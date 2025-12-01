import { test, expect } from '@playwright/test';

test.describe('CSRF Protection Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('should include CSRF token in login form', async ({ page }) => {
    // Check if hidden CSRF token field exists
    const csrfInput = page.locator('input[name="csrf_token"]');
    await expect(csrfInput).toBeHidden();
    
    // Token should have a value
    const tokenValue = await csrfInput.inputValue();
    expect(tokenValue.length).toBeGreaterThan(0);
  });

  test('should include CSRF token in registration form', async ({ page }) => {
    await page.goto('/auth?mode=register');
    
    const csrfInput = page.locator('input[name="csrf_token"]');
    await expect(csrfInput).toBeHidden();
    
    const tokenValue = await csrfInput.inputValue();
    expect(tokenValue.length).toBeGreaterThan(0);
  });

  test('should reject form submission without CSRF token', async ({ page }) => {
    // Remove CSRF token
    await page.evaluate(() => {
      const csrfInput = document.querySelector('input[name="csrf_token"]') as HTMLInputElement;
      if (csrfInput) csrfInput.value = '';
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@12345!');
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.getByText(/inválido|erro|falha/i)).toBeVisible({ timeout: 5000 });
  });

  test('should reject form submission with invalid CSRF token', async ({ page }) => {
    // Replace CSRF token with invalid value
    await page.evaluate(() => {
      const csrfInput = document.querySelector('input[name="csrf_token"]') as HTMLInputElement;
      if (csrfInput) csrfInput.value = 'invalid_token_12345';
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@12345!');
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.getByText(/inválido|erro|token/i)).toBeVisible({ timeout: 5000 });
  });

  test('should regenerate CSRF token after failed submission', async ({ page }) => {
    // Get initial token
    const initialToken = await page.inputValue('input[name="csrf_token"]');
    
    // Submit form with wrong credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Get new token
    const newToken = await page.inputValue('input[name="csrf_token"]');
    
    // Tokens should be different
    expect(newToken).not.toEqual(initialToken);
  });

  test('CSRF token should be session-specific', async ({ page, context }) => {
    // Get token from first session
    const token1 = await page.inputValue('input[name="csrf_token"]');
    
    // Open new page in same context (same session)
    const page2 = await context.newPage();
    await page2.goto('/auth');
    const token2 = await page2.inputValue('input[name="csrf_token"]');
    
    // Tokens should be the same (same session)
    expect(token1).toEqual(token2);
    
    await page2.close();
  });

  test('CSRF token should expire after timeout', async ({ page }) => {
    // Get initial token
    const initialToken = await page.inputValue('input[name="csrf_token"]');
    
    // Wait for token expiry (simulate by manipulating timestamp)
    await page.evaluate(() => {
      const expiredData = {
        token: sessionStorage.getItem('csrf_token'),
        timestamp: Date.now() - 7200000 // 2 hours ago
      };
      sessionStorage.setItem('csrf_token', JSON.stringify(expiredData));
    });
    
    await page.reload();
    
    // New token should be generated
    const newToken = await page.inputValue('input[name="csrf_token"]');
    expect(newToken).not.toEqual(initialToken);
  });

  test('should clear CSRF token on logout', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@12345!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/client|\/professional|\/admin/);
    
    // Logout
    await page.click('button:has-text("Sair")');
    
    // CSRF token should be cleared from sessionStorage
    const csrfCleared = await page.evaluate(() => {
      return sessionStorage.getItem('csrf_token') === null;
    });
    
    expect(csrfCleared).toBeTruthy();
  });

  test('should protect password reset form with CSRF', async ({ page }) => {
    await page.goto('/reset-password');
    
    // CSRF token should be present
    const csrfInput = page.locator('input[name="csrf_token"]');
    await expect(csrfInput).toBeHidden();
    
    const tokenValue = await csrfInput.inputValue();
    expect(tokenValue.length).toBeGreaterThan(0);
  });

  test('should protect profile update form with CSRF', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'professional@example.com');
    await page.fill('input[type="password"]', 'Test@12345!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/professional/);
    await page.goto('/professional/profile');
    
    // CSRF token should be present in profile form
    const csrfInput = page.locator('input[name="csrf_token"]');
    const csrfCount = await csrfInput.count();
    expect(csrfCount).toBeGreaterThan(0);
  });
});
