import { adminDb } from './firebase-admin';

export interface Membership {
  userId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  /** The 1-year contract end date (subscription start + 1 year) */
  contractEndDate: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Current month's upload count */
  uploadsUsedThisMonth?: number;
  /** Plan's monthly upload limit */
  uploadLimit?: number;
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

/** Get upload limit for a given plan */
function getUploadLimitForPlan(planId: string): number {
  const plan = planId?.toLowerCase().trim();
  switch (plan) {
    case 'start':
      return 2;
    case 'smart':
      return 5;
    case 'precision':
      return -1; // Unlimited
    default:
      return 2;
  }
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
          const createdAt = parseDate(subscriptionData?.createdAt, new Date());
          // Contract end date is 1 year from subscription creation
          const contractEndDate = parseDate(
            subscriptionData?.contractEndDate,
            new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000)
          );
          const planId = subscriptionData?.planId || userData?.plan || 'start';
          return {
            userId: userData.uid || userId,
            planId,
            status: subscriptionData?.status || 'active',
            stripeSubscriptionId: subscriptionData?.stripeSubscriptionId || userData.stripeSubscriptionId,
            stripeCustomerId: subscriptionData?.stripeCustomerId || userData.stripeCustomerId,
            currentPeriodStart: parseDate(subscriptionData?.currentPeriodStart, new Date()),
            currentPeriodEnd: parseDate(subscriptionData?.currentPeriodEnd, new Date()),
            contractEndDate,
            cancelAtPeriodEnd: subscriptionData?.cancelAtPeriodEnd || false,
            createdAt,
            updatedAt: parseDate(subscriptionData?.updatedAt, new Date()),
            uploadsUsedThisMonth: userData?.uploadsUsedThisMonth || 0,
            uploadLimit: getUploadLimitForPlan(planId),
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

    const createdAt = parseDate(userData?.createdAt, new Date());
    // Contract end date is 1 year from account/subscription creation
    const contractEndDate = parseDate(
      userData?.contractEndDate,
      new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000)
    );
    
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
      contractEndDate,
      cancelAtPeriodEnd: false,
      createdAt,
      updatedAt: parseDate(userData?.updatedAt, new Date()),
      uploadsUsedThisMonth: userData?.uploadsUsedThisMonth || 0,
      uploadLimit: getUploadLimitForPlan(userPlan),
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
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        uploadsUsedThisMonth: 0,
        uploadLimit: 2,
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
 * Check if user is within their 1-year contract period.
 * Even if monthly payment has expired, they can still access features
 * within the contract period.
 */
export function isWithinContractPeriod(membership: Membership | null): boolean {
  if (!membership) return false;
  const now = new Date();
  return membership.contractEndDate > now;
}

/**
 * Check if user has reached their upload limit for the current month.
 */
export function hasReachedUploadLimit(membership: Membership | null): boolean {
  if (!membership) return true;
  // -1 means unlimited
  if (membership.uploadLimit === -1) return false;
  const used = membership.uploadsUsedThisMonth || 0;
  const limit = membership.uploadLimit || 2;
  return used >= limit;
}

/**
 * Palmira access gate.
 *
 * Product requirement: Users within their 1-year contract period can access 
 * the AI assistant to view their history and reports. The "Subscription Expired"
 * message only shows after the 1-year contract ends.
 * 
 * For users with no plan at all, they cannot access Palmira.
 */
export function canAccessPalmira(membership: Membership | null): boolean {
  if (!membership) return false;
  const planId = String(membership.planId || '').toLowerCase().trim();
  
  // Must have a valid plan
  if (planId === '' || planId === 'none') return false;
  
  // Check if within 1-year contract period
  return isWithinContractPeriod(membership);
}

/**
 * Check if user can perform new analysis (upload new files for AI analysis).
 * Requires being within contract AND not having reached upload limit.
 */
export function canPerformAnalysis(membership: Membership | null): boolean {
  if (!membership) return false;
  
  // Must be within contract period
  if (!isWithinContractPeriod(membership)) return false;
  
  // Must not have reached upload limit
  if (hasReachedUploadLimit(membership)) return false;
  
  return true;
}

/**
 * Check if the subscription has fully expired (contract period ended).
 * This is when we show the "Subscription Expired" message.
 */
export function isContractExpired(membership: Membership | null): boolean {
  if (!membership) return true;
  return !isWithinContractPeriod(membership);
}

/**
 * Check if user can access AI assistant/chatbot functionality.
 * Users within contract can access AI assistant; only after contract expires
 * do they lose access.
 */
export function canAccessAIAssistant(membership: Membership | null): boolean {
  return canAccessPalmira(membership);
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
  const withinContract = isWithinContractPeriod(membership);

  // If within contract period, show positive message even if billing has issues
  if (withinContract) {
    const contractEndStr = membership.contractEndDate.toLocaleDateString();
    
    if (status === 'active' || status === 'trialing') {
      return `Active membership (contract until ${contractEndStr})`;
    }
    
    if (status === 'past_due') {
      return `Payment past due - access continues until ${contractEndStr}`;
    }
    
    if (status === 'canceled') {
      return `Cancelled - access continues until ${contractEndStr}`;
    }
    
    return `Access until ${contractEndStr}`;
  }

  // Contract has ended
  switch (status) {
    case 'active':
      return 'Active membership';
    case 'trialing':
      return 'Trial period';
    case 'canceled':
      return 'Subscription expired';
    case 'past_due':
      return 'Subscription expired - payment past due';
    case 'expired':
      return 'Subscription expired';
    default:
      return 'Subscription expired';
  }
}