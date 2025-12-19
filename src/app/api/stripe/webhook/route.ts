import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import admin, { adminDb } from '@/lib/firebase-admin';
import { addPaymentToSheet, updateSubscriptionStatus, addCancellationToSheet } from '@/lib/googleSheets';

// Initialize Stripe with error handling
function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY not configured');
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    maxNetworkRetries: 2, // Retry on network failures
    timeout: 10000, // 10 second timeout for Stripe API calls
  });
}

// Get webhook secret with validation
function getWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return null;
  }
  return secret;
}

// Helper to create consistent JSON responses
function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

// GET handler - for health checks and browser visits
export async function GET() {
  return jsonResponse({
    status: 'ok',
    message: 'Stripe webhook endpoint is active. This endpoint only accepts POST requests from Stripe.',
    timestamp: new Date().toISOString(),
  }, 200);
}

// HEAD handler - for health checks
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// OPTIONS handler - for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, HEAD, OPTIONS',
      'Content-Type': 'application/json',
    },
  });
}

// Process events with individual error handling per event type
async function processEvent(event: Stripe.Event, stripe: Stripe): Promise<void> {
  const startTime = Date.now();
  console.log(`📥 Processing event: ${event.type} (ID: ${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const sessionId = (event.data.object as Stripe.Checkout.Session).id;
        // Fetch with timeout
        const session = await Promise.race([
          stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'line_items.data.price']
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Stripe API timeout')), 5000)
          )
        ]);
        await handleCheckoutCompleted(session as Stripe.Checkout.Session);
        break;
      }

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
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Event ${event.type} processed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Event ${event.type} failed after ${duration}ms:`, error);
    // Don't rethrow - we want to return 200 to Stripe regardless
  }
}

export async function POST(req: NextRequest) {
  const requestStart = Date.now();
  console.log('🔔 Stripe webhook received at:', new Date().toISOString());

  // Initialize Stripe
  const stripe = getStripe();
  if (!stripe) {
    return jsonResponse({ error: 'Stripe not configured' }, 500);
  }

  // Get webhook secret
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    return jsonResponse({ error: 'Webhook secret not configured' }, 500);
  }

  // Read raw body - MUST be done before any other body parsing
  let rawBody: string;
  try {
    rawBody = await req.text();
    if (!rawBody || rawBody.length === 0) {
      console.error('❌ Empty request body');
      return jsonResponse({ error: 'Empty body' }, 400);
    }
    console.log('📦 Body received, length:', rawBody.length);
  } catch (err) {
    console.error('❌ Failed to read request body:', err);
    return jsonResponse({ error: 'Failed to read body' }, 400);
  }

  // Get signature header
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return jsonResponse({ error: 'Missing signature' }, 400);
  }
  console.log('🔑 Signature header present');

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.log('✅ Signature verified successfully');
    console.log('📋 Event type:', event.type);
    console.log('📋 Event ID:', event.id);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown verification error';
    console.error('❌ Signature verification failed:', errorMsg);
    
    // Log additional debug info
    console.error('Debug - Signature length:', signature.length);
    console.error('Debug - Body starts with:', rawBody.substring(0, 100));
    console.error('Debug - Secret starts with:', webhookSecret.substring(0, 10) + '...');
    
    return jsonResponse({ error: `Signature verification failed: ${errorMsg}` }, 400);
  }

  // Process the event with a hard timeout to ensure we respond to Stripe in time
  // Vercel has a 10s default timeout, Stripe expects response within 5-20s
  const processingTimeout = 8000; // 8 seconds max for processing
  
  try {
    await Promise.race([
      processEvent(event, stripe),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Processing timeout - will retry')), processingTimeout)
      )
    ]);
  } catch (timeoutError) {
    // Log timeout but still return 200 - Stripe will retry if needed
    console.warn('⚠️ Processing timed out, but returning 200 to prevent Stripe retry storm');
  }

  const totalDuration = Date.now() - requestStart;
  console.log(`📊 Total webhook processing time: ${totalDuration}ms`);

  // ALWAYS return 200 after successful signature verification
  // This tells Stripe we received the webhook, even if processing had issues
  return jsonResponse({ 
    received: true,
    eventType: event.type,
    eventId: event.id,
    processingTime: totalDuration
  }, 200);
}

