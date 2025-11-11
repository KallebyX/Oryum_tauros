import { test, expect } from '@playwright/test';

test.describe('Onboarding', () => {
  test('deve completar onboarding com sucesso', async ({ page }) => {
    // Navegar para página de onboarding
    await page.goto('/onboarding');

    // Verificar se está na página correta
    await expect(page).toHaveTitle(/Oryum Tauros/);

    // Preencher formulário de onboarding
    await page.fill('input[name="farmName"]', 'Fazenda Teste E2E');
    await page.selectOption('select[name="state"]', 'SP');
    await page.fill('input[name="city"]', 'São Paulo');
    await page.fill('input[name="area"]', '500');
    await page.selectOption('select[name="productionType"]', 'cattle_dairy');

    // Submeter formulário
    await page.click('button[type="submit"]');

    // Verificar redirecionamento para dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verificar mensagem de sucesso
    await expect(page.locator('text=Fazenda cadastrada com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/onboarding');

    // Tentar submeter sem preencher
    await page.click('button[type="submit"]');

    // Verificar mensagens de validação
    await expect(page.locator('text=Nome da fazenda é obrigatório')).toBeVisible();
  });
});
