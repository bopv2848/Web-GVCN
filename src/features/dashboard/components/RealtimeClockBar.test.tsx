import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { RealtimeClockBar } from './RealtimeClockBar';

describe('RealtimeClockBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Khởi tạo thời gian cố định: Thứ Hai, 14/09/2026 16:30:00 (Tuần 2 - Học kỳ I)
    const mockDate = new Date(2026, 8, 14, 16, 30, 0); // Tháng 9 là index 8
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hiển thị chuẩn xác thứ, ngày, tháng, năm bằng tiếng Việt', () => {
    render(<RealtimeClockBar />);
    expect(screen.getByText(/Thứ Hai, ngày 14 tháng 09 năm 2026/)).toBeDefined();
  });

  it('tự động hiển thị huy hiệu tuần học hiện tại trong năm học (Tuần 2 - Học kỳ I)', () => {
    render(<RealtimeClockBar />);
    expect(screen.getByText('Tuần 2 - Học kỳ I')).toBeDefined();
  });

  it('hiển thị đồng hồ thời gian thực và cập nhật từng giây', () => {
    render(<RealtimeClockBar />);
    expect(screen.getByText(/16:30:00/)).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/16:30:01/)).toBeDefined();
  });
});
