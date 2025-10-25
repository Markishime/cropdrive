import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Use Stripe secret key from environment variable
// For testing, set STRIPE_SECRET_KEY in your .env.local file
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For development, skip token verification if emulators are enabled
    let userId: string;

    if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
      // In development with emulators, extract user ID from header
      const token = authHeader.replace('Bearer ', '');
      userId = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).user_id || 'demo-user';
    } else {
      // In production, verify Firebase token
      const { adminAuth } = await import('@/lib/firebase-admin');
      const token = authHeader.replace('Bearer ', '');
      const decodedToken = await adminAuth.verifyIdToken(token);
      userId = decodedToken.uid;
    }

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const { planId, isYearly } = await req.json();

    // Validate plan ID
    if (!planId || !['start', 'smart', 'precision'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // For testing: use test price IDs or create them on the fly
    // In production, you should use actual Stripe Price IDs from environment variables
    const testPriceIds = {
      start: {
        monthly: 'price_test_start_monthly',
        yearly: 'price_test_start_yearly',
      },
      smart: {
        monthly: 'price_test_smart_monthly',
        yearly: 'price_test_smart_yearly',
      },
      precision: {
        monthly: 'price_test_precision_monthly',
        yearly: 'price_test_precision_yearly',
      },
    };

    // Get price ID from environment or use test IDs
    const priceIds = {
      start: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY || testPriceIds.start.monthly,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY || testPriceIds.start.yearly,
      },
      smart: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY || testPriceIds.smart.monthly,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY || testPriceIds.smart.yearly,
      },
      precision: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY || testPriceIds.precision.monthly,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY || testPriceIds.precision.yearly,
      },
    };

    const priceId = priceIds[planId as keyof typeof priceIds][isYearly ? 'yearly' : 'monthly'];

    // Create Stripe checkout session
    // For testing with dynamic prices (when Stripe Price IDs don't exist yet)
    const sessionConfig: any = {
      customer_email: userData.email,
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        userId: userId,
        planId: planId,
        isYearly: isYearly.toString(),
      },
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_creation: 'if_required',
      allow_promotion_codes: true,
    };

    // Try to use existing price IDs, fallback to creating inline prices for testing
    if (priceId && priceId.startsWith('price_')) {
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
      sessionConfig.subscription_data = {
        metadata: {
          userId: userId,
          planId: planId,
          isYearly: isYearly.toString(),
        },
      };
    } else {
      // Create inline price for testing
      const planPrices = {
        start: { monthly: 9900, yearly: 10680 },
        smart: { monthly: 12900, yearly: 13920 },
        precision: { monthly: 17900, yearly: 19320 },
      };
      
      const price = planPrices[planId as keyof typeof planPrices][isYearly ? 'yearly' : 'monthly'];
      
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: `CropDrive ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
              description: `${isYearly ? 'Yearly' : 'Monthly'} subscription to CropDrive AI`,
            },
            unit_amount: price,
            recurring: {
              interval: isYearly ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
