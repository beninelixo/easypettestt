import { test, expect } from '@playwright/test';

test.describe('Protected Settings Routes', () => {
  test.beforeEach(async ({ page }) => {
    // Login as professional user
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'professional@example.com');
    await page.fill('input[type="password"]', 'Test@12345!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/professional/);
  });

  test('should protect employees page with settings password', async ({ page }) => {
    await page.goto('/professional/employees');
    
    // Should redirect to settings or show password prompt
    const url = page.url();
    const hasPasswordPrompt = await page.getByText(/senha.*configurações/i).isVisible().catch(() => false);
    
    expect(url.includes('/professional/settings') || hasPasswordPrompt).toBeTruthy();
  });

  test('should protect reports page with settings password', async ({ page }) => {
    await page.goto('/professional/reports');
    
    // Should redirect to settings or show password prompt
    const url = page.url();
    const hasPasswordPrompt = await page.getByText(/senha.*configurações/i).isVisible().catch(() => false);
    
    expect(url.includes('/professional/settings') || hasPasswordPrompt).toBeTruthy();
  });

  test('should protect backup page with settings password', async ({ page }) => {
    await page.goto('/professional/backup');
    
    // Should redirect to settings or show password prompt
    const url = page.url();
    const hasPasswordPrompt = await page.getByText(/senha.*configurações/i).isVisible().catch(() => false);
    
    expect(url.includes('/professional/settings') || hasPasswordPrompt).toBeTruthy();
  });

  test('should protect plans page with settings password', async ({ page }) => {
    await page.goto('/professional/plans');
    
    // Should redirect to settings or show password prompt
    const url = page.url();
    const hasPasswordPrompt = await page.getByText(/senha.*configurações/i).isVisible().catch(() => false);
    
    expect(url.includes('/professional/settings') || hasPasswordPrompt).toBeTruthy();
  });

  test('should protect profile page with settings password', async ({ page }) => {
    await page.goto('/professional/profile');
    
    // Should redirect to settings or show password prompt
    const url = page.url();
    const hasPasswordPrompt = await page.getByText(/senha.*configurações/i).isVisible().catch(() => false);
    
    expect(url.includes('/professional/settings') || hasPasswordPrompt).toBeTruthy();
  });

  test('should allow access after correct password', async ({ page }) => {
    await page.goto('/professional/settings');
    
    // Wait for password prompt
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    
    // Enter settings password
    await page.fill('input[type="password"]', 'Settings@123');
    await page.click('button:has-text("Confirmar")');
    
    // Should show settings page
    await expect(page.getByText(/Configurações/i)).toBeVisible();
    
    // Now navigate to protected page
    await page.click('button:has-text("Funcionários")');
    
    // Should access without another password prompt
    await expect(page).toHaveURL(/\/professional\/employees/);
  });

  test('should block access after incorrect password', async ({ page }) => {
    await page.goto('/professional/settings');
    
    // Wait for password prompt
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    
    // Enter wrong password
    await page.fill('input[type="password"]', 'WrongPassword');
    await page.click('button:has-text("Confirmar")');
    
    // Should show error
    await expect(page.getByText(/senha.*incorreta/i)).toBeVisible();
  });

  test('should limit password attempts', async ({ page }) => {
    await page.goto('/professional/settings');
    
    // Try wrong password multiple times
    for (let i = 0; i < 3; i++) {
      await page.fill('input[type="password"]', 'WrongPassword');
      await page.click('button:has-text("Confirmar")');
      await page.waitForTimeout(500);
    }
    
    // Should show lockout message
    await expect(page.getByText(/bloqueado|tentativas.*esgotadas/i)).toBeVisible();
  });

  test('should not show protected routes in sidebar without authentication', async ({ page }) => {
    // Go to services page (not protected)
    await page.goto('/professional/services');
    
    // Check sidebar
    const employeesLink = page.locator('a:has-text("Funcionários")');
    const reportsLink = page.locator('a:has-text("Relatórios")');
    const backupLink = page.locator('a:has-text("Backup")');
    const plansLink = page.locator('a:has-text("Planos")');
    
    // These links should not be visible in sidebar (moved to settings)
    await expect(employeesLink).not.toBeVisible();
    await expect(reportsLink).not.toBeVisible();
    await expect(backupLink).not.toBeVisible();
    await expect(plansLink).not.toBeVisible();
  });

  test('should reset password authentication on logout', async ({ page }) => {
    await page.goto('/professional/settings');
    
    // Enter password
    await page.fill('input[type="password"]', 'Settings@123');
    await page.click('button:has-text("Confirmar")');
    
    // Access is granted
    await expect(page.getByText(/Configurações/i)).toBeVisible();
    
    // Logout
    await page.click('button:has-text("Sair")');
    await page.waitForURL(/\/auth/);
    
    // Login again
    await page.fill('input[type="email"]', 'professional@example.com');
    await page.fill('input[type="password"]', 'Test@12345!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/professional/);
    
    // Try to access settings again
    await page.goto('/professional/settings');
    
    // Should ask for password again
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
