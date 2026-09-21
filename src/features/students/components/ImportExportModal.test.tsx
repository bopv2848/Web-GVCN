import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportExportModal } from './ImportExportModal';
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
];

describe('ImportExportModal - Phân quyền RBAC', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ẨN nút xóa tất cả khi canDeleteAll = false (giáo viên bộ môn, cán sự)', () => {
    render(
      <ImportExportModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        students={mockStudents}
        classId="class-6a6"
        onOpenDeleteAll={() => {}}
        canDeleteAll={false}
      />
    );

    // Không được thấy nút xóa toàn bộ học sinh
    expect(screen.queryByText(/Xóa toàn bộ 1 học sinh hiện tại để nạp mới/i)).not.toBeInTheDocument();
  });

  it('HIỂN THỊ nút xóa tất cả khi canDeleteAll = true (GVCN / Admin)', () => {
    const handleOpenDelete = vi.fn();
    const handleClose = vi.fn();

    render(
      <ImportExportModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={() => {}}
        students={mockStudents}
        classId="class-6a6"
        onOpenDeleteAll={handleOpenDelete}
        canDeleteAll={true}
      />
    );

    const deleteLink = screen.getByText(/Xóa toàn bộ 1 học sinh hiện tại để nạp mới/i);
    expect(deleteLink).toBeInTheDocument();

    fireEvent.click(deleteLink);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenDelete).toHaveBeenCalledTimes(1);
  });

  it('ẨN checkbox "Xóa sạch toàn bộ học sinh cũ trước khi nạp" khi canDeleteAll = false kể cả khi đã nạp file preview', async () => {
    vi.spyOn(excelParser, 'parseFile').mockResolvedValue({
      validRows: [{ fullName: 'Trần Văn Mới', gender: 'Nam' }],
      invalidRows: [],
      headers: ['STT', 'Họ và tên', 'Giới tính'],
    });

    render(
      <ImportExportModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        students={mockStudents}
        classId="class-6a6"
        canDeleteAll={false}
      />
    );

    const input = screen.getByLabelText(/Bấm vào đây để chọn tệp/i);
    const mockFile = new File(['dummy'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [mockFile] } });
    });

    expect(screen.getByText(/Phát hiện/i)).toBeInTheDocument();
    // Checkbox không xuất hiện vì canDeleteAll = false
    expect(screen.queryByText(/Xóa sạch toàn bộ 1 học sinh cũ trước khi nạp/i)).not.toBeInTheDocument();
  });

  it('HIỆN checkbox "Xóa sạch toàn bộ học sinh cũ trước khi nạp" khi canDeleteAll = true', async () => {
    vi.spyOn(excelParser, 'parseFile').mockResolvedValue({
      validRows: [{ fullName: 'Trần Văn Mới', gender: 'Nam' }],
      invalidRows: [],
      headers: ['STT', 'Họ và tên', 'Giới tính'],
    });

    render(
      <ImportExportModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        students={mockStudents}
        classId="class-6a6"
        canDeleteAll={true}
      />
    );

    const input = screen.getByLabelText(/Bấm vào đây để chọn tệp/i);
    const mockFile = new File(['dummy'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [mockFile] } });
    });

    expect(screen.getByText(/Xóa sạch toàn bộ 1 học sinh cũ trước khi nạp/i)).toBeInTheDocument();
  });
});
