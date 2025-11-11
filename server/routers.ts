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
      .mutation(async ({ input, ctx }) => {
        await db.completeChallenge(input.farmId, input.challengeId);
        
        // Enviar notificação de conquista
        if (ctx.user) {
          const challenges = await db.getActiveChallenges();
          const challenge = challenges.find((c: any) => c.id === input.challengeId);
          
          if (challenge) {
            const { notifyChallengeCompleted } = await import("./_core/notifications");
            await notifyChallengeCompleted(ctx.user.id, challenge.title, challenge.points);
          }
        }
        
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
      .mutation(async ({ input, ctx }) => {
        const taskId = await db.createPlanningTask({
          ...input,
          dueDate: new Date(input.dueDate)
        });
        
        // Enviar notificação se tarefa vence em 3 dias ou menos
        if (ctx.user) {
          const dueDate = new Date(input.dueDate);
          const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 3 && daysUntil >= 0) {
            const { notifyPendingTask } = await import("./_core/notifications");
            await notifyPendingTask(ctx.user.id, input.title, dueDate);
          }
        }
        
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
  
  reproduction: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        animalId: z.number(),
        eventType: z.enum(["heat", "insemination", "pregnancy_check", "birth", "abortion"]),
        date: z.string(),
        notes: z.string().optional(),
        bullId: z.number().optional(),
        semenCode: z.string().optional(),
        result: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const eventId = await db.createReproductiveEvent({
          ...input,
          date: new Date(input.date),
        });
        return { eventId };
      }),
    
    listByAnimal: protectedProcedure
      .input(z.object({ animalId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReproductiveEventsByAnimalId(input.animalId);
      }),
    
    listByFarm: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReproductiveEventsByFarmId(input.farmId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        eventType: z.enum(["heat", "insemination", "pregnancy_check", "birth", "abortion"]).optional(),
        date: z.string().optional(),
        notes: z.string().optional(),
        result: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, date, ...rest } = input;
        await db.updateReproductiveEvent(id, {
          ...rest,
          ...(date && { date: new Date(date) }),
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteReproductiveEvent(input.id);
        return { success: true };
      }),
  }),
  
  health: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        animalId: z.number(),
        vaccineType: z.string(),
        date: z.string(),
        dosage: z.string().optional(),
        veterinarian: z.string().optional(),
        nextDueDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const vaccinationId = await db.createVaccination({
          ...input,
          date: new Date(input.date),
          nextDueDate: input.nextDueDate ? new Date(input.nextDueDate) : undefined,
        });
        
        // Enviar notificação se houver próxima dose
        if (input.nextDueDate && ctx.user) {
          const animal = await db.getAnimalById(input.animalId);
          const nextDate = new Date(input.nextDueDate);
          const daysUntil = Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          // Notificar se faltar 7 dias ou menos
          if (daysUntil <= 7 && animal) {
            const { notifyVaccinationAlert } = await import("./_core/notifications");
            await notifyVaccinationAlert(ctx.user.id, animal.tagId, input.vaccineType, nextDate);
          }
        }
        
        return { vaccinationId };
      }),
    
    listByAnimal: protectedProcedure
      .input(z.object({ animalId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVaccinationsByAnimalId(input.animalId);
      }),
    
    listByFarm: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVaccinationsByFarmId(input.farmId);
      }),
    
    upcoming: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUpcomingVaccinations(input.farmId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        vaccineType: z.string().optional(),
        date: z.string().optional(),
        dosage: z.string().optional(),
        nextDueDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, date, nextDueDate, ...rest } = input;
        await db.updateVaccination(id, {
          ...rest,
          ...(date && { date: new Date(date) }),
          ...(nextDueDate && { nextDueDate: new Date(nextDueDate) }),
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteVaccination(input.id);
        return { success: true };
      }),
  }),
  
  pastures: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        name: z.string(),
        areaHectares: z.number(),
        grassType: z.string().optional(),
        status: z.enum(["active", "resting", "renovation"]).optional(),
        currentBatchId: z.number().optional(),
        rotationStartDate: z.string().optional(),
        restPeriodDays: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const pastureId = await db.createPasture({
          ...input,
          rotationStartDate: input.rotationStartDate ? new Date(input.rotationStartDate) : undefined,
        });
        return { pastureId };
      }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPasturesByFarmId(input.farmId);
      }),
    
    available: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAvailablePastures(input.farmId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        areaHectares: z.number().optional(),
        status: z.enum(["active", "resting", "renovation"]).optional(),
        currentBatchId: z.number().optional(),
        rotationStartDate: z.string().optional(),
        restPeriodDays: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, rotationStartDate, ...rest } = input;
        await db.updatePasture(id, {
          ...rest,
          ...(rotationStartDate && { rotationStartDate: new Date(rotationStartDate) }),
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePasture(input.id);
        return { success: true };
      }),
  }),
  
  supplementation: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        batchId: z.number(),
        supplementType: z.string(),
        quantityKg: z.number(),
        costPerKg: z.number().optional(),
        date: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const supplementationId = await db.createSupplementation({
          ...input,
          date: new Date(input.date),
        });
        return { supplementationId };
      }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSupplementationByFarmId(input.farmId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        supplementType: z.string().optional(),
        quantityKg: z.number().optional(),
        costPerKg: z.number().optional(),
        date: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, date, ...rest } = input;
        await db.updateSupplementation(id, {
          ...rest,
          ...(date && { date: new Date(date) }),
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSupplementation(input.id);
        return { success: true };
      }),
  }),
  
  milk: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        animalId: z.number(),
        date: z.string(),
        liters: z.number(),
        lactationDay: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const productionId = await db.createMilkProduction({
          ...input,
          date: new Date(input.date),
        });
        return { productionId };
      }),
    
    list: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getMilkProductionByFarmId(
          input.farmId,
          input.startDate ? new Date(input.startDate) : undefined,
          input.endDate ? new Date(input.endDate) : undefined
        );
      }),
  }),
  
  ai: router({
    recommendations: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .mutation(async ({ input }) => {
        const farm = await db.getFarmById(input.farmId);
        if (!farm) throw new Error("Fazenda não encontrada");
        
        const animals = await db.getAnimalsByFarmId(input.farmId);
        const esgScore = await db.calculateESGScore(input.farmId);
        const challenges = await db.getChallengeProgressByFarmId(input.farmId);
        
        const { generateFarmRecommendations } = await import("./_core/aiRecommendations");
        
        const recommendations = await generateFarmRecommendations({
          farmId: input.farmId,
          farmName: farm.name,
          animalCount: animals.length,
          esgScore: esgScore,
          challenges: challenges.filter((c: any) => !c.completed).map((c: any) => c.challengeId.toString()),
        });
        
        // Salvar recomendação no banco
        const recommendationId = await db.createAIRecommendation({
          farmId: input.farmId,
          type: "production",
          title: "Recomendações Gerais",
          content: recommendations,
        });
        
        return { recommendationId, content: recommendations };
      }),
    
    esgSuggestions: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .mutation(async ({ input }) => {
        const esgScore = await db.calculateESGScore(input.farmId);
        const responses = await db.getESGResponsesByFarmId(input.farmId);
        const checklists = await db.getActiveChecklists();
        
        const questionsWithResponses = checklists.map((checklist: any) => {
          const response = responses.find((r: any) => r.checklistId === checklist.id);
          return {
            question: checklist.title,
            response: response?.response || false,
          };
        });
        
        const { generateESGImprovementSuggestions } = await import("./_core/aiRecommendations");
        
        const suggestions = await generateESGImprovementSuggestions(
          esgScore,
          questionsWithResponses
        );
        
        // Salvar sugestão no banco
        const recommendationId = await db.createAIRecommendation({
          farmId: input.farmId,
          type: "esg",
          title: "Sugestões para Melhorar ESG",
          content: suggestions,
        });
        
        return { recommendationId, content: suggestions };
      }),
    
    performanceSummary: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .mutation(async ({ input }) => {
        const animals = await db.getAnimalsByFarmId(input.farmId);
        const financialSummary = await db.getFinancialSummary(input.farmId);
        const esgScore = await db.calculateESGScore(input.farmId);
        const challenges = await db.getChallengeProgressByFarmId(input.farmId);
        
        // Calcular GMD médio
        let totalGMD = 0;
        let countGMD = 0;
        for (const animal of animals) {
          if (animal.gmd && animal.gmd > 0) {
            totalGMD += animal.gmd;
            countGMD++;
          }
        }
        const averageGMD = countGMD > 0 ? totalGMD / countGMD : undefined;
        
        const { generatePerformanceSummary } = await import("./_core/aiRecommendations");
        
        const summary = await generatePerformanceSummary({
          totalAnimals: animals.length,
          averageGMD,
          totalRevenue: financialSummary.income,
          totalExpenses: financialSummary.expense,
          esgScore: esgScore,
          completedChallenges: challenges.filter((c: any) => c.completed).length,
        });
        
        // Salvar resumo no banco
        const recommendationId = await db.createAIRecommendation({
          farmId: input.farmId,
          type: "financial",
          title: "Resumo de Desempenho",
          content: summary,
        });
        
        return { recommendationId, content: summary };
      }),
    
    history: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAIRecommendationsByFarmId(input.farmId);
      }),
  }),
  
  reports: router({
    financial: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const transactions = await db.getTransactionsByFarmId(
          input.farmId,
          input.startDate ? new Date(input.startDate) : undefined,
          input.endDate ? new Date(input.endDate) : undefined
        );
        
        const summary = await db.getFinancialSummary(
          input.farmId,
          input.startDate ? new Date(input.startDate) : undefined,
          input.endDate ? new Date(input.endDate) : undefined
        );
        
        // Retornar URL para download (será implementado via endpoint separado)
        return {
          success: true,
          downloadUrl: `/api/reports/financial/${input.farmId}?start=${input.startDate || ''}&end=${input.endDate || ''}`,
        };
      }),
    
    esg: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .mutation(async ({ input }) => {
        const score = await db.calculateESGScore(input.farmId);
        const responses = await db.getESGResponsesByFarmId(input.farmId);
        const badges = await db.getBadgesByFarmId(input.farmId);
        const badge = badges.length > 0 ? badges[0] : null;
        
        return {
          success: true,
          downloadUrl: `/api/reports/esg/${input.farmId}`,
        };
      }),
    
    production: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .mutation(async ({ input }) => {
        const animals = await db.getAnimalsByFarmId(input.farmId);
        const milkProduction = await db.getMilkProductionByFarmId(input.farmId);
        
        return {
          success: true,
          downloadUrl: `/api/reports/production/${input.farmId}`,
        };
      }),
  }),
  
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUserId(ctx.user.id);
    }),
    
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotificationsCount(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),
  
  goals: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        type: z.enum(["milk_production", "gmd", "esg_score", "revenue", "expense_reduction"]),
        title: z.string(),
        targetValue: z.number(),
        unit: z.string(),
        deadline: z.string(),
      }))
      .mutation(async ({ input }) => {
        const goalId = await db.createGoal({
          farmId: input.farmId,
          type: input.type,
          title: input.title,
          targetValue: input.targetValue.toString(),
          unit: input.unit,
          deadline: input.deadline as any, // date type from drizzle accepts string in YYYY-MM-DD format
        });
        return { success: true, goalId };
      }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getGoalsByFarmId(input.farmId);
      }),
    
    updateProgress: protectedProcedure
      .input(z.object({ goalId: z.number(), currentValue: z.number() }))
      .mutation(async ({ input }) => {
        return await db.updateGoalProgress(input.goalId, input.currentValue);
      }),
    
    delete: protectedProcedure
      .input(z.object({ goalId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteGoal(input.goalId);
        return { success: true };
      }),
  }),
  
  alerts: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        type: z.enum(["gmd", "stock", "expense", "milk", "custom"]),
        name: z.string(),
        condition: z.enum(["below", "above", "equal"]),
        threshold: z.number(),
      }))
      .mutation(async ({ input }) => {
        const alertId = await db.createAlert({
          farmId: input.farmId,
          type: input.type,
          name: input.name,
          condition: input.condition,
          threshold: input.threshold.toString(),
          isActive: true,
        });
        return { success: true, alertId };
      }),
    
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAlertsByFarmId(input.farmId);
      }),
    
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.updateAlert(input.id, { isActive: input.isActive });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        threshold: z.number().optional(),
        condition: z.enum(["below", "above", "equal"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.threshold !== undefined) updateData.threshold = data.threshold.toString();
        if (data.condition) updateData.condition = data.condition;
        
        await db.updateAlert(id, updateData);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAlert(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
