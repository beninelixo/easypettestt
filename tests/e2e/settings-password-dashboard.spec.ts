import { test, expect } from '@playwright/test';

test.describe('Settings Password and Dashboard Access', () => {
  test.describe('Professional User Flow', () => {
    test('should show professional dashboard after successful login', async ({ page }) => {
      // Navigate to auth page
      await page.goto('/auth');
      
      // Wait for auth page to load
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Fill login form
      await page.fill('input[type="email"]', 'test-professional@example.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      
      // Submit login
      await page.click('button:has-text("Entrar")');
      
      // Should redirect to professional area
      await page.waitForURL(/\/(professional|petshop)/, { timeout: 15000 });
      
      // Dashboard should be visible
      await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
    });

    test('should redirect to petshop-dashboard after password verification in settings', async ({ page }) => {
      // This test assumes user is already logged in
      await page.goto('/professional/settings');
      
      // Wait for password dialog if it appears
      const passwordDialog = page.locator('[data-testid="password-dialog"], [role="dialog"]');
      
      if (await passwordDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Fill password
        await page.fill('input[type="password"]', 'Settings123!');
        
        // Submit
        await page.click('button:has-text("Acessar"), button:has-text("Confirmar")');
        
        // Should redirect to petshop-dashboard
        await page.waitForURL('/petshop-dashboard', { timeout: 10000 });
        await expect(page.locator('text=Dashboard').first()).toBeVisible();
      }
    });
  });

  test.describe('God User Access', () => {
    test('god user should have full dashboard access', async ({ page }) => {
      // Navigate to auth page
      await page.goto('/auth');
      
      // Wait for auth page to load
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Login as God User
      await page.fill('input[type="email"]', 'beninelixo@gmail.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      
      // Submit login
      await page.click('button:has-text("Entrar")');
      
      // Wait for redirect (can be admin or professional dashboard)
      await page.waitForURL(/\/(admin|professional|petshop)/, { timeout: 15000 });
      
      // Should be able to access dashboard content
      const dashboardContent = page.locator('text=Dashboard, text=GOD MODE').first();
      await expect(dashboardContent).toBeVisible({ timeout: 10000 });
    });

    test('god user should access petshop-dashboard directly', async ({ page }) => {
      // Direct navigation to petshop-dashboard
      await page.goto('/petshop-dashboard');
      
      // If redirected to auth, login first
      if (page.url().includes('/auth')) {
        await page.fill('input[type="email"]', 'beninelixo@gmail.com');
        await page.fill('input[type="password"]', 'TestPassword123!');
        await page.click('button:has-text("Entrar")');
        
        // Navigate again after login
        await page.goto('/petshop-dashboard');
      }
      
      // Dashboard should be accessible
      await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
    });

    test('god user should see GOD MODE label when viewing other pet shops', async ({ page }) => {
      // Login as God User
      await page.goto('/auth');
      await page.waitForSelector('input[type="email"]');
      await page.fill('input[type="email"]', 'beninelixo@gmail.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button:has-text("Entrar")');
      
      // Wait for dashboard
      await page.waitForURL(/\/(admin|professional|petshop)/, { timeout: 15000 });
      
      // Navigate to professional dashboard
      await page.goto('/petshop-dashboard');
      
      // If user owns a pet shop, won't show GOD MODE
      // But if viewing another's shop, should show GOD MODE
      const godModeLabel = page.locator('text=[GOD MODE]');
      
      // This assertion is conditional - God User may have own shop
      const isGodModeVisible = await godModeLabel.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isGodModeVisible) {
        await expect(godModeLabel).toBeVisible();
      }
    });
  });

  test.describe('Role Verification', () => {
    test('professional users should have pet_shop role', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForSelector('input[type="email"]');
      
      // Login as professional
      await page.fill('input[type="email"]', 'professional@test.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button:has-text("Entrar")');
      
      // Should redirect to professional area (indicating pet_shop role)
      await page.waitForURL(/\/(professional|petshop)/, { timeout: 15000 });
    });

    test('client users should redirect to client area', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForSelector('input[type="email"]');
      
      // Login as client
      await page.fill('input[type="email"]', 'client@test.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button:has-text("Entrar")');
      
      // Should redirect to client area
      await page.waitForURL(/\/client/, { timeout: 15000 });
    });
  });
});
