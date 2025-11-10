import { invokeLLM } from "./_core/llm";
import * as db from "./db";

/**
 * Generate AI recommendations based on farm data
 */
export async function generateRecommendations(farmId: number) {
  try {
    // Get farm data
    const farm = await db.getFarmById(farmId);
    if (!farm) {
      throw new Error("Farm not found");
    }

    // Get financial data
    const transactions = await db.getTransactionsByFarm(farmId);
    const totalRevenue = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const profit = totalRevenue - totalExpenses;

    // Get ESG score
    const esgScore = await db.calculateESGScore(farmId);

    // Get inventory status
    const inventory = await db.getInventoryByFarm(farmId);
    const lowStockItems = inventory.filter(
      (item) => item.quantity !== null && item.quantity <= (item.minStock || 0)
    );

    // Get batches
    const batches = await db.getBatchesByFarm(farmId);

    // Prepare context for AI
    const context = `
Fazenda: ${farm.name}
Região: ${farm.region || "Não especificada"}
Área: ${farm.sizeHectares || 0} hectares
Tipo de produção: ${farm.farmType || "Não especificado"}

Situação Financeira:
- Receita total: R$ ${(totalRevenue / 100).toFixed(2)}
- Despesas totais: R$ ${(totalExpenses / 100).toFixed(2)}
- Lucro: R$ ${(profit / 100).toFixed(2)}
- Margem: ${totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0}%

Score ESG:
- Pontuação: ${esgScore.score} de ${esgScore.maxScore} (${esgScore.percentage.toFixed(1)}%)

Estoque:
- Total de itens: ${inventory.length}
- Itens com estoque baixo: ${lowStockItems.length}

Lotes:
- Total de lotes: ${batches.length}
- Lotes ativos: ${batches.length}
`;

    // Generate recommendations using AI
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um consultor especializado em gestão rural e pecuária. Analise os dados da fazenda e forneça 3 recomendações práticas e acionáveis para melhorar a produtividade, rentabilidade e sustentabilidade. Seja específico e direto.`,
        },
        {
          role: "user",
          content: `Analise esta fazenda e forneça 3 recomendações:\n\n${context}`,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const recommendationsText = typeof messageContent === 'string' ? messageContent : '';

    // Parse recommendations (simple split by numbered list)
    const recommendationLines = recommendationsText
      .split("\n")
      .filter((line: string) => line.trim().match(/^\d+[\.)]/));

    const recommendations = recommendationLines.slice(0, 3).map((line: string, index: number) => {
      const text = line.replace(/^\d+[\.)]/, "").trim();
      return {
        title: `Recomendação ${index + 1}`,
        description: text,
        category: index === 0 ? "financial" : index === 1 ? "esg" : "operational",
        priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
      };
    });

    // Save recommendations to database
    const savedRecommendations = [];
    for (const rec of recommendations) {
      const id = await db.createAIRecommendation({
        farmId,
        content: rec.description,
        title: rec.title,
        type: rec.category,
        priority: rec.priority as "low" | "medium" | "high",
      });
      savedRecommendations.push({ id, ...rec });
    }

    return savedRecommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw error;
  }
}

/**
 * Generate suggestions to improve ESG badge level
 */
export async function generateESGSuggestions(farmId: number) {
  try {
    const esgScore = await db.calculateESGScore(farmId);
    const responses = await db.getESGResponsesByFarm(farmId);
    const checklists = await db.getAllESGChecklists();

    // Find checklists not yet completed
    const completedChecklistIds = responses.map((r) => r.checklistId);
    const pendingChecklists = checklists.filter(
      (c) => !completedChecklistIds.includes(c.id)
    );

    const context = `
Score ESG atual: ${esgScore.score} de ${esgScore.maxScore} (${esgScore.percentage.toFixed(1)}%)
Checklists completados: ${responses.length}
Checklists pendentes: ${pendingChecklists.length}

Checklists pendentes prioritários:
${pendingChecklists
  .slice(0, 5)
  .map((c) => `- ${c.title} (${c.maxPoints} pontos)`)
  .join("\n")}
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em práticas ESG (Ambiental, Social e Governança) para propriedades rurais. Forneça sugestões práticas e específicas para melhorar o selo ESG.`,
        },
        {
          role: "user",
          content: `Com base nestes dados, sugira 3 ações prioritárias para melhorar o selo ESG:\n\n${context}`,
        },
      ],
    });

    const suggestionsText = response.choices[0]?.message?.content || "";
    return suggestionsText;
  } catch (error) {
    console.error("Error generating ESG suggestions:", error);
    throw error;
  }
}

/**
 * Summarize financial report
 */
export async function summarizeFinancialReport(farmId: number, period: string) {
  try {
    const transactions = await db.getTransactionsByFarm(farmId);

    const revenue = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Group by category
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category || "Outros";
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (t.amount || 0);
      });

    const context = `
Período: ${period}
Receita total: R$ ${(revenue / 100).toFixed(2)}
Despesas totais: R$ ${(expenses / 100).toFixed(2)}
Lucro: R$ ${((revenue - expenses) / 100).toFixed(2)}

Despesas por categoria:
${Object.entries(expensesByCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, val]) => `- ${cat}: R$ ${(val / 100).toFixed(2)}`)
  .join("\n")}
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um analista financeiro especializado em agronegócio. Analise o relatório financeiro e forneça um resumo executivo com insights e recomendações.`,
        },
        {
          role: "user",
          content: `Analise este relatório financeiro e forneça um resumo executivo:\n\n${context}`,
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error summarizing report:", error);
    throw error;
  }
}
