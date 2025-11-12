import { test, expect } from '@playwright/test';

test.describe('Invalid Credentials Handling', () => {
  test('should show error for invalid email', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="email"]', 'invalido@email.com');
    await page.fill('input[type="password"]', 'SenhaQualquer123');
    await page.click('button:has-text("Entrar")');
    
    // Should show error toast/message
    await expect(page.locator('text=incorretos, text=inválido, text=Email ou senha')).toBeVisible({ timeout: 5000 });
    
    // Should remain on auth page
    await expect(page).toHaveURL('/auth');
  });

  test('should show error for wrong password', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaErrada123');
    await page.click('button:has-text("Entrar")');
    
    // Should show error
    await expect(page.locator('text=incorretos, text=inválido, text=Email ou senha')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL('/auth');
  });

  test('should enforce rate limiting after multiple failed attempts', async ({ page }) => {
    await page.goto('/auth');
    
    // Try to login multiple times with wrong credentials
    for (let i = 0; i < 5; i++) {
      await page.fill('input[type="email"]', 'beninelixo@gmail.com');
      await page.fill('input[type="password"]', `SenhaErrada${i}`);
      await page.click('button:has-text("Entrar")');
      await page.waitForTimeout(1000); // Wait between attempts
    }
    
    // Should show rate limit message
    await expect(page.locator('text=Muitas tentativas, text=bloqueio, text=Aguarde')).toBeVisible({ timeout: 5000 });
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="email"]', 'email-invalido');
    await page.fill('input[type="password"]', 'SenhaQualquer123');
    await page.click('button:has-text("Entrar")');
    
    // Should show validation error
    await expect(page.locator('text=Email inválido, text=inválido')).toBeVisible({ timeout: 3000 });
  });

  test('should require minimum password length', async ({ page }) => {
    await page.goto('/auth');
    
    // Switch to register tab
    await page.click('button:has-text("Registrar"), [role="tab"]:has-text("Registrar")');
    
    await page.fill('input[type="email"]', 'novo@email.com');
    await page.fill('input[type="password"]', '123'); // Too short
    await page.click('button:has-text("Criar Conta")');
    
    // Should show password length error
    await expect(page.locator('text=mínimo 8 caracteres, text=muito curta')).toBeVisible({ timeout: 3000 });
  });
});
