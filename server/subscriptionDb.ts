import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { subscriptions, InsertSubscription, users } from "../drizzle/schema";

// ===== SUBSCRIPTION OPERATIONS =====

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(subscriptions).values(subscription);
  return result[0].insertId;
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSubscription(stripeSubscriptionId: string, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(subscriptions)
    .set(data)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

export async function updateUserStripeCustomerId(userId: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users)
    .set({ stripeCustomerId })
    .where(eq(users.id, userId));
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(users)
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}
