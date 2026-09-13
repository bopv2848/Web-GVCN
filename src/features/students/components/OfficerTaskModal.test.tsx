import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfficerTaskModal } from './OfficerTaskModal';
import type { Student } from '../../../types/student';

const mockStudent: Student = {
  id: 'hs-test-01',
  code: 'HS01',
  fullName: 'Phan Minh Khang',
  gender: 'Nam',
  groupName: 'Tổ 1',
  groupColorClass: 'bg-rose-500',
  classRole: 'Lớp trưởng',
  boardingType: 'Bán trú',
  points: 120,
  stars: 15,
  classId: 'class-6a6',
  createdAt: '2026-09-01T00:00:00Z',
};

describe('OfficerTaskModal Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('không hiển thị gì nếu modal đóng hoặc student là null', () => {
    const { container } = render(
      <OfficerTaskModal isOpen={false} onClose={() => {}} student={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('hiển thị đầy đủ thông tin nhiệm vụ và hỗ trợ sao chép Zalo', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const handleClose = vi.fn();

    render(
      <OfficerTaskModal
        isOpen={true}
        onClose={handleClose}
        student={mockStudent}
      />
    );

    expect(screen.getByText('Phan Minh Khang')).toBeInTheDocument();
    expect(screen.getByText(/Sổ Tay Tự Quản & Phân Công Nhiệm Vụ 6A6/i)).toBeInTheDocument();
    expect(screen.getByText(/Trọng tâm tuần này:/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /Sao chép lời dặn gửi Zalo/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock.mock.calls[0][0]).toContain('Phan Minh Khang');
    expect(writeTextMock.mock.calls[0][0]).toContain('Lớp trưởng');
    expect(writeTextMock.mock.calls[0][0]).toContain('GVCN: Thầy Phan Văn Bộ');
  });

  it('hỗ trợ Thầy thêm ghi chú riêng và chèn vào tin nhắn Zalo', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <OfficerTaskModal
        isOpen={true}
        onClose={() => {}}
        student={mockStudent}
      />
    );

    // Gõ ghi chú riêng
    const noteInput = screen.getByPlaceholderText(/Dặn riêng em mang theo sổ ghi chép/i);
    fireEvent.change(noteInput, {
      target: { value: 'Dặn riêng em Khang mang theo sổ ghi chép nề nếp' },
    });

    // Bấm sao chép
    const copyBtn = screen.getByRole('button', { name: /Sao chép lời dặn gửi Zalo/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock.mock.calls[0][0]).toContain('📌 Lời dặn riêng của Thầy: Dặn riêng em Khang mang theo sổ ghi chép nề nếp');
  });

  it('cho phép Thầy bấm nút "Chỉnh sửa nội dung" để sửa toàn văn tin nhắn và khôi phục mẫu gốc', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <OfficerTaskModal
        isOpen={true}
        onClose={() => {}}
        student={mockStudent}
      />
    );

    // Bấm nút "✏️ Chỉnh sửa nội dung"
    const editBtn = screen.getByRole('button', { name: /Chỉnh sửa nội dung/i });
    fireEvent.click(editBtn);

    // Đã chuyển sang chế độ soạn thảo
    const textarea = screen.getByLabelText(/Nội dung lời dặn gửi Zalo/i);
    expect(textarea).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xem cẩm nang/i })).toBeInTheDocument();

    // Thầy sửa nội dung trực tiếp
    fireEvent.change(textarea, {
      target: { value: 'Nội dung dặn dò tùy chỉnh đặc biệt của Thầy Phan Văn Bộ' },
    });

    // Bấm sao chép nội dung đã sửa
    const copyBtn = screen.getByRole('button', { name: /Sao chép lời dặn gửi Zalo/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock.mock.calls[0][0]).toBe('Nội dung dặn dò tùy chỉnh đặc biệt của Thầy Phan Văn Bộ');

    // Bấm "Khôi phục mẫu gốc"
    const resetBtn = screen.getByRole('button', { name: /Khôi phục mẫu gốc/i });
    fireEvent.click(resetBtn);

    expect(textarea).not.toHaveValue('Nội dung dặn dò tùy chỉnh đặc biệt của Thầy Phan Văn Bộ');
  });
});
