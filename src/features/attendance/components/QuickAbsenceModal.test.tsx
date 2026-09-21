import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickAbsenceModal } from './QuickAbsenceModal';
import { attendanceService } from '../services/attendanceService';

vi.mock('../services/attendanceService', () => ({
  attendanceService: {
    quickRecordAbsence: vi.fn().mockResolvedValue(true),
    cancelQuickAbsence: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../../students/services/studentService', () => ({
  studentService: {
    getStudents: vi.fn().mockResolvedValue([
      { id: 'st-1', fullName: 'Đỗ Bảo An', groupName: 'Tổ 1', code: 'HS01', gender: 'Nam' },
      { id: 'st-2', fullName: 'Lê Ngọc Anh', groupName: 'Tổ 1', code: 'HS02', gender: 'Nữ' },
      { id: 'st-3', fullName: 'Trần Minh Tâm', groupName: 'Tổ 2', code: 'HS03', gender: 'Nam' },
    ]),
  },
}));

describe('QuickAbsenceModal Component Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    className: 'Lớp 6A6',
    currentPeriod: 3,
    sessionName: 'Sáng',
    absentStudents: [
      { id: 'st-3', name: 'Trần Minh Tâm', reason: 'Đau bụng (xuống Y tế)' },
    ],
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('không hiển thị khi isOpen = false', () => {
    const { container } = render(<QuickAbsenceModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hiển thị tiêu đề, thông tin buổi và tiết học hiện tại', async () => {
    render(<QuickAbsenceModal {...defaultProps} />);

    expect(screen.getByText(/Ghi Nhận Vắng Nhanh Cho Tiết Này/i)).toBeInTheDocument();
    expect(screen.getByText(/Buổi Sáng/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiết 3 hiện tại/i)).toBeInTheDocument();
  });

  it('tải danh sách học sinh và cho phép tìm kiếm theo tên', async () => {
    render(<QuickAbsenceModal {...defaultProps} />);

    // Chờ tải xong học sinh
    await waitFor(() => {
      expect(screen.getByText('Đỗ Bảo An')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Gõ tên hoặc số thứ tự/i);
    fireEvent.change(searchInput, { target: { value: 'Ngọc Anh' } });

    expect(screen.getByText('Lê Ngọc Anh')).toBeInTheDocument();
    expect(screen.queryByText('Đỗ Bảo An')).not.toBeInTheDocument();
  });

  it('gọi quickRecordAbsence khi chọn học sinh và nhấn xác nhận ghi nhận', async () => {
    render(<QuickAbsenceModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Đỗ Bảo An')).toBeInTheDocument();
    });

    // 1. Chọn học sinh
    fireEvent.click(screen.getByText('Đỗ Bảo An'));

    // 2. Nhấn nút Ghi Nhận Vắng Ngay
    const submitBtn = screen.getByRole('button', { name: /Ghi Nhận Vắng Ngay/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(attendanceService.quickRecordAbsence).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 'st-1',
          startPeriod: 3,
        })
      );
    });

    // Thông báo thành công hiển thị
    expect(screen.getByText(/Đã ghi nhận vắng em Đỗ Bảo An/i)).toBeInTheDocument();
  });

  it('hiển thị danh sách học sinh đang vắng và cho phép bấm "Quay lại lớp" (1-chạm)', async () => {
    render(<QuickAbsenceModal {...defaultProps} />);

    // Học sinh đang vắng là Trần Minh Tâm
    expect(screen.getByText('Trần Minh Tâm')).toBeInTheDocument();
    expect(screen.getByText(/Đau bụng \(xuống Y tế\)/i)).toBeInTheDocument();

    const returnBtn = screen.getByRole('button', { name: /Quay lại lớp/i });
    expect(returnBtn).toBeInTheDocument();

    fireEvent.click(returnBtn);

    await waitFor(() => {
      expect(attendanceService.cancelQuickAbsence).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 'st-3',
        })
      );
    });

    expect(screen.getByText(/Đã khôi phục hiện diện cho em Trần Minh Tâm/i)).toBeInTheDocument();
  });
});
