import { test, expect } from '@playwright/test';

test.describe('Logout Functionality', () => {
  test('admin should be able to logout and be redirected to home', async ({ page }) => {
    // Login first
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/admin/dashboard', { timeout: 5000 });
    
    // Find and click logout button (may be in menu or sidebar)
    const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")').first();
    await logoutButton.click();
    
    // Should be redirected to home page
    await page.waitForURL('/', { timeout: 3000 });
    await expect(page).toHaveURL('/');
    
    // Should see login/register options
    await expect(page.locator('text=Entrar')).toBeVisible();
  });

  test('client should be able to logout and be redirected to home', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'cliente@test.com');
    await page.fill('input[type="password"]', 'SenhaCliente123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/client/pets', { timeout: 5000 });
    
    const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")').first();
    await logoutButton.click();
    
    await page.waitForURL('/', { timeout: 3000 });
    await expect(page).toHaveURL('/');
  });

  test('logout should clear authentication state', async ({ page, context }) => {
    // Login
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/admin/dashboard');
    
    // Logout
    const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")').first();
    await logoutButton.click();
    await page.waitForURL('/');
    
    // Try to access protected route - should redirect to login
    await page.goto('/admin/dashboard');
    await page.waitForURL('/auth', { timeout: 3000 });
    await expect(page).toHaveURL('/auth');
  });
});
