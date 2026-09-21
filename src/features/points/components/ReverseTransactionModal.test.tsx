import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReverseTransactionModal } from './ReverseTransactionModal';
import type { PointTransaction } from '../../../types/points';

describe('ReverseTransactionModal Component', () => {
  const mockTx: PointTransaction = {
    id: 'tx-123',
    studentId: 'std-1',
    studentName: 'Đỗ Bảo An',
    groupName: 'Tổ 1',
    points: 5,
    stars: 5,
    reason: 'Phát biểu hăng hái',
    occurredAt: '2026-09-15T08:00:00Z',
    createdBy: 'Lê Ngọc Anh (Lớp trưởng)',
  };

  it('không render khi isOpen = false hoặc transaction = null', () => {
    const { container: c1 } = render(
      <ReverseTransactionModal
        isOpen={false}
        onClose={vi.fn()}
        transaction={mockTx}
        onConfirm={vi.fn()}
      />
    );
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(
      <ReverseTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={null}
        onConfirm={vi.fn()}
      />
    );
    expect(c2.firstChild).toBeNull();
  });

  it('hiển thị thông tin giao dịch gốc cần hoàn tác', () => {
    render(
      <ReverseTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={mockTx}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Đỗ Bảo An')).toBeInTheDocument();
    expect(screen.getByText('+5 điểm • ⭐ 5 sao')).toBeInTheDocument();
    expect(screen.getByText('"Phát biểu hăng hái"')).toBeInTheDocument();
    expect(screen.getByText('Lê Ngọc Anh (Lớp trưởng)')).toBeInTheDocument();
  });

  it('báo lỗi khi bấm gửi mà chưa nhập lý do', async () => {
    const onConfirmMock = vi.fn();
    render(
      <ReverseTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={mockTx}
        onConfirm={onConfirmMock}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Hoàn tác/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Vui lòng nhập hoặc chọn lý do hoàn tác/i)).toBeInTheDocument();
    expect(onConfirmMock).not.toHaveBeenCalled();
  });

  it('cho phép chọn nhanh lý do gợi ý và gửi phản hồi thành công', async () => {
    const onConfirmMock = vi.fn().mockResolvedValue(undefined);
    render(
      <ReverseTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={mockTx}
        onConfirm={onConfirmMock}
      />
    );

    const quickBtn = screen.getByText('Học sinh có giấy xin phép hợp lệ của phụ huynh');
    fireEvent.click(quickBtn);

    const textarea = screen.getByPlaceholderText(/Hôm nay bạn An đã có giấy phép/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Học sinh có giấy xin phép hợp lệ của phụ huynh');

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Hoàn tác/i });
    fireEvent.click(submitBtn);

    expect(onConfirmMock).toHaveBeenCalledWith('Học sinh có giấy xin phép hợp lệ của phụ huynh');
  });
});
