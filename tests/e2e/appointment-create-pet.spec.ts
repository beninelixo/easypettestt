import { test, expect } from '@playwright/test';
import { loginAsTestClient, createTestPet } from './helpers/appointment-helpers';
import { TEST_PET } from './fixtures/appointment-fixtures';

test.describe('Appointment Flow - Create Pet', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestClient(page);
  });

  test('should create a new pet successfully', async ({ page }) => {
    await page.goto('/client/pets');
    
    // Click add pet button
    await page.click('button:has-text("Adicionar Pet")');
    
    // Verify form opened
    await expect(page.locator('text=Cadastrar Pet')).toBeVisible();
    
    // Fill pet form
    await page.fill('input[name="name"]', TEST_PET.name);
    await page.selectOption('select[name="species"]', TEST_PET.species);
    await page.fill('input[name="breed"]', TEST_PET.breed);
    await page.fill('input[name="age"]', TEST_PET.age.toString());
    await page.fill('input[name="weight"]', TEST_PET.weight.toString());
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success toast
    await expect(page.locator('text=Pet cadastrado com sucesso')).toBeVisible({ timeout: 5000 });
    
    // Verify pet appears in list
    await expect(page.locator(`text=${TEST_PET.name}`)).toBeVisible();
    
    // Verify pet details are correct
    const petCard = page.locator('.pet-card').filter({ hasText: TEST_PET.name });
    await expect(petCard.locator(`text=${TEST_PET.breed}`)).toBeVisible();
    await expect(petCard.locator(`text=${TEST_PET.age}`)).toBeVisible();
  });

  test('should validate required fields when creating pet', async ({ page }) => {
    await page.goto('/client/pets');
    
    // Click add pet button
    await page.click('button:has-text("Adicionar Pet")');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Verify validation errors appear
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible();
    await expect(page.locator('text=Espécie é obrigatória')).toBeVisible();
  });

  test('should be able to edit pet after creation', async ({ page }) => {
    // Create pet first
    await createTestPet(page, { ...TEST_PET, name: 'Pet Edit Test' });
    
    // Click edit button
    await page.click('button:has-text("Editar"):visible').first();
    
    // Update pet name
    await page.fill('input[name="name"]', 'Pet Edit Test - Updated');
    await page.click('button[type="submit"]');
    
    // Verify update success
    await expect(page.locator('text=Pet atualizado com sucesso')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Pet Edit Test - Updated')).toBeVisible();
  });

  test('should be able to delete pet', async ({ page }) => {
    // Create pet first
    await createTestPet(page, { ...TEST_PET, name: 'Pet Delete Test' });
    
    // Click delete button
    await page.click('button:has-text("Excluir"):visible').first();
    
    // Confirm deletion in dialog
    await page.click('button:has-text("Confirmar")');
    
    // Verify deletion success
    await expect(page.locator('text=Pet excluído com sucesso')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Pet Delete Test')).not.toBeVisible();
  });
});
