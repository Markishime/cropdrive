import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY is not set. Billing portal route will fail.');
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null;

// Stripe Billing Portal configurations
const YEARLY_PORTAL_CONFIGURATION = 'bpc_1Sd48cC4LvDVWRjedcrtJD42';
const MONTHLY_PORTAL_CONFIGURATION = 'bpc_1Sd4JPC4LvDVWRje0O5qeDRv';

// Collect known price IDs from env (fallback to interval detection)
const yearlyPriceIds = [
  process.env.NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY,
  process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY,
  process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY,
].filter(Boolean) as string[];

const monthlyPriceIds = [
  process.env.NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY,
  process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY,
  process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY,
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData?.stripeCustomerId as string | undefined;
    const stripeSubscriptionId = userData?.stripeSubscriptionId as string | undefined;

    if (!stripeSubscriptionId && !stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Fetch subscription to identify price & customer
    const subscription =
      stripeSubscriptionId
        ? await stripe.subscriptions.retrieve(stripeSubscriptionId, {
            expand: ['customer', 'items.data.price'],
          })
        : null;

    // Resolve customer ID
    const customerId =
      (subscription?.customer && typeof subscription.customer === 'string'
        ? subscription.customer
        : (subscription?.customer as Stripe.Customer | null)?.id) ||
      stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Stripe customer not found for user' },
        { status: 400 }
      );
    }

    const price = subscription?.items?.data?.[0]?.price;
    const priceId = price?.id;
    const recurringInterval = price?.recurring?.interval; // 'month' | 'year' | undefined

    const matchedYearly = priceId ? yearlyPriceIds.includes(priceId) : false;
    const matchedMonthly = priceId ? monthlyPriceIds.includes(priceId) : false;

    // Prefer explicit price ID match, fallback to interval
    const isYearly =
      matchedYearly ||
      (!matchedMonthly && recurringInterval === 'year');

    const portalConfiguration = isYearly
      ? YEARLY_PORTAL_CONFIGURATION
      : MONTHLY_PORTAL_CONFIGURATION;

    const host = req.headers.get('host');
    let baseUrl = 'https://cropdrive.ai';
    if (host && host.includes('localhost')) {
      baseUrl = `http://${host}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      configuration: portalConfiguration,
      return_url: `${baseUrl}/payment-method`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create billing portal session',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