// Helper function for Firestore operations with retry
async function firestoreWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 2
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`❌ ${operationName} failed (attempt ${attempt}/${maxRetries}):`, error);
      if (attempt === maxRetries) {
        console.error(`❌ ${operationName} exhausted all retries`);
        return null;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }
  return null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🔔 Webhook: checkout.session.completed received');
  console.log('Session ID:', session.id);
  console.log('Session metadata:', JSON.stringify(session.metadata));
  console.log('Client reference ID:', session.client_reference_id);
  
  // Handle both regular checkout sessions (with metadata) and Payment Links (with client_reference_id)
  let userId = session.metadata?.userId || session.client_reference_id;
  let planId = session.metadata?.planId;
  let isYearly = session.metadata?.isYearly === 'true';

  // If using Payment Links, extract plan info from the line items
  if (!planId && session.line_items?.data?.length) {
    console.log('Extracting plan info from line items...');
    const priceId = session.line_items.data[0]?.price?.id;
    console.log('Price ID from line items:', priceId);
    
    // Map price ID to plan - handle undefined env vars gracefully
    const priceToPlan: Record<string, { planId: string; isYearly: boolean }> = {};
    
    const priceEnvMappings = [
      { env: 'NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY', planId: 'start', isYearly: false },
      { env: 'NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY', planId: 'start', isYearly: true },
      { env: 'NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY', planId: 'smart', isYearly: false },
      { env: 'NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY', planId: 'smart', isYearly: true },
      { env: 'NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY', planId: 'precision', isYearly: false },
      { env: 'NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY', planId: 'precision', isYearly: true },
    ];
    
    for (const mapping of priceEnvMappings) {
      const envValue = process.env[mapping.env];
      if (envValue) {
        priceToPlan[envValue] = { planId: mapping.planId, isYearly: mapping.isYearly };
      }
    }
    
    if (priceId && priceToPlan[priceId]) {
      planId = priceToPlan[priceId].planId;
      isYearly = priceToPlan[priceId].isYearly;
      console.log('✅ Plan extracted from price ID:', planId, 'yearly:', isYearly);
    } else {
      console.warn('⚠️ Unknown price ID:', priceId);
      console.warn('⚠️ Available mappings:', Object.keys(priceToPlan));
    }
  }

  if (!userId) {
    console.error('❌ Missing userId in webhook - cannot process');
    return;
  }

  if (!planId) {
    console.error('❌ Missing planId in webhook - cannot process');
    return;
  }

  console.log('✅ Processing checkout for user:', userId, 'plan:', planId, 'yearly:', isYearly);

  // Get user document using Admin SDK with retry
  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await firestoreWithRetry(
    () => userRef.get(),
    'Get user document'
  );
  
  if (!userDoc || !userDoc.exists) {
    console.error('❌ User not found:', userId);
    return;
  }

  const userData = userDoc.data();
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const periodEnd = new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000);

  // Create subscription record
  const subscriptionData = {
    id: subscriptionId,
    userId: userId,
    planId: planId,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
    status: 'active',
    currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date()),
    currentPeriodEnd: admin.firestore.Timestamp.fromDate(periodEnd),
    cancelAtPeriodEnd: false,
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
    stripePriceId: session.line_items?.data?.[0]?.price?.id || '',
  };

  // Save subscription to Firestore with retry
  if (subscriptionId) {
    await firestoreWithRetry(
      () => adminDb.collection('subscriptions').doc(subscriptionId).set(subscriptionData),
      'Create subscription record'
    );
  }

  // Update user plan and limits
  const planLimits: Record<string, { uploadsLimit: number }> = {
    start: { uploadsLimit: 2 },
    smart: { uploadsLimit: 5 },
    precision: { uploadsLimit: 10 }
  };

  const limits = planLimits[planId];
  if (!limits) {
    console.error('❌ Invalid plan limits for plan:', planId);
    // Default to start plan limits
    console.log('⚠️ Using default limits for unknown plan');
  }

  const uploadsLimit = limits?.uploadsLimit ?? 2;

  console.log('📝 Updating user document in Firestore...');
  console.log('User ID:', userId);
  console.log('Plan:', planId);
  console.log('Uploads limit:', uploadsLimit);

  // Update user with retry
  const userUpdateResult = await firestoreWithRetry(
    () => userRef.update({
      plan: planId,
      billingCycle: isYearly ? 'yearly' : 'monthly',
      uploadsLimit: uploadsLimit,
      uploadsUsed: 0,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(periodEnd),
      subscriptionStatus: 'active',
      cancelAtPeriodEnd: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }),
    'Update user document'
  );

  if (userUpdateResult !== null) {
    console.log('✅✅✅ USER PLAN UPDATED SUCCESSFULLY ✅✅✅');
    console.log('User:', userId);
    console.log('New plan:', planId);
    console.log('Upload limit:', uploadsLimit);
  }

  // Google Sheets tracking (non-critical, fire and forget)
  if (userData) {
    const planNames: Record<string, string> = {
      start: 'CropDrive Start',
      smart: 'CropDrive Smart',
      precision: 'CropDrive Precision',
    };

    const planName = planNames[planId] || planId;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    // Don't await - fire and forget for Google Sheets
    addPaymentToSheet({
      email: userData.email || '',
      name: userData.displayName || userData.farmName || '',
      plan: planId,
      planDisplayName: planName,
      amount: amount,
      currency: session.currency || 'myr',
      status: 'active',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      billingCycle: isYearly ? 'yearly' : 'monthly',
      startDate: new Date(),
      endDate: periodEnd,
      timestamp: new Date(),
    }).then(() => {
      console.log('✅ Payment recorded in Google Sheets');
    }).catch((sheetError) => {
      console.warn('⚠️ Google Sheets update failed (non-critical):', sheetError);
    });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📥 Subscription created:', subscription.id);

  await firestoreWithRetry(
    () => adminDb.collection('subscriptions').doc(subscription.id).set({
      status: subscription.status,
      currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }),
    'Update subscription (created)'
  );

  console.log('✅ Subscription created in database:', subscription.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('📥 Subscription updated:', subscription.id, 'Status:', subscription.status);

  const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
  
  // Update subscription record
  await firestoreWithRetry(
    () => subscriptionRef.set({
      status: subscription.status,
      currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }),
    'Update subscription record'
  );

  // If subscription is canceled or unpaid, downgrade user
  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    const subscriptionDoc = await firestoreWithRetry(
      () => subscriptionRef.get(),
      'Get subscription for user lookup'
    );
    
    if (subscriptionDoc?.exists) {
      const subscriptionData = subscriptionDoc.data();
      const userId = subscriptionData?.userId;
      
      if (userId) {
        await firestoreWithRetry(
          () => adminDb.collection('users').doc(userId).update({
            plan: 'start',
            uploadsLimit: 10,
            subscriptionStatus: 'canceled',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }),
          'Downgrade user plan'
        );
        console.log('⬇️ Downgraded user to basic plan:', userId);
      }
    }
  }

  console.log('✅ Subscription updated in database');

  // Google Sheets update (fire and forget)
  updateSubscriptionStatus(
    subscription.id,
    subscription.status,
    subscription.status === 'canceled' ? new Date() : undefined
  ).catch((err) => console.warn('⚠️ Google Sheets update failed:', err));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('📥 Subscription deleted:', subscription.id);

  const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
  
  // Mark subscription as canceled
  await firestoreWithRetry(
    () => subscriptionRef.set({
      status: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }),
    'Mark subscription canceled'
  );

  // Get subscription to find user
  const subscriptionDoc = await firestoreWithRetry(
    () => subscriptionRef.get(),
    'Get subscription for user lookup'
  );
  
  if (subscriptionDoc?.exists) {
    const subscriptionData = subscriptionDoc.data();
    const userId = subscriptionData?.userId;
    
    if (userId) {
      await firestoreWithRetry(
        () => adminDb.collection('users').doc(userId).update({
          plan: 'none',
          uploadsLimit: 0,
          uploadsUsed: 0,
          subscriptionStatus: 'canceled',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }),
        'Downgrade user after deletion'
      );
      console.log('⬇️ Downgraded user after subscription deletion:', userId);
    }
  }

  console.log('✅ Subscription deletion handled');

  // Google Sheets (fire and forget)
  addCancellationToSheet(subscription.id, 'Subscription deleted')
    .catch((err) => console.warn('⚠️ Google Sheets cancellation failed:', err));
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('📥 Payment succeeded:', invoice.id);

  // Check if this is a contract buyout invoice (Option B monthly cancellation)
  if (invoice.metadata?.type === 'contract_buyout') {
    console.log('📥 Contract buyout invoice paid, proceeding to cancel subscription');
    await handleContractBuyoutPaid(invoice);
    return;
  }

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) {
    console.log('ℹ️ Invoice has no subscription, skipping');
    return;
  }

  const subscriptionRef = adminDb.collection('subscriptions').doc(subscriptionId);
  const subscriptionDoc = await firestoreWithRetry(
    () => subscriptionRef.get(),
    'Get subscription for payment'
  );

  if (!subscriptionDoc?.exists) {
    console.warn('⚠️ Subscription not found for payment:', subscriptionId);
    return;
  }

  const subscriptionData = subscriptionDoc.data();

  // Update subscription status and period
  await firestoreWithRetry(
    () => subscriptionRef.set({
      status: 'active',
      currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(invoice.period_start * 1000)),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(invoice.period_end * 1000)),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }),
    'Update subscription after payment'
  );

  // Reset user upload count for new billing period
  const userId = subscriptionData?.userId;
  if (userId) {
    await firestoreWithRetry(
      () => adminDb.collection('users').doc(userId).update({
        uploadsUsed: 0,
        subscriptionStatus: 'active',
        currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(invoice.period_end * 1000)),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      'Reset user uploads after payment'
    );
    console.log('✅ Payment processed, usage reset for user:', userId);
  }
}

