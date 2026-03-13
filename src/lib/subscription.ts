import { PrismaClient, Subscription, SubscriptionPlan } from '@/generated/prisma/client';

const db = new PrismaClient();

export type UserSubscriptionWithPlan = Subscription & {
  plan: SubscriptionPlan;
};

/**
 * Fetches the most recent active subscription for a user, including the plan details.
 */
export async function getUserSubscription(userId: string): Promise<UserSubscriptionWithPlan | null> {
  try {
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        active: true,
        OR: [
          { endsAt: null },
          { endsAt: { gt: new Date() } },
        ],
      },
      include: {
        plan: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return subscription as UserSubscriptionWithPlan | null;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Checks if the user's current tier meets or exceeds the required tier.
 * Tiers are: 0=Free, 1=Silver, 2=Gold, 3=Live
 */
export function hasAccessToTier(currentTier: number, requiredTier: number): boolean {
  return currentTier >= requiredTier;
}

/**
 * Higher-level utility to check if a user has access to a specific content tier.
 */
export async function checkUserAccess(userId: string, requiredTier: number): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  const currentTier = subscription?.plan?.tier ?? 0;
  return hasAccessToTier(currentTier, requiredTier);
}

/**
 * Check if user has any active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription !== null;
}