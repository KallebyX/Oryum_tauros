import { describe, it, expect } from 'vitest';

describe('Cálculos do Sistema', () => {
  describe('Cálculo de GMD (Ganho Médio Diário)', () => {
    it('deve calcular GMD corretamente com duas pesagens', () => {
      const pesoInicial = 300; // kg
      const pesoFinal = 360; // kg
      const diasEntrePesagens = 30;
      
      const gmd = (pesoFinal - pesoInicial) / diasEntrePesagens;
      
      expect(gmd).toBe(2); // 2 kg/dia
    });

    it('deve retornar 0 quando não há ganho de peso', () => {
      const pesoInicial = 300;
      const pesoFinal = 300;
      const diasEntrePesagens = 30;
      
      const gmd = (pesoFinal - pesoInicial) / diasEntrePesagens;
      
      expect(gmd).toBe(0);
    });

    it('deve calcular GMD negativo quando há perda de peso', () => {
      const pesoInicial = 360;
      const pesoFinal = 330;
      const diasEntrePesagens = 30;
      
      const gmd = (pesoFinal - pesoInicial) / diasEntrePesagens;
      
      expect(gmd).toBe(-1); // -1 kg/dia
    });
  });

  describe('Cálculo de Score ESG', () => {
    it('deve calcular score ESG corretamente', () => {
      const totalPraticas = 16;
      const praticasImplementadas = 12;
      
      const score = Math.round((praticasImplementadas / totalPraticas) * 100);
      
      expect(score).toBe(75); // 75%
    });

    it('deve retornar 0 quando nenhuma prática está implementada', () => {
      const totalPraticas = 16;
      const praticasImplementadas = 0;
      
      const score = Math.round((praticasImplementadas / totalPraticas) * 100);
      
      expect(score).toBe(0);
    });

    it('deve retornar 100 quando todas as práticas estão implementadas', () => {
      const totalPraticas = 16;
      const praticasImplementadas = 16;
      
      const score = Math.round((praticasImplementadas / totalPraticas) * 100);
      
      expect(score).toBe(100);
    });
  });

  describe('Cálculo de Progresso de Metas', () => {
    it('deve calcular progresso de meta de produção de leite', () => {
      const metaLitros = 1000;
      const litrosAtual = 750;
      
      const progresso = Math.round((litrosAtual / metaLitros) * 100);
      
      expect(progresso).toBe(75); // 75%
    });

    it('deve limitar progresso a 100% quando meta é ultrapassada', () => {
      const metaLitros = 1000;
      const litrosAtual = 1200;
      
      const progresso = Math.min(Math.round((litrosAtual / metaLitros) * 100), 100);
      
      expect(progresso).toBe(100);
    });

    it('deve calcular progresso de meta de GMD', () => {
      const metaGMD = 2.0; // kg/dia
      const gmdAtual = 1.5; // kg/dia
      
      const progresso = Math.round((gmdAtual / metaGMD) * 100);
      
      expect(progresso).toBe(75); // 75%
    });
  });

  describe('Cálculo de Dias Restantes', () => {
    it('deve calcular dias restantes até prazo corretamente', () => {
      const hoje = new Date('2025-11-10');
      const prazo = new Date('2025-11-20');
      
      const diasRestantes = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diasRestantes).toBe(10);
    });

    it('deve retornar 0 quando prazo já passou', () => {
      const hoje = new Date('2025-11-20');
      const prazo = new Date('2025-11-10');
      
      const diasRestantes = Math.max(0, Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));
      
      expect(diasRestantes).toBe(0);
    });
  });

  describe('Cálculo Financeiro', () => {
    it('deve calcular saldo corretamente', () => {
      const receitas = 10000;
      const despesas = 7000;
      
      const saldo = receitas - despesas;
      
      expect(saldo).toBe(3000);
    });

    it('deve calcular margem de lucro', () => {
      const receitas = 10000;
      const despesas = 7000;
      
      const margemLucro = ((receitas - despesas) / receitas) * 100;
      
      expect(margemLucro).toBe(30); // 30%
    });
  });
});
