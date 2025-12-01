import { test, expect } from '@playwright/test';

test.describe('Admin Authentication and Redirect', () => {
  test('should redirect admin to /admin/dashboard after login', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill login form
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    
    // Wait for redirect (max 10s)
    await page.waitForURL('/admin/dashboard', { timeout: 10000 });
    
    // Verify admin dashboard loaded
    await expect(page.locator('text=Painel Administrativo')).toBeVisible();
  });
  
  test('should redirect logged admin from / to /admin/dashboard', async ({ page }) => {
    // Login first
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/admin/dashboard', { timeout: 10000 });
    
    // Now try to go to home
    await page.goto('/');
    
    // Should be redirected back to admin dashboard
    await page.waitForURL('/admin/dashboard', { timeout: 5000 });
    await expect(page).toHaveURL('/admin/dashboard');
  });
  
  test('should show GOD MODE ATIVO badge for god user', async ({ page }) => {
    await page.goto('/auth');
    
    // Login as god user
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    
    // Wait for admin dashboard
    await page.waitForURL('/admin/dashboard', { timeout: 10000 });
    
    // Verify GOD MODE badge is visible
    await expect(page.locator('text=GOD MODE ATIVO')).toBeVisible();
  });
});

test.describe('Admin Dashboard Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/admin/dashboard', { timeout: 10000 });
  });

  test('admin sidebar navigation works correctly', async ({ page }) => {
    // Test Modo Deus navigation
    const modoDeus = page.locator('a[href="/admin/god-mode"]');
    if (await modoDeus.isVisible()) {
      await modoDeus.click();
      await expect(page).toHaveURL('/admin/god-mode');
    }
    
    // Navigate back to dashboard
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('admin can access system health page', async ({ page }) => {
    await page.goto('/admin/system-health');
    await expect(page).toHaveURL('/admin/system-health');
    
    // Check that the page loaded without errors
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('admin can access security monitoring page', async ({ page }) => {
    await page.goto('/admin/security');
    await expect(page).toHaveURL('/admin/security');
  });

  test('admin can access user management page', async ({ page }) => {
    await page.goto('/admin/user-management');
    await expect(page).toHaveURL('/admin/user-management');
  });

  test('admin can access audit logs page', async ({ page }) => {
    await page.goto('/admin/audit-logs');
    await expect(page).toHaveURL('/admin/audit-logs');
  });

  test('admin can access backup management page', async ({ page }) => {
    await page.goto('/admin/backup-management');
    await expect(page).toHaveURL('/admin/backup-management');
  });
});

test.describe('Role Resolution Delay Handling', () => {
  test('should show loading state and eventually redirect even with delayed role', async ({ page }) => {
    // Intercept role fetch to simulate delay
    await page.route('**/rest/v1/user_roles*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await route.continue();
    });
    
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    
    // Should eventually redirect despite delay
    await page.waitForURL('/admin/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('should trigger safety net if role never loads on /auth', async ({ page }) => {
    // Block role fetch completely
    await page.route('**/rest/v1/user_roles*', route => route.abort());
    
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    
    // Safety net should kick in after timeout
    await page.waitForTimeout(5000);
    
    // Should end up somewhere (either dashboard or home with redirect)
    const currentUrl = page.url();
    expect(['/admin/dashboard', '/client/pets', '/']).toContain(new URL(currentUrl).pathname);
  });
});
