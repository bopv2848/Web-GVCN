import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RandomStudentModal } from './RandomStudentModal';
import type { WinnerStudentInfo } from './RandomStudentModal';

describe('RandomStudentModal Component', () => {
  const mockWinner: WinnerStudentInfo = {
    student: {
      id: 'hs-1',
      classId: 'class-6a6',
      fullName: 'Nguyễn Hoàng Anh Khoa',
      gender: 'Nam',
      classRole: 'Tổ trưởng',
      points: 120,
      stars: 5,
      groupName: 'Tổ 4',
      groupColorClass: 'text-amber-600',
    },
    seatKey: '0_0',
    aisleName: 'TỔ 4',
    deskNumber: 1,
  };

  it('không render khi isOpen = false', () => {
    const { container } = render(
      <RandomStudentModal
        isOpen={false}
        winner={mockWinner}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('hiển thị thông tin học sinh trúng thưởng khi isOpen = true', () => {
    render(
      <RandomStudentModal
        isOpen={true}
        winner={mockWinner}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Nguyễn Hoàng Anh Khoa')).toBeInTheDocument();
    expect(screen.getByText(/DÃY TỔ 4 • BÀN 1/i)).toBeInTheDocument();
    expect(screen.getByText('Tổ trưởng')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bốc Thăm Bạn Khác/i })).toBeInTheDocument();
  });

  it('gọi onSpinAgain khi bấm nút Bốc Thăm Bạn Khác', () => {
    const handleSpinAgain = vi.fn();
    render(
      <RandomStudentModal
        isOpen={true}
        winner={mockWinner}
        onSpinAgain={handleSpinAgain}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Bốc Thăm Bạn Khác/i }));
    expect(handleSpinAgain).toHaveBeenCalledTimes(1);
  });

  it('gọi onAwardPoints khi bấm nút cộng điểm thi đua', async () => {
    const handleAwardPoints = vi.fn().mockResolvedValue(undefined);
    render(
      <RandomStudentModal
        isOpen={true}
        winner={mockWinner}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
        onAwardPoints={handleAwardPoints}
      />
    );

    expect(screen.getByText(/Thưởng Điểm Thi Đua:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⭐ \+2 Điểm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🌟 \+5 Điểm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🏆 \+10 Điểm/i })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /🌟 \+5 Điểm/i }));
    });
    expect(handleAwardPoints).toHaveBeenCalledWith(5, expect.any(String));
  });

  it('hiển thị cả 2 học sinh khi ở chế độ Đôi bạn cùng bàn (isPair = true)', () => {
    const mockPairWinner: WinnerStudentInfo = {
      ...mockWinner,
      isPair: true,
      partnerStudent: {
        id: 'hs-2',
        classId: 'class-6a6',
        fullName: 'Trần Thị Bích Ngọc',
        gender: 'Nữ',
        classRole: 'Học sinh',
        points: 95,
        stars: 4,
        groupName: 'Tổ 4',
        groupColorClass: 'text-amber-600',
      },
      partnerSeatKey: '0_1',
    };

    render(
      <RandomStudentModal
        isOpen={true}
        winner={mockPairWinner}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/ĐÔI BẠN CÙNG BÀN • SINH HOẠT LỚP/i)).toBeInTheDocument();
    expect(screen.getByText('Cặp Đôi Được Chọn Phát Biểu')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Hoàng Anh Khoa')).toBeInTheDocument();
    expect(screen.getByText('Trần Thị Bích Ngọc')).toBeInTheDocument();
    expect(screen.getByText(/DÃY TỔ 4 • BÀN 1/i)).toBeInTheDocument();
  });

  it('hiển thị đầy đủ danh sách 4 học sinh khi ở chế độ Nhóm 4 bạn (isGroup4 = true)', () => {
    const mockGroupWinner: WinnerStudentInfo = {
      student: mockWinner.student,
      seatKey: '0_0',
      aisleName: 'TỔ 1',
      deskNumber: 1,
      isGroup4: true,
      groupDeskLabel: 'DÃY TỔ 1 • BÀN 1 & 2',
      groupStudents: [
        mockWinner.student,
        {
          id: 'hs-2',
          classId: 'class-6a6',
          fullName: 'Lê Văn An',
          gender: 'Nam',
          classRole: 'Học sinh',
          points: 80,
          stars: 3,
          groupName: 'Tổ 1',
          groupColorClass: 'text-amber-600',
        },
        {
          id: 'hs-3',
          classId: 'class-6a6',
          fullName: 'Phạm Hồng Ánh',
          gender: 'Nữ',
          classRole: 'Học sinh',
          points: 85,
          stars: 4,
          groupName: 'Tổ 1',
          groupColorClass: 'text-amber-600',
        },
        {
          id: 'hs-4',
          classId: 'class-6a6',
          fullName: 'Hoàng Minh Tuấn',
          gender: 'Nam',
          classRole: 'Tổ phó',
          points: 90,
          stars: 4,
          groupName: 'Tổ 1',
          groupColorClass: 'text-amber-600',
        },
      ],
    };

    render(
      <RandomStudentModal
        isOpen={true}
        winner={mockGroupWinner}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/NHÓM 4 HỌC SINH • ĐẠI DIỆN THUYẾT TRÌNH/i)).toBeInTheDocument();
    expect(screen.getByText('Nhóm Được Chọn Lên Bảng Thuyết Trình')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Hoàng Anh Khoa')).toBeInTheDocument();
    expect(screen.getByText('Lê Văn An')).toBeInTheDocument();
    expect(screen.getByText('Phạm Hồng Ánh')).toBeInTheDocument();
    expect(screen.getByText('Hoàng Minh Tuấn')).toBeInTheDocument();
    expect(screen.getByText('DÃY TỔ 1 • BÀN 1 & 2')).toBeInTheDocument();
  });

  it('cho phép chọn gán nhiệm vụ nhanh và kích hoạt callback onAssignTask', () => {
    const handleAssignTask = vi.fn();
    render(
      <RandomStudentModal
        isOpen={true}
        winner={mockWinner}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
        onAssignTask={handleAssignTask}
      />
    );

    expect(screen.getByText(/Gán Nhiệm Vụ Nhanh:/i)).toBeInTheDocument();
    const taskBtn = screen.getByRole('button', { name: /🧹 Trực nhật lớp tuần tới/i });
    expect(taskBtn).toBeInTheDocument();

    fireEvent.click(taskBtn);
    expect(handleAssignTask).toHaveBeenCalledWith('🧹 Trực nhật lớp tuần tới');
    expect(screen.getByText(/✓ Đã gán: 🧹 Trực nhật lớp tuần tới/i)).toBeInTheDocument();
  });

  it('hiển thị huy hiệu ưu tiên học sinh chưa gọi khi winner có uncalledCount', () => {
    const winnerWithPriority: WinnerStudentInfo = {
      ...mockWinner,
      isPair: true,
      totalMembers: 2,
      uncalledCount: 2,
      partnerStudent: {
        id: 'hs-2',
        classId: 'class-6a6',
        fullName: 'Trần Thị Bích Ngọc',
        gender: 'Nữ',
      } as any,
    };

    render(
      <RandomStudentModal
        isOpen={true}
        winner={winnerWithPriority}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/100% Bạn mới chưa gọi/i)).toBeInTheDocument();
  });

  it('tích hợp bộ bấm giờ thảo luận nhanh với các mốc 30s, 1p, 2p, 3p, 5p, 7p và tùy chỉnh', () => {
    render(
      <RandomStudentModal
        isOpen={true}
        winner={mockWinner}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Bộ Bấm Giờ Thảo Luận Nhanh:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /30s/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1 Phút/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2 Phút/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3 Phút/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /5 Phút/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /7 Phút/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tùy chỉnh/i })).toBeInTheDocument();

    // Bấm chọn mốc 1 Phút
    fireEvent.click(screen.getByRole('button', { name: /1 Phút/i }));
    expect(screen.getAllByText('01:00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /⏸️ Tạm dừng/i })).toBeInTheDocument();

    // Bấm tạm dừng
    fireEvent.click(screen.getByRole('button', { name: /⏸️ Tạm dừng/i }));
    expect(screen.getByRole('button', { name: /▶️ Tiếp tục/i })).toBeInTheDocument();

    // Bấm đặt lại
    fireEvent.click(screen.getByRole('button', { name: /🔄 Đặt lại/i }));
    expect(screen.getByText(/Chọn mốc phát lệnh:/i)).toBeInTheDocument();
  });

  it('hỗ trợ nhập số phút tùy ý cho thuyết trình và tự động hẹn giờ', () => {
    render(
      <RandomStudentModal
        isOpen={true}
        winner={mockWinner}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // Mở ô nhập tùy chỉnh
    fireEvent.click(screen.getByRole('button', { name: /Tùy chỉnh/i }));
    const input = screen.getByPlaceholderText(/Nhập số phút thuyết trình/i);
    expect(input).toBeInTheDocument();

    // Nhập 4 phút và bấm hẹn giờ
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: /Hẹn Giờ/i }));

    expect(screen.getAllByText('04:00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /⏸️ Tạm dừng/i })).toBeInTheDocument();
  });

  it('gợi ý và cộng điểm thưởng tốc độ (+1đ) khi hoàn thành sớm trước thời hạn', () => {
    const handleAwardPoints = vi.fn();
    render(
      <RandomStudentModal
        isOpen={true}
        winner={mockWinner}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
        onAwardPoints={handleAwardPoints}
      />
    );

    // Kích hoạt đồng hồ 1 Phút
    fireEvent.click(screen.getByRole('button', { name: /1 Phút/i }));

    // Banner thưởng tốc độ hiển thị kèm checkbox
    expect(screen.getByText(/Trả lời nhanh trước giờ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/\+1đ Thưởng tốc độ/i)).toBeInTheDocument();

    // Các nút điểm được cộng dồn +1đ (Ví dụ 2+1 = 3đ)
    const bonusBtn = screen.getByRole('button', { name: /⭐ \+3 Điểm/i });
    expect(bonusBtn).toHaveTextContent('+3 Điểm');
    expect(bonusBtn).toHaveTextContent('Phát biểu + Tốc độ');

    fireEvent.click(bonusBtn);
    expect(handleAwardPoints).toHaveBeenCalledWith(3, expect.stringContaining('Thưởng tốc độ phản xạ'));
  });
});
