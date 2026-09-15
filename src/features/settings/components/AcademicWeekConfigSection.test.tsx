import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AcademicWeekConfigSection } from './AcademicWeekConfigSection';

vi.mock('../../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

describe('AcademicWeekConfigSection Component', () => {
  beforeEach(() => {
    localStorage.clear();
    // Giả lập ngày 14/09/2026
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 14, 10, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hiển thị đầy đủ các trường cấu hình tuần học và xem trước trực quan', () => {
    render(<AcademicWeekConfigSection classId="66666666-6666-6666-6666-666666666666" />);

    expect(screen.getByText(/Cấu Hình Tuần Học & Lịch Dạy Bù/)).toBeDefined();
    expect(screen.getByText(/Tuần 2 - Học kỳ I/)).toBeDefined();
    expect(screen.getByText('LƯU CẤU HÌNH TUẦN HỌC')).toBeDefined();
  });

  it('cho phép bấm nút chọn nhanh điều chỉnh tuần bù/nghỉ lễ và cập nhật ngay xem trước', () => {
    render(<AcademicWeekConfigSection classId="66666666-6666-6666-6666-666666666666" />);

    // Bấm nút "+1 Tuần (Dạy bù)"
    const plusOneBtn = screen.getByText('+1 Tuần (Dạy bù)');
    fireEvent.click(plusOneBtn);

    // Xem trước phải đổi thành Tuần 3 - Học kỳ I
    expect(screen.getByText(/Tuần 3 - Học kỳ I/)).toBeDefined();
  });
});
