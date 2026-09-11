import React, { useState, useEffect } from 'react';
import type { CompanionCase, CompanionFormData, CaseSeverity, CaseStatus } from '../types';
import type { Student } from '../../../types/student';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';

interface CompanionCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CompanionFormData) => Promise<void>;
  editingCase?: CompanionCase | null;
  students: Student[];
}

export const CompanionCaseModal: React.FC<CompanionCaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCase,
  students,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [studentId, setStudentId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [severityLevel, setSeverityLevel] = useState<CaseSeverity>('medium');
  const [status, setStatus] = useState<CaseStatus>('active');
  const [primaryConcern, setPrimaryConcern] = useState<string>('');
  const [actionPlan, setActionPlan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingCase) {
      setStudentId(editingCase.studentId);
      setStartDate(editingCase.startDate);
      setSeverityLevel(editingCase.severityLevel);
      setStatus(editingCase.status);
      setPrimaryConcern(editingCase.primaryConcern);
      setActionPlan(editingCase.actionPlan);
    } else {
      setStudentId(students[0]?.id || '');
      setStartDate(todayStr);
      setSeverityLevel('medium');
      setStatus('active');
      setPrimaryConcern('');
      setActionPlan('');
    }
    setErrorMessage(null);
  }, [editingCase, students, isOpen, todayStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setErrorMessage('Vui lòng chọn học sinh.');
      return;
    }
    if (!primaryConcern.trim()) {
      setErrorMessage('Vui lòng mô tả vấn đề cần đồng hành.');
      return;
    }
    if (!actionPlan.trim()) {
      setErrorMessage('Vui lòng ghi rõ biện pháp can thiệp/kế hoạch.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSave({
        studentId,
        startDate,
        severityLevel,
        status,
        primaryConcern: primaryConcern.trim(),
        actionPlan: actionPlan.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Lỗi lưu hồ sơ đồng hành:', err);
      setErrorMessage('Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCase ? 'Chỉnh Sửa Hồ Sơ Đồng Hành' : 'Lập Hồ Sơ Đồng Hành Mới'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* 1. Chọn học sinh */}
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
            Học sinh cần đồng hành *
          </label>
          <select
            value={studentId}
            disabled={Boolean(editingCase)}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.code || 'HS'}) - {s.gender}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Mức độ & Trạng thái & Ngày bắt đầu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Mức độ lưu tâm *
            </label>
            <select
              value={severityLevel}
              onChange={(e) => setSeverityLevel(e.target.value as CaseSeverity)}
              className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="critical">🚨 Khẩn cấp (Đặc biệt lưu ý)</option>
              <option value="medium">⚠️ Cần lưu tâm (Trung bình)</option>
              <option value="low">🌱 Theo dõi thêm (Nhẹ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Trạng thái can thiệp
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CaseStatus)}
              className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="active">🤝 Đang hỗ trợ</option>
              <option value="monitoring">👀 Theo dõi định kỳ</option>
              <option value="completed">✨ Đã tiến bộ (Hoàn thành)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 3. Vấn đề trọng tâm */}
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
            Vấn đề trọng tâm của học sinh *
          </label>
          <textarea
            rows={3}
            placeholder="Ví dụ: Thường xuyên ngủ gật trong giờ học do thức khuya chơi game, gia đình bố mẹ đi làm xa ít quan tâm..."
            value={primaryConcern}
            onChange={(e) => setPrimaryConcern(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 4. Kế hoạch & Biện pháp */}
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
            Kế hoạch can thiệp & Biện pháp sư phạm *
          </label>
          <textarea
            rows={3}
            placeholder="Ví dụ: 1. Thầy gặp riêng chia sẻ định hướng; 2. Trao đổi với mẹ để quản lý điện thoại sau 22h; 3. Phân công Lớp phó học tập kèm môn Toán..."
            value={actionPlan}
            onChange={(e) => setActionPlan(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" onClick={onClose} variant="outline" size="sm" className="text-xs font-bold">
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="text-xs font-bold">
            {isSubmitting ? 'Đang lưu...' : editingCase ? 'Lưu Thay Đổi' : 'Tạo Hồ Sơ'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
