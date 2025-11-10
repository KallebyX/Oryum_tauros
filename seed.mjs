import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL não definida');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🌱 Iniciando seed do banco de dados...');

// Seed ESG Checklists
console.log('Criando checklists ESG...');
const esgChecklists = [
  {
    category: 'environmental',
    title: 'Uso de Energia Renovável',
    description: 'Utiliza fontes de energia renovável (solar, eólica, biomassa)',
    maxPoints: 15,
  },
  {
    category: 'environmental',
    title: 'Gestão de Resíduos',
    description: 'Possui sistema adequado de coleta e destinação de resíduos',
    maxPoints: 10,
  },
  {
    category: 'environmental',
    title: 'Conservação de Água',
    description: 'Implementa práticas de conservação e reuso de água',
    maxPoints: 15,
  },
  {
    category: 'environmental',
    title: 'Preservação de Mata Nativa',
    description: 'Mantém áreas de preservação permanente e reserva legal',
    maxPoints: 20,
  },
  {
    category: 'social',
    title: 'Condições de Trabalho',
    description: 'Oferece condições adequadas de trabalho e segurança',
    maxPoints: 15,
  },
  {
    category: 'social',
    title: 'Capacitação de Funcionários',
    description: 'Investe em treinamento e desenvolvimento da equipe',
    maxPoints: 10,
  },
  {
    category: 'social',
    title: 'Engajamento Comunitário',
    description: 'Participa de iniciativas e projetos sociais na comunidade',
    maxPoints: 10,
  },
  {
    category: 'governance',
    title: 'Transparência Financeira',
    description: 'Mantém registros financeiros organizados e transparentes',
    maxPoints: 15,
  },
  {
    category: 'governance',
    title: 'Compliance Legal',
    description: 'Cumpre todas as regulamentações ambientais e trabalhistas',
    maxPoints: 20,
  },
  {
    category: 'governance',
    title: 'Planejamento Estratégico',
    description: 'Possui plano de negócios e metas de longo prazo',
    maxPoints: 10,
  },
];

for (const checklist of esgChecklists) {
  await db.insert(schema.esgChecklists).values(checklist);
}

console.log(`✅ ${esgChecklists.length} checklists ESG criados`);

// Seed Challenges
console.log('Criando desafios...');
const now = new Date();
const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 dias

const challenges = [
  {
    title: 'Redução de Desperdício',
    description: 'Reduza o desperdício de insumos em 20% nos próximos 3 meses',
    type: 'sustainability',
    points: 100,
    startDate: now,
    endDate: futureDate,
    isActive: true,
  },
  {
    title: 'Aumento de Produtividade',
    description: 'Aumente a produtividade por hectare em 15%',
    type: 'productivity',
    points: 150,
    startDate: now,
    endDate: futureDate,
    isActive: true,
  },
  {
    title: 'Certificação ESG Bronze',
    description: 'Atinja 40% de score ESG e ganhe o selo Bronze',
    type: 'esg',
    points: 200,
    startDate: now,
    endDate: futureDate,
    isActive: true,
  },
  {
    title: 'Controle Financeiro',
    description: 'Registre todas as transações financeiras por 30 dias consecutivos',
    type: 'management',
    points: 80,
    startDate: now,
    endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    title: 'Gestão de Estoque',
    description: 'Mantenha o estoque sem itens vencidos ou em falta por 60 dias',
    type: 'management',
    points: 120,
    startDate: now,
    endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

for (const challenge of challenges) {
  await db.insert(schema.challenges).values(challenge);
}

console.log(`✅ ${challenges.length} desafios criados`);

console.log('\\n🎉 Seed concluído com sucesso!');
console.log('\\nDados criados:');
console.log(`  - ${esgChecklists.length} checklists ESG`);
console.log(`  - ${challenges.length} desafios`);
console.log('\\nAgora você pode:');
console.log('  1. Fazer login no sistema');
console.log('  2. Completar o onboarding para criar sua fazenda');
console.log('  3. Explorar todas as funcionalidades do ERP');

await connection.end();
