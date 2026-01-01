import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  maxNetworkRetries: 2,
  timeout: 10000,
});

// GET - Fetch checkout session details from Stripe
export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    await adminAuth.verifyIdToken(token);

    // Get session ID from query params
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    console.log('📋 Fetching checkout session:', sessionId);

    // Fetch the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.default_payment_method', 'customer'],
    });

    console.log('✅ Session retrieved:', {
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
      paymentStatus: session.payment_status,
    });

    // Extract subscription details
    let subscriptionId: string | null = null;
    let customerId: string | null = null;
    let billingCycle = 'monthly';
    let currentPeriodEnd: string | null = null;
    let paymentMethod: any = null;

    // Get customer ID
    if (session.customer) {
      customerId = typeof session.customer === 'string' 
        ? session.customer 
        : session.customer.id;
    }

    // Get subscription details
    if (session.subscription) {
      const subscription = typeof session.subscription === 'string'
        ? await stripe.subscriptions.retrieve(session.subscription, {
            expand: ['default_payment_method'],
          })
        : session.subscription as Stripe.Subscription;
      
      subscriptionId = subscription.id;
      
      // Get billing cycle from subscription items
      const interval = subscription.items?.data?.[0]?.price?.recurring?.interval;
      billingCycle = interval === 'year' ? 'yearly' : 'monthly';
      
      // Get period end
      if ((subscription as any).current_period_end) {
        currentPeriodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();
      }
      
      // Get payment method
      if ((subscription as any).default_payment_method) {
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
        }
      }
      
      // If no payment method from subscription, try customer
      if (!paymentMethod && customerId) {
        try {
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
              }
            }
          }
        } catch (error) {
          console.warn('Could not fetch customer payment method:', error);
        }
      }
      
      // Last resort: try to get from all customer payment methods
      if (!paymentMethod && customerId) {
        try {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
            limit: 1,
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
            }
          }
        } catch (error) {
          console.warn('Could not fetch payment methods list:', error);
        }
      }
    }

    console.log('📊 Extracted session data:', {
      subscriptionId,
      customerId,
      billingCycle,
      currentPeriodEnd,
      hasPaymentMethod: !!paymentMethod,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        subscription: subscriptionId,
        customer: customerId,
        billingCycle,
        currentPeriodEnd,
        paymentMethod,
        paymentStatus: session.payment_status,
        status: session.status,
      },
    });

  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session', details: error.message },
      { status: 500 }
    );
  }
}

