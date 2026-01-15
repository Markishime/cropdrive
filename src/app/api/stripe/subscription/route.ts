import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover' as any,
  maxNetworkRetries: 2,
  timeout: 10000,
});

// Helper function to safely convert timestamp to ISO string
const safeTimestampToISO = (timestamp: number | undefined | null): string | null => {
  if (!timestamp) return null;
  try {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
};

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
        success: true,
        status: 200,
        subscription: null, 
        message: 'No active subscription' 
      }, { status: 200 });
    }

    // Fetch subscription from Stripe with price details
    let subscription: Stripe.Subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
        expand: ['default_payment_method', 'latest_invoice', 'items.data.price', 'customer'],
      });
    } catch (stripeError: any) {
      console.error('Stripe subscription retrieval error:', stripeError.message);
      // If subscription doesn't exist in Stripe, return null subscription
      if (stripeError.code === 'resource_missing') {
        return NextResponse.json({ 
          success: true,
          subscription: null, 
          message: 'Subscription not found in Stripe' 
        }, { status: 200 });
      }
      throw stripeError;
    }

    // Get payment method details - check Firestore first, then Stripe
    let paymentMethod = null;
    
    console.log('🔍 Fetching payment method for subscription:', stripeSubscriptionId);
    
    // First, check if payment method is stored in Firestore subscription document
    const subscriptionDoc = await adminDb.collection('subscriptions').doc(stripeSubscriptionId).get();
    if (subscriptionDoc.exists) {
      const subscriptionData = subscriptionDoc.data();
      if (subscriptionData?.paymentMethod) {
        paymentMethod = subscriptionData.paymentMethod;
        console.log('✅ Found payment method in Firestore subscription document:', paymentMethod);
      }
    }
    
    // If not in subscription document, check user document
    if (!paymentMethod && userData?.paymentMethod) {
      paymentMethod = userData.paymentMethod;
      console.log('✅ Found payment method in user document:', paymentMethod);
    }
    
    // If not in Firestore, fetch from Stripe
    if (!paymentMethod) {
      console.log('🔍 Payment method not in Firestore, fetching from Stripe...');
      
      // Try to get payment method from subscription
      if ((subscription as any).default_payment_method) {
        try {
          let pm: Stripe.PaymentMethod;
          
          if (typeof (subscription as any).default_payment_method === 'string') {
            pm = await stripe.paymentMethods.retrieve((subscription as any).default_payment_method);
          } else {
            pm = (subscription as any).default_payment_method as Stripe.PaymentMethod;
          }
          
          if (pm.card) {
            paymentMethod = {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            };
            console.log('✅ Found payment method from subscription:', paymentMethod);
          }
        } catch (error) {
          console.error('Error fetching subscription payment method:', error);
        }
      }
    
      // If no payment method on subscription, try to get from customer's default payment method
      if (!paymentMethod && subscription.customer) {
        try {
          const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

          console.log('🔍 Checking customer default payment method:', customerId);

          const customer = await stripe.customers.retrieve(customerId, {
            expand: ['invoice_settings.default_payment_method'],
          });

          if (customer && !customer.deleted) {
            const customerObj = customer as Stripe.Customer;
            const defaultPm = customerObj.invoice_settings?.default_payment_method;

            if (defaultPm) {
              let pm: Stripe.PaymentMethod;

              if (typeof defaultPm === 'string') {
                pm = await stripe.paymentMethods.retrieve(defaultPm);
              } else {
                pm = defaultPm as Stripe.PaymentMethod;
              }

              if (pm.card) {
                paymentMethod = {
                  brand: pm.card.brand,
                  last4: pm.card.last4,
                  expMonth: pm.card.exp_month,
                  expYear: pm.card.exp_year,
                };
                console.log('✅ Found payment method from customer:', paymentMethod);
              }
            } else {
              // If no default payment method set, check all customer's payment methods
              console.log('🔍 No default payment method, checking all customer payment methods');
              const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
              });

              if (paymentMethods.data.length > 0) {
                const pm = paymentMethods.data[0];
                if (pm.card) {
                  paymentMethod = {
                    brand: pm.card.brand,
                    last4: pm.card.last4,
                    expMonth: pm.card.exp_month,
                    expYear: pm.card.exp_year,
                  };
                  console.log('✅ Found payment method from customer payment methods:', paymentMethod);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching customer payment method:', error);
        }
      }
    
      // Last resort: try to get the payment method from the latest successful invoice
      if (!paymentMethod && subscription.latest_invoice) {
        try {
          const invoiceId = typeof subscription.latest_invoice === 'string'
            ? subscription.latest_invoice
            : subscription.latest_invoice.id;
          
          console.log('🔍 Checking latest invoice for payment method:', invoiceId);
          
          const invoice = await stripe.invoices.retrieve(invoiceId, {
            expand: ['payment_intent.payment_method'],
          });
          
          if ((invoice as any).payment_intent) {
            let pi: Stripe.PaymentIntent;

            if (typeof (invoice as any).payment_intent === 'string') {
              pi = await stripe.paymentIntents.retrieve((invoice as any).payment_intent, {
                expand: ['payment_method'],
              });
            } else {
              pi = (invoice as any).payment_intent as Stripe.PaymentIntent;
            }
            
            if (pi.payment_method) {
              let pm: Stripe.PaymentMethod;
              
              if (typeof pi.payment_method === 'string') {
                pm = await stripe.paymentMethods.retrieve(pi.payment_method);
              } else {
                pm = pi.payment_method as Stripe.PaymentMethod;
              }
              
              if (pm.card) {
                paymentMethod = {
                  brand: pm.card.brand,
                  last4: pm.card.last4,
                  expMonth: pm.card.exp_month,
                  expYear: pm.card.exp_year,
                };
                console.log('✅ Found payment method from invoice:', paymentMethod);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching invoice payment method:', error);
        }
      }
    }
    
    // If we fetched payment method from Stripe and it's not in Firestore, save it
    if (paymentMethod) {
      const subscriptionData = subscriptionDoc.exists ? subscriptionDoc.data() : null;
      
      // Save to subscription document if it doesn't exist or is different
      if (!subscriptionData?.paymentMethod || JSON.stringify(subscriptionData.paymentMethod) !== JSON.stringify(paymentMethod)) {
        console.log('💾 Saving payment method to Firestore subscription document');
        if (subscriptionDoc.exists) {
          await adminDb.collection('subscriptions').doc(stripeSubscriptionId).update({
            paymentMethod: paymentMethod,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          await adminDb.collection('subscriptions').doc(stripeSubscriptionId).set({
            userId,
            stripeSubscriptionId,
            paymentMethod: paymentMethod,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      }
      
      // Always update user document with payment method
      const userPaymentMethod = userData?.paymentMethod;
      if (!userPaymentMethod || JSON.stringify(userPaymentMethod) !== JSON.stringify(paymentMethod)) {
        console.log('💾 Saving payment method to user document');
        await adminDb.collection('users').doc(userId).update({
          paymentMethod: paymentMethod,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('✅ Payment method saved to user document');
      }
    }
    
    if (!paymentMethod) {
      console.warn('⚠️ No payment method found for subscription:', stripeSubscriptionId);
    }

    // Get price details for monthly plans
    const priceItem = subscription.items.data[0]?.price;
    const priceId = priceItem?.id || null;
    const unitAmount = priceItem?.unit_amount || 0;
    const currency = priceItem?.currency || 'myr';
    const interval = priceItem?.recurring?.interval || 'month';

    // Calculate subscription start date safely
    const startDateTimestamp = (subscription as any).start_date || subscription.created || Math.floor(Date.now() / 1000);
    let subscriptionStartDate = new Date(startDateTimestamp * 1000);
    
    // Validate the date
    if (isNaN(subscriptionStartDate.getTime())) {
      console.error('Invalid subscription start date, falling back to current time');
      subscriptionStartDate = new Date();
    }
    
    // Calculate contract year end (12 months from subscription start)
    const contractYearEnd = new Date(subscriptionStartDate);
    contractYearEnd.setMonth(contractYearEnd.getMonth() + 12);

    // Calculate months used
    const now = new Date();
    const monthsUsed = Math.floor(
      (now.getTime() - subscriptionStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );

    // Check if we're beyond the first contract year
    const isBeyondContractYear = now >= contractYearEnd;

    // Check for pending contract cancellation in our database
    const subscriptionData = subscriptionDoc.exists ? subscriptionDoc.data() : null;
    const pendingContractCancellation = subscriptionData?.pendingContractCancellation || userData?.pendingContractCancellation || false;
    const contractCancellationDate = subscriptionData?.contractCancellationDate?.toDate?.() || userData?.contractCancellationDate?.toDate?.() || null;

    // Check if user can undo cancellation (within contract year)
    const canUndoCancellation = pendingContractCancellation && !isBeyondContractYear;
    
    // For monthly installment plans: auto-renewal cannot be toggled during contract year
    // This ensures the 12-month commitment is honored
    const isMonthlyInstallment = interval === 'month';
    const canToggleAutoRenewal = !isMonthlyInstallment || isBeyondContractYear;
    
    // For monthly installment plans, the "access ends" date is the contract year end
    // Not the monthly billing period end - user has access for the full year
    const accessEndsDate = isMonthlyInstallment && !isBeyondContractYear
      ? contractYearEnd.toISOString()
      : safeTimestampToISO((subscription as any).current_period_end) || new Date().toISOString();

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: safeTimestampToISO((subscription as any).current_period_start) || new Date().toISOString(),
        currentPeriodEnd: safeTimestampToISO((subscription as any).current_period_end) || new Date().toISOString(),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        cancelAt: safeTimestampToISO((subscription as any).cancel_at),
        billingCycle: interval,
        paymentMethod,
        // Contract year fields
        subscriptionStartDate: subscriptionStartDate.toISOString(),
        contractYearEnd: contractYearEnd.toISOString(),
        monthsUsed: Math.max(0, monthsUsed),
        remainingMonths: Math.max(0, 12 - monthsUsed),
        isBeyondContractYear,
        priceId,
        unitAmount,
        currency,
        // Pending cancellation info
        pendingContractCancellation,
        contractCancellationDate: contractCancellationDate ? contractCancellationDate.toISOString() : null,
        canUndoCancellation,
        // Monthly installment plan specific fields
        isMonthlyInstallment,
        canToggleAutoRenewal,
        accessEndsDate, // This is the date when access actually ends (contract year end for monthly plans)
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
      // First verify the subscription exists and is active in Stripe
      let subscription: Stripe.Subscription;
      try {
        subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        
        // Check if subscription is in a state that can be updated
        if (subscription.status === 'canceled') {
          return NextResponse.json({ 
            error: 'Subscription is already canceled. Please subscribe to a new plan.',
            expired: true 
          }, { status: 400 });
        }
      } catch (stripeError: any) {
        console.error('Error retrieving subscription from Stripe:', stripeError.message);
        if (stripeError.code === 'resource_missing') {
          return NextResponse.json({ 
            error: 'Subscription not found in Stripe. Please contact support.',
            expired: true 
          }, { status: 400 });
        }
        throw stripeError;
      }

      // For monthly subscriptions within contract year, we don't actually update Stripe
      // We just track it in our database - Stripe keeps charging monthly
      const priceItem = subscription.items?.data?.[0]?.price;
      const interval = priceItem?.recurring?.interval;
      const isMonthly = interval === 'month';

      // Calculate if within contract year
      const startDateTimestamp = (subscription as any).start_date || subscription.created || Math.floor(Date.now() / 1000);
      const subscriptionStartDate = new Date(startDateTimestamp * 1000);
      const contractYearEnd = new Date(subscriptionStartDate);
      contractYearEnd.setMonth(contractYearEnd.getMonth() + 12);
      const now = new Date();
      const isWithinContractYear = now < contractYearEnd;

      // For monthly subscriptions within contract year, DON'T update Stripe
      // Just track in our database - billing continues
      if (isMonthly && isWithinContractYear) {
        console.log('📅 Monthly subscription within contract year - not updating Stripe, tracking in DB only');
        
        // Update Firestore subscriptions collection
        const subscriptionRef = adminDb.collection('subscriptions').doc(stripeSubscriptionId);
        const subscriptionDoc = await subscriptionRef.get();
        
        const updateData = {
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          pendingContractCancellation: cancelAtPeriodEnd,
          contractCancellationDate: cancelAtPeriodEnd ? admin.firestore.Timestamp.fromDate(contractYearEnd) : admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (subscriptionDoc.exists) {
          await subscriptionRef.update(updateData);
        } else {
          await subscriptionRef.set({
            userId,
            stripeSubscriptionId,
            ...updateData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        // Update user document
        await adminDb.collection('users').doc(userId).update({
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          pendingContractCancellation: cancelAtPeriodEnd,
          contractCancellationDate: cancelAtPeriodEnd ? admin.firestore.Timestamp.fromDate(contractYearEnd) : admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log('✅ Auto-renewal preference tracked (billing continues):', { 
          subscriptionId: stripeSubscriptionId, 
          pendingCancellation: cancelAtPeriodEnd,
          contractEndDate: contractYearEnd.toISOString()
        });

        return NextResponse.json({
          success: true,
          status: 200,
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          pendingContractCancellation: cancelAtPeriodEnd,
          contractCancellationDate: cancelAtPeriodEnd ? contractYearEnd.toISOString() : null,
          billingCycle: 'monthly',
          message: cancelAtPeriodEnd 
            ? `Cancellation scheduled. Your subscription will continue with monthly payments until ${contractYearEnd.toLocaleDateString()}, then be cancelled. You can undo this anytime before then.`
            : 'Cancellation undone. Your subscription will continue normally with auto-renewal.',
        }, { status: 200 });
      }

      // For yearly subscriptions or beyond contract year, update Stripe normally
      try {
        subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: cancelAtPeriodEnd,
        });
      } catch (stripeError: any) {
        console.error('Error updating subscription in Stripe:', stripeError.message);
        throw stripeError;
      }

      // Update Firestore subscriptions collection
      const subscriptionRef = adminDb.collection('subscriptions').doc(stripeSubscriptionId);
      const subscriptionDoc = await subscriptionRef.get();
      
      if (subscriptionDoc.exists) {
        await subscriptionRef.update({
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await subscriptionRef.set({
          userId,
          stripeSubscriptionId,
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      const billingCycle = interval === 'year' ? 'yearly' : 'monthly';
      const renewalPeriod = interval === 'year' ? 'year' : 'month';

      // Update user document
      await adminDb.collection('users').doc(userId).update({
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('✅ Auto-renewal toggled in Stripe:', { 
        subscriptionId: stripeSubscriptionId, 
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        billingCycle: billingCycle
      });

      return NextResponse.json({
        success: true,
        status: 200,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        billingCycle: billingCycle,
        message: subscription.cancel_at_period_end 
          ? `Auto-renewal disabled. Your subscription will remain active until the end of the current ${renewalPeriod}, but will not renew automatically.`
          : `Auto-renewal enabled. Your subscription will renew automatically every ${renewalPeriod}.`,
      }, { status: 200 });
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

// DELETE - Request cancellation (for 12-month contract, schedules cancellation at contract end)
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

    // Get subscription details
    let subscription: Stripe.Subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (stripeError: any) {
      console.error('Error retrieving subscription:', stripeError.message);
      if (stripeError.code === 'resource_missing') {
        return NextResponse.json({ 
          error: 'Subscription not found. It may have already been cancelled.',
          expired: true 
        }, { status: 400 });
      }
      throw stripeError;
    }

    // Check if already canceled
    if (subscription.status === 'canceled') {
      return NextResponse.json({ 
        error: 'Subscription is already canceled.',
        expired: true 
      }, { status: 400 });
    }

    const priceItem = subscription.items?.data?.[0]?.price;
    const interval = priceItem?.recurring?.interval;
    const isMonthly = interval === 'month';

    // Calculate contract year end
    const startDateTimestamp = (subscription as any).start_date || subscription.created || Math.floor(Date.now() / 1000);
    const subscriptionStartDate = new Date(startDateTimestamp * 1000);
    const contractYearEnd = new Date(subscriptionStartDate);
    contractYearEnd.setMonth(contractYearEnd.getMonth() + 12);
    const now = new Date();
    const isWithinContractYear = now < contractYearEnd;
    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);

    if (isMonthly && isWithinContractYear) {
      // For monthly subscriptions within contract year:
      // Don't cancel in Stripe - just mark as pending cancellation
      // Stripe will continue charging monthly until contract year ends
      // Then we cancel via cron job
      
      console.log('📅 Monthly subscription within contract year - scheduling cancellation for:', contractYearEnd.toISOString());
      
      // Update Firestore subscriptions collection
      const subscriptionRef = adminDb.collection('subscriptions').doc(stripeSubscriptionId);
      const subscriptionDoc = await subscriptionRef.get();
      
      const updateData = {
        pendingContractCancellation: true,
        contractCancellationDate: admin.firestore.Timestamp.fromDate(contractYearEnd),
        cancellationRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (subscriptionDoc.exists) {
        await subscriptionRef.update(updateData);
      } else {
        await subscriptionRef.set({
          userId,
          stripeSubscriptionId,
          status: 'active',
          ...updateData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Update user document
      await adminDb.collection('users').doc(userId).update({
        pendingContractCancellation: true,
        contractCancellationDate: admin.firestore.Timestamp.fromDate(contractYearEnd),
        cancellationRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Keep subscription status as active - they still have access and billing continues
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('✅ Cancellation scheduled for user:', userId, 'Contract ends:', contractYearEnd.toISOString());

      return NextResponse.json({
        success: true,
        status: 200,
        pendingContractCancellation: true,
        contractCancellationDate: contractYearEnd.toISOString(),
        message: `Cancellation scheduled. Your subscription will continue with monthly payments until ${contractYearEnd.toLocaleDateString()} (end of your 12-month contract). You can still use all services and can undo this cancellation anytime before then.`,
        currentPeriodEnd: currentPeriodEnd.toISOString(),
      }, { status: 200 });
    }

    // For yearly subscriptions or beyond contract year, cancel at period end
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update Firestore subscriptions collection
    const subscriptionRef = adminDb.collection('subscriptions').doc(stripeSubscriptionId);
    const subscriptionDoc = await subscriptionRef.get();
    
    if (subscriptionDoc.exists) {
      await subscriptionRef.update({
        cancelAtPeriodEnd: true,
        cancellationRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        currentPeriodEnd: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
      });
    } else {
      await subscriptionRef.set({
        userId,
        stripeSubscriptionId,
        cancelAtPeriodEnd: true,
        cancellationRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        currentPeriodEnd: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
      });
    }

    // Update user document
    await adminDb.collection('users').doc(userId).update({
      cancelAtPeriodEnd: true,
      cancellationRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Subscription set to cancel at period end for user:', userId, 'Period ends:', currentPeriodEnd);

    return NextResponse.json({
      success: true,
      status: 200,
      cancelAtPeriodEnd: true,
      message: 'Subscription will be cancelled at the end of the current billing period. You can continue using all services until then.',
      currentPeriodEnd: currentPeriodEnd.toISOString(),
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Reactivate/Undo cancellation
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

    // Try to retrieve the subscription
    let currentSubscription: Stripe.Subscription;
    try {
      currentSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (stripeError: any) {
      return NextResponse.json({ 
        error: 'Subscription has been cancelled. Please subscribe to a new plan.',
        expired: true
      }, { status: 400 });
    }
    
    // Check if subscription has already ended
    if (currentSubscription.status === 'canceled') {
      return NextResponse.json({ 
        error: 'Subscription has been cancelled. Please subscribe to a new plan to continue service.',
        expired: true
      }, { status: 400 });
    }

    // Check if within contract year (can undo)
    const startDateTimestamp = (currentSubscription as any).start_date || currentSubscription.created || Math.floor(Date.now() / 1000);
    const subscriptionStartDate = new Date(startDateTimestamp * 1000);
    const contractYearEnd = new Date(subscriptionStartDate);
    contractYearEnd.setMonth(contractYearEnd.getMonth() + 12);
    const now = new Date();
    const isWithinContractYear = now < contractYearEnd;

    if (!isWithinContractYear) {
      return NextResponse.json({ 
        error: 'Cannot undo cancellation after contract year has ended. Please subscribe to a new plan.',
        expired: true
      }, { status: 400 });
    }

    // If subscription has cancel_at_period_end set in Stripe, clear it
    if (currentSubscription.cancel_at_period_end) {
      await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
    }

    // Update Firestore subscriptions collection
    const subscriptionRef = adminDb.collection('subscriptions').doc(stripeSubscriptionId);
    const subscriptionDoc = await subscriptionRef.get();
    
    if (subscriptionDoc.exists) {
      await subscriptionRef.update({
        status: 'active',
        cancelAtPeriodEnd: false,
        pendingContractCancellation: false,
        contractCancellationDate: admin.firestore.FieldValue.delete(),
        reactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Update user document
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'active',
      cancelAtPeriodEnd: false,
      pendingContractCancellation: false,
      contractCancellationDate: admin.firestore.FieldValue.delete(),
      subscriptionReactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Cancellation undone for user:', userId);

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Subscription has been reactivated! Auto-renewal is now enabled and your subscription will continue normally.',
      subscription: {
        id: currentSubscription.id,
        status: 'active',
        currentPeriodEnd: new Date((currentSubscription as any).current_period_end * 1000).toISOString(),
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription', details: error.message },
      { status: 500 }
    );
  }
}
