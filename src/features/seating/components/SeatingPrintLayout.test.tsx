import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeatingPrintLayout } from './SeatingPrintLayout';
import type { SeatAssignmentWithStudent } from '../../../types/seating';

describe('SeatingPrintLayout Component', () => {
  const mockAisles = [
    { name: '4', pairIndex: 3, cols: [6, 7], subTitle: 'Cửa sổ' },
    { name: '3', pairIndex: 2, cols: [4, 5], subTitle: 'Giữa trái' },
    { name: '2', pairIndex: 1, cols: [2, 3], subTitle: 'Giữa phải' },
    { name: '1', pairIndex: 0, cols: [0, 1], subTitle: 'Hành lang' },
  ];

  const mockAssignmentGrid = new Map<string, SeatAssignmentWithStudent>();
  mockAssignmentGrid.set('0_6', {
    id: 'seat-1',
    layoutId: 'layout-1',
    studentId: 'student-1',
    rowIndex: 0,
    colIndex: 6,
    isHidden: false,
    student: {
      id: 'student-1',
      classId: 'class-6a6',
      fullName: 'Phan Minh Khang',
      gender: 'Nam',
      classRole: 'Lớp trưởng',
      points: 100,
      stars: 5,
      groupName: 'Tổ 4',
      groupColorClass: 'text-amber-500',
    },
  });

  it('hiển thị đầy đủ thông tin tiêu đề trường, lớp và bản in', () => {
    render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="LỚP 6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
      />
    );

    expect(screen.getByText('TRƯỜNG THCS TÂN HẢI')).toBeInTheDocument();
    expect(screen.getByText('LỚP 6A6')).toBeInTheDocument();
    expect(screen.getByText('SƠ ĐỒ CHỖ NGỒI HỌC SINH')).toBeInTheDocument();
    expect(screen.getByText(/GVCN: Thầy Phan Văn Bộ/i)).toBeInTheDocument();
    expect(screen.getByText('🗺️ PHÒNG HỌC LỚP 6A6')).toBeInTheDocument();
  });

  it('hiển thị đầy đủ cả 4 dãy bàn học và tất cả 6 hàng bàn học', () => {
    render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
      />
    );

    // Kiểm tra 4 dãy
    expect(screen.getByText('DÃY 4')).toBeInTheDocument();
    expect(screen.getByText('DÃY 3')).toBeInTheDocument();
    expect(screen.getByText('DÃY 2')).toBeInTheDocument();
    expect(screen.getByText('DÃY 1')).toBeInTheDocument();

    // Kiểm tra học sinh được xếp chỗ (2 dòng: họ Phan và tên Minh Khang)
    expect(screen.getByText('Phan')).toBeInTheDocument();
    expect(screen.getByText('Minh Khang')).toBeInTheDocument();
    expect(screen.getByText('LT')).toBeInTheDocument();

    // Kiểm tra Bàn Giáo Viên & Bảng Lớp Học
    expect(screen.getByText('Bàn Giáo Viên')).toBeInTheDocument();
    expect(screen.getByText(/BẢNG LỚP HỌC/i)).toBeInTheDocument();
  });

  it('áp dụng chính xác tiêu đề hành chính tùy biến khi truyền customHeader', () => {
    render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
        customHeader={{
          schoolName: 'TRƯỜNG THCS TÂN HẢI - NĂM HỌC 2025-2026',
          className: 'LỚP 6A6 CHỌN',
          title: 'SƠ ĐỒ BÀN HỌC CHÍNH THỨC',
          teacherName: 'Cô Nguyễn Thị Mai',
          academicYear: '2025 - 2026',
          appliedDate: '15/09/2025',
          modeNote: 'Ban hành theo Quyết định số 12/QĐ-THCS',
        }}
      />
    );

    expect(screen.getByText('TRƯỜNG THCS TÂN HẢI - NĂM HỌC 2025-2026')).toBeInTheDocument();
    expect(screen.getByText('LỚP 6A6 CHỌN')).toBeInTheDocument();
    expect(screen.getByText('SƠ ĐỒ BÀN HỌC CHÍNH THỨC')).toBeInTheDocument();
    expect(screen.getByText(/Cô Nguyễn Thị Mai/i)).toBeInTheDocument();
    expect(screen.getByText(/2025 - 2026/i)).toBeInTheDocument();
    expect(screen.getByText('Ban hành theo Quyết định số 12/QĐ-THCS')).toBeInTheDocument();
    expect(screen.getByText(/Ngày lập: 15\/09\/2025/i)).toBeInTheDocument();
  });

  it('hiển thị định dạng đen trắng siêu tương phản khi colorMode là monochrome', () => {
    render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
        customHeader={{
          colorMode: 'monochrome',
        }}
      />
    );

    // Học sinh và huy hiệu vẫn hiển thị đầy đủ (2 dòng: Phan và Minh Khang)
    expect(screen.getByText('Phan')).toBeInTheDocument();
    expect(screen.getByText('Minh Khang')).toBeInTheDocument();
    const badge = screen.getByText('LT');
    expect(badge).toBeInTheDocument();
    // Huy hiệu lớp trưởng ở chế độ monochrome có class nền đen chữ trắng tương phản cao
    expect(badge.parentElement).toHaveClass('bg-black');
    expect(badge.parentElement).toHaveClass('text-white');
  });

  it('áp dụng phông chữ Times New Roman, cỡ chữ 14 và cho phép xuống dòng họ tên học sinh', () => {
    render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
      />
    );

    const firstNameEl = screen.getByText('Phan');
    const lastNameEl = screen.getByText('Minh Khang');
    expect(firstNameEl).toBeInTheDocument();
    expect(lastNameEl).toBeInTheDocument();
    // Phông chữ Times New Roman và cỡ chữ 14 trên container
    const containerEl = lastNameEl.parentElement;
    expect(containerEl?.style.fontFamily).toContain('Times New Roman');
    expect(containerEl?.style.fontSize).toBe('14px');

    // Layout tổng thể cũng sử dụng phông Times New Roman
    const rootLayout = document.getElementById('seating-print-layout');
    expect(rootLayout?.style.fontFamily).toContain('Times New Roman');
  });

  it('hỗ trợ tùy chọn cỡ chữ 12pt và viết hoa toàn bộ họ tên học sinh', () => {
    render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
        customHeader={{
          fontSize: 12,
          nameCase: 'uppercase',
        }}
      />
    );

    // Tên được chuyển thành VIẾT HOA và chia 2 dòng
    const firstNameEl = screen.getByText('PHAN');
    const lastNameEl = screen.getByText('MINH KHANG');
    expect(firstNameEl).toBeInTheDocument();
    expect(lastNameEl).toBeInTheDocument();
    // Cỡ chữ 12px
    expect(lastNameEl.parentElement?.style.fontSize).toBe('12px');
  });

  it('tự động co nhỏ 1 cỡ chữ cho học sinh có tên dài quá 4 từ khi bật autoFitLongNames', () => {
    const longNameGrid = new Map(mockAssignmentGrid);
    longNameGrid.set('0_6', {
      id: 'seat-1',
      layoutId: 'layout-1',
      studentId: 'student-1',
      rowIndex: 0,
      colIndex: 6,
      isHidden: false,
      student: {
        id: 'student-1',
        classId: 'class-6a6',
        fullName: 'Nguyễn Thị Ngọc Ánh Tuyết', // 5 từ (> 4 từ)
        gender: 'Nữ',
        classRole: 'Học sinh',
        points: 100,
        stars: 5,
        groupName: 'Tổ 4',
        groupColorClass: 'text-amber-500',
      },
    });

    render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={longNameGrid}
        customHeader={{
          fontSize: 14,
          autoFitLongNames: true,
        }}
      />
    );

    const firstNameEl = screen.getByText('Nguyễn Thị Ngọc');
    const lastNameEl = screen.getByText('Ánh Tuyết');
    expect(firstNameEl).toBeInTheDocument();
    expect(lastNameEl).toBeInTheDocument();
    // Tự động co từ 14px xuống 13px trên container
    expect(lastNameEl.parentElement?.style.fontSize).toBe('13px');
  });

  it('hiển thị Sĩ số tự động tính toán hoặc theo props truyền vào', () => {
    render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
        totalStudentsCount={42}
        femaleStudentsCount={22}
      />
    );

    expect(screen.getByText('(Sĩ số: 42/Nữ: 22)')).toBeInTheDocument();
  });

  it('cho phép ẩn Sĩ số hoặc hiển thị nội dung tùy chỉnh', () => {
    const { rerender } = render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
        customHeader={{
          showClassSize: false,
        }}
      />
    );

    expect(screen.queryByText(/Sĩ số:/i)).not.toBeInTheDocument();

    // Rerender với nội dung tùy chỉnh
    rerender(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
        customHeader={{
          showClassSize: true,
          classSizeText: '(Sĩ số: 42/nữ)',
        }}
      />
    );

    expect(screen.getByText('(Sĩ số: 42/nữ)')).toBeInTheDocument();
  });

  it('hiển thị Mũi tên Cửa Ra Vào khi showDoorArrow là true và ẩn khi là false', () => {
    const { rerender } = render(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
        elementsConfig={{
          doorPosition: 'right',
          doorAngle: 180,
          teacherDeskPosition: 'right',
        }}
        customHeader={{
          showDoorArrow: true,
        }}
      />
    );

    expect(screen.getByText('Cửa ra vào')).toBeInTheDocument();

    // Khi tắt showDoorArrow: false
    rerender(
      <SeatingPrintLayout
        schoolName="TRƯỜNG THCS TÂN HẢI"
        className="6A6"
        isRotationEnabled={false}
        activeWeekMode="odd"
        schoolWeekInfo={{ weekNumber: 1, mode: 'odd' }}
        totalRows={6}
        aisles={mockAisles}
        assignmentGrid={mockAssignmentGrid}
        elementsConfig={{
          doorPosition: 'right',
          doorAngle: 180,
          teacherDeskPosition: 'right',
        }}
        customHeader={{
          showDoorArrow: false,
        }}
      />
    );

    expect(screen.queryByText('Cửa ra vào')).not.toBeInTheDocument();
  });
});
