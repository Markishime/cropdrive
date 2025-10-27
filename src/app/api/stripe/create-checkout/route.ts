import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
    console.log('=== Checkout API Called ===');
    
    // Get the current user
    const authHeader = req.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Unauthorized - Please login again' }, { status: 401 });
    }

    // For development, skip token verification if in test mode
    let userId: string;

    // Check if we're in development/test mode
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';
    
    if (isDevelopment) {
      // In development, extract user ID from token without verification
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.user_id || decoded.uid || 'demo-user';
        console.log('Development mode: Extracted userId:', userId);
      } catch (error) {
        console.error('Error decoding token in dev mode:', error);
        return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
      }
    } else {
      // In production, verify Firebase token
      try {
        const { adminAuth } = await import('@/lib/firebase-admin');
        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
        console.log('Production mode: Verified userId:', userId);
      } catch (error) {
        console.error('Error verifying token in production:', error);
        return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
      }
    }

    // Get user data - in development mode, decode from token; in production, use Firestore
    let userData: any;
    
    if (isDevelopment) {
      // In development, extract email from Firebase token
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userData = {
          email: decoded.email || `user-${userId}@test.com`,
          uid: userId,
        };
        console.log('Development mode: Using email from token:', userData.email);
      } catch (error) {
        console.error('Error extracting email from token:', error);
        // Fallback email for testing
        userData = {
          email: `user-${userId}@test.com`,
          uid: userId,
        };
      }
    } else {
      // In production, get from Firestore using Admin SDK
      try {
        const { adminDb } = await import('@/lib/firebase-admin');
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        userData = userDoc.data();
      } catch (error) {
        console.error('Error fetching user from Firestore:', error);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
      }
    }
    
    console.log('User data retrieved:', { email: userData.email, uid: userId });
    
    const { planId, isYearly } = await req.json();
    console.log('Plan details:', { planId, isYearly });

    // Validate plan ID
    if (!planId || !['start', 'smart', 'precision'].includes(planId)) {
      console.error('Invalid plan ID:', planId);
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

    let priceId: string | null = priceIds[planId as keyof typeof priceIds][isYearly ? 'yearly' : 'monthly'];
    console.log('Price ID resolved:', priceId);

    // Important: ALWAYS use Stripe Checkout Sessions (not payment links) 
    // to ensure metadata is properly passed to webhooks for plan activation
    // If the price ID is a direct URL (https://buy.stripe.com), we need to 
    // extract the actual Price ID or create an inline price
    
    if (priceId && priceId.startsWith('https://buy.stripe.com')) {
      console.warn('⚠️ Direct Stripe payment link detected. Converting to checkout session...');
      // Extract price ID from URL if possible, or set to null to use inline pricing
      priceId = null; // Force inline pricing for proper metadata handling
    }

    // Create Stripe checkout session (with proper metadata for webhooks)
    const sessionConfig: any = {
      customer_email: userData.email,
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.vercel.app'}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.vercel.app'}/pricing`,
      metadata: {
        userId: userId,
        planId: planId,
        isYearly: isYearly.toString(),
      },
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
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
      // Create inline price for testing (when no Stripe Price ID is configured)
      // Prices in cents (smallest currency unit): MYR 24 = 2400 cents
      const planPrices = {
        start: { monthly: 2400, yearly: 19200 },      // 24 RM/month, 192 RM/year
        smart: { monthly: 3900, yearly: 33600 },      // 39 RM/month, 336 RM/year
        precision: { monthly: 4900, yearly: 48000 },  // 49 RM/month, 480 RM/year
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

  } catch (error: any) {
    console.error('=== Checkout Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}
