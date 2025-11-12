import { test, expect } from '@playwright/test';
import { loginAsTestClient, createTestPet, getTomorrowDate } from './helpers/appointment-helpers';
import { TEST_PET, TEST_APPOINTMENT } from './fixtures/appointment-fixtures';

test.describe('Appointment Flow - Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestClient(page);
    await createTestPet(page, TEST_PET);
  });

  test('should complete full appointment booking flow', async ({ page }) => {
    // Step 1: Select pet shop
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    // Step 2: Select pet
    const petSelector = page.locator(`text=${TEST_PET.name}`).first();
    if (await petSelector.isVisible()) {
      await petSelector.click();
    }
    
    // Step 3: Select service
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
    await page.waitForTimeout(500);
    
    // Step 4: Select date
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    // Step 5: Wait for available times and select
    await page.waitForSelector(`button:has-text("${TEST_APPOINTMENT.time}")`, { timeout: 5000 });
    await page.click(`button:has-text("${TEST_APPOINTMENT.time}")`);
    
    // Step 6: Confirm appointment
    await page.click('button:has-text("Confirmar Agendamento")');
    
    // Verify success toast
    await expect(page.locator('text=Agendamento criado com sucesso')).toBeVisible({ timeout: 5000 });
    
    // Verify redirect to appointments page
    await page.waitForURL('/client/appointments');
  });

  test('should display appointment summary before confirmation', async ({ page }) => {
    // Navigate through flow
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    await page.waitForSelector(`button:has-text("${TEST_APPOINTMENT.time}")`, { timeout: 5000 });
    await page.click(`button:has-text("${TEST_APPOINTMENT.time}")`);
    
    // Verify appointment summary is visible
    await expect(page.locator('text=Resumo do Agendamento')).toBeVisible();
    await expect(page.locator(`text=${TEST_PET.name}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_APPOINTMENT.serviceName}`)).toBeVisible();
    await expect(page.locator('text=/R\\$/i')).toBeVisible();
  });

  test('should show newly created appointment in appointments list', async ({ page }) => {
    // Create appointment
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    await page.waitForSelector(`button:has-text("${TEST_APPOINTMENT.time}")`, { timeout: 5000 });
    await page.click(`button:has-text("${TEST_APPOINTMENT.time}")`);
    
    await page.click('button:has-text("Confirmar Agendamento")');
    await page.waitForURL('/client/appointments');
    
    // Verify appointment appears in list
    await expect(page.locator(`text=${TEST_PET.name}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_APPOINTMENT.serviceName}`)).toBeVisible();
    
    // Verify status is "Pendente"
    await expect(page.locator('text=Pendente')).toBeVisible();
  });

  test('should display correct appointment details in card', async ({ page }) => {
    // Create appointment
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    await page.waitForSelector(`button:has-text("${TEST_APPOINTMENT.time}")`, { timeout: 5000 });
    await page.click(`button:has-text("${TEST_APPOINTMENT.time}")`);
    
    await page.click('button:has-text("Confirmar Agendamento")');
    await page.waitForURL('/client/appointments');
    
    // Find appointment card
    const appointmentCard = page.locator('.appointment-card, [data-testid="appointment-card"]').first();
    
    // Verify all details are present
    await expect(appointmentCard.locator(`text=${TEST_PET.name}`)).toBeVisible();
    await expect(appointmentCard.locator(`text=${TEST_APPOINTMENT.serviceName}`)).toBeVisible();
    await expect(appointmentCard.locator(`text=${TEST_APPOINTMENT.time}`)).toBeVisible();
    await expect(appointmentCard.locator('text=Pendente')).toBeVisible();
  });

  test('should prevent double booking at same time slot', async ({ page }) => {
    // Create first appointment
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    await page.waitForSelector(`button:has-text("${TEST_APPOINTMENT.time}")`, { timeout: 5000 });
    await page.click(`button:has-text("${TEST_APPOINTMENT.time}")`);
    
    await page.click('button:has-text("Confirmar Agendamento")');
    await page.waitForURL('/client/appointments');
    
    // Try to book same slot again
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Selecionar data")');
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    // Verify the previously selected time is no longer available
    await page.waitForTimeout(2000);
    const timeButton = page.locator(`button:has-text("${TEST_APPOINTMENT.time}")`);
    
    if (await timeButton.isVisible()) {
      await expect(timeButton).toBeDisabled();
    } else {
      // Time slot should not be shown at all
      expect(await timeButton.count()).toBe(0);
    }
  });

  test('should display confirmation button only when all fields are selected', async ({ page }) => {
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    // Initially, confirmation button should be disabled
    const confirmButton = page.locator('button:has-text("Confirmar Agendamento")');
    if (await confirmButton.isVisible()) {
      await expect(confirmButton).toBeDisabled();
    }
    
    // Select service
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
    
    // Still disabled (no date/time selected)
    if (await confirmButton.isVisible()) {
      await expect(confirmButton).toBeDisabled();
    }
    
    // Select date and time
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    await page.waitForSelector(`button:has-text("${TEST_APPOINTMENT.time}")`, { timeout: 5000 });
    await page.click(`button:has-text("${TEST_APPOINTMENT.time}")`);
    
    // Now should be enabled
    await expect(confirmButton).toBeEnabled();
  });
});
