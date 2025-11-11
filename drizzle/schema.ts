import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";

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
  category: mysqlEnum("category", ["financial", "esg", "production", "management"]).default("production"),
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
 * Assinaturas Stripe
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(),
  planId: mysqlEnum("planId", ["basic", "professional", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing"]).notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: int("cancelAtPeriodEnd").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

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

/**
 * Notificações
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["vaccination", "task", "challenge", "stock", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Metas e KPIs
 */
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  type: mysqlEnum("type", ["milk_production", "gmd", "esg_score", "revenue", "expense_reduction"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  targetValue: decimal("targetValue", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("currentValue", { precision: 10, scale: 2 }).default("0"),
  unit: varchar("unit", { length: 50 }).notNull(),
  deadline: date("deadline").notNull(),
  status: mysqlEnum("status", ["active", "completed", "failed"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

/**
 * Alertas Customizáveis
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  type: mysqlEnum("type", ["gmd", "stock", "expense", "milk", "custom"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  condition: mysqlEnum("condition", ["below", "above", "equal"]).notNull(),
  threshold: decimal("threshold", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Orçamentos e Planejamento Financeiro
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  year: int("year").notNull(),
  month: int("month").notNull(),
  category: mysqlEnum("category", ["revenue", "expense"]).notNull(),
  subcategory: varchar("subcategory", { length: 100 }).notNull(),
  plannedAmount: decimal("plannedAmount", { precision: 10, scale: 2 }).notNull(),
  actualAmount: decimal("actualAmount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Projeções Financeiras com Cenários
 */
export const financialProjections = mysqlTable("financial_projections", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  scenario: mysqlEnum("scenario", ["optimistic", "realistic", "pessimistic"]).notNull(),
  
  // Premissas de Receita
  revenueGrowthRate: decimal("revenueGrowthRate", { precision: 5, scale: 2 }).notNull(), // % crescimento
  averagePrice: decimal("averagePrice", { precision: 10, scale: 2 }).notNull(), // preço médio por unidade
  expectedVolume: int("expectedVolume").notNull(), // volume esperado de produção/vendas
  
  // Premissas de Custo
  fixedCosts: decimal("fixedCosts", { precision: 10, scale: 2 }).notNull(),
  variableCostPerUnit: decimal("variableCostPerUnit", { precision: 10, scale: 2 }).notNull(),
  operatingExpenseRate: decimal("operatingExpenseRate", { precision: 5, scale: 2 }).notNull(), // % sobre receita
  
  // Resultados Calculados
  projectedRevenue: decimal("projectedRevenue", { precision: 12, scale: 2 }).notNull(),
  projectedCosts: decimal("projectedCosts", { precision: 12, scale: 2 }).notNull(),
  projectedProfit: decimal("projectedProfit", { precision: 12, scale: 2 }).notNull(),
  profitMargin: decimal("profitMargin", { precision: 5, scale: 2 }).notNull(), // % margem
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialProjection = typeof financialProjections.$inferSelect;
export type InsertFinancialProjection = typeof financialProjections.$inferInsert;
