import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import admin, { adminDb } from '@/lib/firebase-admin';
import { addPaymentToSheet, updateSubscriptionStatus, addCancellationToSheet } from '@/lib/googleSheets';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Process events asynchronously after returning 200 to Stripe
async function processEventAsync(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const sessionId = (event.data.object as Stripe.Checkout.Session).id;
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['line_items', 'line_items.data.price']
        });
        await handleCheckoutCompleted(session);
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
  } catch (error) {
    console.error(`Error processing event ${event.type}:`, error);
  }
}

export async function POST(req: NextRequest) {
  console.log('🔔 Stripe webhook received');
  
  let body: string;
  let signature: string | null;
  
  try {
    // Read the raw body as text - critical for signature verification
    body = await req.text();
    console.log('📦 Body length:', body.length);
    
    // Get signature from headers - use req.headers directly (not next/headers)
    signature = req.headers.get('stripe-signature');
    console.log('🔑 Signature present:', !!signature);
    
    if (!signature) {
      console.error('❌ No stripe-signature header found');
      return new Response(JSON.stringify({ error: 'No signature' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (err) {
    console.error('❌ Error reading request:', err);
    return new Response(JSON.stringify({ error: 'Failed to read request' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Signature verified, event type:', event.type);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Webhook signature verification failed:', errorMessage);
    return new Response(JSON.stringify({ error: `Invalid signature: ${errorMessage}` }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // IMPORTANT: Return 200 immediately to Stripe, then process asynchronously
  // This prevents Stripe timeouts on Vercel serverless functions
  // Note: On Vercel, we can't truly run async after response, but we can try
  // The key is to return quickly
  
  try {
    // Process the event - but with a timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Processing timeout')), 8000);
    });
    
    await Promise.race([
      processEventAsync(event),
      timeoutPromise
    ]);
    
    console.log('✅ Event processed successfully:', event.type);
  } catch (error) {
    // Log but don't fail - we've already verified the signature
    console.error('⚠️ Event processing error (non-fatal):', error);
  }

  // Always return 200 after successful signature verification
  return new Response(JSON.stringify({ received: true }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('🔔 Webhook: checkout.session.completed received');
    console.log('Session ID:', session.id);
    console.log('Session metadata:', session.metadata);
    console.log('Client reference ID:', session.client_reference_id);
    
    // Handle both regular checkout sessions (with metadata) and Payment Links (with client_reference_id)
    let userId = session.metadata?.userId || session.client_reference_id;
    let planId = session.metadata?.planId;
    let isYearly = session.metadata?.isYearly === 'true';

    // If using Payment Links, extract plan info from the line items
    if (!planId && session.line_items?.data.length) {
      console.log('Extracting plan info from line items...');
      const priceId = session.line_items.data[0]?.price?.id;
      console.log('Price ID from line items:', priceId);
      
      // Map price ID to plan
      const priceToPlan: { [key: string]: { planId: string, isYearly: boolean } } = {
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY || '']: { planId: 'start', isYearly: false },
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY || '']: { planId: 'start', isYearly: true },
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY || '']: { planId: 'smart', isYearly: false },
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY || '']: { planId: 'smart', isYearly: true },
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY || '']: { planId: 'precision', isYearly: false },
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY || '']: { planId: 'precision', isYearly: true },
      };
      
      if (priceId && priceToPlan[priceId]) {
        planId = priceToPlan[priceId].planId;
        isYearly = priceToPlan[priceId].isYearly;
        console.log('✅ Plan extracted from price ID:', planId, 'yearly:', isYearly);
      }
    }

    if (!userId) {
      console.error('❌ Missing userId in webhook');
      console.log('Full session data:', JSON.stringify(session, null, 2));
      return;
    }

    if (!planId) {
      console.error('❌ Missing planId in webhook');
      console.log('Full session data:', JSON.stringify(session, null, 2));
      return;
    }

    console.log('✅ Processing checkout for user:', userId, 'plan:', planId, 'yearly:', isYearly);

    // Get user document using Admin SDK
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
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
      currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date()),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000)),
      cancelAtPeriodEnd: false,
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
      stripePriceId: session.line_items?.data[0]?.price?.id || '',
    };

    // Save subscription to Firestore using Admin SDK
    await adminDb.collection('subscriptions').doc(session.subscription as string).set(subscriptionData);

    // Update user plan and limits
    const planLimits = {
      start: { uploadsLimit: 10 },
      smart: { uploadsLimit: 50 },
      precision: { uploadsLimit: -1 }
    };

    const limits = planLimits[planId as keyof typeof planLimits];
    if (!limits) {
      console.error('❌ Invalid plan limits for plan:', planId);
      return;
    }

    console.log('📝 Updating user document in Firestore...');
    console.log('User ID:', userId);
    console.log('Plan:', planId);
    console.log('Limits:', limits);

    await userRef.update({
      plan: planId,
      billingCycle: isYearly ? 'yearly' : 'monthly',
      uploadsLimit: limits.uploadsLimit,
      uploadsUsed: 0,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅✅✅ USER PLAN UPDATED SUCCESSFULLY ✅✅✅');
    console.log('User:', userId);
    console.log('New plan:', planId);
    console.log('Upload limit:', limits.uploadsLimit);

    console.log('✅ Subscription created successfully for user:', userId);

    // Also add to Google Sheets for tracking
    try {
      if (userData) {
        const planNames = {
          start: { en: 'CropDrive Start', ms: 'CropDrive Start' },
          smart: { en: 'CropDrive Smart', ms: 'CropDrive Smart' },
          precision: { en: 'CropDrive Precision', ms: 'CropDrive Precision' },
        };

        const planName = planNames[planId as keyof typeof planNames]?.en || planId;
        const amount = session.amount_total ? session.amount_total / 100 : 0;

        await addPaymentToSheet({
          email: userData.email,
          name: userData.displayName || userData.farmName || '',
          plan: planId,
          planDisplayName: planName,
          amount: amount,
          currency: session.currency || 'myr',
          status: 'active',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          billingCycle: isYearly ? 'yearly' : 'monthly',
          startDate: new Date(),
          endDate: new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000),
          timestamp: new Date(),
        });
        console.log('✅ Payment recorded in Google Sheets');
      }
    } catch (sheetError) {
      console.error('⚠️ Failed to add to Google Sheets (non-critical):', sheetError);
      // Don't throw error - Google Sheets is supplementary
    }

  } catch (error) {
    console.error('❌ Error handling checkout completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription created:', subscription.id);

    // Update subscription in Firestore using Admin SDK - use set with merge to handle missing docs
    const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
    await subscriptionRef.set({
      status: subscription.status,
      currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('✅ Updated subscription in database:', subscription.id);

  } catch (error) {
    console.error('❌ Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);

    // Update subscription in Firestore using Admin SDK - use set with merge
    const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
    await subscriptionRef.set({
      status: subscription.status,
      currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // If subscription is canceled, update user status
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      const subscriptionDoc = await subscriptionRef.get();
      if (subscriptionDoc.exists) {
        const subscriptionData = subscriptionDoc.data();
        if (subscriptionData && subscriptionData.userId) {
          const userRef = adminDb.collection('users').doc(subscriptionData.userId);
          await userRef.update({
            plan: 'start', // Downgrade to basic plan
            uploadsLimit: 10,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log('Downgraded user to basic plan:', subscriptionData.userId);
        }
      }
    }

    console.log('✅ Updated subscription status in database');

    // Update Google Sheets status
    try {
      await updateSubscriptionStatus(
        subscription.id,
        subscription.status,
        subscription.status === 'canceled' ? new Date() : undefined
      );
    } catch (sheetError) {
      console.error('⚠️ Failed to update Google Sheets (non-critical):', sheetError);
    }

  } catch (error) {
    console.error('❌ Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription deleted:', subscription.id);

    // Update subscription status in Firestore using Admin SDK - use set with merge
    const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
    await subscriptionRef.set({
      status: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Downgrade user to basic plan
    const subscriptionDoc = await subscriptionRef.get();
    if (subscriptionDoc.exists) {
      const subscriptionData = subscriptionDoc.data();
      if (subscriptionData && subscriptionData.userId) {
        const userRef = adminDb.collection('users').doc(subscriptionData.userId);
        await userRef.update({
          plan: 'start',
          uploadsLimit: 10,
          uploadsUsed: 0,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Downgraded user to basic plan after subscription deletion:', subscriptionData.userId);
      }
    }

    console.log('✅ Handled subscription deletion');

    // Record cancellation in Google Sheets
    try {
      await addCancellationToSheet(subscription.id, 'Subscription deleted');
    } catch (sheetError) {
      console.error('⚠️ Failed to update Google Sheets (non-critical):', sheetError);
    }

  } catch (error) {
    console.error('❌ Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Payment succeeded:', invoice.id);

    // Find subscription by customer
    if (invoice.subscription) {
      const subscriptionRef = adminDb.collection('subscriptions').doc(invoice.subscription as string);
      const subscriptionDoc = await subscriptionRef.get();

      if (subscriptionDoc.exists) {
        const subscriptionData = subscriptionDoc.data();

        // Update subscription status and period - use set with merge
        await subscriptionRef.set({
          status: 'active',
          currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(invoice.period_start * 1000)),
          currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(invoice.period_end * 1000)),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Reset user upload count for new billing period
        if (subscriptionData && subscriptionData.userId) {
          const userRef = adminDb.collection('users').doc(subscriptionData.userId);
          await userRef.update({
            uploadsUsed: 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log('✅ Updated subscription and reset usage for user:', subscriptionData.userId);
        }
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
      const subscriptionRef = adminDb.collection('subscriptions').doc(invoice.subscription as string);
      const subscriptionDoc = await subscriptionRef.get();

      if (subscriptionDoc.exists) {
        const subscriptionData = subscriptionDoc.data();

        // Update subscription status - use set with merge
        await subscriptionRef.set({
          status: 'past_due',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Update user status (but don't downgrade immediately - give grace period)
        if (subscriptionData && subscriptionData.userId) {
          const userRef = adminDb.collection('users').doc(subscriptionData.userId);
          await userRef.update({
            status: 'past_due',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log('⚠️ Marked subscription and user as past_due:', subscriptionData.userId);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
}

