import { adminDb } from './firebase-admin';

export interface Membership {
  userId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function parseDate(value: any, fallback: Date): Date {
  if (!value) return fallback;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? fallback : d;
  }
  if (typeof value === 'number') {
    const ms = value < 10_000_000_000 ? value * 1000 : value;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? fallback : d;
  }
  return fallback;
}

/**
 * Server-side membership check using Admin SDK
 * Use this in API routes instead of the client-side getMembership
 */
export async function getMembershipAdmin(userId: string): Promise<Membership | null> {
  try {
    if (!userId) {
      console.warn('No userId provided');
      return null;
    }

    // Get user document using Admin SDK
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();

    // Check if user has a stripe subscription ID
    if (userData?.stripeSubscriptionId) {
      try {
        const subscriptionDoc = await adminDb
          .collection('subscriptions')
          .doc(userData.stripeSubscriptionId)
          .get();

        if (subscriptionDoc.exists) {
          const subscriptionData = subscriptionDoc.data();
          return {
            userId: userData.uid || userId,
            planId: subscriptionData?.planId || userData?.plan || 'start',
            status: subscriptionData?.status || 'active',
            stripeSubscriptionId: subscriptionData?.stripeSubscriptionId || userData.stripeSubscriptionId,
            stripeCustomerId: subscriptionData?.stripeCustomerId || userData.stripeCustomerId,
            currentPeriodStart: parseDate(subscriptionData?.currentPeriodStart, new Date()),
            currentPeriodEnd: parseDate(subscriptionData?.currentPeriodEnd, new Date()),
            cancelAtPeriodEnd: subscriptionData?.cancelAtPeriodEnd || false,
            createdAt: parseDate(subscriptionData?.createdAt, new Date()),
            updatedAt: parseDate(subscriptionData?.updatedAt, new Date()),
          } as Membership;
        }
      } catch (subError) {
        console.warn('Error fetching subscription by ID, using user data:', subError);
      }
    }

    // Return basic membership info from user profile
    const userPlan = userData?.plan || 'start';
    const isPaidPlan = userPlan === 'smart' || userPlan === 'precision';
    
    // Determine status
    let membershipStatus: 'active' | 'past_due' | 'canceled' | 'trialing' = 'active';
    if (isPaidPlan && userData?.stripeSubscriptionId) {
      membershipStatus = 'active';
    } else if (isPaidPlan) {
      membershipStatus = 'active'; // User has paid plan but subscription might still be processing
    }
    
    return {
      userId: userData?.uid || userId,
      planId: userPlan,
      status: membershipStatus,
      stripeSubscriptionId: userData?.stripeSubscriptionId,
      stripeCustomerId: userData?.stripeCustomerId,
      currentPeriodStart: parseDate(userData?.currentPeriodStart ?? userData?.createdAt, new Date()),
      currentPeriodEnd: parseDate(
        userData?.currentPeriodEnd,
        // If period end is missing (common on free/start), make it long-lived.
        userPlan === 'start'
          ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      ),
      cancelAtPeriodEnd: false,
      createdAt: parseDate(userData?.createdAt, new Date()),
      updatedAt: parseDate(userData?.updatedAt, new Date()),
    } as Membership;
  } catch (error: any) {
    console.error('Error getting membership (admin):', error);

    // Dev resilience: if Firestore Admin is temporarily unavailable locally,
    // don't hard-block Palmira endpoints (they require auth anyway).
    // This prevents 403s when running without reliable Firestore connectivity.
    const isDev = process.env.NODE_ENV !== 'production';
    const isUnavailable =
      error?.code === 14 ||
      String(error?.message || '').includes('UNAVAILABLE') ||
      String(error?.details || '').includes('No connection established');

    if (isDev && isUnavailable) {
      return {
        userId,
        planId: 'start',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Membership;
    }

    return null;
  }
}

export function getMembershipStatus(membership: Membership | null): string {
  if (!membership) {
    return 'inactive';
  }

  const now = new Date();
  const periodEnd = membership.currentPeriodEnd;

  if (membership.status === 'canceled') {
    return 'canceled';
  }

  if (membership.status === 'past_due') {
    return 'past_due';
  }

  if (periodEnd < now) {
    return 'expired';
  }

  return membership.status;
}

export function isMembershipActive(membership: Membership | null): boolean {
  const status = getMembershipStatus(membership);
  return status === 'active' || status === 'trialing';
}

/**
 * Check if user has full access (active, trialing, or cancelled but still within contract period)
 * This allows access to all features except AI assistant for cancelled users
 */
export function hasFullAccess(membership: Membership | null): boolean {
  if (!membership) return false;

  const status = getMembershipStatus(membership);
  const now = new Date();

  // Active and trialing users always have full access
  if (status === 'active' || status === 'trialing') {
    return true;
  }

  // Cancelled users have full access if they're still within their contract period
  if (status === 'canceled' && membership.currentPeriodEnd > now) {
    return true;
  }

  return false;
}

/**
 * Palmira access gate.
 *
 * Product requirement: any authenticated user with a plan (planId !== 'none')
 * can access Palmira. This is intentionally less strict than `hasFullAccess`,
 * which is used for broader "paid period" checks in other parts of the app.
 */
export function canAccessPalmira(membership: Membership | null): boolean {
  if (!membership) return false;
  const planId = String(membership.planId || '').toLowerCase().trim();
  return planId !== '' && planId !== 'none';
}

/**
 * Check if user can access AI assistant/chatbot functionality
 * Only active and trialing users can use AI assistant
 */
export function canAccessAIAssistant(membership: Membership | null): boolean {
  const status = getMembershipStatus(membership);
  return status === 'active' || status === 'trialing';
}

/**
 * Get a user-friendly membership status message
 */
export function getMembershipStatusMessage(membership: Membership | null): string {
  if (!membership) {
    return 'No membership';
  }

  const status = getMembershipStatus(membership);
  const now = new Date();

  switch (status) {
    case 'active':
      return 'Active membership';
    case 'trialing':
      return 'Trial period';
    case 'canceled':
      if (membership.currentPeriodEnd > now) {
        const endDate = membership.currentPeriodEnd.toLocaleDateString();
        return `Full access until ${endDate} (cancelled)`;
      } else {
        return 'Membership expired';
      }
    case 'past_due':
      return 'Payment past due';
    case 'expired':
      return 'Membership expired';
    default:
      return 'Unknown status';
  }
}