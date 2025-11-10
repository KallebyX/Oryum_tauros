import { eq, and, desc, sql, gte, lte, between } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  farms, InsertFarm,
  batches, InsertBatch,
  financialTransactions, InsertFinancialTransaction,
  inventoryItems, InsertInventoryItem,
  esgChecklists, InsertESGChecklist,
  esgResponses, InsertESGResponse,
  badges, InsertBadge,
  challenges, InsertChallenge,
  challengeProgress, InsertChallengeProgress,
  aiRecommendations, InsertAIRecommendation,
  planningEvents, InsertPlanningEvent
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER OPERATIONS =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.farmId !== undefined) {
      values.farmId = user.farmId;
      updateSet.farmId = user.farmId;
    }
    if (user.language !== undefined) {
      values.language = user.language;
      updateSet.language = user.language;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserFarm(userId: number, farmId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ farmId }).where(eq(users.id, userId));
}

// ===== FARM OPERATIONS =====

export async function createFarm(farm: InsertFarm) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(farms).values(farm);
  return result[0].insertId;
}

export async function getFarmById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(farms).where(eq(farms.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllFarms() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(farms).orderBy(desc(farms.createdAt));
}

export async function getFarmsByRegion(region: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(farms).where(eq(farms.region, region));
}

export async function updateFarm(id: number, data: Partial<InsertFarm>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(farms).set(data).where(eq(farms.id, id));
}

export async function deleteFarm(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(farms).where(eq(farms.id, id));
}

// ===== BATCH OPERATIONS =====

export async function createBatch(batch: InsertBatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(batches).values(batch);
  return result[0].insertId;
}

export async function getBatchesByFarm(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(batches).where(eq(batches.farmId, farmId));
}

export async function updateBatch(id: number, data: Partial<InsertBatch>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(batches).set(data).where(eq(batches.id, id));
}

export async function deleteBatch(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(batches).where(eq(batches.id, id));
}

// ===== FINANCIAL TRANSACTION OPERATIONS =====

export async function createTransaction(transaction: InsertFinancialTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(financialTransactions).values(transaction);
  return result[0].insertId;
}

export async function getTransactionsByFarm(farmId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(financialTransactions).where(eq(financialTransactions.farmId, farmId));
  
  if (startDate && endDate) {
    return await db.select().from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.farmId, farmId),
          between(financialTransactions.date, startDate, endDate)
        )
      )
      .orderBy(desc(financialTransactions.date));
  }
  
  return await query.orderBy(desc(financialTransactions.date));
}

export async function getFinancialSummary(farmId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return { income: 0, expenses: 0, balance: 0 };
  
  let conditions = [eq(financialTransactions.farmId, farmId)];
  
  if (startDate && endDate) {
    conditions.push(between(financialTransactions.date, startDate, endDate));
  }
  
  const transactions = await db.select().from(financialTransactions)
    .where(and(...conditions));
  
  const income = transactions
    .filter(t => t.type === 'sale' || t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = transactions
    .filter(t => t.type === 'purchase' || t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    income,
    expenses,
    balance: income - expenses
  };
}

export async function deleteTransaction(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
}

// ===== INVENTORY OPERATIONS =====

export async function createInventoryItem(item: InsertInventoryItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(inventoryItems).values(item);
  return result[0].insertId;
}

export async function getInventoryByFarm(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(inventoryItems).where(eq(inventoryItems.farmId, farmId));
}

export async function getLowStockItems(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(inventoryItems)
    .where(
      and(
        eq(inventoryItems.farmId, farmId),
        sql`${inventoryItems.quantity} <= ${inventoryItems.minStock}`
      )
    );
}

export async function getExpiringSoonItems(farmId: number, daysAhead: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return await db.select().from(inventoryItems)
    .where(
      and(
        eq(inventoryItems.farmId, farmId),
        lte(inventoryItems.expiryDate, futureDate)
      )
    );
}

export async function updateInventoryItem(id: number, data: Partial<InsertInventoryItem>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(inventoryItems).set(data).where(eq(inventoryItems.id, id));
}

export async function deleteInventoryItem(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
}

// ===== ESG CHECKLIST OPERATIONS =====

export async function createESGChecklist(checklist: InsertESGChecklist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(esgChecklists).values(checklist);
  return result[0].insertId;
}

export async function getAllESGChecklists() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(esgChecklists).where(eq(esgChecklists.isActive, true));
}

