import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function login(page: any) {
  await page.goto('/admin/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button:has-text("Увійти")');
  await page.waitForURL('/admin/posts');
}

test.describe('Admin Users CRUD', () => {
  test('create user and delete user', async ({ page }) => {
    const testEmail = `e2e-user-${Date.now()}@test.com`;

    await login(page);

    // Navigate to users page
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3:has-text("Додати користувача")')).toBeVisible();

    // Create user
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button:has-text("Додати")');

    // Verify user appears in list
    await expect(page.locator('tr', { hasText: testEmail })).toBeVisible();

    // Delete user
    const userRow = page.locator('tr', { hasText: testEmail });
    await userRow.locator('button[title="Видалити"]').click();

    // Confirm delete modal
    await page.click('button:has-text("Видалити")');

    // Verify user removed
    await expect(page.locator('tr', { hasText: testEmail })).toHaveCount(0);
  });
});
