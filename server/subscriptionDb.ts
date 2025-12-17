import { getDb } from "./db";
import { subscriptions, users, type Subscription, type InsertSubscription } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Create a new subscription for a user
 */
export async function createSubscription(
  userId: number,
  tier: "free" | "pro" = "pro",
  stripeSubscriptionId?: string,
  stripeCustomerId?: string
): Promise<Subscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      userId,
      tier,
      status: "active",
      stripeSubscriptionId,
      stripeCustomerId,
      startDate: new Date(),
      endDate,
    })
    .$returningId();

  const [created] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscription.id));

  return created!;
}

/**
 * Get active subscription for a user
 */
export async function getActiveSubscription(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return subscription || null;
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  return subscription || null;
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  subscriptionId: number,
  status: "active" | "cancelled" | "expired"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(subscriptions)
    .set({ status, updatedAt: new Date() })
    .where(eq(subscriptions.id, subscriptionId));
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(subscriptions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    );
}

/**
 * Check if user has active Pro subscription
 */
export async function hasActiveProSubscription(userId: number): Promise<boolean> {
  const subscription = await getActiveSubscription(userId);
  
  if (!subscription) return false;
  
  // Check if subscription is Pro and not expired
  if (subscription.tier !== "pro") return false;
  if (subscription.endDate && new Date() > subscription.endDate) {
    // Auto-expire if past end date
    await updateSubscriptionStatus(subscription.id, "expired");
    return false;
  }
  
  return true;
}

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: number): Promise<"free" | "pro"> {
  const hasProSubscription = await hasActiveProSubscription(userId);
  return hasProSubscription ? "pro" : "free";
}
