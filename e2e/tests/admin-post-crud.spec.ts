import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

test.describe('Admin Post CRUD', () => {
  test('admin login → create post → publish → verify public page', async ({ page }) => {
    const postTitle = `E2E Test ${Date.now()}`;

    // 1. Login
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toHaveText('Вхід адміністратора');

    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Увійти")');

    // 2. Redirected to posts list
    await page.waitForURL('/admin/posts');
    await expect(page.locator('button:has-text("Додати пост")')).toBeVisible();

    // 3. Create new post
    await page.click('button:has-text("Додати пост")');
    await page.waitForURL('/admin/posts/create');

    // 4. Fill form
    await page.fill('input[name="title"]', postTitle);
    // Slug auto-generated from title
    await page.click('input[value="published"]');

    // 5. Save
    await page.click('button[type="submit"]:has-text("Зберегти")');

    // 6. Back to posts list with success toast
    await page.waitForURL('/admin/posts');
    await expect(page.locator('text=Пост збережено')).toBeVisible();

    // 7. Find the post in the list and get its slug
    const postRow = page.locator('tr', { hasText: postTitle });
    await expect(postRow).toBeVisible();
    const slugLink = postRow.locator('code');
    const slugText = await slugLink.textContent();
    const slug = slugText?.replace('/', '').trim() ?? '';

    // 8. Visit public page
    await page.goto(`/page/${slug}`);
    await expect(page.locator('h1', { hasText: postTitle })).toBeVisible();
  });
});
