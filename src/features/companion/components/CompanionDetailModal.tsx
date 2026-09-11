import React, { useState, useEffect, useCallback } from 'react';
import type { CompanionCase, CompanionUpdate, CompanionUpdateFormData } from '../types';
import { companionService } from '../services/companionService';
import { useAuth } from '../../../hooks/useAuth';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

interface CompanionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionCase: CompanionCase | null;
  onUpdateAdded: () => void;
}

export const CompanionDetailModal: React.FC<CompanionDetailModalProps> = ({
  isOpen,
  onClose,
  companionCase: c,
  onUpdateAdded,
}) => {
  const { user } = useAuth();
  const authorId = user?.id || '00000000-0000-0000-0000-000000000001';
  const todayStr = new Date().toISOString().split('T')[0];

  const [updates, setUpdates] = useState<CompanionUpdate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Form state
  const [updateDate, setUpdateDate] = useState<string>(todayStr);
  const [observationNotes, setObservationNotes] = useState<string>('');
  const [interactionSummary, setInteractionSummary] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadUpdates = useCallback(async () => {
    if (!c?.id) return;
    setIsLoading(true);
    try {
      const data = await companionService.getCaseUpdates(c.id);
      setUpdates(data);
    } catch (err) {
      console.error('Lỗi tải nhật ký ca đồng hành:', err);
    } finally {
      setIsLoading(false);
    }
  }, [c?.id]);

  useEffect(() => {
    if (isOpen && c?.id) {
      loadUpdates();
      setIsAdding(false);
      setObservationNotes('');
      setInteractionSummary('');
      setUpdateDate(todayStr);
      setErrorMsg(null);
    }
  }, [isOpen, c?.id, loadUpdates, todayStr]);

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!c?.id) return;
    if (!observationNotes.trim()) {
      setErrorMsg('Vui lòng nhập quan sát sư phạm hoặc biểu hiện của học sinh.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const formData: CompanionUpdateFormData = {
        updateDate,
        observationNotes: observationNotes.trim(),
        interactionSummary: interactionSummary.trim() || undefined,
      };
      await companionService.addCaseUpdate(c.id, authorId, formData);
      setObservationNotes('');
      setInteractionSummary('');
      setIsAdding(false);
      await loadUpdates();
      onUpdateAdded();
    } catch (err) {
      console.error('Lỗi thêm nhật ký:', err);
      setErrorMsg('Không thể lưu nhật ký. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!window.confirm('Thầy có chắc chắn muốn xóa bản ghi nhật ký này?')) return;
    try {
      await companionService.deleteCaseUpdate(updateId);
      await loadUpdates();
      onUpdateAdded();
    } catch (err) {
      console.error('Lỗi xóa nhật ký:', err);
    }
  };

  if (!c) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Nhật Ký Tiến Trình: ${c.studentName}`}
      size="lg"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar pr-1">
        {/* 1. Tóm tắt ca đồng hành */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black text-slate-850">
              Học sinh: {c.studentName} ({c.studentCode}) • {c.groupName}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Bắt đầu: {c.startDate}
            </span>
          </div>

          <div className="text-xs space-y-1 pt-1 border-t border-slate-200/60">
            <p>
              <strong className="text-slate-600 uppercase text-[10.5px]">Vấn đề chính:</strong>{' '}
              <span className="text-slate-850 font-medium">{c.primaryConcern}</span>
            </p>
            <p>
              <strong className="text-slate-600 uppercase text-[10.5px]">Biện pháp:</strong>{' '}
              <span className="text-slate-700 font-medium">{c.actionPlan}</span>
            </p>
          </div>
        </div>

        {/* 2. Nút Thêm nhật ký & Form */}
        <div>
          {!isAdding ? (
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Dòng Thời Gian Quan Sát ({updates.length})
              </h4>
              <Button
                onClick={() => setIsAdding(true)}
                variant="primary"
                size="sm"
                className="text-xs font-bold shadow-xs"
              >
                ➕ Thêm Nhật Ký / Biên Bản
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleAddUpdate}
              className="bg-indigo-50/60 border border-indigo-200/80 p-4 rounded-2xl space-y-3 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wide">
                  Ghi Chép Nhật Ký Mới
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕ Đóng
                </button>
              </div>

              {errorMsg && (
                <div className="p-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ngày ghi nhận *
                </label>
                <input
                  type="date"
                  value={updateDate}
                  onChange={(e) => setUpdateDate(e.target.value)}
                  className="w-full sm:w-48 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Quan sát sư phạm & Tiến bộ của em *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Em đã tự giác chép bài đầy đủ, không còn ngủ gật trong giờ Sử..."
                  value={observationNotes}
                  onChange={(e) => setObservationNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nội dung trao đổi / Làm việc phụ huynh (nếu có)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: 19h30 Thầy gọi điện cho Phụ huynh, gia đình ghi nhận và cam kết quản lý giờ giấc..."
                  value={interactionSummary}
                  onChange={(e) => setInteractionSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs font-bold"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Nhật Ký'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* 3. Danh sách dòng thời gian */}
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <LoadingSpinner size="md" text="Đang tải nhật ký..." />
          </div>
        ) : updates.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xl mb-1">📝</p>
            <p className="text-xs font-bold text-slate-500">
              Chưa có ghi chép nhật ký nào cho học sinh này.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Thầy hãy bấm "Thêm Nhật Ký" ở trên để ghi lại quá trình quan sát và trao đổi cùng gia đình.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                    📅 Ngày {u.updateDate}
                  </span>
                  <button
                    onClick={() => handleDeleteUpdate(u.id)}
                    className="text-slate-300 hover:text-rose-600 transition-colors p-1 text-xs"
                    title="Xóa bản ghi này"
                  >
                    🗑️
                  </button>
                </div>

                <div className="text-xs text-slate-850 space-y-1.5">
                  <p className="font-medium leading-relaxed">
                    <strong className="text-slate-600 text-[11px]">Quan sát:</strong>{' '}
                    {u.observationNotes}
                  </p>
                  {u.interactionSummary && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] font-medium leading-relaxed">
                      <strong>📞 Trao đổi / Làm việc:</strong> {u.interactionSummary}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
