import React from 'react';
import type { CompanionKpiSummary } from '../types';

interface CompanionKpiCardsProps {
  kpi: CompanionKpiSummary;
}

export const CompanionKpiCards: React.FC<CompanionKpiCardsProps> = ({ kpi }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      {/* 1. Tổng số ca */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Tổng hồ sơ</span>
          <span className="p-2 rounded-xl bg-slate-100 text-slate-700 text-base">🛡️</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-black text-slate-850 tracking-tight">
            {kpi.totalCases}
          </span>
          <span className="text-xs text-slate-400 font-bold">em</span>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-500">Học sinh diện lưu ý</p>
      </div>

      {/* 2. Đang hỗ trợ tích cực */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Đang can thiệp</span>
          <span className="p-2 rounded-xl bg-blue-100 text-blue-700 text-base">🤝</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-black text-blue-700 tracking-tight">
            {kpi.activeCount}
          </span>
          <span className="text-xs text-slate-400 font-bold">em</span>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-500">GVCN đang kèm cặp</p>
      </div>

      {/* 3. Đang theo dõi nề nếp */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Theo dõi định kỳ</span>
          <span className="p-2 rounded-xl bg-amber-100 text-amber-700 text-base">👀</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-black text-amber-700 tracking-tight">
            {kpi.monitoringCount}
          </span>
          <span className="text-xs text-slate-400 font-bold">em</span>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-500">Tình hình đã ổn định</p>
      </div>

      {/* 4. Đã tiến bộ / Hoàn thành */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Đã tiến bộ</span>
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 text-base">🌱</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight">
            {kpi.completedCount}
          </span>
          <span className="text-xs text-slate-400 font-bold">em</span>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-500">Đã hòa nhập tốt</p>
      </div>

      {/* 5. Khẩn cấp cần ưu tiên */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Ca đặc biệt</span>
          <span className="p-2 rounded-xl bg-rose-100 text-rose-700 text-base">⚠️</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={`text-2xl md:text-3xl font-black tracking-tight ${
              kpi.criticalCount > 0 ? 'text-rose-600' : 'text-slate-800'
            }`}
          >
            {kpi.criticalCount}
          </span>
          <span className="text-xs text-slate-400 font-bold">khẩn</span>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-500">Cần liên hệ gia đình gấp</p>
      </div>
    </div>
  );
};
