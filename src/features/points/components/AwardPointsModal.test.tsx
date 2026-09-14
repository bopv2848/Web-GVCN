import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AwardPointsModal } from './AwardPointsModal';
import { pointsService } from '../services/pointsService';
import type { PointCategory } from '../../../types/points';
import type { Student, Group } from '../../../types/student';

vi.mock('../services/pointsService', () => ({
  pointsService: {
    createTransaction: vi.fn(),
  },
}));

describe('AwardPointsModal Component', () => {
  const mockStudents: Student[] = [
    {
      id: 'std-1',
      classId: 'class-1',
      fullName: 'Đỗ Bảo An',
      gender: 'Nam',
      code: '6A601',
      groupName: 'Tổ 1',
      groupColorClass: 'text-blue-500',
      classRole: 'Thành viên',
      points: 10,
      stars: 5,
      createdAt: '2026-09-01',
    },
  ];

  const mockGroups: Group[] = [
    {
      id: 'grp-1',
      classId: 'class-1',
      name: 'Tổ 1',
      orderIndex: 1,
      colorClass: 'text-blue-500',
    },
  ];

  const mockCategories: PointCategory[] = [
    {
      id: 'cat-add-1',
      type: 'add',
      categoryGroup: 'Học tập',
      title: 'Phát biểu xây dựng bài tích cực',
      defaultPoints: 3,
      defaultStars: 3,
    },
    {
      id: 'cat-add-2',
      type: 'add',
      categoryGroup: 'Nề nếp',
      title: 'Đi học đầy đủ cả tuần',
      defaultPoints: 5,
      defaultStars: 5,
    },
    {
      id: 'cat-sub-1',
      type: 'subtract',
      categoryGroup: 'Nề nếp',
      title: 'Đi học trễ',
      defaultPoints: -5,
      defaultStars: 0,
    },
    {
      id: 'cat-sub-2',
      type: 'subtract',
      categoryGroup: 'Nề nếp',
      title: 'Nói chuyện riêng trong giờ',
      defaultPoints: -5,
      defaultStars: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hiển thị 2 tab phân chia rõ rệt: Phần Điểm Cộng và Phần Điểm Trừ', () => {
    render(
      <AwardPointsModal
        isOpen={true}
        onClose={vi.fn()}
        classId="class-1"
        onSuccess={vi.fn()}
        students={mockStudents}
        groups={mockGroups}
        categories={mockCategories}
      />
    );

    expect(screen.getByRole('button', { name: /PHẦN ĐIỂM CỘNG/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PHẦN ĐIỂM TRỪ/i })).toBeInTheDocument();

    // Mặc định tab Phần Điểm Cộng đang mở -> Dropdown chỉ có tiêu chí cộng
    expect(screen.getByText(/Phát biểu xây dựng bài tích cực/i)).toBeInTheDocument();
    expect(screen.getByText(/Đi học đầy đủ cả tuần/i)).toBeInTheDocument();
    expect(screen.queryByText(/Đi học trễ/i)).not.toBeInTheDocument();
  });

  it('chuyển đổi sang Phần Điểm Trừ sẽ lọc danh sách tiêu chí chỉ còn điểm vi phạm', () => {
    render(
      <AwardPointsModal
        isOpen={true}
        onClose={vi.fn()}
        classId="class-1"
        onSuccess={vi.fn()}
        students={mockStudents}
        groups={mockGroups}
        categories={mockCategories}
      />
    );

    // Bấm sang tab Phần Điểm Trừ
    const subTabBtn = screen.getByRole('button', { name: /PHẦN ĐIỂM TRỪ/i });
    fireEvent.click(subTabBtn);

    // Dropdown bây giờ chỉ chứa các tiêu chí vi phạm
    expect(screen.getByText(/Đi học trễ/i)).toBeInTheDocument();
    expect(screen.getByText(/Nói chuyện riêng trong giờ/i)).toBeInTheDocument();
    expect(screen.queryByText(/Phát biểu xây dựng bài tích cực/i)).not.toBeInTheDocument();
  });

  it('cho phép submit ghi nhận điểm thi đua vào sổ cái thành công', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();
    (pointsService.createTransaction as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

    render(
      <AwardPointsModal
        isOpen={true}
        onClose={handleClose}
        classId="class-1"
        onSuccess={handleSuccess}
        students={mockStudents}
        groups={mockGroups}
        categories={mockCategories}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /GHI NHẬN VÀO SỔ CÁI/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(pointsService.createTransaction).toHaveBeenCalledTimes(1);
    expect(pointsService.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        classId: 'class-1',
        targetType: 'student',
        studentId: 'std-1',
        points: 3,
        stars: 3,
        reason: 'Phát biểu xây dựng bài tích cực',
      })
    );
  });

  it('hiển thị trực tiếp khung xem trước biến động điểm (Live Preview Badge)', () => {
    render(
      <AwardPointsModal
        isOpen={true}
        onClose={vi.fn()}
        classId="class-1"
        onSuccess={vi.fn()}
        students={mockStudents}
        groups={mockGroups}
        categories={mockCategories}
      />
    );

    // Kiểm tra có khung xem trước
    const previewBadge = screen.getByTestId('live-preview-badge');
    expect(previewBadge).toBeInTheDocument();
    expect(screen.getByText(/Xem trước biến động điểm/i)).toBeInTheDocument();

    // Mặc định chọn tiêu chí cộng 3đ: 10đ ➔ 13đ (+3đ) và 5⭐ ➔ 8⭐ (+3⭐)
    expect(previewBadge).toHaveTextContent('10đ');
    expect(previewBadge).toHaveTextContent('13đ');
    expect(previewBadge).toHaveTextContent('(+3đ)');
    expect(previewBadge).toHaveTextContent('5⭐');
    expect(previewBadge).toHaveTextContent('8⭐');
    expect(previewBadge).toHaveTextContent('(+3⭐)');

    // Chuyển sang phần điểm trừ 5đ: 10đ ➔ 5đ (-5đ)
    const subTabBtn = screen.getByRole('button', { name: /PHẦN ĐIỂM TRỪ/i });
    fireEvent.click(subTabBtn);

    expect(previewBadge).toHaveTextContent('10đ');
    expect(previewBadge).toHaveTextContent('5đ');
    expect(previewBadge).toHaveTextContent('(-5đ)');
  });
});
