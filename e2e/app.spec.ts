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
    await expect(page.getByRole('heading', { name: /(Quản Lý Học Sinh|Tổ Chức Lớp Học)/i })).toBeVisible();
  });

  test('should support touch to swap student seats on mobile and desktop', async ({ page }) => {
    await page.goto('/seating');
    // Chờ sơ đồ và tiêu đề phòng học hiển thị
    await expect(page.getByRole('heading', { name: /Phòng Học Lớp/i })).toBeVisible({ timeout: 15000 });

    // Đảm bảo không còn trạng thái nạp dữ liệu bàn ghế
    await expect(page.locator('text=Đang đồng bộ Sơ đồ')).not.toBeVisible({ timeout: 20000 }).catch(() => {});

    const studentDesks = page.locator('[data-testid="student-desk-card"], [title*="để đổi chỗ"]');
    await expect(studentDesks.first()).toBeVisible({ timeout: 25000 });

    // 1. Chạm vào ghế của học sinh A
    await studentDesks.first().click();

    // 2. Thanh hành động nổi FloatingSwapActionBar xuất hiện
    await expect(page.locator('text=Đang chọn:')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Chạm vào bạn học sinh khác')).toBeVisible({ timeout: 10000 });

    // 3. Chạm vào ghế của học sinh B để hoán đổi vị trí
    await studentDesks.nth(1).click();

    // 4. Kiểm tra toast thông báo đổi chỗ thành công xuất hiện
    await expect(page.locator('text=Đã đổi chỗ giữa em')).toBeVisible({ timeout: 10000 });
  });

  test('should open award points modal, submit points and reflect in ledger', async ({ page }) => {
    await page.goto('/points?action=award');

    // 1. Kiểm tra modal Chấm Điểm Nề Nếp & Thi Đua hiển thị
    await expect(page.getByRole('heading', { name: /Chấm Điểm Nề Nếp & Thi Đua/i })).toBeVisible({ timeout: 15000 });

    // 2. Chờ danh sách học sinh nạp hoàn tất và chọn học sinh theo ID cụ thể
    const studentSelect = page.locator('form select').first();
    await expect(studentSelect).toBeVisible({ timeout: 15000 });
    const studentOptions = studentSelect.locator('option:not([value=""])');
    await expect(studentOptions.first()).toBeAttached({ timeout: 20000 });
    const studentId = await studentOptions.first().getAttribute('value');
    expect(studentId).toBeTruthy();
    await studentSelect.selectOption(studentId!);

    // 3. Nhập lý do khen thưởng / cộng điểm
    const reasonInput = page.locator('input[placeholder*="Giúp đỡ bạn"]').first();
    await expect(reasonInput).toBeVisible({ timeout: 10000 });
    await reasonInput.fill('Phát biểu xây dựng bài sôi nổi');

    // 4. Kiểm tra khung xem trước biến động điểm (Live Preview Badge)
    await expect(page.locator('[data-testid="live-preview-badge"]')).toBeVisible({ timeout: 10000 });

    // 5. Bấm nút GHI NHẬN VÀO SỔ CÁI (cuộn vào tầm nhìn để hỗ trợ mobile viewports)
    const submitBtn = page.getByRole('button', { name: /GHI NHẬN VÀO SỔ CÁI/i });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // 6. Kiểm tra modal đóng lại sau khi lưu
    await expect(page.getByRole('heading', { name: /Chấm Điểm Nề Nếp & Thi Đua/i })).not.toBeVisible({ timeout: 15000 });

    // 7. Kiểm tra giao dịch hiển thị ngay trên dòng nhật ký sổ cái
    await expect(page.locator('text=Phát biểu xây dựng bài sôi nổi').first()).toBeVisible({ timeout: 15000 });
  });

  test('should allow teacher to edit criterion points and stars directly from award modal', async ({ page }) => {
    await page.goto('/points?action=award');

    // Chờ modal Chấm Điểm mở ra
    await expect(page.getByRole('heading', { name: /Chấm Điểm Nề Nếp & Thi Đua/i })).toBeVisible({ timeout: 15000 });

    // Tìm nút chỉnh sửa tiêu chí đầu tiên
    const editBtn = page.locator('[data-testid^="edit-cat-"]').first();
    await expect(editBtn).toBeVisible({ timeout: 15000 });
    await editBtn.click();

    // Modal Điều Chỉnh Tiêu Chí xuất hiện
    await expect(page.getByRole('heading', { name: /Điều Chỉnh Tiêu Chí/i })).toBeVisible({ timeout: 10000 });

    // Bấm nút mốc điểm nhanh +10đ
    const quickPointBtn = page.getByRole('button', { name: '+10đ', exact: true });
    if (await quickPointBtn.isVisible()) {
      await quickPointBtn.click();
    }

    // Bấm Lưu thay đổi
    const saveBtn = page.getByRole('button', { name: /💾 Lưu thay đổi/i });
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();

    // Modal chỉnh sửa đóng lại và hiển thị thông báo thành công
    await expect(page.getByRole('heading', { name: /Điều Chỉnh Tiêu Chí/i })).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Đã điều chỉnh tiêu chí')).toBeVisible({ timeout: 10000 });
  });
});




