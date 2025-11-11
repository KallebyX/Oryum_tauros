import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, farms, InsertFarm, batches, InsertBatch,
  animals, InsertAnimal, weighings, InsertWeighing,
  milkProduction, InsertMilkProduction, financialTransactions, InsertFinancialTransaction,
  inventoryItems, InsertInventoryItem, reproductiveEvents, InsertReproductiveEvent,
  vaccinations, InsertVaccination, pastures, InsertPasture,
  supplementation, InsertSupplementation, esgChecklists, InsertESGChecklist,
  esgResponses, InsertESGResponse, badges, InsertBadge,
  challenges, InsertChallenge, challengeProgress, InsertChallengeProgress,
  aiRecommendations, InsertAIRecommendation, planningTasks, InsertPlanningTask,
  notifications, InsertNotification,
  subscriptions, InsertSubscription,
  goals, InsertGoal
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

// ========== USER HELPERS ==========

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
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserFarm(userId: number, farmId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ farmId }).where(eq(users.id, userId));
}

// ========== FARM HELPERS ==========

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
  return result[0];
}

export async function getFarmsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(farms).where(eq(farms.userId, userId));
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

// ========== BATCH HELPERS ==========

export async function createBatch(batch: InsertBatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(batches).values(batch);
  return result[0].insertId;
}

export async function getBatchesByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(batches).where(eq(batches.farmId, farmId)).orderBy(desc(batches.createdAt));
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

// ========== ANIMAL HELPERS ==========

export async function createAnimal(animal: InsertAnimal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(animals).values(animal);
  return result[0].insertId;
}

export async function getAnimalsByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  const animalsList = await db.select().from(animals).where(eq(animals.farmId, farmId)).orderBy(desc(animals.createdAt));
  
  // Calcular GMD para cada animal
  const animalsWithGMD = await Promise.all(
    animalsList.map(async (animal) => {
      const gmd = await calculateGMD(animal.id);
      return { ...animal, gmd };
    })
  );
  
  return animalsWithGMD;
}

export async function getAnimalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(animals).where(eq(animals.id, id)).limit(1);
  return result[0];
}

export async function updateAnimal(id: number, data: Partial<InsertAnimal>) {
  const db = await getDb();
  if (!db) return;
  await db.update(animals).set(data).where(eq(animals.id, id));
}

// ========== WEIGHING HELPERS ==========

export async function createWeighing(weighing: InsertWeighing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(weighings).values(weighing);
  
  await db.update(animals).set({ currentWeight: weighing.weight }).where(eq(animals.id, weighing.animalId));
  
  return result[0].insertId;
}

export async function getWeighingsByAnimalId(animalId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(weighings).where(eq(weighings.animalId, animalId)).orderBy(desc(weighings.date));
}

export async function calculateGMD(animalId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const weighingsList = await db.select().from(weighings)
    .where(eq(weighings.animalId, animalId))
    .orderBy(weighings.date);
  
  if (weighingsList.length < 2) return null;
  
  const first = weighingsList[0];
  const last = weighingsList[weighingsList.length - 1];
  
  const weightDiff = last.weight - first.weight;
  const daysDiff = Math.floor((new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return null;
  
  return weightDiff / daysDiff;
}

// ========== MILK PRODUCTION HELPERS ==========

export async function createMilkProduction(production: InsertMilkProduction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(milkProduction).values(production);
  return result[0].insertId;
}

export async function getMilkProductionByFarmId(farmId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const allProduction = await db.select().from(milkProduction)
    .where(eq(milkProduction.farmId, farmId))
    .orderBy(desc(milkProduction.date));
  
  if (startDate && endDate) {
    return allProduction.filter(p => {
      const pDate = new Date(p.date);
      return pDate >= startDate && pDate <= endDate;
    });
  }
  
  return allProduction;
}

// ========== FINANCIAL TRANSACTION HELPERS ==========

export async function createTransaction(transaction: InsertFinancialTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(financialTransactions).values(transaction);
  return result[0].insertId;
}

export async function getTransactionsByFarmId(farmId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const allTransactions = await db.select().from(financialTransactions)
    .where(eq(financialTransactions.farmId, farmId))
    .orderBy(desc(financialTransactions.date));
  
  if (startDate && endDate) {
    return allTransactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });
  }
  
  return allTransactions;
}