// Handle contract buyout invoice payment (Option B monthly cancellation)
async function handleContractBuyoutPaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.metadata?.subscriptionId;
  if (!subscriptionId) {
    console.error('❌ Contract buyout invoice missing subscriptionId in metadata');
    return;
  }

  console.log('📥 Processing contract buyout for subscription:', subscriptionId);

  // Get Stripe instance
  const stripe = getStripe();
  if (!stripe) {
    console.error('❌ Stripe not configured for buyout processing');
    return;
  }

  try {
    // Cancel the subscription in Stripe
    await stripe.subscriptions.cancel(subscriptionId);
    console.log('✅ Subscription cancelled after buyout payment:', subscriptionId);

    // Get subscription document to find user
    const subscriptionRef = adminDb.collection('subscriptions').doc(subscriptionId);
    const subscriptionDoc = await firestoreWithRetry(
      () => subscriptionRef.get(),
      'Get subscription for buyout'
    );

    // Update subscription document
    await firestoreWithRetry(
      () => subscriptionRef.set({
        status: 'canceled',
        pendingBuyoutCancellation: false,
        buyoutPaid: true,
        buyoutPaidAt: admin.firestore.FieldValue.serverTimestamp(),
        cancellationType: 'option_b_paid_via_webhook',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true }),
      'Update subscription after buyout'
    );

    // Update user document
    if (subscriptionDoc?.exists) {
      const subscriptionData = subscriptionDoc.data();
      const userId = subscriptionData?.userId;
      
      if (userId) {
        await firestoreWithRetry(
          () => adminDb.collection('users').doc(userId).update({
            plan: 'none',
            uploadsLimit: 0,
            subscriptionStatus: 'canceled',
            pendingBuyoutCancellation: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }),
          'Downgrade user after buyout'
        );
        console.log('✅ User downgraded after contract buyout:', userId);
      }
    }
  } catch (error) {
    console.error('❌ Error processing contract buyout:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('📥 Payment failed:', invoice.id);

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) {
    console.log('ℹ️ Invoice has no subscription, skipping');
    return;
  }

  const subscriptionRef = adminDb.collection('subscriptions').doc(subscriptionId);
  const subscriptionDoc = await firestoreWithRetry(
    () => subscriptionRef.get(),
    'Get subscription for failed payment'
  );

  if (!subscriptionDoc?.exists) {
    console.warn('⚠️ Subscription not found for failed payment:', subscriptionId);
    return;
  }

  const subscriptionData = subscriptionDoc.data();

  // Mark subscription as past_due
  await firestoreWithRetry(
    () => subscriptionRef.set({
      status: 'past_due',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }),
    'Mark subscription past_due'
  );

  // Update user status (grace period - don't downgrade immediately)
  const userId = subscriptionData?.userId;
  if (userId) {
    await firestoreWithRetry(
      () => adminDb.collection('users').doc(userId).update({
        subscriptionStatus: 'past_due',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      'Mark user past_due'
    );
    console.log('⚠️ Payment failed, marked as past_due:', userId);
  }
}

  