import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Classroom3DScene } from './Classroom3DScene';
import type { SeatingMedicalAnalysis } from '../../../types/seating';

// Mock hook useRealtimeAttendanceStats để test hiển thị số liệu SS, HD, V
vi.mock('../../attendance/hooks/useRealtimeAttendanceStats', () => ({
  useRealtimeAttendanceStats: vi.fn(() => ({
    total: 47,
    present: 47,
    absent: 0,
    excused: 0,
    unexcused: 0,
    isLoading: false,
    lastUpdated: new Date(),
  })),
}));

describe('Classroom3DScene Real-time Attendance & Date Tests', () => {
  const defaultMedicalAnalysis: SeatingMedicalAnalysis = {
    totalSickInSeats: 0,
    clusters: [],
    sickStudentIds: new Set(),
    atRiskNeighborStudentIds: new Set(),
  };

  const defaultProps = {
    schoolName: 'TRƯỜNG THCS TÂN HẢI',
    className: 'LỚP 6A6',
    totalRows: 5,
    aisles: [
      { name: '1', pairIndex: 0, cols: [0, 1], subTitle: 'Dãy 1 (Cửa sổ)' },
      { name: '2', pairIndex: 1, cols: [2, 3], subTitle: 'Dãy 2' },
    ],
    assignmentGrid: new Map(),
    medicalAnalysis: defaultMedicalAnalysis,
    clusterDeskKeys: new Set<string>(),
    sickReasonMap: new Map<string, string>(),
    isMedicalMode: false,
    selectedSourceSeat: null,
    draggedSeat: null,
    dragOverPos: null,
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    onSeatClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('xóa hoàn toàn dòng chữ cũ "BẢNG LỚP HỌC CHÍNH (6A6)" khỏi bảng lớp', () => {
    render(<Classroom3DScene {...defaultProps} />);

    // Phải không còn dòng chữ BẢNG LỚP HỌC CHÍNH
    expect(screen.queryByText(/BẢNG LỚP HỌC CHÍNH/i)).not.toBeInTheDocument();
  });

  it('hiển thị khung điểm danh theo thời gian thực gồm SS (sĩ số), HD (hiện diện), V (vắng)', () => {
    render(<Classroom3DScene {...defaultProps} />);

    // Có tiêu đề điểm danh
    expect(screen.getByText(/Điểm danh/i)).toBeInTheDocument();

    // Có các nhãn SS:, HD:, V:
    expect(screen.getByText('SS:')).toBeInTheDocument();
    expect(screen.getByText('HD:')).toBeInTheDocument();
    expect(screen.getByText('V:')).toBeInTheDocument();

    // Số liệu sĩ số 47, hiện diện 47, vắng 0
    const numbers47 = screen.getAllByText('47');
    expect(numbers47.length).toBeGreaterThanOrEqual(2); // Cả SS và HD đều là 47
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('bổ sung thứ, ngày tháng năm theo thời gian thực ở góc trên bên phải bảng', () => {
    render(<Classroom3DScene {...defaultProps} />);

    // Góc trên bên phải phải có thông tin thứ tiếng Việt (Thứ...)
    const dateElements = screen.getAllByText(/Thứ|Chủ Nhật/i);
    expect(dateElements.length).toBeGreaterThan(0);

    // Có năm hiện tại trong tiêu đề ngày
    const currentYear = String(new Date().getFullYear());
    const yearElements = screen.getAllByText(new RegExp(currentYear));
    expect(yearElements.length).toBeGreaterThan(0);
  });

  it('xóa bỏ hoàn toàn dòng chữ cũ "TRƯỜNG THCS TÂN HẢI • PHÒNG HỌC LỚP 6A6" và GVCN khỏi giữa bảng', () => {
    render(<Classroom3DScene {...defaultProps} />);

    expect(
      screen.queryByText(/TRƯỜNG THCS TÂN HẢI • PHÒNG HỌC LỚP/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/GVCN: Thầy Phan Văn Bộ • Năm học:/i)
    ).not.toBeInTheDocument();
  });

  it('hiển thị môn học theo TKB thực tế hoặc Giờ ra chơi / Nghỉ ở giữa bảng', () => {
    render(<Classroom3DScene {...defaultProps} />);

    // Phải hiển thị một trong các trạng thái hợp lệ: Tiết ... Môn ... HOẶC Giờ ra chơi HOẶC Nghỉ
    const lessonElements = screen.queryAllByText(/Tiết \d+: Môn/i);
    const recessElements = screen.queryAllByText(/GIỜ RA CHƠI/i);
    const offElements = screen.queryAllByText(/NGHỈ/i);

    expect(
      lessonElements.length > 0 || recessElements.length > 0 || offElements.length > 0
    ).toBe(true);
  });

  it('hiển thị các nút thử nghiệm xem trước gồm Tiết 1, Ra chơi, Tiết 3, Tiết 6 (Chiều)', () => {
    render(<Classroom3DScene {...defaultProps} />);

    expect(screen.getByText('Tiết 1')).toBeInTheDocument();
    expect(screen.getByText('Ra chơi')).toBeInTheDocument();
    expect(screen.getByText('Tiết 3')).toBeInTheDocument();
    expect(screen.getByText('Tiết 6 (Chiều)')).toBeInTheDocument();
    expect(screen.getByText('Nghỉ')).toBeInTheDocument();
  });

  it('hiển thị huy hiệu đếm ngược thời gian khi xem trước tiết học và giờ ra chơi', () => {
    render(<Classroom3DScene {...defaultProps} />);

    // Nhấn xem trước Tiết 1
    fireEvent.click(screen.getByText('Tiết 1'));
    expect(screen.getByText(/Còn 15 phút là hết tiết/i)).toBeInTheDocument();

    // Nhấn xem trước Ra chơi
    fireEvent.click(screen.getByText('Ra chơi'));
    expect(screen.getByText(/Còn 8 phút vào lớp/i)).toBeInTheDocument();
  });

  it('mở hộp thoại Ghi nhận vắng nhanh 1-chạm khi bấm vào ô số V trên bảng', () => {
    render(<Classroom3DScene {...defaultProps} />);

    // Bấm vào ô số V
    const vRow = screen.getByTitle(/Chạm trực tiếp vào ô số V để ghi nhận vắng nhanh/i);
    fireEvent.click(vRow);

    // Modal vắng nhanh xuất hiện
    expect(screen.getByText(/Ghi Nhận Vắng Nhanh Cho Tiết Này/i)).toBeInTheDocument();
  });

  it('hiển thị hiệu ứng và huy hiệu "Đang Chọn" trên bàn 3D khi nhận highlightedSeatKey', () => {
    const gridWithStudent = new Map();
    gridWithStudent.set('0_0', {
      id: 'assign-1',
      studentId: 'st-1',
      classId: 'class-6a6',
      rowIndex: 0,
      colIndex: 0,
      student: {
        id: 'st-1',
        fullName: 'Nguyễn Văn An',
        gender: 'Nam',
        classRole: 'Lớp trưởng',
        groupName: 'Tổ 1',
      },
    });

    render(
      <Classroom3DScene
        {...defaultProps}
        assignmentGrid={gridWithStudent}
        highlightedSeatKey="0_0"
      />
    );

    expect(screen.getByText(/Đang Chọn/i)).toBeInTheDocument();
  });

  it('hiển thị hiệu ứng vinh danh và huy hiệu "Trúng Thưởng" trên bàn 3D khi nhận winnerSeatKey', () => {
    const gridWithStudent = new Map();
    gridWithStudent.set('0_0', {
      id: 'assign-1',
      studentId: 'st-1',
      classId: 'class-6a6',
      rowIndex: 0,
      colIndex: 0,
      student: {
        id: 'st-1',
        fullName: 'Nguyễn Văn An',
        gender: 'Nam',
        classRole: 'Lớp trưởng',
        groupName: 'Tổ 1',
      },
    });

    render(
      <Classroom3DScene
        {...defaultProps}
        assignmentGrid={gridWithStudent}
        winnerSeatKey="0_0"
      />
    );

    expect(screen.getAllByText(/Trúng Thưởng/i).length).toBeGreaterThanOrEqual(1);
  });

  it('gọi onResetView khi bấm nút Toàn Cảnh', () => {
    const handleReset = vi.fn();
    render(<Classroom3DScene {...defaultProps} onResetView={handleReset} />);

    const resetBtn = screen.getByRole('button', { name: /Toàn Cảnh/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
