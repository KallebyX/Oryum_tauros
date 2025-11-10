import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  farms: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        region: z.string().optional(),
        state: z.string().optional(),
        sizeHectares: z.number().optional(),
        animalCount: z.number().optional(),
        farmType: z.enum(["cattle", "dairy", "sheep", "goat", "buffalo", "mixed"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const farmId = await db.createFarm({ ...input, userId: ctx.user.id });
        await db.updateUserFarm(ctx.user.id, farmId);
        return { farmId };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getFarmsByUserId(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getFarmById(input.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        region: z.string().optional(),
        state: z.string().optional(),
        sizeHectares: z.number().optional(),
        animalCount: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateFarm(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFarm(input.id);
        return { success: true };
      }),
  }),

  batches: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        name: z.string(),
        animalType: z.enum(["cattle", "sheep", "goat", "buffalo"]),
        phase: z.enum(["cria", "recria", "engorda", "confinamento", "lactacao", "seca"]),
        quantity: z.number(),
        averageWeight: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const batchId = await db.createBatch(input);
        return { batchId };
      }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBatchesByFarmId(input.farmId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        quantity: z.number().optional(),
        averageWeight: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateBatch(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBatch(input.id);
        return { success: true };
      }),
    
    listAnimals: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAnimalsByFarmId(input.farmId);
      }),
    
    createAnimal: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        tagId: z.string(),
        species: z.enum(["cattle", "sheep", "goat", "buffalo"]),
        breed: z.string().optional(),
        birthDate: z.date(),
        sex: z.enum(["male", "female"]),
        batchId: z.number().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const animalId = await db.createAnimal(input);
        return { animalId };
      }),
    
    createWeighing: protectedProcedure
      .input(z.object({
        animalId: z.number(),
        weight: z.number(),
        date: z.date(),
      }))
      .mutation(async ({ input }) => {
        const weighingId = await db.createWeighing(input);
        return { weighingId };
      }),
  }),

  financial: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        type: z.enum(["income", "expense"]),
        category: z.string(),
        description: z.string().optional(),
        amount: z.number(),
        date: z.string(),
        batchId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { date, ...rest } = input;
        const transactionId = await db.createTransaction({
          ...rest,
          date: new Date(date)
        });
        return { transactionId };
      }),
    
    list: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const start = input.startDate ? new Date(input.startDate) : undefined;
        const end = input.endDate ? new Date(input.endDate) : undefined;
        return await db.getTransactionsByFarmId(input.farmId, start, end);
      }),
    
    summary: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const start = input.startDate ? new Date(input.startDate) : undefined;
        const end = input.endDate ? new Date(input.endDate) : undefined;
        return await db.getFinancialSummary(input.farmId, start, end);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        category: z.string().optional(),
        description: z.string().optional(),
        amount: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTransaction(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTransaction(input.id);
        return { success: true };
      }),
  }),

  inventory: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        name: z.string(),
        type: z.enum(["feed", "medicine", "supplement", "equipment", "other"]),
        quantity: z.number(),
        unit: z.string(),
        minStock: z.number().optional(),
        expiryDate: z.string().optional(),
        unitCost: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { expiryDate, ...rest } = input;
        const itemId = await db.createInventoryItem({
          ...rest,
          ...(expiryDate && { expiryDate: new Date(expiryDate) })
        });
        return { itemId };
      }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInventoryByFarmId(input.farmId);
      }),
    
    lowStock: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLowStockItems(input.farmId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number().optional(),
        unitCost: z.number().optional(),
        expiryDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, expiryDate, ...data } = input;
        await db.updateInventoryItem(id, {
          ...data,
          ...(expiryDate && { expiryDate: new Date(expiryDate) })
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteInventoryItem(input.id);
        return { success: true };
      }),
  }),

  esg: router({
    checklists: protectedProcedure.query(async () => {
      return await db.getActiveChecklists();
    }),
    
    listChecklists: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async () => {
        return await db.getActiveChecklists();
      }),
    
    listResponses: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getESGResponsesByFarmId(input.farmId);
      }),
    
    answerQuestion: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        checklistId: z.number(),
        answer: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const checklist = await db.getChecklistById(input.checklistId);
        if (!checklist) throw new Error("Checklist not found");
        
        const responseId = await db.createESGResponse({
          farmId: input.farmId,
          checklistId: input.checklistId,
          response: input.answer,
          pointsObtained: input.answer ? checklist.maxPoints : 0,
        });
        
        const score = await db.calculateESGScore(input.farmId);
        await db.awardBadge(input.farmId, score);
        
        return { responseId, score };
      }),
    
    getBadge: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        const badges = await db.getBadgesByFarmId(input.farmId);
        return badges[0] || null;
      }),
    
    respond: protectedProcedure
      .input(z.object({
        checklistId: z.number(),
        farmId: z.number(),
        response: z.boolean(),
        pointsObtained: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const responseId = await db.createESGResponse(input);
        const score = await db.calculateESGScore(input.farmId);
        await db.awardBadge(input.farmId, score);
        return { responseId, score };
      }),
    
    score: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.calculateESGScore(input.farmId);
      }),
    
    badges: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBadgesByFarmId(input.farmId);
      }),
  }),

  challenges: router({
    active: protectedProcedure.query(async () => {
      return await db.getActiveChallenges();
    }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async () => {
        return await db.getActiveChallenges();
      }),
    
    listProgress: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChallengeProgressByFarmId(input.farmId);
      }),
    
    start: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        challengeId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.startChallenge(input.farmId, input.challengeId);
        return { success: true };
      }),
    
    complete: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        challengeId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.completeChallenge(input.farmId, input.challengeId);
        return { success: true };
      }),
    
    progress: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        challengeId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getChallengeProgress(input.farmId, input.challengeId);
      }),
    
    updateProgress: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        challengeId: z.number(),
        progress: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateChallengeProgress(input.farmId, input.challengeId, input.progress);
        return { success: true };
      }),
  }),

  ranking: router({
    get: protectedProcedure
      .input(z.object({ region: z.string().optional() }))
      .query(async ({ input }) => {
        return await db.getRanking(input.region);
      }),
  }),

  dashboard: router({
    kpis: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDashboardKPIs(input.farmId);
      }),
  }),

  planning: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        category: z.enum(["vaccination", "reproduction", "feeding", "maintenance", "other"]),
        dueDate: z.string(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const taskId = await db.createPlanningTask({
          ...input,
          dueDate: new Date(input.dueDate)
        });
        return { taskId };
      }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlanningTasksByFarmId(input.farmId);
      }),
    
    toggleComplete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.toggleTaskComplete(input.id);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePlanningTask(input.id);
        return { success: true };
      }),
  }),
  
  subscription: router({
    current: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await db.getSubscriptionByUserId(ctx.user.id);
      return subscription;
    }),
    
    createCheckout: protectedProcedure
      .input(z.object({
        priceId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCheckoutSession } = await import("./_core/stripe");
        
        const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000";
        
        const session = await createCheckoutSession({
          priceId: input.priceId,
          userId: ctx.user.id,
          userEmail: ctx.user.email || undefined,
          successUrl: `${baseUrl}/pricing?success=true`,
          cancelUrl: `${baseUrl}/pricing?canceled=true`,
        });
        
        return { url: session.url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
