import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "producer", "manager", "auditor"]).default("user").notNull(),
  farmId: int("farmId"),
  language: varchar("language", { length: 5 }).default("pt"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscriptions table - tracks user subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete"]).notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Farms table - represents rural properties
 */
export const farms = mysqlTable("farms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 100 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }).default("BR"),
  sizeHectares: int("sizeHectares"),
  animalCount: int("animalCount"),
  farmType: varchar("farmType", { length: 50 }).default("cattle"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Farm = typeof farms.$inferSelect;
export type InsertFarm = typeof farms.$inferInsert;

/**
 * Batches/Lotes - groups of animals
 */
export const batches = mysqlTable("batches", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).default("cattle"),
  quantity: int("quantity").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Batch = typeof batches.$inferSelect;
export type InsertBatch = typeof batches.$inferInsert;

/**
 * Financial Transactions - sales, purchases, expenses
 */
export const financialTransactions = mysqlTable("financial_transactions", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  type: mysqlEnum("type", ["sale", "purchase", "expense", "income"]).notNull(),
  description: text("description"),
  amount: int("amount").notNull(), // Store as cents/centavos
  category: varchar("category", { length: 100 }),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

/**
 * Inventory Items - feed, medicines, supplies
 */
export const inventoryItems = mysqlTable("inventory_items", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }),
  quantity: int("quantity").default(0),
  unit: varchar("unit", { length: 20 }).default("kg"),
  expiryDate: timestamp("expiryDate"),
  unitCost: int("unitCost"), // Store as cents/centavos
  minStock: int("minStock").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;

/**
 * ESG Checklists - templates for ESG evaluation
 */
export const esgChecklists = mysqlTable("esg_checklists", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  maxPoints: int("maxPoints").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ESGChecklist = typeof esgChecklists.$inferSelect;
export type InsertESGChecklist = typeof esgChecklists.$inferInsert;

/**
 * ESG Responses - farm responses to checklist items
 */
export const esgResponses = mysqlTable("esg_responses", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").notNull(),
  farmId: int("farmId").notNull(),
  response: boolean("response").default(false),
  pointsObtained: int("pointsObtained").default(0),
  notes: text("notes"),
  evidenceUrl: text("evidenceUrl"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ESGResponse = typeof esgResponses.$inferSelect;
export type InsertESGResponse = typeof esgResponses.$inferInsert;

/**
 * Badges/Selos - Bronze, Silver, Gold certifications
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  level: mysqlEnum("level", ["bronze", "silver", "gold"]).notNull(),
  score: int("score").default(0),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * Challenges - monthly missions and goals
 */
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  points: int("points").default(0),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  ruleMetrics: text("ruleMetrics"), // JSON string for challenge rules
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

/**
 * Challenge Progress - farm progress on challenges
 */
export const challengeProgress = mysqlTable("challenge_progress", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  farmId: int("farmId").notNull(),
  progressPercent: int("progressPercent").default(0),
  pointsEarned: int("pointsEarned").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChallengeProgress = typeof challengeProgress.$inferSelect;
export type InsertChallengeProgress = typeof challengeProgress.$inferInsert;

/**
 * AI Recommendations - generated suggestions
 */
export const aiRecommendations = mysqlTable("ai_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  type: varchar("type", { length: 50 }).default("general"),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  source: varchar("source", { length: 100 }).default("ai"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = typeof aiRecommendations.$inferInsert;

/**
 * Planning Events - vaccinations, reproduction, tasks
 */
export const planningEvents = mysqlTable("planning_events", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).default("task"),
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanningEvent = typeof planningEvents.$inferSelect;
export type InsertPlanningEvent = typeof planningEvents.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  farm: one(farms, {
    fields: [users.farmId],
    references: [farms.id],
  }),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const farmsRelations = relations(farms, ({ many }) => ({
  users: many(users),
  batches: many(batches),
  financialTransactions: many(financialTransactions),
  inventoryItems: many(inventoryItems),
  esgResponses: many(esgResponses),
  badges: many(badges),
  challengeProgress: many(challengeProgress),
  aiRecommendations: many(aiRecommendations),
  planningEvents: many(planningEvents),
}));

export const batchesRelations = relations(batches, ({ one }) => ({
  farm: one(farms, {
    fields: [batches.farmId],
    references: [farms.id],
  }),
}));

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  farm: one(farms, {
    fields: [financialTransactions.farmId],
    references: [farms.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  farm: one(farms, {
    fields: [inventoryItems.farmId],
    references: [farms.id],
  }),
}));

export const esgResponsesRelations = relations(esgResponses, ({ one }) => ({
  farm: one(farms, {
    fields: [esgResponses.farmId],
    references: [farms.id],
  }),
  checklist: one(esgChecklists, {
    fields: [esgResponses.checklistId],
    references: [esgChecklists.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  farm: one(farms, {
    fields: [badges.farmId],
    references: [farms.id],
  }),
}));

export const challengeProgressRelations = relations(challengeProgress, ({ one }) => ({
  farm: one(farms, {
    fields: [challengeProgress.farmId],
    references: [farms.id],
  }),
  challenge: one(challenges, {
    fields: [challengeProgress.challengeId],
    references: [challenges.id],
  }),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  farm: one(farms, {
    fields: [aiRecommendations.farmId],
    references: [farms.id],
  }),
}));

export const planningEventsRelations = relations(planningEvents, ({ one }) => ({
  farm: one(farms, {
    fields: [planningEvents.farmId],
    references: [farms.id],
  }),
}));


/**
 * Animals table - individual animal tracking with RFID/tag
 */
export const animals = mysqlTable("animals", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  batchId: int("batchId"),
  tagNumber: varchar("tagNumber", { length: 50 }).notNull(), // Brinco/RFID
  name: varchar("name", { length: 100 }),
  species: mysqlEnum("species", ["bovine_milk", "bovine_beef", "sheep", "goat", "buffalo", "other"]).notNull(),
  breed: varchar("breed", { length: 100 }),
  sex: mysqlEnum("sex", ["male", "female"]).notNull(),
  birthDate: date("birthDate"),
  birthWeight: int("birthWeight"), // kg
  currentWeight: int("currentWeight"), // kg
  motherId: int("motherId"), // Reference to mother animal
  fatherId: int("fatherId"), // Reference to father animal
  acquisitionDate: date("acquisitionDate"),
  acquisitionType: mysqlEnum("acquisitionType", ["birth", "purchase", "transfer"]),
  status: mysqlEnum("status", ["active", "sold", "deceased", "transferred"]).default("active"),
  phase: mysqlEnum("phase", ["calf", "weaning", "growing", "fattening", "feedlot", "breeding", "lactation"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Animal = typeof animals.$inferSelect;
export type InsertAnimal = typeof animals.$inferInsert;

/**
 * Animal weights table - weight history for GMD calculation
 */
export const animalWeights = mysqlTable("animal_weights", {
  id: int("id").autoincrement().primaryKey(),
  animalId: int("animalId").notNull(),
  weight: int("weight").notNull(), // kg
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnimalWeight = typeof animalWeights.$inferSelect;
export type InsertAnimalWeight = typeof animalWeights.$inferInsert;

/**
 * Milk production table - daily milk production records
 */
export const milkProduction = mysqlTable("milk_production", {
  id: int("id").autoincrement().primaryKey(),
  animalId: int("animalId").notNull(),
  farmId: int("farmId").notNull(),
  date: date("date").notNull(),
  liters: int("liters").notNull(), // Liters per day
  lactationDay: int("lactationDay"), // Days since calving
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MilkProduction = typeof milkProduction.$inferSelect;
export type InsertMilkProduction = typeof milkProduction.$inferInsert;

/**
 * Vaccines table - vaccine catalog
 */
export const vaccines = mysqlTable("vaccines", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["brucellosis", "foot_mouth", "rabies", "clostridial", "leptospirosis", "bvd_ibr", "other"]).notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  dosage: varchar("dosage", { length: 100 }),
  applicationMethod: varchar("applicationMethod", { length: 100 }),
  withdrawalPeriod: int("withdrawalPeriod"), // days
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vaccine = typeof vaccines.$inferSelect;
export type InsertVaccine = typeof vaccines.$inferInsert;

/**
 * Animal vaccinations table - vaccination records
 */
export const animalVaccinations = mysqlTable("animal_vaccinations", {
  id: int("id").autoincrement().primaryKey(),
  animalId: int("animalId").notNull(),
  vaccineId: int("vaccineId").notNull(),
  date: date("date").notNull(),
  nextDueDate: date("nextDueDate"),
  batchNumber: varchar("batchNumber", { length: 100 }),
  appliedBy: varchar("appliedBy", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnimalVaccination = typeof animalVaccinations.$inferSelect;
export type InsertAnimalVaccination = typeof animalVaccinations.$inferInsert;

/**
 * Reproductive events table - breeding, insemination, pregnancy, calving
 */
export const reproductiveEvents = mysqlTable("reproductive_events", {
  id: int("id").autoincrement().primaryKey(),
  animalId: int("animalId").notNull(), // Female animal
  eventType: mysqlEnum("eventType", ["heat", "insemination", "pregnancy_check", "calving", "abortion"]).notNull(),
  date: date("date").notNull(),
  bullId: int("bullId"), // Male animal or semen ID
  semenCode: varchar("semenCode", { length: 100 }),
  inseminationType: mysqlEnum("inseminationType", ["natural", "artificial"]),
  pregnancyResult: boolean("pregnancyResult"),
  calvingSex: mysqlEnum("calvingSex", ["male", "female"]),
  calvingWeight: int("calvingWeight"),
  calvingDifficulty: mysqlEnum("calvingDifficulty", ["normal", "assisted", "difficult"]),
  calfId: int("calfId"), // Newborn animal ID
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReproductiveEvent = typeof reproductiveEvents.$inferSelect;
export type InsertReproductiveEvent = typeof reproductiveEvents.$inferInsert;

/**
 * Pastures table - pasture/paddock management
 */
export const pastures = mysqlTable("pastures", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  areaHectares: int("areaHectares").notNull(),
  grassType: varchar("grassType", { length: 100 }),
  currentStockingRate: int("currentStockingRate"), // animals per hectare
  maxStockingRate: int("maxStockingRate"),
  status: mysqlEnum("status", ["active", "resting", "maintenance"]).default("active"),
  lastRotationDate: date("lastRotationDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pasture = typeof pastures.$inferSelect;
export type InsertPasture = typeof pastures.$inferInsert;

/**
 * Feed supplements table - feed and supplement tracking
 */
export const feedSupplements = mysqlTable("feed_supplements", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  batchId: int("batchId"),
  animalId: int("animalId"),
  date: date("date").notNull(),
  feedType: mysqlEnum("feedType", ["concentrate", "silage", "hay", "mineral", "protein", "other"]).notNull(),
  quantity: int("quantity").notNull(), // kg
  cost: int("cost"), // cents
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeedSupplement = typeof feedSupplements.$inferSelect;
export type InsertFeedSupplement = typeof feedSupplements.$inferInsert;
