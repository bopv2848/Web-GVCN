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
});
