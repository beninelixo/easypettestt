import { test, expect } from '@playwright/test';

test.describe('Professional Authentication and Services Redirect', () => {
  test('should redirect professional to /professional/services after login', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill login form with professional credentials
    await page.fill('input[type="email"]', 'professional@easypet.com');
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.click('button:has-text("Entrar")');
    
    // Wait for redirect to services page
    await page.waitForURL('/professional/services', { timeout: 5000 });
    
    // Verify services page loaded
    await expect(page.locator('h1:has-text("Gerenciar Serviços")')).toBeVisible();
  });
  
  test('should not show "Ver Catálogo" button for employees', async ({ page }) => {
    // Login as employee
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'employee@easypet.com');
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.click('button:has-text("Entrar")');
    
    await page.waitForURL('/professional/services');
    
    // Verify "Ver Catálogo" button is not visible
    await expect(page.locator('button:has-text("Catálogo de Serviços")')).not.toBeVisible();
    await expect(page.locator('a:has-text("Ver Catálogo")')).not.toBeVisible();
  });
  
  test('should show "Ver Catálogo" button for owners', async ({ page }) => {
    // Login as owner
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'owner@easypet.com');
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.click('button:has-text("Entrar")');
    
    await page.waitForURL('/professional/services');
    
    // Verify "Ver Catálogo" button is visible
    await expect(page.locator('button:has-text("Catálogo de Serviços")')).toBeVisible();
  });
});
