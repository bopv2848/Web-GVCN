import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../components/common/Button';
import { seatingService } from '../services/seatingService';

interface SchoolYearStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartDate: string;
  onSave: (newStartDate: string) => Promise<void>;
}

export const SchoolYearStartModal: React.FC<SchoolYearStartModalProps> = ({
  isOpen,
  onClose,
  currentStartDate,
  onSave,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(currentStartDate || '2026-09-01');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(currentStartDate || '2026-09-01');
    }
  }, [isOpen, currentStartDate]);

  // Tính toán thử nghiệm tuần học theo ngày đang chọn
  const previewWeek = useMemo(() => {
    return seatingService.getCurrentSchoolWeek(selectedDate);
  }, [selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setIsSubmitting(true);
    try {
      await onSave(selectedDate);
      onClose();
    } catch (err) {
      console.error('Lỗi lưu ngày bắt đầu năm học:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (presetDate: string) => {
    setSelectedDate(presetDate);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl shadow-2xs border border-blue-200/60">
              📅
            </div>
            <div>
              <h3 className="text-base font-black text-slate-850">
                Tùy Chỉnh Ngày Bắt Đầu Năm Học
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Đồng bộ lên Cloud Supabase cho Lớp 6A6
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Nội dung Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="school-year-start-input"
              className="block text-xs font-black text-slate-700 uppercase tracking-wider"
            >
              Chọn ngày tựu trường / bắt đầu học thực tế:
            </label>
            <input
              id="school-year-start-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-850 transition-all cursor-pointer shadow-2xs"
            />
          </div>

          {/* Gợi ý ngày nhanh (Presets) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400">
              ⚡ Gợi ý mốc thời gian phổ biến:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('2026-09-01')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedDate === '2026-09-01'
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                01/09/2026 (Tựu trường chuẩn)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('2026-09-05')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedDate === '2026-09-05'
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                05/09/2026 (Khai giảng toàn quốc)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('2026-08-24')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedDate === '2026-08-24'
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                24/08/2026 (Tựu trường sớm)
              </button>
            </div>
          </div>

          {/* Hộp xem trước kết quả tính toán */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Tuần học tính toán:</span>
              <span className="font-black text-blue-700 text-sm">
                Tuần {previewWeek.weekNumber}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Chế độ tuần tương ứng:</span>
              <span
                className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                  previewWeek.mode === 'even'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {previewWeek.mode === 'even' ? '🌤️ Tuần Chẵn' : '☀️ Tuần Lẻ'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-200/60">
              💡 Cấu hình này sẽ được lưu lên Cloud Supabase và tự động đồng bộ khi Thầy đăng nhập trên điện thoại hoặc máy tính khác.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="text-xs font-black shadow-md shadow-primary/20"
            >
              {isSubmitting ? 'Đang lưu Cloud...' : '💾 Lưu Lên Cloud'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
