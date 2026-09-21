import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresentationSidePanel, type SpinHistoryItem } from './PresentationSidePanel';

describe('PresentationSidePanel Component', () => {
  const mockHistory: SpinHistoryItem[] = [
    {
      id: 'spin-1',
      studentId: 'hs-1',
      studentName: 'Trần Minh Tâm',
      groupName: 'Tổ 1',
      aisleName: 'TỔ 1',
      deskNumber: 2,
      time: '08:15',
      awardedPoints: 5,
    },
  ];

  it('không render khi isOpen = false', () => {
    const { container } = render(
      <PresentationSidePanel
        isOpen={false}
        spinHistory={mockHistory}
        onClearHistory={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('hiển thị đầy đủ ghi chú và danh sách học sinh đã bốc thăm khi isOpen = true', () => {
    render(
      <PresentationSidePanel
        isOpen={true}
        classNameTitle="Lớp 6A6"
        spinHistory={mockHistory}
        onClearHistory={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Bảng Tiện Ích Sinh Hoạt')).toBeInTheDocument();
    expect(screen.getByText(/Lớp 6A6 • Trực Tiếp/i)).toBeInTheDocument();
    expect(screen.getByText(/Dặn dò & Nội dung tiết sinh hoạt:/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã Bốc Thăm \(1\):/i)).toBeInTheDocument();
    expect(screen.getByText('Trần Minh Tâm')).toBeInTheDocument();
    expect(screen.getByText('+5đ')).toBeInTheDocument();
  });

  it('thu hẹp độ rộng sang bên phải để hạn chế chiếm diện tích sơ đồ', () => {
    render(
      <PresentationSidePanel
        isOpen={true}
        spinHistory={[]}
        onClearHistory={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const panel = screen.getByLabelText('Bảng tiện ích tiết sinh hoạt lớp');
    expect(panel).toHaveClass('w-64');
  });

  it('gọi onClose khi nhấn nút đóng', () => {
    const handleClose = vi.fn();
    render(
      <PresentationSidePanel
        isOpen={true}
        spinHistory={[]}
        onClearHistory={vi.fn()}
        onClose={handleClose}
      />
    );

    fireEvent.click(screen.getByTitle('Thu gọn bảng tiện ích'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi onClearHistory khi nhấn Làm mới vòng', () => {
    const handleClear = vi.fn();
    render(
      <PresentationSidePanel
        isOpen={true}
        spinHistory={mockHistory}
        onClearHistory={handleClear}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Làm mới vòng/i }));
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('cho phép chèn mẫu ghi chú gợi ý', () => {
    render(
      <PresentationSidePanel
        isOpen={true}
        spinHistory={[]}
        onClearHistory={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Mẫu gợi ý:')).toBeInTheDocument();
    expect(screen.getByText('Thi đua tuần')).toBeInTheDocument();
    expect(screen.getByText('Sinh hoạt Đội')).toBeInTheDocument();
    expect(screen.getByText('Ôn thi & Kiểm tra')).toBeInTheDocument();

    const templateBtn = screen.getByRole('button', { name: /Thi đua tuần/i });
    fireEvent.click(templateBtn);

    const textarea = screen.getByPlaceholderText(/Nhận xét nề nếp tuần qua/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Đánh giá nề nếp & chuyên cần tuần qua');
  });

  it('cho phép Thầy lưu mẫu riêng tùy chỉnh và xóa mẫu riêng', () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Mẫu Dặn Dò Riêng 6A6');
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <PresentationSidePanel
        isOpen={true}
        classId="class-test-custom"
        spinHistory={[]}
        onClearHistory={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText(/Nhận xét nề nếp tuần qua/i);
    fireEvent.change(textarea, { target: { value: 'Nội dung dặn dò riêng của Thầy' } });

    const saveCustomBtn = screen.getByRole('button', { name: /💾 Lưu Mẫu Riêng/i });
    expect(saveCustomBtn).toBeInTheDocument();

    fireEvent.click(saveCustomBtn);

    // Mẫu riêng đã được thêm vào danh sách mẫu của Thầy
    expect(screen.getByText('Mẫu Dặn Dò Riêng 6A6')).toBeInTheDocument();

    // Nút xóa mẫu riêng (✕)
    const deleteBtn = screen.getByTitle('Xóa mẫu riêng này');
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);

    // Mẫu đã bị xóa khỏi danh sách
    expect(screen.queryByText('Mẫu Dặn Dò Riêng 6A6')).not.toBeInTheDocument();
  });

  it('hiển thị huy hiệu nhiệm vụ đã gán (assignedTask) trong danh sách bốc thăm', () => {
    const historyWithTask: SpinHistoryItem[] = [
      {
        ...mockHistory[0],
        assignedTask: 'Cặp đối thoại A-B',
      },
    ];

    render(
      <PresentationSidePanel
        isOpen={true}
        spinHistory={historyWithTask}
        onClearHistory={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Cặp đối thoại A-B')).toBeInTheDocument();
  });
});
