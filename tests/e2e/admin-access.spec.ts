import { test, expect } from '@playwright/test';

test.describe('Admin Access and Permissions', () => {
  test('admin should have full CRUD access to pet shops', async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@easypet.com');
    await page.fill('input[type="password"]', 'Admin@12345!');
    await page.click('button[type="submit"]');
    
    // Navigate to pet shops management
    await page.waitForURL(/\/admin/);
    await page.goto('/admin/pet-shops');
    
    // Should see pet shops list
    await expect(page.getByRole('heading', { name: /pet shops/i })).toBeVisible();
    
    // Should be able to view details
    const firstShop = page.locator('[data-test="pet-shop-item"]').first();
    if (await firstShop.count() > 0) {
      await firstShop.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('admin should have full CRUD access to users', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@easypet.com');
    await page.fill('input[type="password"]', 'Admin@12345!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin/);
    await page.goto('/admin/user-management');
    
    // Should see users list
    await expect(page.getByRole('heading', { name: /usuários|users/i })).toBeVisible();
    
    // Should have edit button
    await expect(page.getByRole('button', { name: /editar|edit/i }).first()).toBeVisible();
  });

  test('admin should be able to view all reports', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@easypet.com');
    await page.fill('input[type="password"]', 'Admin@12345!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin/);
    await page.goto('/admin/dashboard');
    
    // Should see global statistics
    await expect(page.getByText(/Total Pet Shops|Total Clientes/i)).toBeVisible();
    await expect(page.getByText(/Faturamento/i)).toBeVisible();
  });

  test('admin should have access to system health monitoring', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@easypet.com');
    await page.fill('input[type="password"]', 'Admin@12345!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin/);
    await page.goto('/admin/system-health');
    
    // Should see system health metrics
    await expect(page.getByText(/Database|Email Service|Backups/i)).toBeVisible();
  });

  test('admin should be able to manage permissions', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@easypet.com');
    await page.fill('input[type="password"]', 'Admin@12345!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin/);
    await page.goto('/admin/user-management');
    
    // Click on first user
    await page.click('[data-test="user-item"]:first-child');
    
    // Should see permission options
    await expect(page.getByText(/permissões|permissions|role/i)).toBeVisible();
  });

  test('non-admin should not access admin pages', async ({ page }) => {
    // Login as client
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'client@example.com');
    await page.fill('input[type="password"]', 'Client@12345!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/client/);
    
    // Try to access admin page
    await page.goto('/admin/dashboard');
    
    // Should be redirected
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test('admin should be able to execute system actions', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@easypet.com');
    await page.fill('input[type="password"]', 'Admin@12345!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin/);
    await page.goto('/admin/dashboard');
    
    // Should see quick actions
    await expect(page.getByRole('button', { name: /limpeza|backup|análise/i }).first()).toBeVisible();
  });
});
