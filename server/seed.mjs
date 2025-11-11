import { drizzle } from "drizzle-orm/mysql2";
import { esgChecklists, challenges } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL);

console.log("[Seed] Iniciando seed do banco de dados...");

// Checklists ESG padrão
const esgChecklistsData = [
  // Ambiental
  {
    title: "Possui sistema de tratamento de efluentes?",
    description: "Tratamento adequado de dejetos e águas residuais",
    category: "environmental",
    maxPoints: 10,
    isActive: true,
  },
  {
    title: "Utiliza energia renovável (solar, eólica)?",
    description: "Uso de fontes de energia limpa e renovável",
    category: "environmental",
    maxPoints: 10,
    isActive: true,
  },
  {
    title: "Realiza rotação de pastagens?",
    description: "Sistema de manejo que preserva o solo e a vegetação",
    category: "environmental",
    maxPoints: 8,
    isActive: true,
  },
  {
    title: "Possui área de preservação permanente (APP)?",
    description: "Manutenção de áreas de mata nativa e nascentes",
    category: "environmental",
    maxPoints: 10,
    isActive: true,
  },
  {
    title: "Faz compostagem de resíduos orgânicos?",
    description: "Reaproveitamento de resíduos para adubo orgânico",
    category: "environmental",
    maxPoints: 7,
    isActive: true,
  },
  {
    title: "Utiliza sistema de captação de água da chuva?",
    description: "Aproveitamento de água pluvial para reduzir consumo",
    category: "environmental",
    maxPoints: 8,
    isActive: true,
  },
  
  // Social
  {
    title: "Oferece treinamento regular aos funcionários?",
    description: "Capacitação e desenvolvimento profissional da equipe",
    category: "social",
    maxPoints: 8,
    isActive: true,
  },
  {
    title: "Possui equipamentos de proteção individual (EPIs)?",
    description: "Fornecimento e uso obrigatório de EPIs",
    category: "social",
    maxPoints: 10,
    isActive: true,
  },
  {
    title: "Oferece benefícios além do salário (plano de saúde, vale-alimentação)?",
    description: "Benefícios adicionais para bem-estar dos colaboradores",
    category: "social",
    maxPoints: 7,
    isActive: true,
  },
  {
    title: "Respeita as normas de bem-estar animal?",
    description: "Manejo humanizado e condições adequadas para os animais",
    category: "social",
    maxPoints: 10,
    isActive: true,
  },
  {
    title: "Participa de programas sociais da comunidade?",
    description: "Engajamento com a comunidade local",
    category: "social",
    maxPoints: 5,
    isActive: true,
  },
  
  // Governança
  {
    title: "Possui registros financeiros organizados?",
    description: "Controle financeiro e contábil adequado",
    category: "governance",
    maxPoints: 8,
    isActive: true,
  },
  {
    title: "Mantém documentação sanitária em dia?",
    description: "GTA, vacinas e documentos sanitários atualizados",
    category: "governance",
    maxPoints: 10,
    isActive: true,
  },
  {
    title: "Realiza auditorias internas regulares?",
    description: "Avaliação periódica de processos e conformidade",
    category: "governance",
    maxPoints: 7,
    isActive: true,
  },
  {
    title: "Possui certificações de qualidade (orgânico, Rainforest, etc)?",
    description: "Certificações reconhecidas de boas práticas",
    category: "governance",
    maxPoints: 10,
    isActive: true,
  },
  {
    title: "Tem plano de sucessão familiar/empresarial?",
    description: "Planejamento para continuidade do negócio",
    category: "governance",
    maxPoints: 5,
    isActive: true,
  },
];

// Desafios mensais
const challengesData = [
  {
    title: "Mestre da Eficiência",
    description: "Registre todas as transações financeiras por 30 dias consecutivos",
    category: "financial",
    points: 100,
    targetValue: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    title: "Guardião do Rebanho",
    description: "Registre pesagens semanais de todos os animais por 1 mês",
    category: "management",
    points: 150,
    targetValue: 4,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    title: "Campeão ESG",
    description: "Alcance score ESG de 70 pontos ou mais",
    category: "esg",
    points: 200,
    targetValue: 70,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    title: "Planejador Estratégico",
    description: "Complete 20 tarefas no módulo de planejamento",
    category: "management",
    points: 120,
    targetValue: 20,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    title: "Produtor Sustentável",
    description: "Implemente 5 práticas ESG no checklist",
    category: "esg",
    points: 180,
    targetValue: 5,
    startDate: new Date(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    title: "Gestor de Estoque",
    description: "Mantenha todos os itens do estoque acima do mínimo por 30 dias",
    category: "management",
    points: 100,
    targetValue: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    title: "Especialista em Reprodução",
    description: "Registre 10 eventos reprodutivos (cio, IA, prenhez)",
    category: "production",
    points: 130,
    targetValue: 10,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    title: "Vacinador Exemplar",
    description: "Mantenha o calendário sanitário 100% em dia",
    category: "management",
    points: 150,
    targetValue: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

async function seed() {
  try {
    // Inserir checklists ESG
    console.log("[Seed] Inserindo checklists ESG...");
    for (const checklist of esgChecklistsData) {
      await db.insert(esgChecklists).values(checklist);
    }
    console.log(`[Seed] ${esgChecklistsData.length} checklists ESG inseridos com sucesso!`);

    // Inserir desafios
    console.log("[Seed] Inserindo desafios mensais...");
    for (const challenge of challengesData) {
      await db.insert(challenges).values(challenge);
    }
    console.log(`[Seed] ${challengesData.length} desafios inseridos com sucesso!`);

    console.log("[Seed] ✅ Seed concluído com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("[Seed] ❌ Erro ao executar seed:", error);
    process.exit(1);
  }
}

seed();
