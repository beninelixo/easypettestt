import { test, expect } from '@playwright/test';

test.describe('Settings Password Protection', () => {
  test('should prompt to create password on first access to settings', async ({ page }) => {
    // Login as owner without settings password
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'newowner@easypet.com');
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.click('button:has-text("Entrar")');
    
    await page.waitForURL('/professional/services');
    
    // Navigate to settings
    await page.click('a:has-text("Configurações")');
    
    // Should show password creation dialog
    await expect(page.locator('text=Criar Senha de Configurações')).toBeVisible();
    
    // Create password
    await page.fill('input[placeholder*="Mínimo 8 caracteres"]', 'SettingsPass123');
    await page.fill('input[placeholder*="Digite a senha novamente"]', 'SettingsPass123');
    await page.click('button:has-text("Criar Senha")');
    
    // Should access settings page
    await expect(page.locator('h1:has-text("Configurações")')).toBeVisible();
  });
  
  test('should prompt for password on subsequent settings access', async ({ page }) => {
    // Login as owner with existing settings password
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'owner@easypet.com');
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.click('button:has-text("Entrar")');
    
    await page.waitForURL('/professional/services');
    
    // Navigate to settings
    await page.click('a:has-text("Configurações")');
    
    // Should show password verification dialog
    await expect(page.locator('text=Senha de Configurações')).toBeVisible();
    
    // Enter correct password
    await page.fill('input[placeholder*="Digite a senha"]', 'SettingsPass123');
    await page.click('button:has-text("Acessar")');
    
    // Should access settings page
    await expect(page.locator('h1:has-text("Configurações")')).toBeVisible();
  });
  
  test('should block access with wrong password and limit attempts', async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'owner@easypet.com');
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.click('button:has-text("Entrar")');
    
    await page.waitForURL('/professional/services');
    
    // Navigate to settings
    await page.click('a:has-text("Configurações")');
    
    // Try wrong password 3 times
    for (let i = 0; i < 3; i++) {
      await page.fill('input[placeholder*="Digite a senha"]', 'WrongPassword');
      await page.click('button:has-text("Acessar")');
      await page.waitForTimeout(500);
    }
    
    // Should show attempts exhausted message
    await expect(page.locator('text=Sem tentativas restantes')).toBeVisible();
    
    // Should redirect after block
    await page.waitForURL('/professional/services', { timeout: 3000 });
  });
  
  test('should allow password change in settings', async ({ page }) => {
    // Login and access settings
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'owner@easypet.com');
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.click('button:has-text("Entrar")');
    
    await page.waitForURL('/professional/services');
    await page.click('a:has-text("Configurações")');
    
    // Enter password
    await page.fill('input[placeholder*="Digite a senha"]', 'SettingsPass123');
    await page.click('button:has-text("Acessar")');
    
    // Click change password option
    await page.click('text=Alterar Senha de Configurações');
    
    // Should show change password interface (placeholder for future implementation)
    await expect(page.locator('text=Funcionalidade em desenvolvimento')).toBeVisible();
  });
});
