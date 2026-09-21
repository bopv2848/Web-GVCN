import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassroomTimerWidget } from './ClassroomTimerWidget';

describe('ClassroomTimerWidget Component', () => {
  it('không render khi isOpen = false', () => {
    const { container } = render(
      <ClassroomTimerWidget isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('hiển thị đầy đủ mốc thời gian và nút điều khiển khi isOpen = true', () => {
    render(<ClassroomTimerWidget isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Thời Gian Thảo Luận/i)).toBeInTheDocument();
    expect(screen.getByText(/05:00/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bắt Đầu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+1 Phút/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đặt Lại/i })).toBeInTheDocument();

    // Kiểm tra các mốc preset
    expect(screen.getByRole('button', { name: '1 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1P 30S' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '15 Phút' })).toBeInTheDocument();
  });

  it('thay đổi thời gian đếm ngược khi chọn mốc khác', () => {
    render(<ClassroomTimerWidget isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '2 Phút' }));
    expect(screen.getByText('02:00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '1P 30S' }));
    expect(screen.getByText('01:30')).toBeInTheDocument();
  });

  it('gọi onClose khi nhấn nút đóng', () => {
    const handleClose = vi.fn();
    render(<ClassroomTimerWidget isOpen={true} onClose={handleClose} />);

    fireEvent.click(screen.getByTitle('Đóng đồng hồ'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('cho phép chọn nhạc chuông báo hết giờ', () => {
    render(<ClassroomTimerWidget isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Âm báo hết giờ:')).toBeInTheDocument();
    expect(screen.getByText('Chuông trường')).toBeInTheDocument();
    expect(screen.getByText('Tiếng kẻng')).toBeInTheDocument();
    expect(screen.getByText('Vui nhộn')).toBeInTheDocument();
    expect(screen.getByText('Ding-Dong')).toBeInTheDocument();

    const gongButton = screen.getByTitle(/Chọn âm chuông: Tiếng kẻng/i);
    fireEvent.click(gongButton);
    expect(gongButton).toHaveTextContent('✓');
  });

  it('tự động thu gọn khi bấm Bắt Đầu để không che sơ đồ lớp', () => {
    render(<ClassroomTimerWidget isOpen={true} onClose={vi.fn()} />);

    const startBtn = screen.getByRole('button', { name: /Bắt Đầu/i });
    fireEvent.click(startBtn);

    // Bảng lớn biến mất, hiển thị thanh mini với nút Mở rộng và Tạm dừng
    expect(screen.queryByText(/CHỌN NHANH MỐC THỜI GIAN/i)).not.toBeInTheDocument();
    expect(screen.getByTitle('Mở rộng bảng cài đặt đồng hồ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⏸ Tạm dừng/i })).toBeInTheDocument();

    // Bấm nút mở rộng thì bảng lớn hiển thị trở lại
    fireEvent.click(screen.getByTitle('Mở rộng bảng cài đặt đồng hồ'));
    expect(screen.getByText(/CHỌN NHANH MỐC THỜI GIAN/i)).toBeInTheDocument();
  });

  it('hỗ trợ tay nắm kéo di chuyển vị trí mini timer (draggable)', () => {
    render(<ClassroomTimerWidget isOpen={true} onClose={vi.fn()} />);

    const startBtn = screen.getByRole('button', { name: /Bắt Đầu/i });
    fireEvent.click(startBtn);

    // Kiểm tra có tay nắm kéo di chuyển
    const dragHandle = screen.getByTitle(/kéo di chuyển đồng hồ/i);
    expect(dragHandle).toBeInTheDocument();
  });
});
