import { Page, expect } from '@playwright/test';

export interface PetData {
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
}

export interface AppointmentData {
  petShopName: string;
  serviceName: string;
  date?: string; // Format: YYYY-MM-DD or 'tomorrow'
  time: string; // Format: HH:MM
}

/**
 * Login as test client
 */
export async function loginAsTestClient(page: Page) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'cliente@test.com');
  await page.fill('input[type="password"]', 'SenhaCliente123');
  await page.click('button:has-text("Entrar")');
  await page.waitForURL('/client/pets');
}

/**
 * Create a test pet for appointments
 */
export async function createTestPet(page: Page, petData: PetData) {
  await page.goto('/client/pets');
  
  // Click add pet button
  await page.click('button:has-text("Adicionar Pet")');
  
  // Fill pet form
  await page.fill('input[name="name"]', petData.name);
  await page.selectOption('select[name="species"]', petData.species);
  await page.fill('input[name="breed"]', petData.breed);
  await page.fill('input[name="age"]', petData.age.toString());
  await page.fill('input[name="weight"]', petData.weight.toString());
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for success toast
  await expect(page.locator('text=Pet cadastrado com sucesso')).toBeVisible({ timeout: 5000 });
  
  // Verify pet appears in list
  await expect(page.locator(`text=${petData.name}`)).toBeVisible();
}

/**
 * Create a complete test appointment
 */
export async function createTestAppointment(page: Page, appointmentData: AppointmentData) {
  // Navigate to select pet shop
  await page.goto('/select-petshop');
  
  // Search for pet shop
  const searchInput = page.locator('input[type="search"]');
  if (await searchInput.isVisible()) {
    await searchInput.fill(appointmentData.petShopName);
    await page.waitForTimeout(500); // Wait for search results
  }
  
  // Select pet shop (click first available)
  await page.click('button:has-text("Selecionar"):visible').first();
  await page.waitForURL('/new-appointment');
  
  // Select service
  await page.click(`text=${appointmentData.serviceName}`).first();
  
  // Calculate date if 'tomorrow'
  let dateToSelect = appointmentData.date || 'tomorrow';
  if (dateToSelect === 'tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateToSelect = tomorrow.toISOString().split('T')[0];
  }
  
  // Select date (open calendar and click date)
  await page.click('button:has-text("Selecionar data")');
  await page.click(`[data-date="${dateToSelect}"]`);
  
  // Wait for available times to load
  await page.waitForSelector(`button:has-text("${appointmentData.time}")`, { timeout: 5000 });
  
  // Select time
  await page.click(`button:has-text("${appointmentData.time}")`);
  
  // Confirm appointment
  await page.click('button:has-text("Confirmar Agendamento")');
  
  // Wait for success toast
  await expect(page.locator('text=Agendamento criado com sucesso')).toBeVisible({ timeout: 5000 });
  
  // Verify redirect to appointments page
  await page.waitForURL('/client/appointments');
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Clean up test appointments (if needed)
 */
export async function cleanupTestAppointments(page: Page) {
  await page.goto('/client/appointments');
  
  // Find all pending test appointments and cancel them
  const cancelButtons = page.locator('button:has-text("Cancelar")');
  const count = await cancelButtons.count();
  
  for (let i = 0; i < count; i++) {
    const button = cancelButtons.nth(i);
    if (await button.isVisible()) {
      await button.click();
      
      // Confirm in dialog
      await page.click('button:has-text("Confirmar")');
      
      // Wait for success
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Verify appointment appears in list with correct data
 */
export async function verifyAppointmentInList(
  page: Page,
  petName: string,
  serviceName: string,
  status: string = 'Pendente'
) {
  await page.goto('/client/appointments');
  
  // Verify appointment card contains expected data
  const appointmentCard = page.locator('.appointment-card').filter({ hasText: petName });
  await expect(appointmentCard).toBeVisible();
  await expect(appointmentCard.locator(`text=${serviceName}`)).toBeVisible();
  await expect(appointmentCard.locator(`text=${status}`)).toBeVisible();
}
