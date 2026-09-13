import React from 'react';
import { Button } from '../../../components/common/Button';
import type { SeatingMedicalAnalysis } from '../../../types/seating';

interface SeatingToolbarProps {
  isMedicalMode: boolean;
  medicalAnalysis: SeatingMedicalAnalysis;
  isRotationEnabled: boolean;
  schoolWeekInfo: { weekNumber: number; mode: 'odd' | 'even' };
  schoolYearStartDate: string;
  activeWeekMode: 'odd' | 'even';
  isSavingWeek: boolean;
  onToggleRotation: (enabled: boolean) => void;
  onSelectWeekMode: (mode: 'odd' | 'even') => void;
  onOpenStartDateModal: () => void;
  onOpenClusterModal: () => void;
  onResetLayout: () => void;
  onSaveCurrentWeekAsBase: () => void;
}

export const SeatingToolbar: React.FC<SeatingToolbarProps> = ({
  isMedicalMode,
  medicalAnalysis,
  isRotationEnabled,
  schoolWeekInfo,
  schoolYearStartDate,
  activeWeekMode,
  isSavingWeek,
  onToggleRotation,
  onSelectWeekMode,
  onOpenStartDateModal,
  onOpenClusterModal,
  onResetLayout,
  onSaveCurrentWeekAsBase,
}) => {
  return (
    <div className="space-y-4 print:hidden">
      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Sơ Đồ Chỗ Ngồi Lớp 6A6
            </h2>
            {isMedicalMode && medicalAnalysis.totalSickInSeats > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Chế độ Giám sát Dịch bệnh</span>
              </span>
            )}
            {isRotationEnabled ? (
              <button
                type="button"
                onClick={onOpenStartDateModal}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Bấm để tùy chỉnh ngày bắt đầu năm học của địa phương"
              >
                <span>🔄 Đảo Tuần Chẵn/Lẻ • Tuần {schoolWeekInfo.weekNumber} ({schoolWeekInfo.mode === 'odd' ? 'Tuần Lẻ' : 'Tuần Chẵn'})</span>
                <span className="text-[10px] opacity-75">⚙️</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenStartDateModal}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Bấm để tùy chỉnh ngày bắt đầu năm học của địa phương"
              >
                <span>📌 Chế độ: Chỗ ngồi Cố định</span>
                <span className="text-[10px] opacity-75">⚙️</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {isRotationEnabled
              ? `Đảo dãy định kỳ theo SO-DO-LOP.xlsx • Tự động tính tuần từ ngày ${schoolYearStartDate} • Kéo thả đổi chỗ • Lưu Supabase`
              : `Chỗ ngồi cố định cho lớp • Ngày bắt đầu: ${schoolYearStartDate} • Kéo - thả chuột để đổi chỗ • Lưu Supabase`}
          </p>
        </div>

        {/* Nút thao tác & 2 Chế độ Sắp Xếp Chỗ Ngồi */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bộ 2 Nút: Cố định vs Đảo Tuần Chẵn/Lẻ */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onToggleRotation(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                !isRotationEnabled
                  ? 'bg-white text-slate-850 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Bình thường: Tắt tính năng tuần chẵn/lẻ cho lớp giữ chỗ ngồi cố định"
            >
              <span>📌</span>
              <span>Cố Định</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleRotation(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                isRotationEnabled
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Mở tính năng: Đảo dãy tuần chẵn / tuần lẻ linh động cho lớp có nhu cầu"
            >
              <span>🔄</span>
              <span>Đảo Tuần Chẵn/Lẻ</span>
            </button>
          </div>

          {/* Nếu mở tính năng Đảo tuần: Hiển thị bộ chọn Tuần Lẻ / Tuần Chẵn */}
          {isRotationEnabled && (
            <div className="inline-flex items-center p-1 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-2xs">
              <button
                type="button"
                onClick={() => onSelectWeekMode('odd')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  activeWeekMode === 'odd'
                    ? 'bg-white text-blue-700 shadow-xs border border-blue-200/80'
                    : 'text-blue-700/70 hover:text-blue-900'
                }`}
              >
                <span>☀️</span>
                <span>Tuần Lẻ</span>
                {schoolWeekInfo.mode === 'odd' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onSelectWeekMode('even')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  activeWeekMode === 'even'
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200/80'
                    : 'text-emerald-700/70 hover:text-emerald-900'
                }`}
              >
                <span>🌤️</span>
                <span>Tuần Chẵn</span>
                {schoolWeekInfo.mode === 'even' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                )}
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onOpenStartDateModal}
            className="text-xs font-bold flex items-center gap-1.5"
            title="Tùy chỉnh ngày khai giảng/tựu trường thực tế của địa phương"
          >
            <span>📅</span>
            <span>Lịch Năm Học</span>
          </Button>

          {medicalAnalysis.clusters.length > 0 && (
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={onOpenClusterModal}
              className="text-xs font-black shadow-md shadow-rose-500/20"
            >
              🚨 XEM {medicalAnalysis.clusters.length} CỤM LÂY NHIỄM
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onResetLayout}
            className="text-xs font-bold"
          >
            🔄 Sắp Xếp Lại 4 Tổ
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => window.print()}
            className="text-xs font-black shadow-md shadow-primary/20"
          >
            🖨️ IN SƠ ĐỒ LỚP A4
          </Button>
        </div>
      </div>

      {/* Banner thông báo khi đang xem trước Tuần Chẵn */}
      {isRotationEnabled && activeWeekMode === 'even' && (
        <div className="bg-emerald-50/90 border border-emerald-200 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌤️</span>
            <div>
              <p className="font-black text-emerald-900">
                Đang xem trước Sơ đồ đảo dãy Tuần Chẵn (Tổ 3 ↔ Tổ 4 | Tổ 1 ↔ Tổ 2)
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Sơ đồ đã xoay chuẩn theo file SO-DO-LOP.xlsx của nhà trường. Thầy có thể in ngay hoặc bấm lưu để cố định làm sơ đồ chính thức.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onSaveCurrentWeekAsBase}
            disabled={isSavingWeek}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-sm cursor-pointer"
          >
            {isSavingWeek ? 'Đang lưu Supabase...' : '💾 Lưu Sơ Đồ Này Lên Supabase'}
          </Button>
        </div>
      )}
    </div>
  );
};