export async function updateTransaction(id: number, data: Partial<InsertFinancialTransaction>) {
  const db = await getDb();
  if (!db) return;
  await db.update(financialTransactions).set(data).where(eq(financialTransactions.id, id));
}

export async function deleteTransaction(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
}

export async function getFinancialSummary(farmId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return { income: 0, expense: 0, balance: 0 };
  
  const transactions = await getTransactionsByFarmId(farmId, startDate, endDate);
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    income,
    expense,
    balance: income - expense
  };
}

// ========== INVENTORY HELPERS ==========

export async function createInventoryItem(item: InsertInventoryItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(inventoryItems).values(item);
  return result[0].insertId;
}

export async function getInventoryByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(inventoryItems)
    .where(eq(inventoryItems.farmId, farmId))
    .orderBy(desc(inventoryItems.createdAt));
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

export async function getLowStockItems(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(inventoryItems)
    .where(and(
      eq(inventoryItems.farmId, farmId),
      sql`${inventoryItems.quantity} <= ${inventoryItems.minStock}`
    ));
}

// ========== ESG HELPERS ==========

export async function getActiveChecklists() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(esgChecklists)
    .where(eq(esgChecklists.isActive, true))
    .orderBy(esgChecklists.category);
}

export async function getChecklistById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(esgChecklists).where(eq(esgChecklists.id, id)).limit(1);
  return result[0];
}

export async function createESGResponse(response: InsertESGResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(esgResponses).values(response);
  return result[0].insertId;
}

export async function getESGResponsesByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(esgResponses)
    .where(eq(esgResponses.farmId, farmId))
    .orderBy(desc(esgResponses.respondedAt));
}

export async function calculateESGScore(farmId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const responses = await getESGResponsesByFarmId(farmId);
  const checklists = await getActiveChecklists();
  
  const totalPoints = responses.reduce((sum, r) => sum + r.pointsObtained, 0);
  const maxPoints = checklists.reduce((sum, c) => sum + c.maxPoints, 0);
  
  if (maxPoints === 0) return 0;
  
  return Math.round((totalPoints / maxPoints) * 100);
}

export async function awardBadge(farmId: number, score: number) {
  const db = await getDb();
  if (!db) return;
  
  let level: "bronze" | "silver" | "gold" | null = null;
  
  if (score >= 90) level = "gold";
  else if (score >= 60) level = "silver";
  else if (score >= 30) level = "bronze";
  
  if (!level) return;
  
  const badge: InsertBadge = {
    farmId,
    level,
    score,
    awardedAt: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };
  
  await db.insert(badges).values(badge);
}

export async function getBadgesByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(badges)
    .where(eq(badges.farmId, farmId))
    .orderBy(desc(badges.awardedAt));
}

// ========== CHALLENGE HELPERS ==========

export async function getActiveChallenges() {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  const allChallenges = await db.select().from(challenges)
    .where(eq(challenges.isActive, true))
    .orderBy(desc(challenges.startDate));
  
  return allChallenges.filter(c => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return start <= today && end >= today;
  });
}

export async function getChallengeProgress(farmId: number, challengeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(challengeProgress)
    .where(and(
      eq(challengeProgress.farmId, farmId),
      eq(challengeProgress.challengeId, challengeId)
    ))
    .limit(1);
  return result[0];
}

export async function getChallengeProgressByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(challengeProgress)
    .where(eq(challengeProgress.farmId, farmId));
}

export async function startChallenge(farmId: number, challengeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getChallengeProgress(farmId, challengeId);
  if (existing) {
    throw new Error("Challenge already started");
  }
  
  const challenge = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
  if (!challenge[0]) {
    throw new Error("Challenge not found");
  }
  
  await db.insert(challengeProgress).values({
    farmId,
    challengeId,
    progressPercent: 0,
    completed: false,
    pointsEarned: 0,
  });
}

export async function completeChallenge(farmId: number, challengeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getChallengeProgress(farmId, challengeId);
  if (!existing) {
    throw new Error("Challenge not started");
  }
  
  if (existing.completed) {
    throw new Error("Challenge already completed");
  }
  
  const challenge = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
  if (!challenge[0]) {
    throw new Error("Challenge not found");
  }
  
  await db.update(challengeProgress)
    .set({
      completed: true,
      completedAt: new Date(),
      pointsEarned: challenge[0].points,
    })
    .where(eq(challengeProgress.id, existing.id));
}

