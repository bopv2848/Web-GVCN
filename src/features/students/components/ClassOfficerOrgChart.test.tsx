import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassOfficerOrgChart } from './ClassOfficerOrgChart';
import type { Student, Group } from '../../../types/student';

describe('ClassOfficerOrgChart Component', () => {
  const mockGroups: Group[] = [
    { id: 'g1', classId: 'c1', name: 'Tổ 1', colorClass: 'text-red-500', orderIndex: 1 },
    { id: 'g2', classId: 'c1', name: 'Tổ 2', colorClass: 'text-green-500', orderIndex: 2 },
    { id: 'g3', classId: 'c1', name: 'Tổ 3', colorClass: 'text-yellow-500', orderIndex: 3 },
    { id: 'g4', classId: 'c1', name: 'Tổ 4', colorClass: 'text-blue-500', orderIndex: 4 },
  ];

  const mockStudents: Student[] = [
    {
      id: 's1',
      classId: 'c1',
      fullName: 'Lê Ngọc Anh',
      gender: 'Nữ',
      classRole: 'Lớp trưởng',
      groupId: 'g1',
      groupName: 'Tổ 1',
      groupColorClass: 'text-red-500',
      points: 20,
      stars: 3,
    },
    {
      id: 's2',
      classId: 'c1',
      fullName: 'Nguyễn Ngọc Ánh Tuyết',
      gender: 'Nữ',
      classRole: 'Phó học tập',
      groupId: 'g2',
      groupName: 'Tổ 2',
      groupColorClass: 'text-green-500',
      points: 15,
      stars: 2,
    },
    {
      id: 's3',
      classId: 'c1',
      fullName: 'Huỳnh Huyền Nhiên',
      gender: 'Nữ',
      classRole: 'Tổ trưởng',
      groupId: 'g1',
      groupName: 'Tổ 1',
      groupColorClass: 'text-red-500',
      points: 10,
      stars: 1,
    },
  ];

  it('1. Hiển thị thông tin Giáo viên chủ nhiệm và Lớp trưởng', () => {
    const handleSelect = vi.fn();
    render(
      <ClassOfficerOrgChart
        students={mockStudents}
        groups={mockGroups}
        onSelectOfficer={handleSelect}
      />
    );

    expect(screen.getByText(/Thầy Phan Văn Bộ/i)).toBeInTheDocument();
    expect(screen.getByText('Lê Ngọc Anh')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Ngọc Ánh Tuyết')).toBeInTheDocument();
  });

  it('2. Hiển thị đủ 4 khối Tổ thi đua và 4 Nguyên tắc hoạt động', () => {
    const handleSelect = vi.fn();
    render(
      <ClassOfficerOrgChart
        students={mockStudents}
        groups={mockGroups}
        onSelectOfficer={handleSelect}
      />
    );

    expect(screen.getByText('Tổ 1')).toBeInTheDocument();
    expect(screen.getByText('Tổ 2')).toBeInTheDocument();
    expect(screen.getByText('Tổ 3')).toBeInTheDocument();
    expect(screen.getByText('Tổ 4')).toBeInTheDocument();
    expect(screen.getByText(/4 Nguyên Tắc Hoạt Động/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Chủ Động/i)).toBeInTheDocument();
  });

  it('3. Kích hoạt onSelectOfficer khi nhấn vào thẻ cán sự', () => {
    const handleSelect = vi.fn();
    render(
      <ClassOfficerOrgChart
        students={mockStudents}
        groups={mockGroups}
        onSelectOfficer={handleSelect}
      />
    );

    const lopTruongCard = screen.getByText('Lê Ngọc Anh').closest('div');
    if (lopTruongCard) {
      fireEvent.click(lopTruongCard);
      expect(handleSelect).toHaveBeenCalledWith(mockStudents[0]);
    }
  });

  it('4. Tách riêng 2 thẻ Thủ Quỹ và Đội Sao Đỏ và hiển thị nút Thêm nhiệm vụ mới', () => {
    const handleSelect = vi.fn();
    render(
      <ClassOfficerOrgChart
        students={mockStudents}
        groups={mockGroups}
        onSelectOfficer={handleSelect}
      />
    );

    // Xác nhận có thẻ Thủ Quỹ và Đội Sao Đỏ riêng biệt
    expect(screen.getByText('Thủ Quỹ')).toBeInTheDocument();
    expect(screen.getByText('Đội Sao Đỏ')).toBeInTheDocument();
    expect(screen.getByText('Thêm Nhiệm Vụ Mới')).toBeInTheDocument();
  });

  it('5. Mở modal phân công cán sự khi nhấn vào thẻ chưa phân công', () => {
    const handleSelect = vi.fn();
    render(
      <ClassOfficerOrgChart
        students={mockStudents}
        groups={mockGroups}
        onSelectOfficer={handleSelect}
      />
    );

    // Bấm vào thẻ Thủ Quỹ (chưa phân công)
    const thuQuyCard = screen.getByText('Thủ Quỹ').closest('div');
    expect(thuQuyCard).toBeInTheDocument();
    if (thuQuyCard) {
      fireEvent.click(thuQuyCard);
    }

    // Modal Phân Công Chức Vụ hiển thị
    expect(screen.getByText(/Phân Công Chức Vụ: Thủ Quỹ/i)).toBeInTheDocument();
  });

  it('6. Mở modal thêm nhiệm vụ mới khi bấm vào thẻ Thêm nhiệm vụ mới', () => {
    const handleSelect = vi.fn();
    render(
      <ClassOfficerOrgChart
        students={mockStudents}
        groups={mockGroups}
        onSelectOfficer={handleSelect}
      />
    );

    const addCard = screen.getByText('Thêm Nhiệm Vụ Mới').closest('div');
    expect(addCard).toBeInTheDocument();
    if (addCard) {
      fireEvent.click(addCard);
    }

    // Modal Thêm Chức Danh / Nhiệm Vụ Mới hiển thị
    expect(screen.getByText(/Thêm Chức Danh \/ Nhiệm Vụ Mới Cho Lớp/i)).toBeInTheDocument();
  });
});
