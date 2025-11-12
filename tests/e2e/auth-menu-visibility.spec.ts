import { test, expect } from '@playwright/test';

test.describe('Menu Visibility After Login', () => {
  test('admin should see admin menu after login', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    
    // Wait for redirect
    await page.waitForURL('/admin/dashboard', { timeout: 5000 });
    
    // Verify admin menu items are visible
    await expect(page.locator('nav:has-text("Modo Deus")')).toBeVisible();
    await expect(page.locator('nav:has-text("Métricas de Auth")')).toBeVisible();
  });
  
  test('pet_shop should see service menu without disappearing', async ({ page }) => {
    await page.goto('/auth');
    
    // Login as pet_shop (assuming test account exists)
    await page.fill('input[type="email"]', 'petshop@test.com');
    await page.fill('input[type="password"]', 'SenhaPetShop123');
    await page.click('button:has-text("Entrar")');
    
    await page.waitForURL('/professional/dashboard', { timeout: 5000 });
    
    // Click on Serviços menu
    await page.click('nav >> text=Serviços');
    
    // Wait for navigation
    await page.waitForURL('/petshop-dashboard/servicos');
    
    // Verify menu is still visible
    await expect(page.locator('nav >> text=Serviços')).toBeVisible();
    await expect(page.locator('nav >> text=Dashboard')).toBeVisible();
    await expect(page.locator('nav >> text=Calendário')).toBeVisible();
  });
});
