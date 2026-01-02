import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  maxNetworkRetries: 2,
  timeout: 10000,
});

// POST - Sync subscription data from Stripe to Firestore
// This is useful for users who have subscriptions but missing stripeSubscriptionId
export async function POST(req: NextRequest) {
  try {
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
    const email = userData?.email;
    let stripeCustomerId = userData?.stripeCustomerId;
    let stripeSubscriptionId = userData?.stripeSubscriptionId;

    console.log('🔄 Sync subscription requested for user:', userId, { email, stripeCustomerId, stripeSubscriptionId });

    // If we already have subscription ID, just fetch and sync
    if (stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
          expand: ['default_payment_method', 'customer'],
        });

        const syncData = await syncSubscriptionToFirestore(userId, subscription, userData);
        
        return NextResponse.json({
          success: true,
          message: 'Subscription data synced from existing ID',
          subscription: syncData,
        });
      } catch (error: any) {
        // Subscription might be deleted/cancelled
        console.warn('Could not retrieve subscription:', error.message);
      }
    }

    // Try to find subscription by customer ID
    if (stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 10,
        expand: ['data.default_payment_method'],
      });

      // Find the most recent active or trialing subscription
      const activeSubscription = subscriptions.data.find(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
      );

      if (activeSubscription) {
        const syncData = await syncSubscriptionToFirestore(userId, activeSubscription, userData);
        
        return NextResponse.json({
          success: true,
          message: 'Subscription found by customer ID and synced',
          subscription: syncData,
        });
      }
    }

    // Try to find customer by email
    if (email && !stripeCustomerId) {
      const customers = await stripe.customers.list({
        email: email,
        limit: 5,
      });

      for (const customer of customers.data) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 10,
          expand: ['data.default_payment_method'],
        });

        const activeSubscription = subscriptions.data.find(
          (sub) => sub.status === 'active' || sub.status === 'trialing'
        );

        if (activeSubscription) {
          stripeCustomerId = customer.id;
          const syncData = await syncSubscriptionToFirestore(userId, activeSubscription, userData);
          
          return NextResponse.json({
            success: true,
            message: 'Subscription found by email lookup and synced',
            subscription: syncData,
          });
        }
      }
    }

    // No subscription found
    return NextResponse.json({
      success: true,
      message: 'No active subscription found in Stripe',
      subscription: null,
    });

  } catch (error: any) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription', details: error.message },
      { status: 500 }
    );
  }
}

async function syncSubscriptionToFirestore(
  userId: string,
  subscription: Stripe.Subscription,
  userData: any
): Promise<any> {
  // Extract payment method
  let paymentMethod = null;
  if (subscription.default_payment_method) {
    const pm = typeof subscription.default_payment_method === 'string'
      ? await stripe.paymentMethods.retrieve(subscription.default_payment_method)
      : subscription.default_payment_method as Stripe.PaymentMethod;
    
    if (pm.card) {
      paymentMethod = {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      };
    }
  }

  // Get customer ID
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : (subscription.customer as Stripe.Customer)?.id;

  // Determine billing cycle
  const priceItem = subscription.items?.data?.[0]?.price;
  const interval = priceItem?.recurring?.interval;
  const billingCycle = interval === 'year' ? 'yearly' : 'monthly';

  // Update user document
  const updateData: any = {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
    subscriptionStatus: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    billingCycle: billingCycle,
    currentPeriodStart: admin.firestore.Timestamp.fromMillis((subscription as any).current_period_start * 1000),
    currentPeriodEnd: admin.firestore.Timestamp.fromMillis((subscription as any).current_period_end * 1000),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (paymentMethod) {
    updateData.paymentMethod = paymentMethod;
  }

  await adminDb.collection('users').doc(userId).update(updateData);

  console.log('✅ User document synced with subscription data:', {
    userId,
    subscriptionId: subscription.id,
    status: subscription.status,
  });

  // Also update/create subscription document
  await adminDb.collection('subscriptions').doc(subscription.id).set({
    id: subscription.id,
    userId: userId,
    stripeCustomerId: customerId,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodStart: admin.firestore.Timestamp.fromMillis((subscription as any).current_period_start * 1000),
    currentPeriodEnd: admin.firestore.Timestamp.fromMillis((subscription as any).current_period_end * 1000),
    billingCycle: billingCycle,
    paymentMethod: paymentMethod,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return {
    id: subscription.id,
    status: subscription.status,
    billingCycle: billingCycle,
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    paymentMethod: paymentMethod,
  };
}

