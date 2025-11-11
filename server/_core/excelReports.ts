import * as XLSX from 'xlsx';
import { getTransactionsByFarmId } from '../db';

export async function generateFinancialExcel(farmId: number) {
  const transactions = await getTransactionsByFarmId(farmId);

  // Preparar dados para Excel
  const data = transactions.map(t => ({
    'Data': t.date ? new Date(t.date).toLocaleDateString('pt-BR') : '',
    'Tipo': t.type === 'income' ? 'Receita' : 'Despesa',
    'Categoria': t.category,
    'Descrição': t.description || '',
    'Valor (R$)': t.amount,
  }));

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 12 }, // Data
    { wch: 10 }, // Tipo
    { wch: 20 }, // Categoria
    { wch: 40 }, // Descrição
    { wch: 15 }, // Valor
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Transações');

  // Gerar buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

export async function generateAnimalsExcel(farmId: number) {
  const { getAnimalsByFarmId } = await import('../db');
  const animals = await getAnimalsByFarmId(farmId);

  const data = animals.map(a => ({
    'Brinco/Tag': a.tagId,
    'Espécie': a.species === 'cattle' ? 'Bovino' : a.species === 'sheep' ? 'Ovino' : a.species === 'goat' ? 'Caprino' : 'Bubalino',
    'Raça': a.breed || '',
    'Sexo': a.sex === 'female' ? 'Fêmea' : 'Macho',
    'Data de Nascimento': a.birthDate ? new Date(a.birthDate).toLocaleDateString('pt-BR') : '',
    'Idade (dias)': a.birthDate ? Math.floor((Date.now() - new Date(a.birthDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
    'Peso Atual (kg)': a.currentWeight || 0,
    'GMD (kg/dia)': a.gmd || 0,
    'Status': a.status === 'active' ? 'Ativo' : a.status === 'sold' ? 'Vendido' : a.status === 'deceased' ? 'Falecido' : 'Quarentena',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 12 }, // Brinco
    { wch: 15 }, // RFID
    { wch: 10 }, // Espécie
    { wch: 15 }, // Raça
    { wch: 8 }, // Sexo
    { wch: 18 }, // Data Nascimento
    { wch: 12 }, // Idade
    { wch: 15 }, // Peso
    { wch: 12 }, // GMD
    { wch: 12 }, // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Animais');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

export async function generateProductionExcel(farmId: number) {
  const { getMilkProductionByFarmId } = await import('../db');
  const production = await getMilkProductionByFarmId(farmId);

  const data = production.map(p => ({
    'Data': p.date ? new Date(p.date).toLocaleDateString('pt-BR') : '',
    'Animal ID': p.animalId,
    'Litros': p.liters,
    'Observações': p.notes || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 12 }, // Data
    { wch: 12 }, // Animal ID
    { wch: 10 }, // Litros
    { wch: 40 }, // Observações
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Produção de Leite');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}
