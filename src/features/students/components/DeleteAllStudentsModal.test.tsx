import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteAllStudentsModal } from './DeleteAllStudentsModal';
import { excelParser } from '../utils/excelParser';
import type { Student } from '../../../types/student';

const mockStudents: Student[] = [
  {
    id: 'hs-01',
    code: 'HS01',
    fullName: 'Đỗ Bảo An',
    gender: 'Nam',
    groupName: 'Tổ 1',
    groupColorClass: 'text-rose-500',
    classRole: 'Thành viên',
    boardingType: 'Bán trú',
    points: 10,
    stars: 1,
    classId: 'class-6a6',
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'hs-02',
    code: 'HS02',
    fullName: 'Lê Ngọc Anh',
    gender: 'Nữ',
    groupName: 'Tổ 1',
    groupColorClass: 'text-rose-500',
    classRole: 'Lớp trưởng',
    boardingType: 'Bán trú',
    points: 25,
    stars: 3,
    classId: 'class-6a6',
    createdAt: '2026-09-01T00:00:00Z',
  },
];

describe('DeleteAllStudentsModal Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('không hiển thị khi isOpen = false', () => {
    const { container } = render(
      <DeleteAllStudentsModal
        isOpen={false}
        onClose={() => {}}
        onConfirm={async () => {}}
        students={mockStudents}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('hiển thị đầy đủ số lượng học sinh và nút xóa bị vô hiệu hóa ban đầu', () => {
    render(
      <DeleteAllStudentsModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={async () => {}}
        students={mockStudents}
        className="Lớp 6A6"
      />
    );

    expect(screen.getByText(/Xóa Toàn Bộ Danh Sách Học Sinh/i)).toBeInTheDocument();
    expect(screen.getAllByText(/2 học sinh/i).length).toBeGreaterThanOrEqual(1);

    const deleteBtn = screen.getByRole('button', { name: /XÓA SẠCH 2 HỌC SINH/i });
    expect(deleteBtn).toBeDisabled();
  });

  it('mở khóa nút xóa khi người dùng gõ đúng từ khóa XÓA HẾT', () => {
    render(
      <DeleteAllStudentsModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={async () => {}}
        students={mockStudents}
      />
    );

    const input = screen.getByPlaceholderText(/Gõ XÓA HẾT.../i);
    const deleteBtn = screen.getByRole('button', { name: /XÓA SẠCH 2 HỌC SINH/i });

    // Gõ sai
    fireEvent.change(input, { target: { value: 'xoa' } });
    expect(deleteBtn).toBeDisabled();

    // Gõ đúng không dấu thường
    fireEvent.change(input, { target: { value: 'xoa het' } });
    expect(deleteBtn).not.toBeDisabled();

    // Gõ đúng có dấu
    fireEvent.change(input, { target: { value: 'XÓA HẾT' } });
    expect(deleteBtn).not.toBeDisabled();
  });

  it('gọi hàm sao lưu Excel khi bấm nút Sao lưu Excel', async () => {
    const exportSpy = vi.spyOn(excelParser, 'exportToExcel').mockResolvedValue();

    render(
      <DeleteAllStudentsModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={async () => {}}
        students={mockStudents}
        className="Lớp 6A6"
      />
    );

    const backupBtn = screen.getByRole('button', { name: /Sao lưu Excel/i });
    await act(async () => {
      fireEvent.click(backupBtn);
    });

    expect(exportSpy).toHaveBeenCalledWith(mockStudents, 'Lớp 6A6_SaoLuu_TruocKhiXoa');
    expect(screen.getByText(/Đã tải bản sao lưu Excel thành công/i)).toBeInTheDocument();
  });

  it('thực thi onConfirm và onOpenImport khi người dùng xác nhận xóa', async () => {
    const handleConfirm = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();
    const handleOpenImport = vi.fn();

    render(
      <DeleteAllStudentsModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        students={mockStudents}
        onOpenImport={handleOpenImport}
      />
    );

    const input = screen.getByPlaceholderText(/Gõ XÓA HẾT.../i);
    fireEvent.change(input, { target: { value: 'XÓA HẾT' } });

    const deleteBtn = screen.getByRole('button', { name: /XÓA SẠCH 2 HỌC SINH/i });
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenImport).toHaveBeenCalledTimes(1);
  });

  it('hiển thị cảnh báo giới hạn quyền và không cho xóa khi canDeleteAll = false', () => {
    const handleConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <DeleteAllStudentsModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={handleConfirm}
        students={mockStudents}
        canDeleteAll={false}
      />
    );

    expect(screen.getByText(/Giới Hạn Quyền Thao Tác/i)).toBeInTheDocument();
    expect(screen.getByText(/Chỉ Giáo viên chủ nhiệm chính thức/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Gõ XÓA HẾT.../i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /XÓA SẠCH/i })).not.toBeInTheDocument();
  });
});
