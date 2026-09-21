import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Desk3DBlock } from './Desk3DBlock';
import type { SeatAssignmentWithStudent } from '../../../types/seating';

describe('Desk3DBlock Component - Chế độ Chữ Siêu To', () => {
  const mockStudent1: SeatAssignmentWithStudent = {
    id: 'a1',
    layoutId: 'l1',
    studentId: 's1',
    rowIndex: 0,
    colIndex: 0,
    isHidden: false,
    student: {
      id: 's1',
      classId: 'c1',
      fullName: 'Nguyễn Hoàng Anh Khoa',
      gender: 'Nam',
      groupName: 'Tổ 1',
      groupColorClass: 'blue',
      classRole: 'Lớp trưởng',
      points: 10,
      stars: 2,
    },
  };

  const defaultProps = {
    rowIndex: 0,
    colLeft: 0,
    colRight: 1,
    leftAssign: mockStudent1,
    rightAssign: undefined,
    isDeskInCluster: false,
    isLeftSick: false,
    isRightSick: false,
    isLeftAtRisk: false,
    isRightAtRisk: false,
    isLeftAbsent: false,
    isRightAbsent: false,
    isMedicalMode: false,
    isLeftSelected: false,
    isRightSelected: false,
    isLeftDragging: false,
    isRightDragging: false,
    isLeftDragOver: false,
    isRightDragOver: false,
    isLeftHighlighted: false,
    isRightHighlighted: false,
    isLeftWinner: false,
    isRightWinner: false,
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    onSeatClick: vi.fn(),
  };

  it('áp dụng cỡ chữ siêu to (text-[21px]...) khi isLargeTextMode = true', () => {
    render(
      <Desk3DBlock
        {...defaultProps}
        isLargeTextMode={true}
        isFullscreen={true}
        zoomLevel={68}
      />
    );

    // Tên chính "Anh Khoa" phải có class chữ siêu to
    const nameEl = screen.getByText('Anh Khoa');
    expect(nameEl).toHaveClass('text-[21px]');
  });

  it('áp dụng cỡ chữ chuẩn khi isLargeTextMode = false ngay cả khi isFullscreen = true và zoom <= 80', () => {
    render(
      <Desk3DBlock
        {...defaultProps}
        isLargeTextMode={false}
        isFullscreen={true}
        zoomLevel={68}
      />
    );

    // Tên chính "Anh Khoa" phải có class cỡ chữ chuẩn, không bị ép chữ siêu to
    const nameEl = screen.getByText('Anh Khoa');
    expect(nameEl).toHaveClass('text-[13.5px]');
  });

  it('tự động bù trừ Zoom Compensation khi zoom sâu 50% đảm bảo kích thước vật lý >= 18px', () => {
    render(
      <Desk3DBlock
        {...defaultProps}
        isLargeTextMode={false}
        isFullscreen={true}
        zoomLevel={50}
      />
    );

    const nameEl = screen.getByText('Anh Khoa');
    // Tại zoom 50%, font size inline tối thiểu 36px (36px * 0.5 = 18px vật lý)
    expect(nameEl).toHaveStyle({ fontSize: '36px' });
  });
});
