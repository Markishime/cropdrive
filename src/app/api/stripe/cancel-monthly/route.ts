import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

/**
 * POST - Cancel monthly subscription with contract year logic
 * 
 * Option A: "Continue monthly until end of contract year"
 *   - Store in database: subscription id, contract_end_date, "do not renew" flag
 *   - A scheduled job will cancel this subscription at contract_end_date
 * 
 * Option B: "Pay remaining months now and then stop"
 *   - Calculate remaining_months = 12 - months_used
 *   - Create one-off invoice for remaining_months × monthly_price
 *   - After invoice is paid, cancel the subscription immediately
 * 
 * If user is beyond 12 months: just set cancel_at_period_end = true (like yearly)
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const { option } = body; // 'A' or 'B'

    if (!option || !['A', 'B'].includes(option)) {
      return NextResponse.json({ error: 'Invalid option. Must be A or B.' }, { status: 400 });
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const stripeSubscriptionId = userData?.stripeSubscriptionId;
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['items.data.price', 'default_payment_method'],
    });

    // Check if it's actually a monthly subscription
    const interval = subscription.items.data[0]?.price?.recurring?.interval;
    if (interval !== 'month') {
      return NextResponse.json(
        { error: 'This endpoint is only for monthly subscriptions' },
        { status: 400 }
      );
    }

    // Calculate subscription start and contract year end
    const subscriptionStartDate = new Date(subscription.start_date * 1000);
    const contractYearEnd = new Date(subscriptionStartDate);
    contractYearEnd.setMonth(contractYearEnd.getMonth() + 12);

    // Calculate months used
    const now = new Date();
    const monthsUsed = Math.floor(
      (now.getTime() - subscriptionStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );
    const isBeyondContractYear = now >= contractYearEnd;

    // If beyond contract year, treat like yearly: just set cancel_at_period_end
    if (isBeyondContractYear) {
      const updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update database
      await updateCancellationInDatabase(userId, stripeSubscriptionId, {
        cancelAtPeriodEnd: true,
        cancellationType: 'beyond_contract_year',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the current billing period.',
        cancellationType: 'beyond_contract_year',
        cancelAt: new Date((updatedSubscription as any).current_period_end * 1000),
      });
    }

    const priceItem = subscription.items.data[0]?.price;
    const monthlyPriceCents = priceItem?.unit_amount || 0;
    const currency = priceItem?.currency || 'myr';
    const remainingMonths = Math.max(0, 12 - monthsUsed);

    if (option === 'A') {
      // Option A: Continue monthly until end of contract year
      // Store in database, scheduled job will cancel at contract year end
      
      await updateCancellationInDatabase(userId, stripeSubscriptionId, {
        pendingContractCancellation: true,
        contractCancellationDate: admin.firestore.Timestamp.fromDate(contractYearEnd),
        cancellationType: 'option_a_contract_end',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        monthsUsedAtCancellation: monthsUsed,
        remainingMonthsAtCancellation: remainingMonths,
      });

      return NextResponse.json({
        success: true,
        message: `Subscription will continue until ${contractYearEnd.toLocaleDateString()} and then be cancelled.`,
        cancellationType: 'option_a_contract_end',
        contractYearEnd,
        remainingMonths,
      });
    }

    if (option === 'B') {
      // Option B: Pay remaining months now and cancel immediately
      if (!stripeCustomerId) {
        return NextResponse.json({ error: 'No customer ID found' }, { status: 400 });
      }

      const totalAmountCents = remainingMonths * monthlyPriceCents;

      if (totalAmountCents <= 0) {
        // No remaining months to pay, just cancel
        await stripe.subscriptions.cancel(stripeSubscriptionId);
        
        await updateCancellationInDatabase(userId, stripeSubscriptionId, {
          cancelAtPeriodEnd: false,
          cancellationType: 'option_b_immediate_no_remaining',
          cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
          success: true,
          message: 'Subscription cancelled immediately (no remaining months).',
          cancellationType: 'option_b_immediate',
          amountCharged: 0,
        });
      }

      // Create one-off invoice for remaining months
      const invoiceItem = await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        amount: totalAmountCents,
        currency: currency,
        description: `Early termination: ${remainingMonths} remaining month(s) of contract`,
      });

      const invoice = await stripe.invoices.create({
        customer: stripeCustomerId,
        auto_advance: true, // Auto-finalize
        collection_method: 'charge_automatically',
        description: `Contract buyout: ${remainingMonths} months × ${(monthlyPriceCents / 100).toFixed(2)} ${currency.toUpperCase()}`,
        metadata: {
          type: 'contract_buyout',
          subscriptionId: stripeSubscriptionId,
          remainingMonths: remainingMonths.toString(),
        },
      });

      // Finalize and attempt to pay the invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      
      let paymentSucceeded = false;
      let paidInvoice: Stripe.Invoice | null = null;

      try {
        paidInvoice = await stripe.invoices.pay(invoice.id);
        paymentSucceeded = paidInvoice.status === 'paid';
      } catch (paymentError: any) {
        console.error('Payment failed for buyout invoice:', paymentError.message);
        // Invoice is created but not paid - user will need to pay manually
      }

      if (paymentSucceeded) {
        // Payment succeeded, cancel the subscription immediately
        await stripe.subscriptions.cancel(stripeSubscriptionId);

        await updateCancellationInDatabase(userId, stripeSubscriptionId, {
          cancelAtPeriodEnd: false,
          cancellationType: 'option_b_paid_and_cancelled',
          cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
          buyoutInvoiceId: invoice.id,
          buyoutAmountCents: totalAmountCents,
          remainingMonthsPaid: remainingMonths,
        });

        return NextResponse.json({
          success: true,
          message: `Payment successful. Subscription cancelled after paying ${remainingMonths} remaining month(s).`,
          cancellationType: 'option_b_paid_and_cancelled',
          amountCharged: totalAmountCents / 100,
          currency: currency.toUpperCase(),
          remainingMonthsPaid: remainingMonths,
        });
      } else {
        // Payment failed, but invoice is created
        // Store info so we can cancel when invoice is paid (via webhook)
        await updateCancellationInDatabase(userId, stripeSubscriptionId, {
          pendingBuyoutCancellation: true,
          buyoutInvoiceId: invoice.id,
          buyoutAmountCents: totalAmountCents,
          cancellationType: 'option_b_pending_payment',
          cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
          remainingMonthsPaid: remainingMonths,
        });

        return NextResponse.json({
          success: false,
          message: 'Invoice created but payment failed. Please pay the invoice to complete cancellation.',
          cancellationType: 'option_b_pending_payment',
          invoiceId: invoice.id,
          invoiceUrl: finalizedInvoice.hosted_invoice_url,
          amountDue: totalAmountCents / 100,
          currency: currency.toUpperCase(),
        });
      }
    }

    return NextResponse.json({ error: 'Invalid option' }, { status: 400 });

  } catch (error: any) {
    console.error('Error cancelling monthly subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}

async function updateCancellationInDatabase(
  userId: string,
  subscriptionId: string,
  cancellationData: Record<string, any>
) {
  const batch = adminDb.batch();

  // Update subscription document
  const subscriptionRef = adminDb.collection('subscriptions').doc(subscriptionId);
  const subscriptionDoc = await subscriptionRef.get();

  if (subscriptionDoc.exists) {
    batch.update(subscriptionRef, {
      ...cancellationData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    batch.set(subscriptionRef, {
      userId,
      stripeSubscriptionId: subscriptionId,
      ...cancellationData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Update user document
  const userRef = adminDb.collection('users').doc(userId);
  batch.update(userRef, {
    subscriptionStatus: cancellationData.cancelAtPeriodEnd === false ? 'canceled' : 'canceling',
    ...cancellationData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
}

