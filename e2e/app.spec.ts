import { test, expect } from '@playwright/test';

test.describe('Web-GVCN App Smoke Tests', () => {
  test('should load homepage and display class title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Web-GVCN/i);
    await expect(page.locator('h1').first()).toContainText(/LỚP (6A6|12A1)/i);
  });

  test('should navigate to students page smoothly', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/students"]:visible').click();
    await expect(page).toHaveURL(/.*students/);
    await expect(page.getByRole('heading', { name: /Quản Lý Học Sinh/i })).toBeVisible();
  });

  test('should support touch to swap student seats on mobile and desktop', async ({ page }) => {
    await page.goto('/seating');
    // Chờ sơ đồ và các bàn học nạp hoàn tất
    await expect(page.locator('text=BÀN 1').first()).toBeVisible({ timeout: 10000 });

    const studentDesks = page.locator('.cursor-grab');
    await expect(studentDesks.first()).toBeVisible();

    // 1. Chạm vào ghế của học sinh A
    await studentDesks.first().click();

    // 2. Thanh hành động nổi FloatingSwapActionBar xuất hiện
    await expect(page.locator('text=Đang chọn:')).toBeVisible();
    await expect(page.locator('text=Chạm vào bạn học sinh khác hoặc ghế trống để đổi chỗ!')).toBeVisible();

    // 3. Chạm vào ghế của học sinh B để hoán đổi vị trí
    await studentDesks.nth(1).click();

    // 4. Kiểm tra toast thông báo đổi chỗ thành công xuất hiện
    await expect(page.locator('text=Đã đổi chỗ giữa em')).toBeVisible({ timeout: 5000 });
  });

  test('should open award points modal, submit points and reflect in ledger', async ({ page }) => {
    await page.goto('/points?action=award');

    // 1. Kiểm tra modal Chấm Điểm Nề Nếp & Thi Đua hiển thị
    await expect(page.getByRole('heading', { name: /Chấm Điểm Nề Nếp & Thi Đua/i })).toBeVisible({ timeout: 10000 });

    // 2. Chọn học sinh trong danh sách (Playwright tự đợi options xuất hiện)
    const studentSelect = page.locator('form select').first();
    await expect(studentSelect).toBeVisible({ timeout: 10000 });
    await studentSelect.selectOption({ index: 0 });

    // 3. Nhập lý do khen thưởng / cộng điểm
    const reasonInput = page.locator('input[placeholder*="Giúp đỡ bạn"]').first();
    await reasonInput.fill('Phát biểu xây dựng bài sôi nổi');

    // 4. Kiểm tra khung xem trước biến động điểm (Live Preview Badge)
    await expect(page.locator('[data-testid="live-preview-badge"]')).toBeVisible();

    // 5. Bấm nút GHI NHẬN VÀO SỔ CÁI
    await page.getByRole('button', { name: /GHI NHẬN VÀO SỔ CÁI/i }).click();

    // 6. Kiểm tra modal đóng lại sau khi lưu
    await expect(page.getByRole('heading', { name: /Chấm Điểm Nề Nếp & Thi Đua/i })).not.toBeVisible({ timeout: 10000 });

    // 7. Kiểm tra giao dịch hiển thị ngay trên dòng nhật ký sổ cái
    await expect(page.locator('text=Phát biểu xây dựng bài sôi nổi').first()).toBeVisible({ timeout: 10000 });
  });
});




