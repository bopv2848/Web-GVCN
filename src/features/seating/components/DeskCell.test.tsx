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

    const studentEl = screen.getByText('Phan Minh Khang');
    expect(studentEl).toBeInTheDocument();
    expect(screen.getByText('Tổ 1')).toBeInTheDocument();
    expect(screen.getByText('Lớp phó')).toBeInTheDocument();

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
});