export async function updateChallengeProgress(farmId: number, challengeId: number, progress: number) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getChallengeProgress(farmId, challengeId);
  
  if (existing) {
    await db.update(challengeProgress)
      .set({ 
        progressPercent: progress,
        completed: progress >= 100,
        completedAt: progress >= 100 ? new Date() : null
      })
      .where(eq(challengeProgress.id, existing.id));
  } else {
    await db.insert(challengeProgress).values({
      farmId,
      challengeId,
      progressPercent: progress,
      completed: progress >= 100,
      completedAt: progress >= 100 ? new Date() : undefined
    });
  }
}

export async function getRanking(region?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const allFarms = await db.select().from(farms);
  
  const ranking = await Promise.all(
    allFarms.map(async (farm) => {
      const esgScore = await calculateESGScore(farm.id);
      const progress = await getChallengeProgressByFarmId(farm.id);
      const challengesCompleted = progress.filter(p => p.completed).length;
      const totalPoints = progress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0) + esgScore;
      
      let esgBadge = "Sem Selo";
      if (esgScore >= 90) esgBadge = "Ouro";
      else if (esgScore >= 60) esgBadge = "Prata";
      else if (esgScore >= 30) esgBadge = "Bronze";
      
      return {
        farmId: farm.id,
        farmName: farm.name,
        region: farm.region,
        totalPoints,
        challengesCompleted,
        esgBadge,
        esgScore,
      };
    })
  );
  
  const filtered = region 
    ? ranking.filter(r => r.region === region)
    : ranking;
  
  const sorted = filtered.sort((a, b) => b.totalPoints - a.totalPoints);
  
  return sorted.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }));
}

// ========== AI RECOMMENDATION HELPERS ==========

export async function createAIRecommendation(recommendation: InsertAIRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiRecommendations).values(recommendation);
  return result[0].insertId;
}

export async function getAIRecommendationsByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(aiRecommendations)
    .where(eq(aiRecommendations.farmId, farmId))
    .orderBy(desc(aiRecommendations.generatedAt))
    .limit(10);
}

// ========== PLANNING HELPERS ==========

export async function createPlanningTask(task: InsertPlanningTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(planningTasks).values(task);
  return result[0].insertId;
}

export async function getPlanningTasksByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(planningTasks)
    .where(eq(planningTasks.farmId, farmId))
    .orderBy(planningTasks.dueDate);
}

export async function toggleTaskComplete(id: number) {
  const db = await getDb();
  if (!db) return;
  
  const task = await db.select().from(planningTasks).where(eq(planningTasks.id, id)).limit(1);
  if (!task[0]) return;
  
  await db.update(planningTasks)
    .set({ 
      completed: !task[0].completed,
      completedAt: !task[0].completed ? new Date() : null
    })
    .where(eq(planningTasks.id, id));
}

export async function deletePlanningTask(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(planningTasks).where(eq(planningTasks.id, id));
}

// ========== DASHBOARD KPIs ==========

export async function getDashboardKPIs(farmId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const farm = await getFarmById(farmId);
  if (!farm) return null;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const financial = await getFinancialSummary(farmId, thirtyDaysAgo);
  
  const esgScore = await calculateESGScore(farmId);
  
  const animalsList = await getAnimalsByFarmId(farmId);
  const activeAnimals = animalsList.filter(a => a.status === 'active').length;
  
  const lowStock = await getLowStockItems(farmId);
  
  const tasks = await getPlanningTasksByFarmId(farmId);
  const pendingTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) >= new Date()).length;
  
  return {
    farm,
    financial,
    esgScore,
    activeAnimals,
    lowStockCount: lowStock.length,
    pendingTasks
  };
}

// ========== SUBSCRIPTION HELPERS ==========

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(subscription);
  return result[0].insertId;
}

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return result[0];
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0];
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function cancelSubscription(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions)
    .set({ status: "canceled", cancelAtPeriodEnd: 1 })
    .where(eq(subscriptions.id, id));
}


// ========== REPRODUCTIVE MANAGEMENT HELPERS ==========

export async function createReproductiveEvent(event: InsertReproductiveEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reproductiveEvents).values(event);
  return result[0].insertId;
}

