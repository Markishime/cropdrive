import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  maxNetworkRetries: 2,
  timeout: 10000,
});

// GET - Fetch user's invoices from Stripe
export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json({ 
        success: true,
        status: 200,
        invoices: [], 
        message: 'No Stripe customer found' 
      }, { status: 200 });
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 100,
      expand: ['data.subscription'],
    });

    // Format invoices for frontend - sort by date (newest first)
    const formattedInvoices = invoices.data
      .map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        amount: (invoice.amount_paid || invoice.amount_due || invoice.total) / 100, // Use amount_paid if available, else amount_due, else total
        currency: invoice.currency.toUpperCase(),
        status: invoice.status,
        date: new Date(invoice.created * 1000).toISOString(), // Convert to ISO string for proper serialization
        periodStart: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
        description: invoice.lines.data[0]?.description || 'Subscription',
        planName: invoice.lines.data[0]?.description || 'CropDrive Subscription',
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, newest first

    console.log(`✅ Fetched ${formattedInvoices.length} invoices for customer ${stripeCustomerId}`);

    return NextResponse.json({ 
      success: true,
      status: 200,
      invoices: formattedInvoices,
      hasMore: invoices.has_more 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.message },
      { status: 500 }
    );
  }
}

