import { test, expect } from '@playwright/test';

test.describe('Advanced Security Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test.describe('CSRF Protection', () => {
    test('should include CSRF token in critical forms', async ({ page }) => {
      await page.goto('/auth?mode=register');
      
      // Check if CSRF token field exists
      const csrfToken = await page.locator('input[name="csrf_token"]').count();
      expect(csrfToken).toBeGreaterThan(0);
    });

    test('should reject requests without valid CSRF token', async ({ page }) => {
      // Try to submit form without CSRF token
      await page.evaluate(() => {
        const form = document.querySelector('form');
        const csrfInput = form?.querySelector('input[name="csrf_token"]');
        if (csrfInput) {
          csrfInput.remove();
        }
      });

      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'Test@12345!');
      await page.click('button[type="submit"]');

      // Should show error or not proceed
      await expect(page.getByText(/erro|falha|token/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('SQL Injection Advanced', () => {
    test('should handle complex SQL injection attempts', async ({ page }) => {
      const sqlPayloads = [
        "' OR '1'='1",
        "' OR 1=1--",
        "'; DROP TABLE users;--",
        "' UNION SELECT NULL--",
        "admin'--",
        "' OR 'a'='a",
      ];

      for (const payload of sqlPayloads) {
        await page.fill('input[type="email"]', payload);
        await page.fill('input[type="password"]', 'Test@123');
        await page.click('button[type="submit"]');
        
        // Should show validation error, not SQL error
        const errorText = await page.textContent('body');
        expect(errorText).not.toContain('SQL');
        expect(errorText).not.toContain('syntax error');
        
        await page.reload();
      }
    });
  });

  test.describe('XSS Protection', () => {
    test('should sanitize script tags in all inputs', async ({ page }) => {
      await page.goto('/auth?mode=register');
      
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')">',
      ];

      for (const payload of xssPayloads) {
        await page.fill('input[name="full_name"]', payload);
        const value = await page.inputValue('input[name="full_name"]');
        
        // Should not contain dangerous tags
        expect(value).not.toContain('<script');
        expect(value).not.toContain('javascript:');
        expect(value).not.toContain('<iframe');
        expect(value).not.toContain('onerror');
        expect(value).not.toContain('onload');
      }
    });

    test('should escape HTML entities', async ({ page }) => {
      await page.goto('/auth?mode=register');
      
      await page.fill('input[name="full_name"]', '<>&"\'');
      const displayedValue = await page.textContent('input[name="full_name"]');
      
      // HTML entities should be escaped or removed
      expect(displayedValue).not.toContain('<script>');
    });
  });

  test.describe('Authentication Security', () => {
    test('should enforce account lockout after failed attempts', async ({ page }) => {
      const maxAttempts = 5;
      
      for (let i = 0; i < maxAttempts + 1; i++) {
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'WrongPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);
      }
      
      // Should show account locked message
      await expect(page.getByText(/bloqueado|locked|temporariamente/i)).toBeVisible();
    });

    test('should prevent timing attacks on login', async ({ page }) => {
      const validEmail = 'valid@example.com';
      const invalidEmail = 'invalid@example.com';
      
      // Measure response time for valid email
      const startValid = Date.now();
      await page.fill('input[type="email"]', validEmail);
      await page.fill('input[type="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      const timeValid = Date.now() - startValid;
      
      await page.reload();
      
      // Measure response time for invalid email
      const startInvalid = Date.now();
      await page.fill('input[type="email"]', invalidEmail);
      await page.fill('input[type="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      const timeInvalid = Date.now() - startInvalid;
      
      // Time difference should be minimal (< 100ms) to prevent timing attacks
      const timeDiff = Math.abs(timeValid - timeInvalid);
      expect(timeDiff).toBeLessThan(100);
    });
  });

  test.describe('Input Length Limits', () => {
    test('should enforce maximum input lengths', async ({ page }) => {
      await page.goto('/auth?mode=register');
      
      // Try extremely long email
      const longEmail = 'a'.repeat(300) + '@example.com';
      await page.fill('input[type="email"]', longEmail);
      await page.blur('input[type="email"]');
      
      // Should show error about length
      await expect(page.getByText(/muito longo|too long|máximo/i)).toBeVisible();
    });

    test('should prevent buffer overflow attempts', async ({ page }) => {
      const bufferOverflow = 'A'.repeat(10000);
      
      await page.fill('input[type="email"]', bufferOverflow);
      await page.fill('input[type="password"]', bufferOverflow);
      
      // Should not crash and should show validation error
      const errorVisible = await page.getByText(/inválido|erro/i).isVisible();
      expect(errorVisible).toBeTruthy();
    });
  });

  test.describe('Session Security', () => {
    test('should clear session on logout', async ({ page }) => {
      // Login first
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'Test@12345!');
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForURL(/\/client|\/professional|\/admin/);
      
      // Logout
      await page.click('button:has-text("Sair")');
      
      // Try to access protected page directly
      await page.goto('/professional/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth/);
    });

    test('should prevent session fixation', async ({ page }) => {
      // Get session before login
      const sessionBefore = await page.evaluate(() => localStorage.getItem('session'));
      
      // Login
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'Test@12345!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      
      // Get session after login
      const sessionAfter = await page.evaluate(() => localStorage.getItem('session'));
      
      // Session should change after login
      expect(sessionBefore).not.toEqual(sessionAfter);
    });
  });

  test.describe('Authorization Bypass', () => {
    test('should prevent direct URL access to admin pages', async ({ page }) => {
      // Try to access admin page without authentication
      await page.goto('/admin/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth/);
    });

    test('should prevent role escalation through client manipulation', async ({ page }) => {
      // Login as client
      await page.fill('input[type="email"]', 'client@example.com');
      await page.fill('input[type="password"]', 'Test@12345!');
      await page.click('button[type="submit"]');
      
      // Try to manipulate localStorage to become admin
      await page.evaluate(() => {
        localStorage.setItem('userRole', 'admin');
      });
      
      // Try to access admin page
      await page.goto('/admin/dashboard');
      
      // Should still be blocked or redirected
      const isOnAdminPage = page.url().includes('/admin/dashboard');
      expect(isOnAdminPage).toBeFalsy();
    });
  });

  test.describe('Content Security Policy', () => {
    test('should have strict CSP headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      // Check for security headers
      expect(headers?.['x-frame-options']).toBe('DENY');
      expect(headers?.['x-content-type-options']).toBe('nosniff');
      expect(headers?.['strict-transport-security']).toContain('max-age');
    });
  });

  test.describe('File Upload Security', () => {
    test('should validate file types on upload', async ({ page }) => {
      await page.goto('/professional/profile');
      
      // Try to upload executable file
      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'malicious.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('fake exe content')
      });
      
      // Should show error
      await expect(page.getByText(/tipo.*arquivo.*inválido/i)).toBeVisible({ timeout: 5000 });
    });

    test('should enforce file size limits', async ({ page }) => {
      await page.goto('/professional/profile');
      
      // Try to upload very large file
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'large.jpg',
        mimeType: 'image/jpeg',
        buffer: largeBuffer
      });
      
      // Should show error about file size
      await expect(page.getByText(/tamanho|size|grande/i)).toBeVisible({ timeout: 5000 });
    });
  });
});
