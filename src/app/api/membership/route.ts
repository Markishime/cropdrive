import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe-server';
import { 
  canAccessAIAssistant, 
  canAccessPalmira, 
  hasFullAccess, 
  getMembershipStatusMessage,
  isWithinContractPeriod,
  hasReachedUploadLimit,
  canPerformAnalysis,
  isContractExpired
} from '@/lib/membership-admin';
import type { Membership } from '@/lib/membership-admin';


/** Compute contract year end from Stripe subscription (same logic as payment-method "Full Access Until") */
async function getContractYearEndFromStripe(stripeSubscriptionId: string): Promise<Date | null> {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const startTimestamp = (subscription as any).start_date ?? subscription.created ?? Math.floor(Date.now() / 1000);
    const startDate = new Date(startTimestamp * 1000);
    if (isNaN(startDate.getTime())) return null;
    const contractYearEnd = new Date(startDate);
    contractYearEnd.setMonth(contractYearEnd.getMonth() + 12);
    return contractYearEnd;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const stripe = getStripe();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { getMembershipAdmin } = await import('@/lib/membership-admin');

    let membership = await getMembershipAdmin(userId);

    // Use Stripe contract year end when available (same as "Full Access Until" on payment page)
    if (membership?.stripeSubscriptionId) {
      const stripeContractEnd = await getContractYearEndFromStripe(membership.stripeSubscriptionId);
      if (stripeContractEnd) {
        const existingEnd = membership.contractEndDate ? new Date(membership.contractEndDate) : null;
        // Use the later of the two so we never shorten access; Stripe is source of truth for "full access until"
        const effectiveEnd = !existingEnd || stripeContractEnd > existingEnd ? stripeContractEnd : existingEnd;
        membership = {
          ...membership,
          contractEndDate: effectiveEnd,
        } as Membership;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        canAccessAI: canAccessAIAssistant(membership),
        canAccessPalmira: canAccessPalmira(membership),
        hasFullAccess: hasFullAccess(membership),
        statusMessage: getMembershipStatusMessage(membership),
        isWithinContract: isWithinContractPeriod(membership),
        isContractExpired: isContractExpired(membership),
        canPerformAnalysis: canPerformAnalysis(membership),
        hasReachedUploadLimit: hasReachedUploadLimit(membership),
        uploadsUsedThisMonth: membership?.uploadsUsedThisMonth || 0,
        uploadLimit: membership?.uploadLimit || 2,
        contractEndDate: membership?.contractEndDate?.toISOString() || null,
        membership: membership
      }
    });
  } catch (error: any) {
    console.error('Error checking membership:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}