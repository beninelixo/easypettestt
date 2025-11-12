import { test, expect } from '@playwright/test';

test.describe('Session Persistence', () => {
  test('should maintain session after page refresh', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    
    await page.waitForURL('/admin/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should still be on admin dashboard
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('text=Dashboard Admin')).toBeVisible();
  });
  
  test('should clear session after logout', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    
    await page.waitForURL('/admin/dashboard');
    
    // Logout
    await page.click('button:has-text("Logout")');
    
    await page.waitForURL('/');
    
    // Try to access admin dashboard
    await page.goto('/admin/dashboard');
    
    // Should be redirected to auth
    await page.waitForURL('/auth');
  });
});
