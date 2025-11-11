import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { 
  esgChecklists, 
  challenges,
  farms,
  batches,
  animals,
  weighings,
  financialTransactions,
  inventoryItems,
  milkProduction,
  planningTasks,
  reproductiveEvents,
  vaccinations,
  pastures
} from "../drizzle/schema.js";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

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
    console.log("\n=== SEED: Limpando dados antigos ===");
    
    // Limpar tabelas na ordem correta (dependências primeiro)
    await db.delete(weighings);
    await db.delete(milkProduction);
    await db.delete(reproductiveEvents);
    await db.delete(vaccinations);
    await db.delete(animals);
    await db.delete(batches);
    await db.delete(financialTransactions);
    await db.delete(inventoryItems);
    await db.delete(planningTasks);
    await db.delete(pastures);
    await db.delete(farms);
    
    console.log("✅ Dados antigos removidos\n");
    
    // ==================== FAZENDAS ====================
    console.log("=== SEED: Criando Fazendas ===");
    const farmsData = [
      {
        userId: 1, // Assumindo que userId 1 existe (criado pelo login local)
        name: "Fazenda Santa Rita",
        region: "Sul de Minas",
        state: "MG",
        // sizeHectares é um inteiro no schema
        sizeHectares: 250,
        farmType: "dairy",
        animalCount: 0,
      },
      {
        userId: 1,
        name: "Rancho Verde",
        region: "Triângulo Mineiro",
        state: "MG",
        sizeHectares: 180,
        // 'beef' não existe no enum do schema; usar 'cattle' para fazendas de corte
        farmType: "cattle",
        animalCount: 0,
      },
    ];
    
    const farmResults = await db.insert(farms).values(farmsData).$returningId();
    const farmId = farmResults[0].id;
    console.log(`✅ ${farmsData.length} fazendas criadas (ID principal: ${farmId})\n`);

    // ==================== LOTES ====================
    console.log("=== SEED: Criando Lotes ===");
    const batchesData = [
      {
        farmId,
        name: "Lote A - Bezerras",
        // animalType deve ser um dos: cattle, sheep, goat, buffalo
        animalType: "cattle",
        // phase deve ser um dos: cria, recria, engorda, confinamento, lactacao, seca
        phase: "cria",
        quantity: 0,
        averageWeight: 0,
      },
      {
        farmId,
        name: "Lote B - Novilhas",
        animalType: "cattle",
        phase: "recria",
        quantity: 0,
        averageWeight: 0,
      },
      {
        farmId,
        name: "Lote C - Vacas em Lactação",
        animalType: "cattle",
        phase: "lactacao",
        quantity: 0,
        averageWeight: 0,
      },
    ];
    
    const batchResults = await db.insert(batches).values(batchesData).$returningId();
    const batchIds = batchResults.map(r => r.id);
    console.log(`✅ ${batchesData.length} lotes criados\n`);

    // ==================== ANIMAIS ====================
    console.log("=== SEED: Criando Animais ===");
    const animalsData = [
      // Lote A - Bezerras
      { farmId, batchId: batchIds[0], tagId: "BRF001", name: "Estrela", species: "cattle", breed: "Holandês", sex: "female", birthDate: new Date("2024-09-15"), birthWeight: 86, currentWeight: 86, status: "active" },
      { farmId, batchId: batchIds[0], tagId: "BRF002", name: "Luna", species: "cattle", breed: "Holandês", sex: "female", birthDate: new Date("2024-08-20"), birthWeight: 95, currentWeight: 95, status: "active" },
      { farmId, batchId: batchIds[0], tagId: "BRF003", name: "Bella", species: "cattle", breed: "Jersey", sex: "female", birthDate: new Date("2024-10-01"), birthWeight: 78, currentWeight: 78, status: "active" },
      
      // Lote B - Novilhas
      { farmId, batchId: batchIds[1], tagId: "NOV001", name: "Princesa", species: "cattle", breed: "Holandês", sex: "female", birthDate: new Date("2023-06-10"), birthWeight: 380, currentWeight: 380, status: "active" },
      { farmId, batchId: batchIds[1], tagId: "NOV002", name: "Rainha", species: "cattle", breed: "Girolando", sex: "female", birthDate: new Date("2023-07-15"), birthWeight: 351, currentWeight: 351, status: "active" },
      { farmId, batchId: batchIds[1], tagId: "NOV003", name: "Flor", species: "cattle", breed: "Jersey", sex: "female", birthDate: new Date("2023-05-20"), birthWeight: 320, currentWeight: 320, status: "active" },
      
      // Lote C - Vacas em Lactação
      { farmId, batchId: batchIds[2], tagId: "VAC001", name: "Mimosa", species: "cattle", breed: "Holandês", sex: "female", birthDate: new Date("2021-03-12"), birthWeight: 620, currentWeight: 620, status: "active" },
      { farmId, batchId: batchIds[2], tagId: "VAC002", name: "Bonita", species: "cattle", breed: "Holandês", sex: "female", birthDate: new Date("2020-11-25"), birthWeight: 650, currentWeight: 650, status: "active" },
      { farmId, batchId: batchIds[2], tagId: "VAC003", name: "Doceira", species: "cattle", breed: "Girolando", sex: "female", birthDate: new Date("2021-01-08"), birthWeight: 580, currentWeight: 580, status: "active" },
      { farmId, batchId: batchIds[2], tagId: "VAC004", name: "Formosa", species: "cattle", breed: "Jersey", sex: "female", birthDate: new Date("2020-09-30"), birthWeight: 480, currentWeight: 480, status: "active" },
    ];
    
    const animalResults = await db.insert(animals).values(animalsData).$returningId();
    const animalIds = animalResults.map(r => r.id);
    console.log(`✅ ${animalsData.length} animais criados\n`);

    // ==================== PESAGENS ====================
    console.log("=== SEED: Criando Pesagens ===");
    const weighingsData = [];
    
    // Pesagens históricas para calcular GMD
    for (let i = 0; i < animalIds.length; i++) {
      const animal = animalsData[i];
      const animalId = animalIds[i];

      // usar currentWeight se disponível, senão birthWeight
      const baseWeight = (animal.currentWeight ?? animal.birthWeight ?? 0);

      // 3 pesagens nos últimos 3 meses
      weighingsData.push(
        { animalId, weight: Math.round(baseWeight * 0.85), date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), notes: "Pesagem inicial" },
        { animalId, weight: Math.round(baseWeight * 0.92), date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), notes: "Pesagem intermediária" },
        { animalId, weight: Math.round(baseWeight), date: new Date(), notes: "Pesagem atual" }
      );
    }
    
    await db.insert(weighings).values(weighingsData);
    console.log(`✅ ${weighingsData.length} pesagens criadas\n`);

    // ==================== PRODUÇÃO DE LEITE ====================
    console.log("=== SEED: Criando Produção de Leite ===");
    const milkData = [];
    
    // Vacas em lactação (últimos 7 animais)
    const lactatingCows = animalIds.slice(-4);
    
    for (let i = 0; i < lactatingCows.length; i++) {
      const animalId = lactatingCows[i];
      const baseProduction = 25 + Math.random() * 10; // 25-35 litros base

      // Produção dos últimos 30 dias
      for (let day = 0; day < 30; day++) {
        const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
        const morningLiters = baseProduction * (0.5 + Math.random() * 0.1);
        const eveningLiters = baseProduction * (0.5 + Math.random() * 0.1);
        const total = parseFloat((morningLiters + eveningLiters).toFixed(2));

        milkData.push({
          animalId,
          farmId,
          date,
          liters: total,
          lactationDay: day + 1,
          notes: "Registro automático de produção",
        });
      }
    }
    
    await db.insert(milkProduction).values(milkData);
    console.log(`✅ ${milkData.length} registros de produção de leite criados\n`);

    // ==================== FINANCEIRO ====================
    console.log("=== SEED: Criando Transações Financeiras ===");
    const financialData = [
      // Receitas
      { farmId, type: "income", category: "sales", amount: 15000.00, date: new Date("2024-11-01"), description: "Venda de leite - Outubro", isPaid: true },
      { farmId, type: "income", category: "sales", amount: 8500.00, date: new Date("2024-10-15"), description: "Venda de 2 novilhas", isPaid: true },
      { farmId, type: "income", category: "sales", amount: 14500.00, date: new Date("2024-10-01"), description: "Venda de leite - Setembro", isPaid: true },
      { farmId, type: "income", category: "sales", amount: 12000.00, date: new Date("2024-09-01"), description: "Venda de leite - Agosto", isPaid: true },
      
      // Despesas
      { farmId, type: "expense", category: "feed", amount: 4500.00, date: new Date("2024-11-05"), description: "Compra de ração (2 toneladas)", isPaid: true },
      { farmId, type: "expense", category: "veterinary", amount: 1200.00, date: new Date("2024-11-03"), description: "Vacinação do rebanho", isPaid: true },
      { farmId, type: "expense", category: "labor", amount: 6800.00, date: new Date("2024-11-01"), description: "Salários - Novembro", isPaid: true },
      { farmId, type: "expense", category: "maintenance", amount: 850.00, date: new Date("2024-10-28"), description: "Manutenção ordenhadeira", isPaid: true },
      { farmId, type: "expense", category: "feed", amount: 3800.00, date: new Date("2024-10-20"), description: "Compra de silagem", isPaid: true },
      { farmId, type: "expense", category: "utilities", amount: 680.00, date: new Date("2024-10-15"), description: "Conta de energia elétrica", isPaid: true },
      { farmId, type: "expense", category: "supplies", amount: 420.00, date: new Date("2024-10-10"), description: "Material de limpeza e higiene", isPaid: true },
      { farmId, type: "expense", category: "labor", amount: 6500.00, date: new Date("2024-10-01"), description: "Salários - Outubro", isPaid: true },
      
      // Despesas pendentes
      { farmId, type: "expense", category: "feed", amount: 5200.00, date: new Date("2024-11-15"), description: "Pedido de ração - A pagar", isPaid: false },
      { farmId, type: "expense", category: "veterinary", amount: 950.00, date: new Date("2024-11-20"), description: "Consulta veterinária - A pagar", isPaid: false },
    ];
    
    await db.insert(financialTransactions).values(financialData);
    console.log(`✅ ${financialData.length} transações financeiras criadas\n`);

    // ==================== INVENTÁRIO ====================
    console.log("=== SEED: Criando Inventário ===");
    const inventoryData = [
      { farmId, name: "Ração para Gado Leiteiro", category: "feed", quantity: 1500, unit: "kg", unitPrice: 2.25, minStock: 500, location: "Galpão A" },
      { farmId, name: "Sal Mineral", category: "supplements", quantity: 80, unit: "kg", unitPrice: 15.50, minStock: 20, location: "Galpão A" },
      { farmId, name: "Silagem de Milho", category: "feed", quantity: 5000, unit: "kg", unitPrice: 0.75, minStock: 1000, location: "Silo 1" },
      { farmId, name: "Feno de Alfafa", category: "feed", quantity: 800, unit: "kg", unitPrice: 3.80, minStock: 200, location: "Galpão B" },
      { farmId, name: "Vacina contra Febre Aftosa", category: "medications", quantity: 25, unit: "dose", unitPrice: 8.50, minStock: 10, location: "Geladeira" },
      { farmId, name: "Vermífugo", category: "medications", quantity: 15, unit: "frasco", unitPrice: 45.00, minStock: 5, location: "Armário Veterinário" },
      { farmId, name: "Detergente Alcalino (limpeza ordenha)", category: "cleaning", quantity: 40, unit: "litro", unitPrice: 12.80, minStock: 10, location: "Sala de Ordenha" },
      { farmId, name: "Papel Toalha", category: "cleaning", quantity: 50, unit: "rolo", unitPrice: 3.50, minStock: 20, location: "Depósito" },
      { farmId, name: "Brinco de Identificação", category: "equipment", quantity: 100, unit: "unidade", unitPrice: 2.20, minStock: 30, location: "Escritório" },
      { farmId, name: "Luva de Ordenha", category: "equipment", quantity: 12, unit: "par", unitPrice: 18.00, minStock: 5, location: "Sala de Ordenha" },
    ];
    
    await db.insert(inventoryItems).values(inventoryData);
    console.log(`✅ ${inventoryData.length} itens de inventário criados\n`);

    // ==================== PASTAGENS ====================
    console.log("=== SEED: Criando Pastagens ===");
    const pasturesData = [
      { farmId, name: "Pasto 1 - Brachiaria", areaHectares: 16, grassType: "Brachiaria Brizantha", currentBatchId: null, rotationStartDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), restPeriodDays: 30, status: "active" },
      { farmId, name: "Pasto 2 - Mombaça", areaHectares: 12, grassType: "Panicum maximum (Mombaça)", currentBatchId: null, rotationStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), restPeriodDays: 30, status: "active" },
      { farmId, name: "Pasto 3 - Tanzânia", areaHectares: 18, grassType: "Panicum maximum (Tanzânia)", currentBatchId: null, rotationStartDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), restPeriodDays: 30, status: "resting" },
      { farmId, name: "Pasto 4 - Marandu", areaHectares: 20, grassType: "Brachiaria Brizantha cv. Marandu", currentBatchId: null, rotationStartDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), restPeriodDays: 30, status: "active" },
    ];
    
    await db.insert(pastures).values(pasturesData);
    console.log(`✅ ${pasturesData.length} pastagens criadas\n`);

    // ==================== TAREFAS DE PLANEJAMENTO ====================
    console.log("=== SEED: Criando Tarefas de Planejamento ===");
    const tasksData = [
      { farmId, title: "Vacinar bezerras", description: "Aplicar vacina contra clostridioses", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), priority: "high", status: "pending" },
      { farmId, title: "Fazer rotação do Pasto 3", description: "Mover animais do Pasto 2 para Pasto 3", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), priority: "medium", status: "pending" },
      { farmId, title: "Comprar ração", description: "Pedir 3 toneladas de ração concentrada", dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), priority: "high", status: "pending" },
      { farmId, title: "Manutenção preventiva ordenhadeira", description: "Verificar mangueiras e teteiras", dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), priority: "medium", status: "pending" },
      { farmId, title: "Inseminação artificial - Novilhas", description: "IA nas novilhas que apresentaram cio", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), priority: "high", status: "pending" },
      { farmId, title: "Limpar bebedouros", description: "Limpar e desinfetar todos os bebedouros", dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), priority: "medium", status: "pending" },
      { farmId, title: "Análise de solo", description: "Coletar amostras para análise laboratorial", dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), priority: "low", status: "pending" },
    ];
    
    await db.insert(planningTasks).values(tasksData);
    console.log(`✅ ${tasksData.length} tarefas de planejamento criadas\n`);

    // ==================== EVENTOS REPRODUTIVOS ====================
    console.log("=== SEED: Criando Eventos Reprodutivos ===");
    const reproductiveData = [];
    
    // Vacas em lactação
    const cowIds = animalIds.slice(-4);
    
    for (let i = 0; i < cowIds.length; i++) {
      const animalId = cowIds[i];
      
      reproductiveData.push(
        { farmId, animalId, eventType: "heat", date: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000), notes: "Cio observado - início do histórico" },
        { farmId, animalId, eventType: "insemination", date: new Date(Date.now() - 279 * 24 * 60 * 60 * 1000), semenCode: "HOL-BR-2024", notes: "IA com touro holandês" },
        { farmId, animalId, eventType: "pregnancy_check", date: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000), result: "positive", notes: "Confirmada prenhez aos 40 dias" },
        { farmId, animalId, eventType: "birth", date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), notes: "Parto normal - bezerra fêmea" }
      );
    }
    
    await db.insert(reproductiveEvents).values(reproductiveData);
    console.log(`✅ ${reproductiveData.length} eventos reprodutivos criados\n`);

    // ==================== VACINAÇÕES ====================
    console.log("=== SEED: Criando Vacinações ===");
    const vaccinationsData = [];
    
    for (let i = 0; i < animalIds.length; i++) {
      const animalId = animalIds[i];
      
      vaccinationsData.push(
        { farmId, animalId, vaccineType: "Febre Aftosa", date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), nextDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), veterinarian: "Dr. Carlos Veterinário" },
        { farmId, animalId, vaccineType: "Raiva", date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), nextDueDate: new Date(Date.now() + 215 * 24 * 60 * 60 * 1000), veterinarian: "Dr. Carlos Veterinário" },
        { farmId, animalId, vaccineType: "Brucelose", date: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), veterinarian: "Dr. Carlos Veterinário" }
      );
    }
    
    await db.insert(vaccinations).values(vaccinationsData);
    console.log(`✅ ${vaccinationsData.length} vacinações criadas\n`);

    // ==================== ESG & CHALLENGES ====================
    console.log("=== SEED: Inserindo Checklists ESG e Desafios ===");
    for (const checklist of esgChecklistsData) {
      await db.insert(esgChecklists).values(checklist);
    }
    console.log(`✅ ${esgChecklistsData.length} checklists ESG inseridos\n`);

    for (const challenge of challengesData) {
      await db.insert(challenges).values(challenge);
    }
    console.log(`✅ ${challengesData.length} desafios inseridos\n`);

    console.log("===========================================");
    console.log("✅ SEED CONCLUÍDO COM SUCESSO!");
    console.log("===========================================");
    console.log(`📊 Resumo dos dados criados:`);
    console.log(`   - ${farmsData.length} fazendas`);
    console.log(`   - ${batchesData.length} lotes`);
    console.log(`   - ${animalsData.length} animais`);
    console.log(`   - ${weighingsData.length} pesagens`);
    console.log(`   - ${milkData.length} registros de produção de leite`);
    console.log(`   - ${financialData.length} transações financeiras`);
    console.log(`   - ${inventoryData.length} itens de inventário`);
    console.log(`   - ${pasturesData.length} pastagens`);
    console.log(`   - ${tasksData.length} tarefas de planejamento`);
    console.log(`   - ${reproductiveData.length} eventos reprodutivos`);
    console.log(`   - ${vaccinationsData.length} vacinações`);
    console.log(`   - ${esgChecklistsData.length} checklists ESG`);
    console.log(`   - ${challengesData.length} desafios`);
    console.log("===========================================\n");
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERRO ao executar seed:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

seed();
