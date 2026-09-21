import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalledStudentsDrawer } from './CalledStudentsDrawer';
import type { SpinHistoryItem } from './PresentationSidePanel';

describe('CalledStudentsDrawer Component', () => {
  const mockHistoryItems: SpinHistoryItem[] = [
    {
      id: 'spin-1',
      studentId: 'st-1',
      studentName: 'Nguyễn Văn An',
      groupName: 'Tổ 1',
      aisleName: 'A',
      deskNumber: 1,
      time: '07:15',
    },
    {
      id: 'spin-2',
      studentId: 'st-2',
      studentName: 'Trần Thị Bình',
      groupName: 'Tổ 2',
      aisleName: 'B',
      deskNumber: 3,
      time: '07:22',
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    historyItems: mockHistoryItems,
    onRemoveItem: vi.fn(),
    onClearAll: vi.fn(),
    totalStudents: 38,
  };

  it('không render gì khi isOpen = false', () => {
    const { container } = render(<CalledStudentsDrawer {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('hiển thị đầy đủ danh sách học sinh đã bốc thăm', () => {
    render(<CalledStudentsDrawer {...defaultProps} />);

    expect(screen.getByText(/ĐÃ BỐC THĂM/i)).toBeInTheDocument();
    expect(screen.getByText('2 / 38')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument();
    expect(screen.getByText('Trần Thị Bình')).toBeInTheDocument();
    expect(screen.getByText('07:15')).toBeInTheDocument();
    expect(screen.getByText('07:22')).toBeInTheDocument();
  });

  it('gọi onClose khi nhấn nút đóng ✕', () => {
    const handleClose = vi.fn();
    render(<CalledStudentsDrawer {...defaultProps} onClose={handleClose} />);

    fireEvent.click(screen.getByLabelText('Đóng bảng trượt'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi onRemoveItem khi bấm nút Gỡ từng học sinh', () => {
    const handleRemove = vi.fn();
    render(<CalledStudentsDrawer {...defaultProps} onRemoveItem={handleRemove} />);

    const removeButtons = screen.getAllByTitle(/Gỡ bạn này khỏi danh sách/i);
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);
    expect(handleRemove).toHaveBeenCalledWith('spin-1');
  });

  it('gọi onClearAll khi bấm nút Làm mới tất cả', () => {
    const handleClearAll = vi.fn();
    render(<CalledStudentsDrawer {...defaultProps} onClearAll={handleClearAll} />);

    const clearBtn = screen.getByTitle(/Xóa toàn bộ danh sách để bắt đầu vòng bốc thăm mới/i);
    fireEvent.click(clearBtn);
    expect(handleClearAll).toHaveBeenCalledTimes(1);
  });

  it('hiển thị thông báo thân thiện khi danh sách trống', () => {
    render(<CalledStudentsDrawer {...defaultProps} historyItems={[]} />);

    expect(
      screen.getByText(/Chưa có học sinh nào được bốc thăm trong tiết này/i)
    ).toBeInTheDocument();
  });

  it('gọi onAwardPoints khi nhấn nút Thưởng +1đ', () => {
    const handleAward = vi.fn();
    render(<CalledStudentsDrawer {...defaultProps} onAwardPoints={handleAward} />);

    const plusOneButtons = screen.getAllByTitle(/Thưởng \+1 điểm/i);
    expect(plusOneButtons.length).toBeGreaterThan(0);

    fireEvent.click(plusOneButtons[0]);
    expect(handleAward).toHaveBeenCalledWith(
      'st-1',
      'Nguyễn Văn An',
      1,
      'Phát biểu xây dựng bài'
    );
  });

  it('gọi onAwardPoints khi nhấn nút Thưởng +2đ', () => {
    const handleAward = vi.fn();
    render(<CalledStudentsDrawer {...defaultProps} onAwardPoints={handleAward} />);

    const plusTwoButtons = screen.getAllByTitle(/Thưởng \+2 điểm/i);
    expect(plusTwoButtons.length).toBeGreaterThan(0);

    fireEvent.click(plusTwoButtons[0]);
    expect(handleAward).toHaveBeenCalledWith(
      'st-1',
      'Nguyễn Văn An',
      2,
      'Câu trả lời xuất sắc'
    );
  });

  it('gọi onAwardPoints khi nhấn nút Trừ -1đ', () => {
    const handleAward = vi.fn();
    render(<CalledStudentsDrawer {...defaultProps} onAwardPoints={handleAward} />);

    const minusOneButtons = screen.getAllByTitle(/Trừ 1 điểm/i);
    expect(minusOneButtons.length).toBeGreaterThan(0);

    fireEvent.click(minusOneButtons[0]);
    expect(handleAward).toHaveBeenCalledWith(
      'st-1',
      'Nguyễn Văn An',
      -1,
      'Nhắc nhở trong tiết học'
    );
  });

  it('hiển thị huy hiệu điểm thưởng khi học sinh đã được cộng điểm', () => {
    const itemsWithPoints: SpinHistoryItem[] = [
      {
        id: 'spin-1',
        studentId: 'st-1',
        studentName: 'Nguyễn Văn An',
        groupName: 'Tổ 1',
        aisleName: 'A',
        deskNumber: 1,
        time: '07:15',
        awardedPoints: 3,
      },
    ];

    render(<CalledStudentsDrawer {...defaultProps} historyItems={itemsWithPoints} />);
    expect(screen.getByText('3đ')).toBeInTheDocument();
    expect(screen.getByText('⭐ +')).toBeInTheDocument();
  });
});
