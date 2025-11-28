import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// GET - Fetch subscription details
export async function GET(req: NextRequest) {
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
    const stripeSubscriptionId = userData?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json({ 
        subscription: null, 
        message: 'No active subscription' 
      });
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['default_payment_method', 'latest_invoice'],
    });

    // Get payment method details
    let paymentMethod = null;
    if (subscription.default_payment_method && typeof subscription.default_payment_method !== 'string') {
      const pm = subscription.default_payment_method as Stripe.PaymentMethod;
      if (pm.card) {
        paymentMethod = {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        };
      }
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        billingCycle: subscription.items.data[0]?.price?.recurring?.interval || 'month',
        paymentMethod,
      },
    });

  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update subscription (toggle auto-renewal, update payment method)
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const { action, cancelAtPeriodEnd } = body;

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const stripeSubscriptionId = userData?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    if (action === 'toggle_auto_renewal') {
      // Toggle auto-renewal (cancel_at_period_end)
      const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      // Update Firestore
      await adminDb.collection('subscriptions').doc(stripeSubscriptionId).update({
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        message: subscription.cancel_at_period_end 
          ? 'Auto-renewal disabled. Your subscription will end at the current period.'
          : 'Auto-renewal enabled. Your subscription will renew automatically.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Cancel subscription at period end
export async function DELETE(req: NextRequest) {
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
    const stripeSubscriptionId = userData?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    // Cancel the subscription at period end (not immediately)
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update Firestore subscriptions collection - use set with merge to handle missing docs
    const subscriptionRef = adminDb.collection('subscriptions').doc(stripeSubscriptionId);
    const subscriptionDoc = await subscriptionRef.get();
    
    if (subscriptionDoc.exists) {
      await subscriptionRef.update({
        cancelAtPeriodEnd: true,
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Create the document if it doesn't exist
      await subscriptionRef.set({
        userId,
        stripeSubscriptionId,
        cancelAtPeriodEnd: true,
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Update user document
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'canceling',
      cancelAtPeriodEnd: true,
      subscriptionCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current billing period.',
      cancelAt: new Date(subscription.current_period_end * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Reactivate a cancelled subscription (before period ends)
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
    const stripeSubscriptionId = userData?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    // First, check if the subscription is still within the period
    const currentSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    
    // Check if subscription has already ended
    if (currentSubscription.status === 'canceled') {
      return NextResponse.json({ 
        error: 'Subscription has already ended. Please subscribe to a new plan.',
        expired: true
      }, { status: 400 });
    }

    // Check if the current period has ended
    const now = Math.floor(Date.now() / 1000);
    if (now >= currentSubscription.current_period_end) {
      return NextResponse.json({ 
        error: 'Subscription period has ended. Please subscribe to a new plan.',
        expired: true
      }, { status: 400 });
    }

    // Reactivate by setting cancel_at_period_end to false
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update Firestore subscriptions collection
    const subscriptionRef = adminDb.collection('subscriptions').doc(stripeSubscriptionId);
    const subscriptionDoc = await subscriptionRef.get();
    
    if (subscriptionDoc.exists) {
      await subscriptionRef.update({
        cancelAtPeriodEnd: false,
        reactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Update user document
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'active',
      cancelAtPeriodEnd: false,
      subscriptionReactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription has been reactivated successfully!',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription', details: error.message },
      { status: 500 }
    );
  }
}

