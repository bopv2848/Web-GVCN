import React from 'react';
import type { ReportSummaryKPI } from '../types';

interface ReportKpiCardsProps {
  kpi: ReportSummaryKPI;
}

export const ReportKpiCards: React.FC<ReportKpiCardsProps> = ({ kpi }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      {/* 1. Tổng điểm thi đua */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Tổng điểm thi đua</span>
          <span className="p-2 rounded-xl bg-amber-100 text-amber-700 text-base">⭐</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={`text-2xl md:text-3xl font-black tracking-tight ${
              kpi.totalPoints >= 0 ? 'text-slate-850' : 'text-rose-600'
            }`}
          >
            {kpi.totalPoints > 0 ? `+${kpi.totalPoints}` : kpi.totalPoints}
          </span>
          <span className="text-xs text-slate-400 font-bold">điểm</span>
        </div>
        <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
          <span className="text-emerald-600 font-black">+{kpi.positivePoints}</span>
          <span>/</span>
          <span className="text-rose-500 font-black">-{kpi.negativePoints}</span>
        </div>
      </div>

      {/* 2. Tỷ lệ chuyên cần */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Tỷ lệ chuyên cần</span>
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 text-base">📅</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight">
            {kpi.overallAttendanceRate}%
          </span>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-500">
          Đánh giá: {kpi.overallAttendanceRate >= 95 ? 'Xuất sắc' : 'Đạt chuẩn'}
        </p>
      </div>

      {/* 3. Lượt đi học muộn */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Đi học muộn</span>
          <span className="p-2 rounded-xl bg-amber-100 text-amber-700 text-base">⏰</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-black text-amber-700 tracking-tight">
            {kpi.totalLate}
          </span>
          <span className="text-xs text-slate-400 font-bold">lượt</span>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-500">
          {kpi.totalLate === 0 ? 'Nề nếp giờ giấc rất tốt' : 'Cần siết chặt nề nếp'}
        </p>
      </div>

      {/* 4. Nghỉ học (Phép & Không phép) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Lượt nghỉ học</span>
          <span className="p-2 rounded-xl bg-rose-100 text-rose-700 text-base">🏥</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-black text-slate-850 tracking-tight">
            {kpi.totalExcused + kpi.totalUnexcused}
          </span>
          <span className="text-xs text-slate-400 font-bold">buổi</span>
        </div>
        <div className="mt-2 text-[11px] font-semibold flex items-center gap-1.5 text-slate-500">
          <span>Có phép: <strong className="text-slate-800">{kpi.totalExcused}</strong></span>
          <span>•</span>
          <span className="text-rose-600 font-bold">K.Phép: {kpi.totalUnexcused}</span>
        </div>
      </div>

      {/* 5. Sĩ số & Giao dịch */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Quy mô & Nhật ký</span>
          <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 text-base">📋</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-black text-indigo-700 tracking-tight">
            {kpi.totalStudents}
          </span>
          <span className="text-xs text-slate-400 font-bold">học sinh</span>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-500">
          {kpi.totalTransactions} giao dịch sổ cái
        </p>
      </div>
    </div>
  );
};
