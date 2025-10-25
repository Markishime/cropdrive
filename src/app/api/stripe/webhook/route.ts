import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const isYearly = session.metadata?.isYearly === 'true';

    if (!userId || !planId) {
      console.log('Missing userId or planId in session metadata');
      return;
    }

    console.log('Processing checkout completion for user:', userId, 'plan:', planId);

    // Get user document
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.log('User not found:', userId);
      return;
    }

    const userData = userDoc.data();

    // Create subscription record
    const subscriptionData = {
      id: session.subscription as string,
      userId: userId,
      planId: planId,
      stripeSubscriptionId: session.subscription as string,
      stripeCustomerId: session.customer as string,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      stripePriceId: session.line_items?.data[0]?.price?.id || '',
    };

    // Save subscription to Firestore
    await setDoc(doc(db, 'subscriptions', session.subscription as string), subscriptionData);

    // Update user plan and limits
    const planLimits = {
      start: { uploadsLimit: 10 },
      smart: { uploadsLimit: 50 },
      precision: { uploadsLimit: -1 }
    };

    const limits = planLimits[planId as keyof typeof planLimits];
    if (limits) {
      await updateDoc(doc(db, 'users', userId), {
        plan: planId,
        uploadsLimit: limits.uploadsLimit,
        uploadsUsed: 0,
        stripeCustomerId: session.customer as string,
        updatedAt: serverTimestamp(),
      });
      console.log('Updated user plan to:', planId, 'with limits:', limits.uploadsLimit);
    }

    console.log('✅ Subscription created successfully for user:', userId);

  } catch (error) {
    console.error('❌ Error handling checkout completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription created:', subscription.id);

    // Update subscription in Firestore
    const subscriptionRef = doc(db, 'subscriptions', subscription.id);
    await updateDoc(subscriptionRef, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    });

    console.log('✅ Updated subscription in database:', subscription.id);

  } catch (error) {
    console.error('❌ Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);

    // Update subscription in Firestore
    const subscriptionRef = doc(db, 'subscriptions', subscription.id);
    await updateDoc(subscriptionRef, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    });

    // If subscription is canceled, update user status
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      const subscriptionDoc = await getDoc(subscriptionRef);
      if (subscriptionDoc.exists()) {
        const subscriptionData = subscriptionDoc.data();
        const userRef = doc(db, 'users', subscriptionData.userId);
        await updateDoc(userRef, {
          plan: 'start', // Downgrade to basic plan
          uploadsLimit: 10,
          updatedAt: serverTimestamp(),
        });
        console.log('Downgraded user to basic plan:', subscriptionData.userId);
      }
    }

    console.log('✅ Updated subscription status in database');

  } catch (error) {
    console.error('❌ Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription deleted:', subscription.id);

    // Update subscription status in Firestore
    const subscriptionRef = doc(db, 'subscriptions', subscription.id);
    await updateDoc(subscriptionRef, {
      status: 'canceled',
      updatedAt: new Date(),
    });

    // Downgrade user to basic plan
    const subscriptionDoc = await getDoc(subscriptionRef);
    if (subscriptionDoc.exists()) {
      const subscriptionData = subscriptionDoc.data();
      const userRef = doc(db, 'users', subscriptionData.userId);
      await updateDoc(userRef, {
        plan: 'start',
        uploadsLimit: 10,
        uploadsUsed: 0,
        updatedAt: serverTimestamp(),
      });
      console.log('Downgraded user to basic plan after subscription deletion:', subscriptionData.userId);
    }

    console.log('✅ Handled subscription deletion');

  } catch (error) {
    console.error('❌ Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Payment succeeded:', invoice.id);

    // Find subscription by customer
    if (invoice.subscription) {
      const subscriptionRef = doc(db, 'subscriptions', invoice.subscription as string);
      const subscriptionDoc = await getDoc(subscriptionRef);

      if (subscriptionDoc.exists()) {
        const subscriptionData = subscriptionDoc.data();

        // Update subscription status and period
        await updateDoc(subscriptionRef, {
          status: 'active',
          currentPeriodStart: new Date(invoice.period_start * 1000),
          currentPeriodEnd: new Date(invoice.period_end * 1000),
          updatedAt: new Date(),
        });

        // Reset user upload count for new billing period
        const userRef = doc(db, 'users', subscriptionData.userId);
        await updateDoc(userRef, {
          uploadsUsed: 0,
          updatedAt: serverTimestamp(),
        });

        console.log('✅ Updated subscription and reset usage for user:', subscriptionData.userId);
      }
    }

  } catch (error) {
    console.error('❌ Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Payment failed:', invoice.id);

    // Find subscription by customer
    if (invoice.subscription) {
      const subscriptionRef = doc(db, 'subscriptions', invoice.subscription as string);
      const subscriptionDoc = await getDoc(subscriptionRef);

      if (subscriptionDoc.exists()) {
        const subscriptionData = subscriptionDoc.data();

        // Update subscription status
        await updateDoc(subscriptionRef, {
          status: 'past_due',
          updatedAt: new Date(),
        });

        // Update user status (but don't downgrade immediately - give grace period)
        const userRef = doc(db, 'users', subscriptionData.userId);
        await updateDoc(userRef, {
          status: 'past_due',
          updatedAt: serverTimestamp(),
        });

        console.log('⚠️ Marked subscription and user as past_due:', subscriptionData.userId);
      }
    }

  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
}
