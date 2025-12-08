import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use Stripe secret key from environment variable
// For testing, set STRIPE_SECRET_KEY in your .env.local file
function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== Checkout API Called ===');
    
    // Initialize Stripe
    const stripe = getStripe();
    if (!stripe) {
      console.error('❌ Stripe not initialized - STRIPE_SECRET_KEY missing');
      return NextResponse.json(
        { error: 'Payment system not configured', details: 'Stripe secret key is missing' },
        { status: 500 }
      );
    }
    console.log('✅ Stripe initialized successfully');
    
    // Get the base URL from request headers (for correct redirect in production)
    // We prioritize the production URL unless we are explicitly in a localhost environment
    const host = req.headers.get('host');
    let baseUrl = 'https://cropdrive.ai';
    
    if (host && host.includes('localhost')) {
      baseUrl = `http://${host}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    }
    
    console.log('Base URL detected:', baseUrl);
    
    // Get the current user
    const authHeader = req.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Unauthorized - Please login again' }, { status: 401 });
    }

    // For development, skip token verification if in test mode
    let userId: string;

    // Check if we're in development/test mode
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';
    
    if (isDevelopment) {
      // In development, extract user ID from token without verification
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.user_id || decoded.uid || 'demo-user';
        console.log('Development mode: Extracted userId:', userId);
      } catch (error) {
        console.error('Error decoding token in dev mode:', error);
        return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
      }
    } else {
      // In production, verify Firebase token
      try {
        const { adminAuth } = await import('@/lib/firebase-admin');
        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
        console.log('Production mode: Verified userId:', userId);
      } catch (error) {
        console.error('Error verifying token in production:', error);
        return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
      }
    }

    // Get user data - in development mode, decode from token; in production, use Firestore
    let userData: any;
    
    if (isDevelopment) {
      // In development, extract email from Firebase token
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userData = {
          email: decoded.email || `user-${userId}@test.com`,
          uid: userId,
        };
        console.log('Development mode: Using email from token:', userData.email);
      } catch (error) {
        console.error('Error extracting email from token:', error);
        // Fallback email for testing
        userData = {
          email: `user-${userId}@test.com`,
          uid: userId,
        };
      }
    } else {
      // In production, get from Firestore using Admin SDK
      try {
        const { adminDb } = await import('@/lib/firebase-admin');
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        userData = userDoc.data();
      } catch (error) {
        console.error('Error fetching user from Firestore:', error);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
      }
    }
    
    console.log('User data retrieved:', { email: userData.email, uid: userId });
    
    const { planId, isYearly } = await req.json();
    console.log('Plan details:', { planId, isYearly });

    // Validate plan ID
    if (!planId || !['start', 'smart', 'precision'].includes(planId)) {
      console.error('Invalid plan ID:', planId);
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Get price ID from environment variables ONLY
    // Only use price IDs that are properly configured in Stripe
    const priceIds = {
      start: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY || null,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY || null,
      },
      smart: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY || null,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY || null,
      },
      precision: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY || null,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY || null,
      },
    };

    let priceId: string | null = priceIds[planId as keyof typeof priceIds][isYearly ? 'yearly' : 'monthly'];
    console.log('Price ID from env:', priceId || '(not set - will use inline pricing)');

    // Important: ALWAYS use Stripe Checkout Sessions (not payment links) 
    // to ensure metadata is properly passed to webhooks for plan activation
    // If the price ID is a direct URL (https://buy.stripe.com), we need to 
    // extract the actual Price ID or create an inline price
    
    if (priceId && priceId.startsWith('https://buy.stripe.com')) {
      console.warn('⚠️ Direct Stripe payment link detected. Converting to checkout session...');
      priceId = null; // Force inline pricing for proper metadata handling
    }
    
    // Also reject invalid/test price IDs that don't actually exist in Stripe
    // Valid Stripe price IDs start with 'price_' (can be price_1xxxxx for live or price_testxxxxx for test)
    if (priceId && !priceId.startsWith('price_')) {
      console.warn('⚠️ Price ID does not look like a real Stripe price ID:', priceId);
      priceId = null; // Force inline pricing
    }

    // Create Stripe checkout session (with proper metadata for webhooks)
    const sessionConfig: any = {
      customer_email: userData.email,
      mode: 'subscription',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        userId: userId,
        planId: planId,
        isYearly: isYearly.toString(),
      },
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
    };

    // Try to use existing price IDs, fallback to creating inline prices for testing
    if (priceId && priceId.startsWith('price_')) {
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
      sessionConfig.subscription_data = {
        metadata: {
          userId: userId,
          planId: planId,
          isYearly: isYearly.toString(),
        },
      };
    } else {
      // Create inline price for testing (when no Stripe Price ID is configured)
      // Prices in cents (smallest currency unit): MYR 36 = 3600 cents
      const planPrices = {
        start: { monthly: 3600, yearly: 35000 },      // 36 RM/month, 350 RM/year
        smart: { monthly: 4700, yearly: 45000 },      // 47 RM/month, 450 RM/year
        precision: { monthly: 6500, yearly: 62000 },  // 65 RM/month, 620 RM/year
      };
      
      const price = planPrices[planId as keyof typeof planPrices][isYearly ? 'yearly' : 'monthly'];
      
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: `CropDrive ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
              description: `${isYearly ? 'Yearly' : 'Monthly'} subscription to CropDrive AI`,
            },
            unit_amount: price,
            recurring: {
              interval: isYearly ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ];
    }

    console.log('📤 Creating Stripe checkout session with config:', {
      customer_email: sessionConfig.customer_email,
      mode: sessionConfig.mode,
      success_url: sessionConfig.success_url,
      cancel_url: sessionConfig.cancel_url,
      metadata: sessionConfig.metadata,
      hasLineItems: !!sessionConfig.line_items,
      lineItemType: sessionConfig.line_items?.[0]?.price ? 'existing_price' : 'inline_price',
    });

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('✅ Stripe checkout session created:', {
      sessionId: session.id,
      url: session.url?.substring(0, 50) + '...',
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('=== Checkout Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    // Check for specific Stripe errors
    let errorMessage = 'Failed to create checkout session';
    let statusCode = 500;
    
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Stripe configuration error: ${error.message}`;
      console.error('Stripe raw:', error.raw);
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe API key is invalid';
    } else if (error.type === 'StripeConnectionError') {
      errorMessage = 'Could not connect to Stripe';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        type: error.type || error.constructor.name,
        code: error.code
      },
      { status: statusCode }
    );
  }
}
