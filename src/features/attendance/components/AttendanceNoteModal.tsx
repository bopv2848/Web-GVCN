import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { AttendanceStatus } from '../../../types/attendance';

interface AttendanceNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  currentStatus: AttendanceStatus;
  initialNote?: string | null;
  onSave: (note: string | null) => Promise<void>;
}

export const AttendanceNoteModal: React.FC<AttendanceNoteModalProps> = ({
  isOpen,
  onClose,
  studentName,
  currentStatus,
  initialNote,
  onSave,
}) => {
  const [noteText, setNoteText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setNoteText(initialNote || '');
    }
  }, [isOpen, initialNote]);

  const presetReasons = [
    { label: 'Ốm sốt / Cảm cúm', emoji: '🤒' },
    { label: 'Đi khám bệnh / Nằm viện', emoji: '🏥' },
    { label: 'Việc riêng gia đình', emoji: '👨‍👩‍👧' },
    { label: 'Thi đấu / Hoạt động trường', emoji: '🏆' },
    { label: 'Mưa bão / Hỏng xe / Kẹt xe', emoji: '🌧️' },
    { label: 'Chưa rõ lý do (Chưa liên hệ được)', emoji: '🚨' },
  ];

  const handleSelectPreset = (reason: string, emoji: string) => {
    setNoteText(`${emoji} ${reason}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(noteText.trim() || null);
      onClose();
    } catch (err) {
      console.error('Lỗi lưu ghi chú:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearNote = async () => {
    setIsLoading(true);
    try {
      await onSave(null);
      onClose();
    } catch (err) {
      console.error('Lỗi xóa ghi chú:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabels: Record<AttendanceStatus, { label: string; badge: string }> = {
    present: { label: 'Có mặt', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    late: { label: 'Đi muộn', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    excused_absence: { label: 'Nghỉ có phép', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
    unexcused_absence: { label: 'Nghỉ không phép', badge: 'bg-rose-100 text-rose-800 border-rose-300' },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ghi Chú Lý Do Chuyên Cần" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Thông tin học sinh */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Học sinh</span>
            <span className="font-black text-sm text-slate-850">{studentName}</span>
          </div>

          <span
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${statusLabels[currentStatus]?.badge}`}
          >
            {statusLabels[currentStatus]?.label}
          </span>
        </div>

        {/* Thẻ gợi ý 1 chạm */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
            ⚡ Gợi ý lý do phổ biến (Chạm để chọn nhanh):
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presetReasons.map((p) => {
              const isSelected = noteText.includes(p.label);
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p.label, p.emoji)}
                  className={`p-2.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{p.emoji}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nhập tự do */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Nội dung lý do chi tiết:
          </label>
          <textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ví dụ: Phụ huynh gọi điện báo con sốt cao từ đêm qua, xin nghỉ 2 ngày..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:border-primary outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {initialNote ? (
            <button
              type="button"
              onClick={handleClearNote}
              disabled={isLoading}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
            >
              🗑️ Xóa ghi chú
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              LƯU GHI CHÚ
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
