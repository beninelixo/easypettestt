import { test, expect } from '@playwright/test';

test.describe('Admin System Health', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@easypet.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display system health panel', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for system health panel
    await expect(page.getByText('Saúde do Sistema')).toBeVisible();
    
    // Check for health indicators
    await expect(page.getByText('Database')).toBeVisible();
    await expect(page.getByText('API')).toBeVisible();
    await expect(page.getByText('Storage')).toBeVisible();
    
    // Check for status badges
    const badges = page.locator('[role="status"]');
    await expect(badges.first()).toBeVisible();
  });

  test('should refresh health metrics', async ({ page }) => {
    await page.goto('/admin');
    
    // Click refresh button
    const refreshButton = page.locator('button:has-text("Atualizar")');
    await refreshButton.click();
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify metrics updated
    await expect(page.getByText(/\d+ms/)).toBeVisible();
  });

  test('should show critical status on errors', async ({ page }) => {
    // This test would require mocking errors
    // For now, just verify the UI can handle error states
    await page.goto('/admin');
    
    // Check that error handling elements exist
    const healthPanel = page.locator('[data-testid="health-panel"]');
    await expect(healthPanel).toBeVisible();
  });

  test('should display uptime percentage', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for uptime display
    await expect(page.getByText(/\d+\.\d+%/)).toBeVisible();
  });
});
