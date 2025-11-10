import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  farmId: int("farmId"),
  language: varchar("language", { length: 5 }).default("pt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Fazendas/Propriedades Rurais
 */
export const farms = mysqlTable("farms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 100 }),
  state: varchar("state", { length: 2 }),
  sizeHectares: int("sizeHectares"),
  animalCount: int("animalCount"),
  farmType: mysqlEnum("farmType", ["cattle", "dairy", "sheep", "goat", "buffalo", "mixed"]).default("cattle"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Farm = typeof farms.$inferSelect;
export type InsertFarm = typeof farms.$inferInsert;

/**
 * Lotes de Animais
 */
export const batches = mysqlTable("batches", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  animalType: mysqlEnum("animalType", ["cattle", "sheep", "goat", "buffalo"]).notNull(),
  phase: mysqlEnum("phase", ["cria", "recria", "engorda", "confinamento", "lactacao", "seca"]).notNull(),
  quantity: int("quantity").notNull(),
  averageWeight: int("averageWeight"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Batch = typeof batches.$inferSelect;
export type InsertBatch = typeof batches.$inferInsert;

/**
 * Animais Individuais (rastreabilidade)
 */
export const animals = mysqlTable("animals", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  batchId: int("batchId"),
  tagId: varchar("tagId", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }),
  species: mysqlEnum("species", ["cattle", "sheep", "goat", "buffalo"]).notNull(),
  breed: varchar("breed", { length: 100 }),
  sex: mysqlEnum("sex", ["male", "female"]).notNull(),
  birthDate: date("birthDate"),
  birthWeight: int("birthWeight"),
  currentWeight: int("currentWeight"),
  motherId: int("motherId"),
  fatherId: int("fatherId"),
  status: mysqlEnum("status", ["active", "sold", "deceased", "quarantine"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Animal = typeof animals.$inferSelect;
export type InsertAnimal = typeof animals.$inferInsert;

/**
 * Histórico de Pesagens
 */
export const weighings = mysqlTable("weighings", {
  id: int("id").autoincrement().primaryKey(),
  animalId: int("animalId").notNull(),
  weight: int("weight").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Weighing = typeof weighings.$inferSelect;
export type InsertWeighing = typeof weighings.$inferInsert;

/**
 * Produção de Leite
 */
export const milkProduction = mysqlTable("milk_production", {
  id: int("id").autoincrement().primaryKey(),
  animalId: int("animalId").notNull(),
  farmId: int("farmId").notNull(),
  date: date("date").notNull(),
  liters: int("liters").notNull(),
  lactationDay: int("lactationDay"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MilkProduction = typeof milkProduction.$inferSelect;
export type InsertMilkProduction = typeof milkProduction.$inferInsert;

/**
 * Transações Financeiras
 */
export const financialTransactions = mysqlTable("financial_transactions", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: int("amount").notNull(),
  date: date("date").notNull(),
  batchId: int("batchId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

/**
 * Estoque
 */
export const inventoryItems = mysqlTable("inventory_items", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["feed", "medicine", "supplement", "equipment", "other"]).notNull(),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  minStock: int("minStock").default(0),
  expiryDate: date("expiryDate"),
  unitCost: int("unitCost"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;

/**
 * Eventos Reprodutivos
 */
export const reproductiveEvents = mysqlTable("reproductive_events", {
  id: int("id").autoincrement().primaryKey(),
  animalId: int("animalId").notNull(),
  farmId: int("farmId").notNull(),
  eventType: mysqlEnum("eventType", ["heat", "insemination", "pregnancy_check", "birth", "abortion"]).notNull(),
  date: date("date").notNull(),
  bullId: int("bullId"),
  semenCode: varchar("semenCode", { length: 100 }),
  result: varchar("result", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReproductiveEvent = typeof reproductiveEvents.$inferSelect;
export type InsertReproductiveEvent = typeof reproductiveEvents.$inferInsert;

/**
 * Vacinas e Tratamentos
 */
export const vaccinations = mysqlTable("vaccinations", {
  id: int("id").autoincrement().primaryKey(),
  animalId: int("animalId"),
  batchId: int("batchId"),
  farmId: int("farmId").notNull(),
  vaccineType: varchar("vaccineType", { length: 100 }).notNull(),
  date: date("date").notNull(),
  nextDueDate: date("nextDueDate"),
  dosage: varchar("dosage", { length: 100 }),
  veterinarian: varchar("veterinarian", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vaccination = typeof vaccinations.$inferSelect;
export type InsertVaccination = typeof vaccinations.$inferInsert;

/**
 * Pastagens
 */
export const pastures = mysqlTable("pastures", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  areaHectares: int("areaHectares").notNull(),
  grassType: varchar("grassType", { length: 100 }),
  currentBatchId: int("currentBatchId"),
  rotationStartDate: date("rotationStartDate"),
  restPeriodDays: int("restPeriodDays").default(30),
  status: mysqlEnum("status", ["active", "resting", "renovation"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pasture = typeof pastures.$inferSelect;
export type InsertPasture = typeof pastures.$inferInsert;

/**
 * Suplementação
 */
export const supplementation = mysqlTable("supplementation", {
  id: int("id").autoincrement().primaryKey(),
  batchId: int("batchId").notNull(),
  farmId: int("farmId").notNull(),
  date: date("date").notNull(),
  supplementType: varchar("supplementType", { length: 100 }).notNull(),
  quantityKg: int("quantityKg").notNull(),
  costPerKg: int("costPerKg"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Supplementation = typeof supplementation.$inferSelect;
export type InsertSupplementation = typeof supplementation.$inferInsert;

/**
 * Checklists ESG
 */
export const esgChecklists = mysqlTable("esg_checklists", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["environmental", "social", "governance"]).notNull(),
  maxPoints: int("maxPoints").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ESGChecklist = typeof esgChecklists.$inferSelect;
export type InsertESGChecklist = typeof esgChecklists.$inferInsert;

/**
 * Respostas ESG
 */
export const esgResponses = mysqlTable("esg_responses", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").notNull(),
  farmId: int("farmId").notNull(),
  response: boolean("response").notNull(),
  pointsObtained: int("pointsObtained").notNull(),
  evidenceUrl: varchar("evidenceUrl", { length: 500 }),
  notes: text("notes"),
  respondedAt: timestamp("respondedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ESGResponse = typeof esgResponses.$inferSelect;
export type InsertESGResponse = typeof esgResponses.$inferInsert;

/**
 * Selos
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  level: mysqlEnum("level", ["bronze", "silver", "gold"]).notNull(),
  score: int("score").notNull(),
  awardedAt: timestamp("awardedAt").defaultNow().notNull(),
  validUntil: timestamp("validUntil"),
  metadata: text("metadata"),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * Desafios
 */
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  points: int("points").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  targetMetric: varchar("targetMetric", { length: 100 }),
  targetValue: int("targetValue"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

/**
 * Progresso de Desafios
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
 * Recomendações IA
 */
export const aiRecommendations = mysqlTable("ai_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  type: mysqlEnum("type", ["financial", "esg", "production", "health"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  status: mysqlEnum("status", ["pending", "viewed", "applied", "dismissed"]).default("pending"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  source: varchar("source", { length: 100 }).default("ai"),
});

export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = typeof aiRecommendations.$inferInsert;

/**
 * Planejamento
 */
export const planningTasks = mysqlTable("planning_tasks", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["vaccination", "reproduction", "feeding", "maintenance", "other"]).notNull(),
  dueDate: date("dueDate").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completedAt"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanningTask = typeof planningTasks.$inferSelect;
export type InsertPlanningTask = typeof planningTasks.$inferInsert;
