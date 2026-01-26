import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

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
          return {
            userId: userData.uid || userId,
            planId: subscriptionData.planId || userData.plan || 'start',
            status: subscriptionData.status || 'active',
            stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
            stripeCustomerId: subscriptionData.stripeCustomerId,
            currentPeriodStart: subscriptionData.currentPeriodStart?.toDate ? subscriptionData.currentPeriodStart.toDate() : new Date(),
            currentPeriodEnd: subscriptionData.currentPeriodEnd?.toDate ? subscriptionData.currentPeriodEnd.toDate() : new Date(),
            cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
            createdAt: subscriptionData.createdAt?.toDate ? subscriptionData.createdAt.toDate() : new Date(),
            updatedAt: subscriptionData.updatedAt?.toDate ? subscriptionData.updatedAt.toDate() : new Date(),
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
          return {
            userId: userData.uid || userId,
            planId: activeSubscription.planId || userData.plan || 'start',
            status: activeSubscription.status || 'active',
            stripeSubscriptionId: activeSubscription.stripeSubscriptionId,
            stripeCustomerId: activeSubscription.stripeCustomerId,
            currentPeriodStart: activeSubscription.currentPeriodStart?.toDate ? activeSubscription.currentPeriodStart.toDate() : new Date(),
            currentPeriodEnd: activeSubscription.currentPeriodEnd?.toDate ? activeSubscription.currentPeriodEnd.toDate() : new Date(),
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd || false,
            createdAt: activeSubscription.createdAt?.toDate ? activeSubscription.createdAt.toDate() : new Date(),
            updatedAt: activeSubscription.updatedAt?.toDate ? activeSubscription.updatedAt.toDate() : new Date(),
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
    
    return {
      userId: userData.uid || userId,
      planId: userPlan,
      status: membershipStatus,
      stripeSubscriptionId: userData.stripeSubscriptionId,
      stripeCustomerId: userData.stripeCustomerId,
      currentPeriodStart: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      cancelAtPeriodEnd: false,
      createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(),
      updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date(),
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