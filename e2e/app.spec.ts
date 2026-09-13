import { test, expect } from '@playwright/test';

test.describe('Web-GVCN App Smoke Tests', () => {
  test('should load homepage and display class title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Web-GVCN/i);
    await expect(page.locator('h1').first()).toContainText(/LỚP (6A6|12A1)/i);
  });

  test('should navigate to students page smoothly', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Học sinh & Tổ');
    await expect(page).toHaveURL(/.*students/);
    await expect(page.locator('h2')).toContainText(/Quản lý Học sinh/i);
  });
});
