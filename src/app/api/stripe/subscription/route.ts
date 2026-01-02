import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover' as any,
  maxNetworkRetries: 2,
  timeout: 10000,
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
      success: true,
      status: 200,
      subscription: null, 
      message: 'No active subscription' 
    }, { status: 200 });
    }

    // Fetch subscription from Stripe with price details
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['default_payment_method', 'latest_invoice', 'items.data.price', 'customer'],
    });

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
            // If it's just the ID, fetch the payment method
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
              // Use the most recent payment method
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
      
      // Always update user document with payment method (ensures it's always stored)
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
    const unitAmount = priceItem?.unit_amount || 0; // Amount in cents
    const currency = priceItem?.currency || 'myr';
    const interval = priceItem?.recurring?.interval || 'month';

    // Calculate subscription start date (first billing cycle start)
    // For new subscriptions, start_date is available. For existing, use created timestamp
    const subscriptionStartDate = new Date((subscription as any).start_date * 1000);
    
    // Calculate contract year end (12 months from subscription start)
    const contractYearEnd = new Date(subscriptionStartDate);
    contractYearEnd.setMonth(contractYearEnd.getMonth() + 12);

    // Calculate months used (number of complete billing periods since start)
    const now = new Date();
    const monthsUsed = Math.floor(
      (now.getTime() - subscriptionStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );

    // Check if we're beyond the first contract year
    const isBeyondContractYear = now >= contractYearEnd;

    // Check for pending contract cancellation in our database (reuse subscriptionDoc from earlier)
    const subscriptionData = subscriptionDoc.exists ? subscriptionDoc.data() : null;
    const pendingContractCancellation = subscriptionData?.pendingContractCancellation || false;
    const contractCancellationDate = subscriptionData?.contractCancellationDate?.toDate?.() || null;

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        cancelAt: (subscription as any).cancel_at ? new Date((subscription as any).cancel_at * 1000).toISOString() : null,
        billingCycle: interval,
        paymentMethod,
        // New fields for monthly contract year logic
        subscriptionStartDate: subscriptionStartDate.toISOString(),
        contractYearEnd: contractYearEnd.toISOString(),
        monthsUsed: Math.max(0, monthsUsed),
        remainingMonths: Math.max(0, 12 - monthsUsed),
        isBeyondContractYear,
        priceId,
        unitAmount, // Monthly price in cents
        currency,
        // Pending cancellation info from our database
        pendingContractCancellation,
        contractCancellationDate: contractCancellationDate ? contractCancellationDate.toISOString() : null,
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

      // Get billing cycle to determine renewal period
      const priceItem = subscription.items?.data?.[0]?.price;
      const interval = priceItem?.recurring?.interval; // 'month' or 'year'
      const billingCycle = interval === 'year' ? 'yearly' : 'monthly';
      const renewalPeriod = interval === 'year' ? 'year' : 'month';

      // Update user document - keep subscription status as 'active' even when auto-renewal is off
      // The subscription remains active until the period ends, it just won't renew automatically
      await adminDb.collection('users').doc(userId).update({
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        // Don't change subscriptionStatus - subscription is still active, just won't auto-renew
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('✅ Auto-renewal toggled:', { 
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

    // Get subscription details before cancelling to preserve period end date
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
    
    // Cancel the subscription immediately (not at period end)
    // Service access will continue until currentPeriodEnd
    await stripe.subscriptions.cancel(stripeSubscriptionId);

    // Update Firestore subscriptions collection - use set with merge to handle missing docs
    const subscriptionRef = adminDb.collection('subscriptions').doc(stripeSubscriptionId);
    const subscriptionDoc = await subscriptionRef.get();
    
    if (subscriptionDoc.exists) {
      await subscriptionRef.update({
        status: 'canceled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Preserve period end for access control
        currentPeriodEnd: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
      });
    } else {
      // Create the document if it doesn't exist
      await subscriptionRef.set({
        userId,
        stripeSubscriptionId,
        status: 'canceled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        currentPeriodEnd: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
      });
    }

    // Update user document - mark as cancelled but preserve plan and period end for access
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'canceled',
      subscriptionCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      // Keep currentPeriodEnd so service access continues until period end
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Subscription cancelled immediately for user:', userId, 'Service access until:', currentPeriodEnd);

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Subscription cancelled. Service access continues until the end of the current billing period.',
      currentPeriodEnd: currentPeriodEnd,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Reactivate a cancelled subscription (before period ends)
// Note: Since subscriptions are cancelled immediately, reactivation requires creating a new subscription
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
    let currentSubscription;
    try {
      currentSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (error: any) {
      // Subscription doesn't exist or is already deleted
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

    // If subscription is still active, reactivate by clearing cancellation flags
    // Update Firestore subscriptions collection (also clear pending contract cancellation)
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

    // Update user document (also clear pending contract cancellation)
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'active',
      cancelAtPeriodEnd: false,
      pendingContractCancellation: false,
      contractCancellationDate: admin.firestore.FieldValue.delete(),
      subscriptionReactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Subscription has been reactivated successfully!',
      subscription: {
        id: currentSubscription.id,
        status: currentSubscription.status,
        currentPeriodEnd: new Date((currentSubscription as any).current_period_end * 1000),
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

