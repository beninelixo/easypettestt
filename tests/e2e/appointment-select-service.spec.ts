import { test, expect } from '@playwright/test';
import { loginAsTestClient, createTestPet } from './helpers/appointment-helpers';
import { TEST_PET, TEST_APPOINTMENT } from './fixtures/appointment-fixtures';

test.describe('Appointment Flow - Select Service', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestClient(page);
    // Ensure we have a pet for appointments
    await createTestPet(page, TEST_PET);
  });

  test('should be able to search and select pet shop', async ({ page }) => {
    await page.goto('/select-petshop');
    
    // Verify pet shop selection page loaded
    await expect(page.locator('text=Selecionar Pet Shop')).toBeVisible();
    
    // Search for pet shop
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(TEST_APPOINTMENT.petShopName);
      await page.waitForTimeout(500);
    }
    
    // Verify pet shop appears in results
    await expect(page.locator(`text=${TEST_APPOINTMENT.petShopName}`)).toBeVisible();
    
    // Select pet shop
    await page.click('button:has-text("Selecionar"):visible').first();
    
    // Verify redirect to appointment page
    await page.waitForURL('/new-appointment');
    await expect(page.locator('text=Novo Agendamento')).toBeVisible();
  });

  test('should display available services after selecting pet shop', async ({ page }) => {
    // Navigate and select pet shop
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    // Verify services are displayed
    await expect(page.locator('text=Serviços Disponíveis')).toBeVisible();
    
    // Verify at least one service is available
    const serviceCards = page.locator('.service-card');
    await expect(serviceCards.first()).toBeVisible();
    
    // Verify service card contains price and duration
    const firstService = serviceCards.first();
    await expect(firstService.locator('text=/R\\$/i')).toBeVisible();
    await expect(firstService.locator('text=/min/i')).toBeVisible();
  });

  test('should be able to select a service', async ({ page }) => {
    // Navigate to appointment page with pet shop selected
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    // Click on a service
    await page.click(`text=${TEST_APPOINTMENT.serviceName}`).first();
    
    // Verify service is selected (visual feedback)
    const selectedService = page.locator('.service-card.selected, .service-card[data-selected="true"]');
    await expect(selectedService).toBeVisible();
    
    // Verify next step button becomes enabled
    const nextButton = page.locator('button:has-text("Próximo"), button:has-text("Continuar")');
    await expect(nextButton).toBeEnabled();
  });

  test('should display service details when clicked', async ({ page }) => {
    await page.goto('/select-petshop');
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    // Click on first service
    const firstService = page.locator('.service-card').first();
    await firstService.click();
    
    // Verify service details are visible
    await expect(page.locator('text=Descrição')).toBeVisible();
    await expect(page.locator('text=Duração')).toBeVisible();
    await expect(page.locator('text=Preço')).toBeVisible();
  });

  test('should persist pet shop selection in localStorage', async ({ page }) => {
    await page.goto('/select-petshop');
    
    // Select pet shop
    await page.click('button:has-text("Selecionar"):visible').first();
    await page.waitForURL('/new-appointment');
    
    // Check localStorage
    const selectedPetShopId = await page.evaluate(() => {
      return localStorage.getItem('selected_pet_shop_id');
    });
    
    expect(selectedPetShopId).toBeTruthy();
    expect(selectedPetShopId).not.toBe('null');
  });
});
