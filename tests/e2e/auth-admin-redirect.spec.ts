import { test, expect } from '@playwright/test';

test.describe('Admin Authentication and Redirect', () => {
  test('should redirect admin to /admin/dashboard after login', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill login form
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    
    // Wait for redirect (max 5s)
    await page.waitForURL('/admin/dashboard', { timeout: 5000 });
    
    // Verify admin dashboard loaded
    await expect(page.locator('text=Dashboard Admin')).toBeVisible();
    
    // Verify admin menu is visible
    await expect(page.locator('nav:has-text("Modo Deus")')).toBeVisible();
  });
  
  test('should redirect logged admin from / to /admin/dashboard', async ({ page }) => {
    // Login first
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/admin/dashboard');
    
    // Now try to go to home
    await page.goto('/');
    
    // Should be redirected back to admin dashboard
    await page.waitForURL('/admin/dashboard', { timeout: 3000 });
    await expect(page).toHaveURL('/admin/dashboard');
  });
});
