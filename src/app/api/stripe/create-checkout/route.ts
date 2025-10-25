import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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

    // Get Stripe price ID
    const priceIds = {
      start: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY,
      },
      smart: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY,
      },
      precision: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY,
      },
    };

    const priceId = priceIds[planId as keyof typeof priceIds][isYearly ? 'yearly' : 'monthly'];
    if (!priceId) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userData.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: userId,
        planId: planId,
        isYearly: isYearly.toString(),
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
          isYearly: isYearly.toString(),
        },
      },
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_creation: 'if_required',
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: true,
      },
    });

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
