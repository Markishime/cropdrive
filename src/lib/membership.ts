import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/** Get upload limit for a given plan */
function getUploadLimitForPlan(planId: string): number {
  return 2;
}

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

// Helper function to find active subscription for a user
async function findActiveSubscription(userId: string): Promise<any | null> {
  try {
    // Check if db is initialized
    if (!db) {
      console.warn('Firestore db not initialized');
      return null;
    }

    const subscriptionsRef = collection(db, 'subscriptions');
    
    // Try query with status filter first
    try {
      const q = query(
        subscriptionsRef,
        where('userId', '==', userId),
        where('status', 'in', ['active', 'trialing']),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
    } catch (queryError: any) {
      // If query fails (e.g., missing index), try simpler query
      console.warn('Complex query failed, trying simpler query:', queryError);
      
      try {
        const simpleQ = query(
          subscriptionsRef,
          where('userId', '==', userId),
          limit(10)
        );

        const snapshot = await getDocs(simpleQ);
        if (!snapshot.empty) {
          // Filter in memory for active subscriptions
          const activeSubs = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((sub: any) => sub.status === 'active' || sub.status === 'trialing')
            .sort((a: any, b: any) => {
              const aDate = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
              const bDate = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
              return bDate - aDate;
            });

          if (activeSubs.length > 0) {
            return activeSubs[0];
          }
        }
      } catch (simpleError) {
        console.error('Simple query also failed:', simpleError);
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding active subscription:', error);
    return null;
  }
}

export async function getMembership(userId: string): Promise<Membership | null> {
  try {
    // Check if db is initialized
    if (!db) {
      console.warn('Firestore db not initialized');
      return null;
    }

    if (!userId) {
      console.warn('No userId provided');
      return null;
    }

    // First, try to get the user's active subscription
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();

    // Check if user has a stripe subscription ID
    if (userData.stripeSubscriptionId) {
      try {
        const subscriptionRef = doc(db, 'subscriptions', userData.stripeSubscriptionId);
        const subscriptionSnap = await getDoc(subscriptionRef);

        if (subscriptionSnap.exists()) {
          const subscriptionData = subscriptionSnap.data();
          const createdAt = subscriptionData.createdAt?.toDate ? subscriptionData.createdAt.toDate() : new Date();
          // Contract end date is 1 year from subscription creation
          const contractEndDate = subscriptionData.contractEndDate?.toDate 
            ? subscriptionData.contractEndDate.toDate() 
            : new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000);
          return {
            userId: userData.uid || userId,
            planId: subscriptionData.planId || userData.plan || 'start',
            status: subscriptionData.status || 'active',
            stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
            stripeCustomerId: subscriptionData.stripeCustomerId,
            currentPeriodStart: subscriptionData.currentPeriodStart?.toDate ? subscriptionData.currentPeriodStart.toDate() : new Date(),
            currentPeriodEnd: subscriptionData.currentPeriodEnd?.toDate ? subscriptionData.currentPeriodEnd.toDate() : new Date(),
            contractEndDate,
            cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
            createdAt,
            updatedAt: subscriptionData.updatedAt?.toDate ? subscriptionData.updatedAt.toDate() : new Date(),
            uploadsUsedThisMonth: userData.uploadsUsedThisMonth || 0,
            uploadLimit: getUploadLimitForPlan(subscriptionData.planId || userData.plan || 'start'),
          } as Membership;
        }
      } catch (subError) {
        console.warn('Error fetching subscription by ID, trying fallback:', subError);
      }
    }

    // Fallback: Try to find any active subscription for this user
    // Only try this if we don't have a direct subscription ID to avoid unnecessary queries
    if (!userData.stripeSubscriptionId) {
      try {
        const activeSubscription = await findActiveSubscription(userId);
        if (activeSubscription) {
          const createdAt = activeSubscription.createdAt?.toDate ? activeSubscription.createdAt.toDate() : new Date();
          const contractEndDate = activeSubscription.contractEndDate?.toDate 
            ? activeSubscription.contractEndDate.toDate() 
            : new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000);
          const planId = activeSubscription.planId || userData.plan || 'start';
          return {
            userId: userData.uid || userId,
            planId,
            status: activeSubscription.status || 'active',
            stripeSubscriptionId: activeSubscription.stripeSubscriptionId,
            stripeCustomerId: activeSubscription.stripeCustomerId,
            currentPeriodStart: activeSubscription.currentPeriodStart?.toDate ? activeSubscription.currentPeriodStart.toDate() : new Date(),
            currentPeriodEnd: activeSubscription.currentPeriodEnd?.toDate ? activeSubscription.currentPeriodEnd.toDate() : new Date(),
            contractEndDate,
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd || false,
            createdAt,
            updatedAt: activeSubscription.updatedAt?.toDate ? activeSubscription.updatedAt.toDate() : new Date(),
            uploadsUsedThisMonth: userData.uploadsUsedThisMonth || 0,
            uploadLimit: getUploadLimitForPlan(planId),
          } as Membership;
        }
      } catch (queryError) {
        console.warn('Error finding active subscription, using user data:', queryError);
      }
    }

    // Return basic membership info from user profile
    // If user has a plan set (smart or precision), consider it active even without subscription document
    const userPlan = userData.plan || 'start';
    const isPaidPlan = userPlan === 'smart' || userPlan === 'precision';
    
    // Determine status: if user has paid plan and subscription ID, it's active
    // If they have paid plan but no subscription ID yet, still mark as active (webhook processing)
    let membershipStatus: 'active' | 'past_due' | 'canceled' | 'trialing' = 'active';
    if (isPaidPlan && userData.stripeSubscriptionId) {
      membershipStatus = 'active';
    } else if (isPaidPlan) {
      // User has paid plan but subscription might still be processing
      membershipStatus = 'active';
    }

    const createdAt = userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date();
    // Contract end date is 1 year from account/subscription creation
    const contractEndDate = userData.contractEndDate?.toDate 
      ? userData.contractEndDate.toDate() 
      : new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    return {
      userId: userData.uid || userId,
      planId: userPlan,
      status: membershipStatus,
      stripeSubscriptionId: userData.stripeSubscriptionId,
      stripeCustomerId: userData.stripeCustomerId,
      currentPeriodStart: createdAt,
      currentPeriodEnd: userPlan === 'start'
        ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years for start plan
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days for paid plans
      contractEndDate,
      cancelAtPeriodEnd: false,
      createdAt,
      updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date(),
      uploadsUsedThisMonth: userData.uploadsUsedThisMonth || 0,
      uploadLimit: getUploadLimitForPlan(userPlan),
    } as Membership;
  } catch (error: any) {
    // Don't log Firestore internal assertion errors as they're often transient
    if (error?.message?.includes('INTERNAL ASSERTION FAILED')) {
      console.warn('Firestore internal error (likely transient):', error.message);
    } else {
      console.error('Error getting membership:', error);
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

  // Users within their contract period have full access
  if (isWithinContractPeriod(membership)) {
    return true;
  }

  // Cancelled users have full access if they're still within their contract period
  if (status === 'canceled' && membership.currentPeriodEnd > now) {
    return true;
  }

  return false;
}

/**
 * Check if user can access AI assistant/chatbot functionality
 * Users within their 1-year contract can access AI assistant
 */
export function canAccessAIAssistant(membership: Membership | null): boolean {
  if (!membership) return false;

  if (!isWithinContractPeriod(membership)) return false;

  const uploadsUsed = membership.uploadsUsedThisMonth || 0;
  const uploadLimit = membership.uploadLimit || 2;
  return uploadsUsed < uploadLimit;
}

/**
 * Get a user-friendly membership status message
 */
export function getMembershipStatusMessage(membership: Membership | null): string {
  if (!membership) {
    return 'No membership';
  }

  const status = getMembershipStatus(membership);
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