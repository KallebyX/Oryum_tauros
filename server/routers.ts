import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== FARM ROUTES =====
  farms: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        region: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        sizeHectares: z.number().optional(),
        animalCount: z.number().optional(),
        farmType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const farmId = await db.createFarm(input);
        // Update user's farmId
        await db.updateUserFarm(ctx.user.id, farmId);
        return { farmId };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      // If user has a farm, return only their farm; admins see all
      if (ctx.user.role === 'admin') {
        return await db.getAllFarms();
      }
      if (ctx.user.farmId) {
        const farm = await db.getFarmById(ctx.user.farmId);
        return farm ? [farm] : [];
      }
      return [];
    }),
    
    getById: protectedProcedure
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
    
    dashboard: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDashboardKPIs(input.farmId);
      }),
  }),

  // ===== FINANCIAL ROUTES =====
  financial: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        type: z.enum(['sale', 'purchase', 'expense', 'income']),
        description: z.string().optional(),
        amount: z.number(),
        category: z.string().optional(),
        date: z.date(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createTransaction(input);
        return { id };
      }),
    
    list: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTransactionsByFarm(input.farmId, input.startDate, input.endDate);
      }),
    
    summary: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFinancialSummary(input.farmId, input.startDate, input.endDate);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTransaction(input.id);
        return { success: true };
      }),
  }),

  // ===== INVENTORY ROUTES =====
  inventory: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        name: z.string(),
        type: z.string().optional(),
        quantity: z.number(),
        unit: z.string().optional(),
        expiryDate: z.date().optional(),
        unitCost: z.number().optional(),
        minStock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createInventoryItem(input);
        return { id };
      }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInventoryByFarm(input.farmId);
      }),
    
    lowStock: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLowStockItems(input.farmId);
      }),
    
    expiringSoon: protectedProcedure
      .input(z.object({ farmId: z.number(), daysAhead: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getExpiringSoonItems(input.farmId, input.daysAhead);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        quantity: z.number().optional(),
        expiryDate: z.date().optional(),
        unitCost: z.number().optional(),
        minStock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateInventoryItem(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteInventoryItem(input.id);
        return { success: true };
      }),
  }),

  // ===== BATCH ROUTES =====
  batches: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        name: z.string(),
        type: z.string().optional(),
        quantity: z.number(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createBatch(input);
        return { id };
      }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBatchesByFarm(input.farmId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        quantity: z.number().optional(),
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
  }),

  // ===== ESG ROUTES =====
  esg: router({
    listChecklists: protectedProcedure.query(async () => {
      return await db.getAllESGChecklists();
    }),
    
    checklists: protectedProcedure.query(async () => {
      return await db.getAllESGChecklists();
    }),
    
    saveResponse: protectedProcedure
      .input(z.object({
        checklistId: z.number(),
        farmId: z.number(),
        response: z.boolean(),
        pointsObtained: z.number(),
        notes: z.string().optional(),
        evidenceUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createESGResponse(input);
        
        // Recalculate score and update badge if needed
        const score = await db.calculateESGScore(input.farmId);
        const currentBadge = await db.getLatestBadgeByFarm(input.farmId);
        
        let newBadgeLevel: 'bronze' | 'silver' | 'gold' | null = null;
        if (score.percentage >= 90) newBadgeLevel = 'gold';
        else if (score.percentage >= 60) newBadgeLevel = 'silver';
        else if (score.percentage >= 30) newBadgeLevel = 'bronze';
        
        // Grant new badge if level increased or first badge
        if (newBadgeLevel && (!currentBadge || currentBadge.level !== newBadgeLevel)) {
          await db.createBadge({
            farmId: input.farmId,
            level: newBadgeLevel,
            score: score.percentage,
          });
        }
        
        return { id, score };
      }),
    
    respond: protectedProcedure
      .input(z.object({
        checklistId: z.number(),
        farmId: z.number(),
        response: z.boolean(),
        pointsObtained: z.number(),
        notes: z.string().optional(),
        evidenceUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createESGResponse(input);
        
        // Recalculate score and update badge if needed
        const score = await db.calculateESGScore(input.farmId);
        const currentBadge = await db.getLatestBadgeByFarm(input.farmId);
        
        let newBadgeLevel: 'bronze' | 'silver' | 'gold' | null = null;
        if (score.percentage >= 90) newBadgeLevel = 'gold';
        else if (score.percentage >= 60) newBadgeLevel = 'silver';
        else if (score.percentage >= 30) newBadgeLevel = 'bronze';
        
        // Grant new badge if level increased or first badge
        if (newBadgeLevel && (!currentBadge || currentBadge.level !== newBadgeLevel)) {
          await db.createBadge({
            farmId: input.farmId,
            level: newBadgeLevel,
            score: score.percentage,
          });
        }
        
        return { id, score };
      }),
    
    calculateScore: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.calculateESGScore(input.farmId);
      }),
    
    score: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.calculateESGScore(input.farmId);
      }),
    
    listResponses: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getESGResponsesByFarm(input.farmId);
      }),
    
    responses: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getESGResponsesByFarm(input.farmId);
      }),
    
    badge: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLatestBadgeByFarm(input.farmId);
      }),
    
    badgeHistory: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBadgesByFarm(input.farmId);
      }),
  }),

  // ===== CHALLENGE ROUTES =====
  challenges: router({
    listActive: protectedProcedure.query(async () => {
      return await db.getActiveChallenges();
    }),
    
    active: protectedProcedure.query(async () => {
      return await db.getActiveChallenges();
    }),
    
    all: protectedProcedure.query(async () => {
      return await db.getAllChallenges();
    }),
    
    getProgress: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChallengeProgressByFarm(input.farmId);
      }),
    
    progress: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChallengeProgressByFarm(input.farmId);
      }),
    
    updateProgress: protectedProcedure
      .input(z.object({
        id: z.number(),
        progressPercent: z.number(),
        pointsEarned: z.number(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        if (data.completed && data.progressPercent >= 100) {
          data.completed = true;
        }
        await db.updateChallengeProgress(id, data);
        return { success: true };
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        points: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        ruleMetrics: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createChallenge(input);
        return { id };
      }),
  }),

  // ===== RANKING ROUTES =====
  ranking: router({
    global: protectedProcedure
      .input(z.object({
        region: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getGlobalRanking(input.region, input.limit);
      }),
    
    getTop: protectedProcedure
      .input(z.object({
        region: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getGlobalRanking(input.region, input.limit || 10);
      }),
  }),

  // ===== AI RECOMMENDATION ROUTES =====
  ai: router({
    recommendations: protectedProcedure
      .input(z.object({ farmId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getAIRecommendationsByFarm(input.farmId, input.limit);
      }),
    
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markRecommendationAsRead(input.id);
        return { success: true };
      }),
    
    generate: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // This will be implemented with actual AI integration
        // For now, create a placeholder
        const id = await db.createAIRecommendation({
          farmId: input.farmId,
          type: 'general',
          title: 'Recomendação Gerada',
          content: 'Esta é uma recomendação de exemplo. A integração com IA será implementada.',
          priority: 'medium',
        });
        return { id };
      }),
  }),

  // ===== PLANNING ROUTES =====
  planning: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        type: z.string().optional(),
        date: z.date(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createPlanningEvent(input);
        return { id };
      }),
    
    list: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getPlanningEventsByFarm(input.farmId, input.startDate, input.endDate);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        if (data.completed) {
          await db.updatePlanningEvent(id, { ...data, completedAt: new Date() });
        } else {
          await db.updatePlanningEvent(id, data);
        }
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePlanningEvent(input.id);
        return { success: true };
      }),
    
    toggleComplete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // Get current event to toggle
        const events = await db.getPlanningEventsByFarm(0); // Will need to fix this
        const event = events.find(e => e.id === input.id);
        if (event) {
          await db.updatePlanningEvent(input.id, { 
            completed: !event.completed,
            completedAt: !event.completed ? new Date() : null 
          });
        }
        return { success: true };
      }),
  }),

  // ===== ADMIN ROUTES =====
  admin: router({
    createESGChecklist: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        maxPoints: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can create checklists
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const id = await db.createESGChecklist(input);
        return { id };
      }),
  }),
  // ===== STRIPE/SUBSCRIPTION ROUTES =====
  subscription: router({
    current: protectedProcedure.query(async ({ ctx }) => {
      const subscriptionDb = await import("./subscriptionDb");
      return await subscriptionDb.getActiveSubscriptionByUserId(ctx.user.id);
    }),
    
    createCheckout: protectedProcedure
      .input(z.object({
        priceId: z.string(),
        planId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2025-10-29.clover',
        });
        
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: input.priceId,
              quantity: 1,
            },
          ],
          success_url: `${origin}/dashboard?subscription=success`,
          cancel_url: `${origin}/pricing?subscription=canceled`,
          client_reference_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || undefined,
          metadata: {
            user_id: ctx.user.id.toString(),
            plan_id: input.planId,
            customer_email: ctx.user.email || '',
            customer_name: ctx.user.name || '',
          },
          allow_promotion_codes: true,
        });
        
        return { url: session.url };
      }),
    
    cancelSubscription: protectedProcedure
      .input(z.object({
        subscriptionId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2025-10-29.clover',
        });
        
        const subscriptionDb = await import("./subscriptionDb");
        const subscription = await subscriptionDb.getSubscriptionByStripeId(input.subscriptionId);
        
        if (!subscription || subscription.userId !== ctx.user.id) {
          throw new Error('Subscription not found or unauthorized');
        }
        
        await stripe.subscriptions.update(input.subscriptionId, {
          cancel_at_period_end: true,
        });
        
        await subscriptionDb.updateSubscription(input.subscriptionId, {
          cancelAtPeriodEnd: true,
        });
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
