import { Request, Response, Express } from "express";
import * as db from "../db";
import {
  generateFinancialReport,
  generateESGReport,
  generateProductionReport,
} from "../_core/pdfReports";

/**
 * Registrar rotas de relatórios
 */
export function registerReportRoutes(app: Express) {
  // Relatório Financeiro
  app.get("/api/reports/financial/:farmId", async (req: Request, res: Response) => {
    try {
      const farmId = parseInt(req.params.farmId);
      const { start, end } = req.query;

      const startDate = start ? new Date(start as string) : undefined;
      const endDate = end ? new Date(end as string) : undefined;

      const transactions = await db.getTransactionsByFarmId(farmId, startDate, endDate);
      const summary = await db.getFinancialSummary(farmId, startDate, endDate);

      const reportData = {
        totalIncome: summary.income,
        totalExpenses: summary.expense,
        balance: summary.balance,
        transactions: transactions.map((t: any) => ({
          date: new Date(t.date),
          type: t.type,
          category: t.category,
          amount: t.amount,
          description: t.description,
        })),
        period: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate || new Date(),
        },
      };

      generateFinancialReport(reportData, res);
    } catch (error: any) {
      console.error("[Reports] Error generating financial report:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Relatório ESG
  app.get("/api/reports/esg/:farmId", async (req: Request, res: Response) => {
    try {
      const farmId = parseInt(req.params.farmId);

      const score = await db.calculateESGScore(farmId);
      const responses = await db.getESGResponsesByFarmId(farmId);
      const checklists = await db.getActiveChecklists();
      const badges = await db.getBadgesByFarmId(farmId);
      const badge = badges.length > 0 ? badges[0] : null;

      const reportData = {
        score,
        badge: badge?.level || null,
        responses: responses.map((r: any) => {
          const checklist = checklists.find((c: any) => c.id === r.checklistId);
          return {
            category: checklist?.category || "unknown",
            question: checklist?.title || "",
            response: r.response,
            points: r.pointsObtained,
          };
        }),
        suggestions: [
          "Implementar sistema de captação de água da chuva",
          "Oferecer treinamentos regulares para funcionários",
          "Manter documentação sanitária sempre atualizada",
        ],
      };

      generateESGReport(reportData, res);
    } catch (error: any) {
      console.error("[Reports] Error generating ESG report:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Relatório de Produção
  app.get("/api/reports/production/:farmId", async (req: Request, res: Response) => {
    try {
      const farmId = parseInt(req.params.farmId);

      const animals = await db.getAnimalsByFarmId(farmId);
      const milkProduction = await db.getMilkProductionByFarmId(farmId);

      // Calcular GMD médio
      let totalGMD = 0;
      let countGMD = 0;
      for (const animal of animals) {
        if (animal.gmd && animal.gmd > 0) {
          totalGMD += animal.gmd;
          countGMD++;
        }
      }
      const averageGMD = countGMD > 0 ? totalGMD / countGMD : 0;

      const reportData = {
        totalAnimals: animals.length,
        averageGMD,
        milkProduction: milkProduction.map((m: any) => {
          const animal = animals.find((a: any) => a.id === m.animalId);
          return {
            date: new Date(m.date),
            quantity: m.quantity,
            animal: animal?.tagId || "Desconhecido",
          };
        }),
        weighings: [],
      };

      generateProductionReport(reportData, res);
    } catch (error: any) {
      console.error("[Reports] Error generating production report:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
