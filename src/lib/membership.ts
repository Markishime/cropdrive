import { doc, getDoc } from 'firebase/firestore';
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

export async function getMembership(userId: string): Promise<Membership | null> {
  try {
    // First, try to get the user's active subscription
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();

    // Check if user has a stripe subscription ID
    if (userData.stripeSubscriptionId) {
      const subscriptionRef = doc(db, 'subscriptions', userData.stripeSubscriptionId);
      const subscriptionSnap = await getDoc(subscriptionRef);

      if (subscriptionSnap.exists()) {
        const subscriptionData = subscriptionSnap.data();
        return {
          userId: userData.uid,
          planId: subscriptionData.planId || userData.plan || 'start',
          status: subscriptionData.status || 'active',
          stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
          stripeCustomerId: subscriptionData.stripeCustomerId,
          currentPeriodStart: subscriptionData.currentPeriodStart?.toDate() || new Date(),
          currentPeriodEnd: subscriptionData.currentPeriodEnd?.toDate() || new Date(),
          cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
          createdAt: subscriptionData.createdAt?.toDate() || new Date(),
          updatedAt: subscriptionData.updatedAt?.toDate() || new Date(),
        } as Membership;
      }
    }

    // Return basic membership info from user profile
    return {
      userId: userData.uid,
      planId: userData.plan || 'start',
      status: 'active',
      currentPeriodStart: userData.createdAt?.toDate() || new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      cancelAtPeriodEnd: false,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
    } as Membership;
  } catch (error) {
    console.error('Error getting membership:', error);
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