export async function getESGChecklistById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(esgChecklists).where(eq(esgChecklists.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== ESG RESPONSE OPERATIONS =====

export async function createESGResponse(response: InsertESGResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(esgResponses).values(response);
  return result[0].insertId;
}

export async function getESGResponsesByFarm(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(esgResponses).where(eq(esgResponses.farmId, farmId));
}

export async function calculateESGScore(farmId: number) {
  const db = await getDb();
  if (!db) return { score: 0, maxScore: 0, percentage: 0 };
  
  const responses = await db.select().from(esgResponses).where(eq(esgResponses.farmId, farmId));
  const checklists = await db.select().from(esgChecklists).where(eq(esgChecklists.isActive, true));
  
  const totalPoints = responses.reduce((sum, r) => sum + (r.pointsObtained || 0), 0);
  const maxPoints = checklists.reduce((sum, c) => sum + (c.maxPoints || 0), 0);
  const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  
  return {
    score: totalPoints,
    maxScore: maxPoints,
    percentage
  };
}

// ===== BADGE OPERATIONS =====

export async function createBadge(badge: InsertBadge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(badges).values(badge);
  return result[0].insertId;
}

export async function getLatestBadgeByFarm(farmId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(badges)
    .where(eq(badges.farmId, farmId))
    .orderBy(desc(badges.grantedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getBadgesByFarm(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(badges)
    .where(eq(badges.farmId, farmId))
    .orderBy(desc(badges.grantedAt));
}

// ===== CHALLENGE OPERATIONS =====

export async function createChallenge(challenge: InsertChallenge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(challenges).values(challenge);
  return result[0].insertId;
}

export async function getActiveChallenges() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return await db.select().from(challenges)
    .where(
      and(
        eq(challenges.isActive, true),
        lte(challenges.startDate, now),
        gte(challenges.endDate, now)
      )
    );
}

export async function getAllChallenges() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(challenges).orderBy(desc(challenges.startDate));
}

// ===== CHALLENGE PROGRESS OPERATIONS =====

export async function createChallengeProgress(progress: InsertChallengeProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(challengeProgress).values(progress);
  return result[0].insertId;
}

export async function getChallengeProgressByFarm(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(challengeProgress).where(eq(challengeProgress.farmId, farmId));
}

export async function updateChallengeProgress(id: number, data: Partial<InsertChallengeProgress>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(challengeProgress).set(data).where(eq(challengeProgress.id, id));
}

// ===== AI RECOMMENDATION OPERATIONS =====

export async function createAIRecommendation(recommendation: InsertAIRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiRecommendations).values(recommendation);
  return result[0].insertId;
}

export async function getAIRecommendationsByFarm(farmId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(aiRecommendations)
    .where(eq(aiRecommendations.farmId, farmId))
    .orderBy(desc(aiRecommendations.generatedAt))
    .limit(limit);
}

export async function markRecommendationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(aiRecommendations).set({ isRead: true }).where(eq(aiRecommendations.id, id));
}

// ===== PLANNING EVENT OPERATIONS =====

export async function createPlanningEvent(event: InsertPlanningEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(planningEvents).values(event);
  return result[0].insertId;
}

export async function getPlanningEventsByFarm(farmId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  if (startDate && endDate) {
    return await db.select().from(planningEvents)
      .where(
        and(
          eq(planningEvents.farmId, farmId),
          between(planningEvents.date, startDate, endDate)
        )
      )
      .orderBy(planningEvents.date);
  }
  
  return await db.select().from(planningEvents)
    .where(eq(planningEvents.farmId, farmId))
    .orderBy(planningEvents.date);
}

export async function updatePlanningEvent(id: number, data: Partial<InsertPlanningEvent>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(planningEvents).set(data).where(eq(planningEvents.id, id));
}

export async function deletePlanningEvent(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(planningEvents).where(eq(planningEvents.id, id));
}

// ===== RANKING OPERATIONS =====

export async function getGlobalRanking(region?: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all farms with their latest badge
  const allFarms = region 
    ? await db.select().from(farms).where(eq(farms.region, region))
    : await db.select().from(farms);
  
  const ranking = await Promise.all(
    allFarms.map(async (farm) => {
      const latestBadge = await getLatestBadgeByFarm(farm.id);
      const esgScore = await calculateESGScore(farm.id);
      
      return {
        farmId: farm.id,
        farmName: farm.name,
        region: farm.region,
        badgeLevel: latestBadge?.level || null,
        score: esgScore.percentage,
        grantedAt: latestBadge?.grantedAt || null
      };
    })
  );
  
  // Sort by score descending
  return ranking
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ===== DASHBOARD KPIs =====

export async function getDashboardKPIs(farmId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  // Financial data
  const currentFinancial = await getFinancialSummary(farmId, thirtyDaysAgo, now);
  const previousFinancial = await getFinancialSummary(farmId, sixtyDaysAgo, thirtyDaysAgo);
  
  // ESG score
  const esgScore = await calculateESGScore(farmId);
  
  // Latest badge
  const latestBadge = await getLatestBadgeByFarm(farmId);
  
  // Inventory alerts
  const lowStockItems = await getLowStockItems(farmId);
  const expiringItems = await getExpiringSoonItems(farmId);
  
  // Active challenges
  const farmChallenges = await getChallengeProgressByFarm(farmId);
  const activeChallenges = farmChallenges.filter(c => !c.completed);
  
  return {
    financial: {
      current: currentFinancial,
      previous: previousFinancial,
      trend: currentFinancial.balance > previousFinancial.balance ? 'up' : 'down'
    },
    esg: esgScore,
    badge: latestBadge,
    alerts: {
      lowStock: lowStockItems.length,
      expiring: expiringItems.length
    },
    challenges: {
      active: activeChallenges.length,
      completed: farmChallenges.filter(c => c.completed).length
    }
  };
}
