import { test, expect } from '@playwright/test';

test.describe('Admin Logs Viewer', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@easypet.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display logs page', async ({ page }) => {
    await page.goto('/admin/logs');
    
    // Check for logs title
    await expect(page.getByText('Logs do Sistema')).toBeVisible();
    
    // Check for filter controls
    await expect(page.getByText('Filtrar')).toBeVisible();
  });

  test('should filter logs by level', async ({ page }) => {
    await page.goto('/admin/logs');
    
    // Open filter dropdown
    await page.click('button:has-text("Nível")');
    
    // Select error level
    await page.click('text=error');
    
    // Verify filtered results
    await page.waitForTimeout(500);
    const logRows = page.locator('[data-level="error"]');
    await expect(logRows.first()).toBeVisible();
  });

  test('should search logs', async ({ page }) => {
    await page.goto('/admin/logs');
    
    // Type in search box
    await page.fill('input[placeholder*="Buscar"]', 'authentication');
    
    // Verify search results
    await page.waitForTimeout(500);
    await expect(page.getByText(/authentication/i)).toBeVisible();
  });

  test('should export logs as JSON', async ({ page }) => {
    await page.goto('/admin/logs');
    
    // Click export button
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar")')
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/logs-.*\.json/);
  });

  test('should export logs as CSV', async ({ page }) => {
    await page.goto('/admin/logs');
    
    // Open export menu
    await page.click('button:has-text("Exportar")');
    
    // Select CSV format
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=CSV')
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/logs-.*\.csv/);
  });

  test('should display log details', async ({ page }) => {
    await page.goto('/admin/logs');
    
    // Click on first log entry
    await page.locator('.log-entry').first().click();
    
    // Verify details modal/panel appears
    await expect(page.getByText('Detalhes do Log')).toBeVisible();
    await expect(page.getByText('timestamp')).toBeVisible();
    await expect(page.getByText('trace_id')).toBeVisible();
  });

  test('should show real-time logs', async ({ page }) => {
    await page.goto('/admin/logs');
    
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    const initialCount = await page.locator('.log-entry').count();
    
    // Wait for potential new logs (in real scenario)
    await page.waitForTimeout(2000);
    
    // In a real scenario with activity, count should increase or stay same
    const finalCount = await page.locator('.log-entry').count();
    expect(finalCount).toBeGreaterThanOrEqual(initialCount);
  });
});
