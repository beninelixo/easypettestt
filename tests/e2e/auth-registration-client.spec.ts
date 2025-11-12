import { test, expect } from '@playwright/test';

test.describe('Client Registration Flow', () => {
  const testEmail = `client-${Date.now()}@test.com`;
  const testPassword = 'ClientTest123!';
  const testName = 'Cliente Teste E2E';
  const testPhone = '11987654321';

  test('should complete full client registration flow', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    
    // Switch to register tab
    await page.click('button[role="tab"]:has-text("Cadastro")');
    
    // Verify client type is selected by default
    await expect(page.locator('button:has-text("Cliente")')).toHaveAttribute('data-state', 'active');
    
    // Fill registration form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[placeholder*="Confirme"]', testPassword);
    await page.fill('input[placeholder*="Nome completo"]', testName);
    await page.fill('input[placeholder*="Telefone"]', testPhone);
    
    // Accept terms
    await page.click('button[role="checkbox"]');
    
    // Submit registration
    await page.click('button:has-text("Criar Conta")');
    
    // Wait for success message
    await expect(page.locator('text=Conta criada com sucesso')).toBeVisible({ timeout: 5000 });
    
    // Should redirect to client pets page
    await page.waitForURL('/client/pets', { timeout: 5000 });
    
    // Verify dashboard loaded with empty state
    await expect(page.locator('text=Meus Pets')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Cadastro")');
    
    // Try to submit empty form
    await page.click('button:has-text("Criar Conta")');
    
    // Should show validation errors
    await expect(page.locator('text=obrigatório')).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Cadastro")');
    
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'weak'); // Weak password
    
    // Should show password requirements
    await expect(page.locator('text=letra minúscula')).toBeVisible();
    await expect(page.locator('text=letra maiúscula')).toBeVisible();
    await expect(page.locator('text=número')).toBeVisible();
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Cadastro")');
    
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'ValidPass123!');
    await page.fill('input[placeholder*="Confirme"]', 'DifferentPass123!');
    
    await page.click('button:has-text("Criar Conta")');
    
    // Should show mismatch error
    await expect(page.locator('text=senhas não coincidem')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Cadastro")');
    
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'ValidPass123!');
    
    await page.click('button:has-text("Criar Conta")');
    
    // Should show email validation error
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('should require terms acceptance', async ({ page }) => {
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Cadastro")');
    
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'ValidPass123!');
    await page.fill('input[placeholder*="Confirme"]', 'ValidPass123!');
    await page.fill('input[placeholder*="Nome completo"]', 'Test User');
    await page.fill('input[placeholder*="Telefone"]', '11987654321');
    
    // Don't check terms
    await page.click('button:has-text("Criar Conta")');
    
    // Should show terms error
    await expect(page.locator('text=aceitar os termos')).toBeVisible();
  });
});
