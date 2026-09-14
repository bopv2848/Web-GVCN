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

  it('hiển thị 2 tab phân chia rõ rệt: Phần Điểm Cộng và Phần Điểm Trừ kèm nút Tiêu chí khác', () => {
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

    // Mặc định tab Phần Điểm Cộng đang mở -> Lưới chỉ có tiêu chí cộng + Tiêu chí khác
    expect(screen.getByText(/Phát biểu xây dựng bài tích cực/i)).toBeInTheDocument();
    expect(screen.getByText(/Đi học đầy đủ cả tuần/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiêu chí thưởng khác/i)).toBeInTheDocument();
    expect(screen.queryByText(/Đi học trễ/i)).not.toBeInTheDocument();
  });

  it('chuyển đổi sang Phần Điểm Trừ sẽ lọc danh sách tiêu chí chỉ còn điểm vi phạm kèm nút Tiêu chí khác', () => {
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

    // Lưới bây giờ chỉ chứa các tiêu chí vi phạm + Vi phạm khác
    expect(screen.getByText(/Đi học trễ/i)).toBeInTheDocument();
    expect(screen.getByText(/Nói chuyện riêng trong giờ/i)).toBeInTheDocument();
    expect(screen.getByText(/Vi phạm \/ Nhắc nhở khác/i)).toBeInTheDocument();
    expect(screen.queryByText(/Phát biểu xây dựng bài tích cực/i)).not.toBeInTheDocument();
  });

  it('cho phép chọn nhiều tiêu chí cùng lúc và tự động tính tổng dồn điểm, sao và lý do', () => {
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

    // Chọn tiêu chí 1 (+3đ, ⭐+3)
    const cat1Btn = screen.getByRole('button', { name: /Phát biểu xây dựng bài tích cực/i });
    fireEvent.click(cat1Btn);

    // Chọn thêm tiêu chí 2 (+5đ, ⭐+5)
    const cat2Btn = screen.getByRole('button', { name: /Đi học đầy đủ cả tuần/i });
    fireEvent.click(cat2Btn);

    // Kiểm tra đếm số tiêu chí đã chọn
    expect(screen.getByText(/Đã chọn: 2 tiêu chí/i)).toBeInTheDocument();

    // Khung xem trước Live Preview tính tổng cộng dồn (+8đ / ⭐+8)
    const previewBadge = screen.getByTestId('live-preview-badge');
    expect(previewBadge).toHaveTextContent('10đ'); // điểm ban đầu
    expect(previewBadge).toHaveTextContent('18đ'); // 10 + 8
    expect(previewBadge).toHaveTextContent('(+8đ)');
    expect(previewBadge).toHaveTextContent('5⭐');  // sao ban đầu
    expect(previewBadge).toHaveTextContent('13⭐'); // 5 + 8
    expect(previewBadge).toHaveTextContent('(+8⭐)');
  });

  it('cho phép chọn Tiêu chí khác hoặc không chọn tiêu chí nào để tự do nhập lý do', () => {
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

    // Bấm chọn nút Tiêu chí khác
    const customBtn = screen.getByRole('button', { name: /Tiêu chí thưởng khác/i });
    fireEvent.click(customBtn);

    expect(screen.getByText(/Chế độ nhập tự do/i)).toBeInTheDocument();

    // Nhập lý do tự do
    const reasonInput = screen.getByPlaceholderText(/VD: Giúp đỡ bạn học tiến bộ/i) as HTMLInputElement;
    fireEvent.change(reasonInput, { target: { value: 'Nhặt được ví tiền trả lại bạn' } });
    expect(reasonInput.value).toBe('Nhặt được ví tiền trả lại bạn');
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

    // Chọn 1 tiêu chí
    const catBtn = screen.getByRole('button', { name: /Phát biểu xây dựng bài tích cực/i });
    fireEvent.click(catBtn);

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
});
