import { test, expect } from '@playwright/test';

test.describe('Pet Shop Registration Flow', () => {
  const testEmail = `petshop-${Date.now()}@test.com`;
  const testPassword = 'PetShop123!';
  const testName = 'Responsável Teste';
  const testPhone = '11987654321';
  const petShopName = 'PetShop Teste E2E';
  const petShopAddress = 'Rua dos Testes, 123';
  const petShopCity = 'São Paulo';
  const petShopState = 'SP';

  test('should complete full pet shop registration flow', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    
    // Switch to register tab
    await page.click('button[role="tab"]:has-text("Cadastro")');
    
    // Switch to professional type
    await page.click('button:has-text("Profissional")');
    await expect(page.locator('button:has-text("Profissional")')).toHaveAttribute('data-state', 'active');
    
    // Fill registration form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[placeholder*="Confirme"]', testPassword);
    await page.fill('input[placeholder*="Nome do responsável"]', testName);
    await page.fill('input[placeholder*="Telefone"]', testPhone);
    
    // Fill pet shop specific fields
    await page.fill('input[placeholder*="Nome do petshop"]', petShopName);
    await page.fill('input[placeholder*="Endereço"]', petShopAddress);
    await page.fill('input[placeholder*="Cidade"]', petShopCity);
    await page.fill('input[placeholder*="Estado"]', petShopState);
    
    // Accept terms
    await page.click('button[role="checkbox"]');
    
    // Submit registration
    await page.click('button:has-text("Criar Conta")');
    
    // Wait for success message
    await expect(page.locator('text=Petshop cadastrado')).toBeVisible({ timeout: 5000 });
    
    // Should redirect to professional dashboard
    await page.waitForURL('/petshop-dashboard', { timeout: 5000 });
    
    // Verify dashboard loaded
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should validate pet shop required fields', async ({ page }) => {
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Cadastro")');
    await page.click('button:has-text("Profissional")');
    
    // Fill only basic info, skip pet shop fields
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'ValidPass123!');
    await page.fill('input[placeholder*="Confirme"]', 'ValidPass123!');
    await page.fill('input[placeholder*="Nome do responsável"]', 'Test User');
    await page.fill('input[placeholder*="Telefone"]', '11987654321');
    await page.click('button[role="checkbox"]');
    
    // Try to submit without pet shop info
    await page.click('button:has-text("Criar Conta")');
    
    // Should show validation errors for pet shop fields
    await expect(page.locator('text=obrigatório')).toBeVisible();
  });

  test('should validate state format (2 letters)', async ({ page }) => {
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Cadastro")');
    await page.click('button:has-text("Profissional")');
    
    // Fill form with invalid state
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'ValidPass123!');
    await page.fill('input[placeholder*="Confirme"]', 'ValidPass123!');
    await page.fill('input[placeholder*="Nome do responsável"]', 'Test User');
    await page.fill('input[placeholder*="Telefone"]', '11987654321');
    await page.fill('input[placeholder*="Nome do petshop"]', 'Test Shop');
    await page.fill('input[placeholder*="Endereço"]', 'Test Address');
    await page.fill('input[placeholder*="Cidade"]', 'Test City');
    await page.fill('input[placeholder*="Estado"]', 'SAO'); // Invalid - 3 letters
    await page.click('button[role="checkbox"]');
    
    await page.click('button:has-text("Criar Conta")');
    
    // Should show state validation error
    await expect(page.locator('text=Estado deve ter 2 letras')).toBeVisible();
  });

  test('should auto-capitalize state code', async ({ page }) => {
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Cadastro")');
    await page.click('button:has-text("Profissional")');
    
    const stateInput = page.locator('input[placeholder*="Estado"]');
    await stateInput.fill('sp');
    
    // Should be auto-capitalized to SP
    await expect(stateInput).toHaveValue('SP');
  });

  test('should switch between client and professional types', async ({ page }) => {
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Cadastro")');
    
    // Start as client
    await expect(page.locator('button:has-text("Cliente")')).toHaveAttribute('data-state', 'active');
    await expect(page.locator('input[placeholder*="Nome completo"]')).toBeVisible();
    
    // Switch to professional
    await page.click('button:has-text("Profissional")');
    await expect(page.locator('button:has-text("Profissional")')).toHaveAttribute('data-state', 'active');
    await expect(page.locator('input[placeholder*="Nome do petshop"]')).toBeVisible();
    
    // Switch back to client
    await page.click('button:has-text("Cliente")');
    await expect(page.locator('button:has-text("Cliente")')).toHaveAttribute('data-state', 'active');
    await expect(page.locator('input[placeholder*="Nome completo"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Nome do petshop"]')).not.toBeVisible();
  });
});
