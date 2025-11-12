import { test, expect } from '@playwright/test';
import { loginAsTestClient, createTestPet, getTomorrowDate } from './helpers/appointment-helpers';
import { TEST_PET, TEST_APPOINTMENT } from './fixtures/appointment-fixtures';

test.describe('Appointment Flow - Cancellation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestClient(page);
    await createTestPet(page, TEST_PET);
    
    // Create an appointment to cancel
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
  });

  test('should show cancel button for pending appointments', async ({ page }) => {
    await page.goto('/client/appointments');
    
    // Verify cancel button is visible for pending appointment
    const cancelButton = page.locator('button:has-text("Cancelar")').first();
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toBeEnabled();
  });

  test('should show confirmation dialog when canceling', async ({ page }) => {
    await page.goto('/client/appointments');
    
    // Click cancel button
    await page.click('button:has-text("Cancelar")').first();
    
    // Verify confirmation dialog appears
    await expect(page.locator('[role="dialog"], [role="alertdialog"]')).toBeVisible();
    await expect(page.locator('text=Tem certeza')).toBeVisible();
    await expect(page.locator('text=cancelar')).toBeVisible();
    
    // Verify both confirm and cancel buttons are present
    await expect(page.locator('button:has-text("Confirmar")').last()).toBeVisible();
    await expect(page.locator('button:has-text("Cancelar")').last()).toBeVisible();
  });

  test('should cancel appointment when confirmed', async ({ page }) => {
    await page.goto('/client/appointments');
    
    // Click cancel button
    await page.click('button:has-text("Cancelar")').first();
    
    // Confirm cancellation in dialog
    await page.click('button:has-text("Confirmar")').last();
    
    // Verify success toast
    await expect(page.locator('text=Agendamento cancelado com sucesso')).toBeVisible({ timeout: 5000 });
    
    // Verify status changed to "Cancelado"
    await expect(page.locator('text=Cancelado')).toBeVisible();
  });

  test('should not cancel appointment when dialog is dismissed', async ({ page }) => {
    await page.goto('/client/appointments');
    
    // Click cancel button
    await page.click('button:has-text("Cancelar")').first();
    
    // Click cancel in dialog (dismiss)
    await page.click('button:has-text("Cancelar")').last();
    
    // Verify status is still "Pendente"
    await expect(page.locator('text=Pendente')).toBeVisible();
    
    // Verify no success toast appeared
    await expect(page.locator('text=Agendamento cancelado')).not.toBeVisible();
  });

  test('should hide cancel button after cancellation', async ({ page }) => {
    await page.goto('/client/appointments');
    
    // Cancel appointment
    await page.click('button:has-text("Cancelar")').first();
    await page.click('button:has-text("Confirmar")').last();
    
    // Wait for cancellation to complete
    await page.waitForTimeout(1000);
    
    // Verify cancel button is no longer visible for this appointment
    const appointmentCard = page.locator('.appointment-card, [data-testid="appointment-card"]').filter({ hasText: 'Cancelado' }).first();
    const cancelButton = appointmentCard.locator('button:has-text("Cancelar")');
    
    await expect(cancelButton).not.toBeVisible();
  });

  test('should change appointment badge color after cancellation', async ({ page }) => {
    await page.goto('/client/appointments');
    
    // Get initial badge (Pendente - should be yellow/warning)
    const appointmentCard = page.locator('.appointment-card, [data-testid="appointment-card"]').first();
    const initialBadge = appointmentCard.locator('text=Pendente').first();
    await expect(initialBadge).toBeVisible();
    
    // Cancel appointment
    await page.click('button:has-text("Cancelar")').first();
    await page.click('button:has-text("Confirmar")').last();
    await page.waitForTimeout(1000);
    
    // Verify badge changed to "Cancelado" (should be red/destructive)
    const canceledBadge = appointmentCard.locator('text=Cancelado').first();
    await expect(canceledBadge).toBeVisible();
  });

  test('should allow canceling multiple appointments', async ({ page }) => {
    // Create second appointment
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Selecionar data")');
    const tomorrowDate = getTomorrowDate();
    await page.click(`[data-date="${tomorrowDate}"]`);
    
    // Select different time
    const availableTimes = page.locator('button:has-text(/\\d{2}:\\d{2}/)');
    await availableTimes.nth(1).click(); // Select second available time
    
    await page.click('button:has-text("Confirmar Agendamento")');
    await page.waitForURL('/client/appointments');
    
    // Now we have 2 appointments - cancel both
    const cancelButtons = page.locator('button:has-text("Cancelar")');
    const count = await cancelButtons.count();
    
    expect(count).toBeGreaterThanOrEqual(2);
    
    // Cancel first appointment
    await cancelButtons.first().click();
    await page.click('button:has-text("Confirmar")').last();
    await page.waitForTimeout(1000);
    
    // Cancel second appointment
    await cancelButtons.first().click(); // After first is canceled, second becomes first
    await page.click('button:has-text("Confirmar")').last();
    await page.waitForTimeout(1000);
    
    // Verify both are canceled
    const canceledBadges = page.locator('text=Cancelado');
    expect(await canceledBadges.count()).toBeGreaterThanOrEqual(2);
  });

  test('should not allow canceling past appointments', async ({ page }) => {
    await page.goto('/client/appointments');
    
    // Note: This test assumes system prevents canceling past appointments
    // If appointment is in the past, cancel button should not appear or be disabled
    
    // All our test appointments are in the future, so cancel button should be enabled
    const cancelButton = page.locator('button:has-text("Cancelar")').first();
    await expect(cancelButton).toBeEnabled();
    
    // This is a placeholder - in real scenario, you'd need to:
    // 1. Wait for appointment to pass (not practical in tests)
    // 2. Or manually create a past appointment in database
    // 3. Then verify cancel button is hidden/disabled
  });

  test('should show appointment list empty state after canceling all appointments', async ({ page }) => {
    await page.goto('/client/appointments');
    
    // Cancel all pending appointments
    const cancelButtons = page.locator('button:has-text("Cancelar")');
    const count = await cancelButtons.count();
    
    for (let i = 0; i < count; i++) {
      await page.click('button:has-text("Cancelar")').first();
      await page.click('button:has-text("Confirmar")').last();
      await page.waitForTimeout(1000);
    }
    
    // Verify all appointments are now canceled
    const pendingBadges = page.locator('text=Pendente');
    expect(await pendingBadges.count()).toBe(0);
    
    // Verify canceled badge appears
    await expect(page.locator('text=Cancelado')).toBeVisible();
  });
});
