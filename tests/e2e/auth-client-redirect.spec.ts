import { test, expect } from '@playwright/test';

test.describe('Client Authentication and Redirect', () => {
  test('should redirect client to /client/pets after login', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill login form (assuming a test client account exists)
    await page.fill('input[type="email"]', 'cliente@test.com');
    await page.fill('input[type="password"]', 'SenhaCliente123');
    await page.click('button:has-text("Entrar")');
    
    // Wait for redirect
    await page.waitForURL('/client/pets', { timeout: 5000 });
    
    // Verify client dashboard loaded
    await expect(page.locator('text=Meus Pets')).toBeVisible();
  });

  test('should redirect logged client from / to /client/pets', async ({ page }) => {
    // Login first
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'cliente@test.com');
    await page.fill('input[type="password"]', 'SenhaCliente123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/client/pets');
    
    // Now try to go to home
    await page.goto('/');
    
    // Should be redirected back to client pets
    await page.waitForURL('/client/pets', { timeout: 3000 });
    await expect(page).toHaveURL('/client/pets');
  });
});
