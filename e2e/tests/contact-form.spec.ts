import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('submits contact form and shows success message', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="name"]', 'E2E Test User');
    await page.fill('input[name="email"]', 'e2e@test.com');
    await page.fill('input[name="subject"]', 'E2E Test Subject');
    await page.fill('textarea[name="message"]', 'This is a test message from E2E suite.');

    await page.click('button:has-text("Надіслати повідомлення")');

    await expect(page.locator('text=Повідомлення надіслано!')).toBeVisible();
    await expect(page.locator('text=Ми з\'яжемося з вами найближчим часом.')).toBeVisible();
  });
});
