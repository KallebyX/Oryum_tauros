import { invokeLLM } from "./llm";

interface FarmData {
  farmId: number;
  farmName: string;
  animalCount: number;
  esgScore?: number;
  recentEvents?: string[];
  challenges?: string[];
}

/**
 * Gera recomendações personalizadas usando IA baseadas nos dados da fazenda
 */
export async function generateFarmRecommendations(farmData: FarmData): Promise<string> {
  const prompt = `Você é um consultor especializado em pecuária sustentável e gestão rural.

Analise os dados da fazenda abaixo e forneça 3-5 recomendações práticas e acionáveis para melhorar a produtividade, sustentabilidade e rentabilidade:

**Dados da Fazenda:**
- Nome: ${farmData.farmName}
- Número de Animais: ${farmData.animalCount}
- Score ESG: ${farmData.esgScore || "Não disponível"}
${farmData.recentEvents && farmData.recentEvents.length > 0 ? `- Eventos Recentes: ${farmData.recentEvents.join(", ")}` : ""}
${farmData.challenges && farmData.challenges.length > 0 ? `- Desafios Ativos: ${farmData.challenges.join(", ")}` : ""}

Forneça recomendações específicas e práticas em formato de lista numerada, focando em:
1. Melhorias no manejo
2. Otimização de custos
3. Sustentabilidade (ESG)
4. Produtividade
5. Bem-estar animal

Seja direto e objetivo. Cada recomendação deve ter 1-2 frases.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um consultor especializado em pecuária sustentável." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === "string" ? content : "Não foi possível gerar recomendações no momento.";
  } catch (error) {
    console.error("[AI] Erro ao gerar recomendações:", error);
    return "Erro ao gerar recomendações. Tente novamente mais tarde.";
  }
}

/**
 * Gera sugestões para melhorar o score ESG
 */
export async function generateESGImprovementSuggestions(
  currentScore: number,
  responses: Array<{ question: string; response: boolean }>
): Promise<string> {
  const answeredNo = responses.filter((r) => !r.response).map((r) => r.question);

  const prompt = `Você é um consultor especializado em ESG (Ambiental, Social e Governança) para o agronegócio.

**Score ESG Atual:** ${currentScore}/100

**Práticas não implementadas:**
${answeredNo.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Com base nas práticas não implementadas, forneça 3-5 sugestões práticas e específicas para melhorar o score ESG da fazenda.

Para cada sugestão, inclua:
- O que fazer
- Por que é importante
- Impacto esperado no score

Seja direto e objetivo. Foque em ações práticas e viáveis.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um consultor especializado em ESG para o agronegócio." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === "string" ? content : "Não foi possível gerar sugestões no momento.";
  } catch (error) {
    console.error("[AI] Erro ao gerar sugestões ESG:", error);
    return "Erro ao gerar sugestões. Tente novamente mais tarde.";
  }
}

/**
 * Sumariza dados e gera insights sobre o desempenho da fazenda
 */
export async function generatePerformanceSummary(data: {
  totalAnimals: number;
  averageGMD?: number;
  totalRevenue?: number;
  totalExpenses?: number;
  esgScore?: number;
  completedChallenges?: number;
}): Promise<string> {
  const profit = (data.totalRevenue || 0) - (data.totalExpenses || 0);

  const prompt = `Você é um analista de dados especializado em agronegócio.

Analise os dados de desempenho abaixo e forneça um resumo executivo com insights acionáveis:

**Dados de Desempenho:**
- Total de Animais: ${data.totalAnimals}
- GMD Médio: ${data.averageGMD ? `${data.averageGMD.toFixed(2)} kg/dia` : "Não disponível"}
- Receita Total: R$ ${data.totalRevenue?.toLocaleString("pt-BR") || "0"}
- Despesas Totais: R$ ${data.totalExpenses?.toLocaleString("pt-BR") || "0"}
- Lucro: R$ ${profit.toLocaleString("pt-BR")}
- Score ESG: ${data.esgScore || "Não disponível"}/100
- Desafios Completados: ${data.completedChallenges || 0}

Forneça:
1. Resumo do desempenho geral (2-3 frases)
2. Principais pontos fortes (2-3 itens)
3. Áreas de atenção (2-3 itens)
4. Recomendação principal para o próximo mês

Seja objetivo e use linguagem clara.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um analista de dados especializado em agronegócio." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === "string" ? content : "Não foi possível gerar o resumo no momento.";
  } catch (error) {
    console.error("[AI] Erro ao gerar resumo:", error);
    return "Erro ao gerar resumo. Tente novamente mais tarde.";
  }
}
