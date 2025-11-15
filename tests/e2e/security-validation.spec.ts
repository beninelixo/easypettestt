import { test, expect } from '@playwright/test';

test.describe('Security Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('should reject XSS attempts in email field', async ({ page }) => {
    const xssPayload = '<script>alert("XSS")</script>@test.com';
    
    await page.fill('input[type="email"]', xssPayload);
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.getByText(/Email inválido/i)).toBeVisible();
  });

  test('should reject SQL injection attempts', async ({ page }) => {
    const sqlPayload = "'; DROP TABLE users; --";
    
    await page.fill('input[type="email"]', sqlPayload);
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.getByText(/Email inválido/i)).toBeVisible();
  });

  test('should enforce strong password requirements', async ({ page }) => {
    await page.goto('/auth?mode=register');
    
    // Try weak password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '12345');
    await page.click('button[type="submit"]');
    
    // Should show password requirements
    await expect(page.getByText(/Senha deve ter no mínimo/i)).toBeVisible();
  });

  test('should validate CPF format', async ({ page }) => {
    // Navigate to registration page with CPF field
    await page.goto('/auth?mode=register&type=professional');
    
    // Try invalid CPF
    await page.fill('input[name="document"]', '12345678901'); // Invalid CPF
    await page.blur('input[name="document"]');
    
    // Should show validation error
    await expect(page.getByText(/CPF inválido/i)).toBeVisible();
  });

  test('should sanitize HTML in text inputs', async ({ page }) => {
    await page.goto('/auth?mode=register');
    
    const htmlPayload = '<b>Bold Name</b><script>alert(1)</script>';
    
    await page.fill('input[name="full_name"]', htmlPayload);
    
    // After sanitization, script should be removed
    const value = await page.inputValue('input[name="full_name"]');
    expect(value).not.toContain('<script>');
  });

  test('should rate limit login attempts', async ({ page }) => {
    // Make multiple failed login attempts
    for (let i = 0; i < 6; i++) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }
    
    // Should show rate limit message
    await expect(page.getByText(/Muitas tentativas/i)).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/auth?mode=register');
    
    // Try invalid phone
    await page.fill('input[name="phone"]', '123'); // Too short
    await page.blur('input[name="phone"]');
    
    // Should show validation error
    await expect(page.getByText(/Telefone inválido/i)).toBeVisible();
  });

  test('should reject invalid URLs', async ({ page }) => {
    // Navigate to a page with URL input (e.g., pet shop settings)
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'petshop@test.com');
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/professional');
    await page.goto('/professional/settings');
    
    // Try invalid URL
    await page.fill('input[name="website"]', 'javascript:alert(1)');
    await page.blur('input[name="website"]');
    
    // Should show validation error
    await expect(page.getByText(/URL inválida/i)).toBeVisible();
  });
});
