import { test, expect } from '@playwright/test';

test.describe('Gestão de Animais', () => {
  test.beforeEach(async ({ page }) => {
    // Assumir que usuário já está autenticado
    await page.goto('/animals');
  });

  test('deve criar novo animal', async ({ page }) => {
    // Clicar no botão de adicionar animal
    await page.click('button:has-text("Adicionar Animal")');

    // Preencher formulário
    await page.fill('input[name="tagId"]', 'TEST001');
    await page.fill('input[name="rfid"]', 'RFID123456');
    await page.selectOption('select[name="species"]', 'cattle');
    await page.fill('input[name="breed"]', 'Nelore');
    await page.fill('input[type="date"]', '2023-01-15');
    await page.selectOption('select[name="sex"]', 'female');

    // Submeter formulário
    await page.click('button[type="submit"]');

    // Verificar mensagem de sucesso
    await expect(page.locator('text=Animal cadastrado com sucesso')).toBeVisible({ timeout: 5000 });

    // Verificar se animal aparece na lista
    await expect(page.locator('text=TEST001')).toBeVisible();
  });

  test('deve registrar pesagem', async ({ page }) => {
    // Assumir que existe um animal na lista
    await page.click('button:has-text("Registrar Pesagem")').first();

    // Preencher formulário de pesagem
    await page.fill('input[name="weight"]', '350');
    await page.fill('input[type="date"]', '2025-11-10');

    // Submeter
    await page.click('button[type="submit"]');

    // Verificar mensagem de sucesso
    await expect(page.locator('text=Pesagem registrada com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('deve calcular GMD automaticamente', async ({ page }) => {
    // Verificar se GMD é exibido na tabela
    await expect(page.locator('text=GMD')).toBeVisible();
    
    // Verificar se há valores de GMD calculados
    const gmdCells = page.locator('td:has-text("kg/dia")');
    await expect(gmdCells.first()).toBeVisible();
  });
});