export async function getReproductiveEventsByAnimalId(animalId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reproductiveEvents)
    .where(eq(reproductiveEvents.animalId, animalId))
    .orderBy(desc(reproductiveEvents.date));
}

export async function getReproductiveEventsByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reproductiveEvents)
    .where(eq(reproductiveEvents.farmId, farmId))
    .orderBy(desc(reproductiveEvents.date));
}

export async function updateReproductiveEvent(id: number, data: Partial<InsertReproductiveEvent>) {
  const db = await getDb();
  if (!db) return;
  await db.update(reproductiveEvents).set(data).where(eq(reproductiveEvents.id, id));
}

export async function deleteReproductiveEvent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(reproductiveEvents).where(eq(reproductiveEvents.id, id));
}

// ========== HEALTH/VACCINATION HELPERS ==========

export async function createVaccination(vaccination: InsertVaccination) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vaccinations).values(vaccination);
  return result[0].insertId;
}

export async function getVaccinationsByAnimalId(animalId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(vaccinations)
    .where(eq(vaccinations.animalId, animalId))
    .orderBy(desc(vaccinations.date));
}

export async function getVaccinationsByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(vaccinations)
    .where(eq(vaccinations.farmId, farmId))
    .orderBy(desc(vaccinations.date));
}

export async function getUpcomingVaccinations(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const allVaccinations = await db.select().from(vaccinations)
    .where(eq(vaccinations.farmId, farmId))
    .orderBy(vaccinations.nextDueDate);
  
  return allVaccinations.filter(v => {
    if (!v.nextDueDate) return false;
    const dueDate = new Date(v.nextDueDate);
    return dueDate >= today && dueDate <= thirtyDaysFromNow;
  });
}

export async function updateVaccination(id: number, data: Partial<InsertVaccination>) {
  const db = await getDb();
  if (!db) return;
  await db.update(vaccinations).set(data).where(eq(vaccinations.id, id));
}

export async function deleteVaccination(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(vaccinations).where(eq(vaccinations.id, id));
}

// ========== PASTURE MANAGEMENT HELPERS ==========

export async function createPasture(pasture: InsertPasture) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pastures).values(pasture);
  return result[0].insertId;
}

export async function getPasturesByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(pastures)
    .where(eq(pastures.farmId, farmId))
    .orderBy(pastures.name);
}

export async function updatePasture(id: number, data: Partial<InsertPasture>) {
  const db = await getDb();
  if (!db) return;
  await db.update(pastures).set(data).where(eq(pastures.id, id));
}

export async function deletePasture(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(pastures).where(eq(pastures.id, id));
}

export async function getAvailablePastures(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(pastures)
    .where(and(
      eq(pastures.farmId, farmId),
      eq(pastures.status, "active")
    ))
    .orderBy(pastures.name);
}

// ========== SUPPLEMENTATION HELPERS ==========

export async function createSupplementation(supplementationData: InsertSupplementation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supplementation).values(supplementationData);
  return result[0].insertId;
}

export async function getSupplementationByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(supplementation)
    .where(eq(supplementation.farmId, farmId))
    .orderBy(desc(supplementation.date));
}

export async function updateSupplementation(id: number, data: Partial<InsertSupplementation>) {
  const db = await getDb();
  if (!db) return;
  await db.update(supplementation).set(data).where(eq(supplementation.id, id));
}

export async function deleteSupplementation(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(supplementation).where(eq(supplementation.id, id));
}


// ========== NOTIFICATION HELPERS ==========

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(notification);
  return result[0].insertId;
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

  return result.length;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId));
}


// ========== GOAL HELPERS ==========

export async function createGoal(goal: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(goals).values(goal);
  return result[0].insertId;
}

export async function getGoalsByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(goals)
    .where(eq(goals.farmId, farmId))
    .orderBy(desc(goals.deadline));
}

export async function updateGoalProgress(goalId: number, currentValue: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar meta
  const goal = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1);
  if (goal.length === 0) throw new Error("Goal not found");

  const targetValue = parseFloat(goal[0].targetValue);
  const newStatus = currentValue >= targetValue ? "completed" : "active";

  await db
    .update(goals)
    .set({ currentValue: currentValue.toString(), status: newStatus })
    .where(eq(goals.id, goalId));

  return { success: true, status: newStatus };
}

export async function deleteGoal(goalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(goals).where(eq(goals.id, goalId));
}
