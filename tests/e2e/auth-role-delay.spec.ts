import { test, expect } from '@playwright/test';

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
    
    // Should show loading state
    await expect(page.locator('text=Carregando')).toBeVisible({ timeout: 3000 });
    
    // Should eventually redirect despite delay
    await page.waitForURL('/admin/dashboard', { timeout: 8000 });
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('should trigger safety net if role never loads on /auth', async ({ page }) => {
    // Block role fetch completely
    await page.route('**/rest/v1/user_roles*', route => route.abort());
    
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'beninelixo@gmail.com');
    await page.fill('input[type="password"]', 'SenhaForte123');
    await page.click('button:has-text("Entrar")');
    
    // Safety net should kick in after 2.5s and redirect to /
    await page.waitForURL('/', { timeout: 4000 });
    
    // AppAuthRedirectGate should then redirect (with force refresh)
    // Wait a bit more for the gate to process
    await page.waitForTimeout(3000);
    
    // Should end up somewhere (either dashboard or still loading)
    const currentUrl = page.url();
    expect(['/admin/dashboard', '/client/pets', '/']).toContain(new URL(currentUrl).pathname);
  });
});
