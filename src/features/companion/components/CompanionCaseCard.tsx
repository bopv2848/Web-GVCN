import React from 'react';
import type { CompanionCase, CaseStatus } from '../types';
import { Button } from '../../../components/common/Button';

interface CompanionCaseCardProps {
  companionCase: CompanionCase;
  isPrivacyMasked: boolean;
  onOpenDetail: (c: CompanionCase) => void;
  onEdit: (c: CompanionCase) => void;
  onQuickStatusChange: (caseId: string, newStatus: CaseStatus) => void;
  onDelete: (caseId: string) => void;
}

export const CompanionCaseCard: React.FC<CompanionCaseCardProps> = ({
  companionCase: c,
  isPrivacyMasked,
  onOpenDetail,
  onEdit,
  onQuickStatusChange,
  onDelete,
}) => {
  const getSeverityBadge = () => {
    switch (c.severityLevel) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            🚨 Mức độ khẩn cấp
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            ⚠️ Cần lưu tâm
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            🌱 Theo dõi nhẹ
          </span>
        );
    }
  };

  const getStatusBadge = () => {
    switch (c.status) {
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-blue-100 text-blue-800 border border-blue-200">
            🤝 Đang hỗ trợ
          </span>
        );
      case 'monitoring':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            👀 Đang theo dõi
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✨ Đã tiến bộ
          </span>
        );
    }
  };

  const blurClass = isPrivacyMasked
    ? 'filter blur-[5px] hover:blur-none transition-all duration-300 select-none hover:select-text cursor-pointer'
    : '';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4 hover:shadow-md transition-shadow">
      {/* 1. Thông tin học sinh & Thẻ trạng thái */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-base flex items-center justify-center shrink-0">
            {c.studentName.slice(0, 1)}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-850 tracking-tight flex items-center gap-2">
              {c.studentName}
              <span className="text-[11px] font-mono font-bold text-slate-400">({c.studentCode})</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              {c.groupName} • Bắt đầu: {c.startDate}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {getSeverityBadge()}
          {getStatusBadge()}
        </div>
      </div>

      {/* 2. Vấn đề trọng tâm & Kế hoạch (Có che mờ bảo mật) */}
      <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
        <div>
          <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
            <span>Vấn đề trọng tâm:</span>
            {isPrivacyMasked && (
              <span className="text-[10px] text-amber-600 font-bold lowercase italic">
                (đang che mờ • rê chuột để đọc)
              </span>
            )}
          </div>
          <p className={`text-xs font-semibold text-slate-800 leading-relaxed ${blurClass}`}>
            {c.primaryConcern}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-200/70">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1">
            Kế hoạch can thiệp & Biện pháp:
          </span>
          <p className={`text-xs font-medium text-slate-700 leading-relaxed ${blurClass}`}>
            {c.actionPlan}
          </p>
        </div>
      </div>

      {/* 3. Thống kê tiến trình & Nút thao tác */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>📝 {c.updatesCount} nhật ký quan sát</span>
          {c.lastUpdateDate && <span>• Cập nhật: {c.lastUpdateDate}</span>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Nút Xem nhật ký chi tiết */}
          <Button
            onClick={() => onOpenDetail(c)}
            variant="primary"
            size="sm"
            className="text-xs font-bold shadow-xs"
          >
            📖 Nhật ký ({c.updatesCount})
          </Button>

          {/* Thay đổi trạng thái nhanh */}
          <select
            value={c.status}
            onChange={(e) => onQuickStatusChange(c.id, e.target.value as CaseStatus)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="active">Đang can thiệp</option>
            <option value="monitoring">Theo dõi nề nếp</option>
            <option value="completed">Đã tiến bộ (Xong)</option>
          </select>

          {/* Sửa */}
          <button
            onClick={() => onEdit(c)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Chỉnh sửa hồ sơ"
          >
            ✏️
          </button>

          {/* Xóa */}
          <button
            onClick={() => {
              if (window.confirm(`Thầy có chắc chắn muốn lưu trữ/xóa hồ sơ của học sinh ${c.studentName}?`)) {
                onDelete(c.id);
              }
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Lưu trữ hồ sơ"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};
