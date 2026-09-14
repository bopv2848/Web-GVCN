import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AttendanceNoteModal } from './AttendanceNoteModal';

describe('AttendanceNoteModal Component', () => {
  it('hiển thị thông tin học sinh và các thẻ gợi ý lý do', () => {
    render(
      <AttendanceNoteModal
        isOpen={true}
        onClose={vi.fn()}
        studentName="Nguyễn Văn An"
        currentStatus="excused_absence"
        initialNote={null}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument();
    expect(screen.getByText('Nghỉ có phép')).toBeInTheDocument();
    expect(screen.getByText(/Ốm sốt \/ Cảm cúm/i)).toBeInTheDocument();
  });

  it('chọn nhanh lý do gợi ý điền vào ô textarea', () => {
    render(
      <AttendanceNoteModal
        isOpen={true}
        onClose={vi.fn()}
        studentName="Nguyễn Văn An"
        currentStatus="late"
        initialNote={null}
        onSave={vi.fn()}
      />
    );

    const presetBtn = screen.getByRole('button', { name: /Mưa bão \/ Hỏng xe/i });
    fireEvent.click(presetBtn);

    const textarea = screen.getByPlaceholderText(/Ví dụ: Phụ huynh gọi điện báo con sốt cao/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Mưa bão / Hỏng xe');
  });

  it('gọi onSave khi nhấn Lưu ghi chú', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);
    render(
      <AttendanceNoteModal
        isOpen={true}
        onClose={vi.fn()}
        studentName="Trần Thị Bích"
        currentStatus="excused_absence"
        initialNote="Đi khám răng"
        onSave={handleSave}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /LƯU GHI CHÚ/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(handleSave).toHaveBeenCalledWith('Đi khám răng');
  });
});
