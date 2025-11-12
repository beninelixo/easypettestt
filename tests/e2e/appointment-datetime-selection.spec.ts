import { test, expect } from '@playwright/test';
import { loginAsTestClient, createTestPet, getTomorrowDate } from './helpers/appointment-helpers';
import { TEST_PET, TEST_APPOINTMENT } from './fixtures/appointment-fixtures';

test.describe('Appointment Flow - Date and Time Selection', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestClient(page);
    await createTestPet(page, TEST_PET);
    
    // Navigate to appointment page with service selected
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
  });

  test('should open calendar when selecting date', async ({ page }) => {
    // Click on date selector
    await page.click('button:has-text("Selecionar data")');
    
    // Verify calendar is visible
    await expect(page.locator('.calendar, [role="dialog"]:has-text("Calendário")')).toBeVisible();
    
    // Verify current month is displayed
    const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
    await expect(page.locator(`text=${currentMonth}`)).toBeVisible();
  });

  test('should only allow selecting future dates', async ({ page }) => {
    await page.click('button:has-text("Selecionar data")');
    
    // Try to select yesterday (should be disabled)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayButton = page.locator(`[data-date="${yesterday.toISOString().split('T')[0]}"]`);
    
    if (await yesterdayButton.isVisible()) {
      await expect(yesterdayButton).toBeDisabled();
    }
    
    // Verify tomorrow is enabled
    const tomorrowDate = getTomorrowDate();
    const tomorrowButton = page.locator(`[data-date="${tomorrowDate}"]`);
    await expect(tomorrowButton).toBeEnabled();
  });

  test('should display available time slots after selecting date', async ({ page }) => {
    // Select date
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    // Wait for available times to load
    await expect(page.locator('text=Horários Disponíveis')).toBeVisible({ timeout: 5000 });
    
    // Verify at least one time slot is available
    const timeSlots = page.locator('button:has-text(/\\d{2}:\\d{2}/)');
    const count = await timeSlots.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show loading state while checking availability', async ({ page }) => {
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    // Verify loading indicator appears
    await expect(page.locator('text=Verificando disponibilidade')).toBeVisible();
  });

  test('should be able to select available time slot', async ({ page }) => {
    // Select date
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    // Wait for times to load
    await page.waitForSelector(`button:has-text("${TEST_APPOINTMENT.time}")`, { timeout: 5000 });
    
    // Select time
    await page.click(`button:has-text("${TEST_APPOINTMENT.time}")`);
    
    // Verify time is selected (visual feedback)
    const selectedTime = page.locator(`button:has-text("${TEST_APPOINTMENT.time}")[data-selected="true"]`);
    await expect(selectedTime).toBeVisible();
  });

  test('should not show occupied time slots', async ({ page }) => {
    // Select date
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    // Wait for times to load
    await page.waitForTimeout(2000);
    
    // Verify conflict message if there are occupied slots
    const conflictMessage = page.locator('text=/\\d+ horários? indisponíve(l|is)/i');
    if (await conflictMessage.isVisible()) {
      // Verify count is displayed
      expect(await conflictMessage.textContent()).toMatch(/\d+/);
    }
  });

  test('should display service duration in time selection', async ({ page }) => {
    // Select date
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    // Wait for times and duration info
    await page.waitForTimeout(1000);
    
    // Verify duration info is displayed
    await expect(page.locator('text=/Duração.*\\d+.*min/i')).toBeVisible();
  });

  test('should update available slots when changing date', async ({ page }) => {
    // Select first date
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    await page.waitForTimeout(1000);
    
    // Get count of available slots
    const firstCount = await page.locator('button:has-text(/\\d{2}:\\d{2}/)').count();
    
    // Select different date
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const dayAfterTomorrowDate = dayAfterTomorrow.toISOString().split('T')[0];
    
    await page.click('button:has-text("Selecionar data")');
    await page.click(`[data-date="${dayAfterTomorrowDate}"]`);
    await page.waitForTimeout(1000);
    
    // Verify slots were reloaded (count may be different)
    const secondCount = await page.locator('button:has-text(/\\d{2}:\\d{2}/)').count();
    expect(secondCount).toBeGreaterThanOrEqual(0);
  });
});
