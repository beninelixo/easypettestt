import { test, expect } from '@playwright/test';

test.describe('Protected Routes Access Control', () => {
  test('unauthenticated user should be redirected from admin routes to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Should be redirected to auth page
    await page.waitForURL('/auth', { timeout: 3000 });
    await expect(page).toHaveURL('/auth');
  });

  test('unauthenticated user should be redirected from client routes to login', async ({ page }) => {
    await page.goto('/client/pets');
    
    await page.waitForURL('/auth', { timeout: 3000 });
    await expect(page).toHaveURL('/auth');
  });

  test('unauthenticated user should be redirected from professional routes to login', async ({ page }) => {
    await page.goto('/professional/dashboard');
    
    await page.waitForURL('/auth', { timeout: 3000 });
    await expect(page).toHaveURL('/auth');
  });

  test('client should not access admin routes', async ({ page }) => {
    // Login as client
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'cliente@test.com');
    await page.fill('input[type="password"]', 'SenhaCliente123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/client/pets', { timeout: 5000 });
    
    // Try to access admin route
    await page.goto('/admin/dashboard');
    
    // Should be redirected back to client dashboard
    await page.waitForURL('/client/pets', { timeout: 3000 });
    await expect(page).toHaveURL('/client/pets');
  });

  test('admin should not be restricted from any routes', async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/admin/dashboard', { timeout: 5000 });
    
    // Admin should be able to access admin routes
    await page.goto('/admin/system-health');
    await expect(page).toHaveURL('/admin/system-health');
    
    await page.goto('/admin/user-management');
    await expect(page).toHaveURL('/admin/user-management');
  });

  test('authenticated user navigating to / should redirect to their dashboard', async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/admin/dashboard', { timeout: 5000 });
    
    // Navigate to home
    await page.goto('/');
    
    // Should be redirected to admin dashboard
    await page.waitForURL('/admin/dashboard', { timeout: 3000 });
    await expect(page).toHaveURL('/admin/dashboard');
  });
});
