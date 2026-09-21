import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { PointTransaction } from '../../../types/points';

interface ReverseTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PointTransaction | null;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const QUICK_FEEDBACK_REASONS = [
  'Học sinh có giấy xin phép hợp lệ của phụ huynh',
  'Ban cán sự ghi nhầm tên học sinh / nhầm tổ',
  'Em học sinh đã nhận lỗi và sửa chữa ngay trong tiết học',
  'Lượt chấm bị trùng lặp với một bạn cán sự khác',
  'Mức cộng/trừ điểm chưa đúng theo barem quy định của lớp',
];

export const ReverseTransactionModal: React.FC<ReverseTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  isLoading = false,
}) => {
  const [feedbackReason, setFeedbackReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!transaction) return null;

  const isPositive = transaction.points >= 0;
  const isBcs =
    (transaction.createdBy || '').toLowerCase().includes('bcs') ||
    (transaction.createdBy || '').toLowerCase().includes('ban cán sự') ||
    (transaction.createdBy || '').toLowerCase().includes('lớp trưởng') ||
    (transaction.createdBy || '').toLowerCase().includes('ngọc anh') ||
    transaction.createdBy === 'dd877932-f537-412d-baf5-018ba482a1e3';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = feedbackReason.trim();
    if (!finalReason) {
      setErrorMsg('Vui lòng nhập hoặc chọn lý do hoàn tác để gửi phản hồi cho Ban cán sự.');
      return;
    }
    setErrorMsg('');
    await onConfirm(finalReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="↩️ Hoàn Tác Giao Dịch & Gửi Phản Hồi Cho Ban Cán Sự"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Khung tóm tắt giao dịch gốc cần hoàn tác */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">Học sinh:</span>
            <span className="font-black text-slate-850 text-sm">{transaction.studentName}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">Điểm thi đua:</span>
            <span
              className={`font-black text-sm ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositive ? `+${transaction.points}` : transaction.points} điểm
              {transaction.stars !== 0 && ` • ⭐ ${transaction.stars} sao`}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">Lý do gốc:</span>
            <span className="font-semibold text-slate-700 italic">"{transaction.reason}"</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
            <span className="font-bold text-slate-500">Người chấm:</span>
            <span
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                isBcs
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {transaction.createdBy || 'Ban Cán Sự'}
            </span>
          </div>
        </div>

        {/* Thông báo hướng dẫn nghiệp vụ */}
        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs">
          <p className="font-bold flex items-center gap-1.5 mb-0.5">
            <span>📢</span>
            <span>Thông báo rút kinh nghiệm cho học sinh:</span>
          </p>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            Lý do phản hồi bên dưới sẽ được lưu vào sổ cái và đồng bộ tức thì (*Realtime*) về máy điện thoại của Ban Cán Sự để các em hiểu rõ và rút kinh nghiệm công tâm hơn.
          </p>
        </div>

        {/* Gợi ý lý do hoàn tác nhanh */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            ⚡ Gợi ý lý do nhanh (bấm để chọn):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_FEEDBACK_REASONS.map((reasonText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFeedbackReason(reasonText)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-all cursor-pointer ${
                  feedbackReason === reasonText
                    ? 'bg-primary text-white border-primary font-bold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {reasonText}
              </button>
            ))}
          </div>
        </div>

        {/* Ô nhập lý do phản hồi chi tiết */}
        <div>
          <label htmlFor="feedback-reason" className="block text-xs font-bold text-slate-700 mb-1">
            Lý do hoàn tác / Ghi chú phản hồi: <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="feedback-reason"
            rows={3}
            value={feedbackReason}
            onChange={(e) => {
              setFeedbackReason(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Ví dụ: Hôm nay bạn An đã có giấy phép của phụ huynh gửi Thầy, Ban cán sự chú ý đối chiếu sổ phép nhé..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent font-medium leading-relaxed resize-none"
          />
          {errorMsg && <p className="text-rose-600 text-xs font-bold mt-1">{errorMsg}</p>}
        </div>

        {/* Nút tác vụ */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
          >
            ↩️ Xác nhận Hoàn tác & Gửi phản hồi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
