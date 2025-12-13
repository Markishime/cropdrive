import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Secret key to protect cron endpoint (set in environment variables)
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET - Process pending contract year cancellations
 * 
 * This endpoint should be called by a cron job (e.g., daily or hourly)
 * It finds all subscriptions with pendingContractCancellation=true
 * where the contractCancellationDate has passed, and cancels them in Stripe.
 */
export async function GET(req: NextRequest) {
  try {
    // Verify this is a legitimate Vercel cron request
    // Vercel sends a special header for cron jobs, or we can use a secret in query params
    const vercelCronHeader = req.headers.get('x-vercel-cron');
    const authHeader = req.headers.get('authorization');
    const cronSecret = authHeader?.replace('Bearer ', '') || req.nextUrl.searchParams.get('secret');
    
    // Allow if it's from Vercel cron OR if secret matches
    const isVercelCron = vercelCronHeader === '1';
    const isAuthorized = cronSecret === CRON_SECRET;
    
    if (!isVercelCron && !isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = admin.firestore.Timestamp.now();

    // Query subscriptions with pending contract cancellations that are due
    const pendingCancellations = await adminDb
      .collection('subscriptions')
      .where('pendingContractCancellation', '==', true)
      .where('contractCancellationDate', '<=', now)
      .get();

    const results: Array<{
      subscriptionId: string;
      status: 'cancelled' | 'error';
      message?: string;
    }> = [];

    for (const doc of pendingCancellations.docs) {
      const data = doc.data();
      const subscriptionId = doc.id;
      const userId = data.userId;

      try {
        // Cancel the subscription in Stripe
        await stripe.subscriptions.cancel(subscriptionId);

        // Update the subscription document
        await adminDb.collection('subscriptions').doc(subscriptionId).update({
          pendingContractCancellation: false,
          contractCancellationProcessed: true,
          contractCancellationProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'canceled',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update user document
        if (userId) {
          await adminDb.collection('users').doc(userId).update({
            subscriptionStatus: 'canceled',
            pendingContractCancellation: false,
            plan: 'none',
            uploadsLimit: 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        results.push({
          subscriptionId,
          status: 'cancelled',
          message: 'Subscription cancelled at contract year end',
        });

        console.log(`✅ Cancelled subscription ${subscriptionId} at contract year end`);

      } catch (error: any) {
        console.error(`❌ Failed to cancel subscription ${subscriptionId}:`, error.message);
        
        results.push({
          subscriptionId,
          status: 'error',
          message: error.message,
        });

        // Mark the error in the database so we don't keep retrying
        await adminDb.collection('subscriptions').doc(subscriptionId).update({
          contractCancellationError: error.message,
          contractCancellationErrorAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      processedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error processing contract cancellations:', error);
    return NextResponse.json(
      { error: 'Failed to process cancellations', details: error.message },
      { status: 500 }
    );
  }
}

