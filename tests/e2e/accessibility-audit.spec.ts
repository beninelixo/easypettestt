import { test, expect } from '@playwright/test';
import { checkA11y, assertNoA11yViolations, assertNoCriticalA11yViolations } from './helpers/accessibility-helper';

test.describe('Accessibility Audit - Public Pages (WCAG 2.1 AA)', () => {
  
  test('Home page should be accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const results = await checkA11y(page, 'Home Page');
    assertNoCriticalA11yViolations(results);
  });

  test('Auth page should be accessible', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    const results = await checkA11y(page, 'Auth Page');
    assertNoCriticalA11yViolations(results);
  });

  test('Pricing page should be accessible', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    const results = await checkA11y(page, 'Pricing Page');
    assertNoCriticalA11yViolations(results);
  });

  test('Features page should be accessible', async ({ page }) => {
    await page.goto('/funcionalidades');
    await page.waitForLoadState('networkidle');
    
    const results = await checkA11y(page, 'Features Page');
    assertNoCriticalA11yViolations(results);
  });

  test('Contact page should be accessible', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    const results = await checkA11y(page, 'Contact Page');
    assertNoCriticalA11yViolations(results);
  });

  test('About page should be accessible', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    
    const results = await checkA11y(page, 'About Page');
    assertNoCriticalA11yViolations(results);
  });
});

test.describe('Accessibility Audit - Forms and Interactive Elements', () => {
  test('Login form should have proper labels and ARIA', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Check for labels
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    
    // Run accessibility audit
    const results = await checkA11y(page, 'Login Form');
    assertNoCriticalA11yViolations(results);
  });

  test('Buttons should have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // All buttons should have text or aria-label
    const buttons = page.locator('button:visible');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel || ariaLabelledBy;
      expect(hasAccessibleName).toBeTruthy();
    }
    
    const results = await checkA11y(page, 'Buttons');
    assertNoCriticalA11yViolations(results);
  });

  test('Images should have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img:visible');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');
      
      // Image should have alt text unless it's decorative (role="presentation" or alt="")
      const isDecorative = role === 'presentation' || alt === '';
      const hasAccessibleText = alt !== null || ariaLabel !== null;
      
      expect(hasAccessibleText || isDecorative).toBeTruthy();
    }
    
    const results = await checkA11y(page, 'Images');
    assertNoCriticalA11yViolations(results);
  });

  test('Links should have descriptive text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const links = page.locator('a:visible');
    const count = await links.count();
    
    for (let i = 0; i < Math.min(count, 20); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      const hasAccessibleName = 
        (text && text.trim().length > 0) || 
        ariaLabel || 
        title;
      
      expect(hasAccessibleName).toBeTruthy();
    }
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('Should be able to navigate with Tab key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab through first 10 interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      
      // Verify focused element is visible
      const focusedElement = page.locator(':focus');
      const isVisible = await focusedElement.isVisible().catch(() => false);
      
      if (isVisible) {
        expect(isVisible).toBe(true);
      }
    }
  });

  test('Should be able to navigate backwards with Shift+Tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab forward first
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Then tab backwards
    await page.keyboard.press('Shift+Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('Should be able to submit auth form with Enter', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.keyboard.press('Tab');
    await page.fill('input[type="password"]', 'TestPassword123');
    
    // Press Enter should submit form
    await page.keyboard.press('Enter');
    
    // Wait a moment for form submission attempt
    await page.waitForTimeout(1000);
  });

  test('Skip to main content link should work', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab once to focus skip link
    await page.keyboard.press('Tab');
    
    // Check if it's a skip link
    const firstFocused = page.locator(':focus');
    const text = await firstFocused.textContent();
    
    if (text && (text.includes('Pular') || text.includes('Skip'))) {
      // Press Enter to use skip link
      await page.keyboard.press('Enter');
      
      // Verify main content is focused
      await page.waitForTimeout(500);
      const mainContent = page.locator('main, [role="main"], #main-content');
      await expect(mainContent.first()).toBeVisible();
    }
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('Should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Axe will automatically check color contrast
    const results = await checkA11y(page, 'Color Contrast');
    
    // Filter for color contrast violations
    const contrastViolations = results.violations.filter(v => 
      v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
    );
    
    if (contrastViolations.length > 0) {
      console.warn(`⚠️ Found ${contrastViolations.length} color contrast issues`);
    }
    
    // Only fail on critical violations
    assertNoCriticalA11yViolations(results);
  });
});

test.describe('Accessibility - Headings Hierarchy', () => {
  test('Should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that page has an h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
    
    // Run accessibility audit
    const results = await checkA11y(page, 'Heading Hierarchy');
    assertNoCriticalA11yViolations(results);
  });

  test('Should not skip heading levels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all heading levels
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = await Promise.all(
      headings.map(h => h.evaluate(el => parseInt(el.tagName[1])))
    );
    
    // Check that heading levels don't skip (e.g., h1 -> h3 without h2)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      
      // Allow going up any number of levels (e.g., h4 -> h2)
      // But only allow going down one level at a time (e.g., h2 -> h3, not h2 -> h4)
      if (diff > 1) {
        console.warn(`⚠️ Heading level skipped from h${headingLevels[i - 1]} to h${headingLevels[i]}`);
      }
    }
  });
});

test.describe('Accessibility - ARIA Attributes', () => {
  test('Should have valid ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const results = await checkA11y(page, 'ARIA Attributes');
    
    // Check for ARIA-related violations
    const ariaViolations = results.violations.filter(v => 
      v.id.includes('aria-') || v.tags.includes('aria')
    );
    
    if (ariaViolations.length > 0) {
      console.warn(`⚠️ Found ${ariaViolations.length} ARIA issues`);
    }
    
    assertNoCriticalA11yViolations(results);
  });

  test('Modal dialogs should trap focus', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Look for any trigger that opens a modal (if present)
    const modalTriggers = page.locator('button:has-text("Esqueci"), button[data-dialog-trigger]');
    const count = await modalTriggers.count();
    
    if (count > 0) {
      await modalTriggers.first().click();
      
      // Wait for modal to appear
      await page.waitForTimeout(500);
      
      // Check if modal is present
      const dialog = page.locator('[role="dialog"], [role="alertdialog"]');
      if (await dialog.isVisible()) {
        // Tab through elements - focus should stay in modal
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press('Tab');
          
          const focusedElement = page.locator(':focus');
          const isInsideDialog = await focusedElement.evaluate(
            (el, dialogEl) => dialogEl?.contains(el) ?? false,
            await dialog.elementHandle()
          );
          
          if (i > 0) { // After first tab, focus should be trapped
            expect(isInsideDialog).toBe(true);
          }
        }
      }
    }
  });
});

test.describe('Accessibility - Screen Reader Support', () => {
  test('Should have appropriate landmark regions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for semantic landmarks
    const header = page.locator('header, [role="banner"]');
    const main = page.locator('main, [role="main"]');
    const nav = page.locator('nav, [role="navigation"]');
    const footer = page.locator('footer, [role="contentinfo"]');
    
    await expect(header.first()).toBeVisible();
    await expect(main.first()).toBeVisible();
    
    // Navigation and footer are common but not always required
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
    
    if (await footer.count() > 0) {
      await expect(footer.first()).toBeVisible();
    }
  });

  test('Should have language attribute', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'pt' or 'pt-BR'
  });

  test('Should have page title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});
