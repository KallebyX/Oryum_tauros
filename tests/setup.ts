// Setup global para testes
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Configurações globais antes de todos os testes
  console.log('Iniciando testes...');
});

afterAll(() => {
  // Limpeza após todos os testes
  console.log('Testes finalizados.');
});
