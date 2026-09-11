import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PickedStudentModal } from './PickedStudentModal';
import type { Student } from '../../../types/student';

describe('PickedStudentModal Component', () => {
  const mockStudent: Student = {
    id: 'hs-1',
    classId: 'c-1',
    fullName: 'Lê Ngọc Anh',
    code: '6A6-01',
    gender: 'Nữ',
    groupName: 'Tổ 1',
    classRole: 'Lớp trưởng',
    boardingType: 'Bán trú',
    guardianStatus: 'active',
    points: 15,
    stars: 2,
    groupColorClass: 'bg-emerald-500',
  };

  it('hiển thị đầy đủ tên học sinh, tổ và chức vụ khi trúng thưởng', () => {
    render(
      <PickedStudentModal
        isOpen={true}
        onClose={vi.fn()}
        student={mockStudent}
        onAwardPoints={vi.fn()}
        onSpinAgain={vi.fn()}
      />
    );

    expect(screen.getByText('Lê Ngọc Anh')).toBeDefined();
    expect(screen.getByText(/Lớp trưởng/)).toBeDefined();
    expect(screen.getByText('Tổ 1')).toBeDefined();
  });

  it('kích hoạt onAwardPoints khi nhấn nút khen thưởng', () => {
    const handleAward = vi.fn();
    render(
      <PickedStudentModal
        isOpen={true}
        onClose={vi.fn()}
        student={mockStudent}
        onAwardPoints={handleAward}
        onSpinAgain={vi.fn()}
      />
    );

    const awardBtn = screen.getByText(/Khen Thưởng \/ Tích Điểm/);
    fireEvent.click(awardBtn);
    expect(handleAward).toHaveBeenCalledWith(mockStudent);
  });
});
