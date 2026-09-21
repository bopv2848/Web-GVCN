import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeskCell } from './DeskCell';
import type { Student } from '../../../types/student';

describe('DeskCell Component', () => {
  const mockStudent: Student = {
    id: 'hs-1',
    classId: 'class-6a6',
    fullName: 'Phan Minh Khang',
    gender: 'Nam',
    classRole: 'Lớp phó',
    points: 100,
    stars: 5,
    groupName: 'Tổ 1',
    groupColorClass: 'text-primary',
  };

  it('hiển thị ghế trống khi không có học sinh', () => {
    render(
      <DeskCell
        rowIndex={0}
        colIndex={0}
        isMedicalMode={false}
      />
    );

    expect(screen.getByText(/Ghế trống/i)).toBeInTheDocument();
  });

  it('hiển thị thông tin học sinh và cho phép kéo thả draggable', () => {
    const handleClick = vi.fn();
    render(
      <DeskCell
        student={mockStudent}
        rowIndex={0}
        colIndex={0}
        isMedicalMode={false}
        onClick={handleClick}
      />
    );

    const studentEl = screen.getByText('Minh Khang');
    expect(studentEl).toBeInTheDocument();
    expect(screen.getByText('Phan')).toBeInTheDocument();
    expect(screen.getByText('LP')).toBeInTheDocument();
    expect(screen.getByTitle('Ban cán sự: Lớp phó')).toBeInTheDocument();
    expect(screen.getByTitle('Tổ 1 (Màu Xanh dương)')).toBeInTheDocument();

    // Click ghế
    fireEvent.click(studentEl);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('hiển thị trạng thái đang chọn đổi chỗ (isSelectedForSwap)', () => {
    render(
      <DeskCell
        student={mockStudent}
        rowIndex={0}
        colIndex={0}
        isMedicalMode={false}
        isSelectedForSwap={true}
      />
    );

    expect(screen.getByText(/Chạm đích để đổi/i)).toBeInTheDocument();
  });

  it('hiển thị chấm đỏ và lý do ốm khi ở chế độ y tế', () => {
    render(
      <DeskCell
        student={mockStudent}
        rowIndex={0}
        colIndex={0}
        isMedicalMode={true}
        isSick={true}
        sickReason="Sốt cao 39 độ"
      />
    );

    expect(screen.getByText(/Nghỉ ốm/i)).toBeInTheDocument();
    expect(screen.getByText(/Sốt cao 39 độ/i)).toBeInTheDocument();
  });

  it('áp dụng kiểu dáng chữ to viền rõ nét khi bật isFullscreen', () => {
    const { container } = render(
      <DeskCell
        student={mockStudent}
        rowIndex={0}
        colIndex={0}
        isMedicalMode={false}
        isFullscreen={true}
      />
    );

    // Thẻ học sinh có viền 3px và nền trắng
    const cardEl = container.firstChild as HTMLElement;
    expect(cardEl).toHaveClass('border-[3px]');
    expect(cardEl).toHaveClass('bg-white');
  });

  it('hiển thị biểu tượng micro khi học sinh đã được gọi phát biểu (isCalled = true)', () => {
    render(
      <DeskCell
        student={mockStudent}
        rowIndex={0}
        colIndex={0}
        isMedicalMode={false}
        isCalled={true}
      />
    );

    expect(screen.getByTitle('Đã được bốc thăm phát biểu trong buổi học này')).toBeInTheDocument();
  });
});
