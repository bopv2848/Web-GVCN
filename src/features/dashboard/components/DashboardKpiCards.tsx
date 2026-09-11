import React from 'react';
import { Card } from '../../../components/common/Card';
import type { DashboardStats } from '../../../types/dashboard';

interface DashboardKpiCardsProps {
  stats: DashboardStats;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ stats }) => {
  const { totalStudents, maleCount, femaleCount, boardingCount, attendanceToday, pointsOverview } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Sĩ số lớp */}
      <Card className="flex flex-col justify-between border-slate-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/20">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase">
            Sĩ số lớp
          </span>
          <span className="w-10 h-10 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center text-lg font-bold shadow-xs">
            👥
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-slate-850 tracking-tight">
              {totalStudents}
            </span>
            <span className="text-xs font-bold text-slate-400">học sinh</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
            <span>👦 {maleCount} Nam</span>
            <span>•</span>
            <span>👧 {femaleCount} Nữ</span>
            <span>•</span>
            <span className="text-blue-600">🏠 {boardingCount} Bán trú</span>
          </div>
        </div>
      </Card>

      {/* 2. Chuyên cần hôm nay */}
      <Card className="flex flex-col justify-between border-slate-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/20">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase">
            Chuyên cần hôm nay
          </span>
          <span className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center text-lg font-bold shadow-xs">
            📅
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-emerald-600 tracking-tight">
              {attendanceToday.overallRate !== null ? `${attendanceToday.overallRate}%` : '--'}
            </span>
            <span className="text-xs font-bold text-slate-400">tỷ lệ có mặt</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
            <span>
              Sáng:{' '}
              <strong className="text-slate-700">
                {attendanceToday.morningRate !== null ? `${attendanceToday.morningRate}%` : 'Chưa'}
              </strong>
            </span>
            <span>•</span>
            <span>
              Chiều:{' '}
              <strong className="text-slate-700">
                {attendanceToday.afternoonRate !== null ? `${attendanceToday.afternoonRate}%` : 'Chưa'}
              </strong>
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Tổ dẫn đầu thi đua */}
      <Card className="flex flex-col justify-between border-slate-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/20">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase">
            Tổ dẫn đầu thi đua
          </span>
          <span className="w-10 h-10 rounded-2xl bg-amber-100/70 text-amber-600 flex items-center justify-center text-lg font-bold shadow-xs">
            🏆
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-amber-600 tracking-tight truncate">
              {pointsOverview.leadingGroup?.name || 'Đang cập nhật'}
            </span>
            <span className="text-xs font-bold text-amber-500 bg-amber-100/60 px-2 py-0.5 rounded-full">
              Hạng 1
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
            <span>Điểm tích lũy:</span>
            <span className="font-bold text-slate-800">
              +{pointsOverview.leadingGroup?.totalPoints || 0} điểm ⭐
            </span>
          </div>
        </div>
      </Card>

      {/* 4. Tổng điểm thi đua cả lớp */}
      <Card className="flex flex-col justify-between border-slate-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-purple-50/20">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase">
            Tổng điểm thi đua lớp
          </span>
          <span className="w-10 h-10 rounded-2xl bg-purple-100/70 text-purple-600 flex items-center justify-center text-lg font-bold shadow-xs">
            ⭐
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-purple-700 tracking-tight">
              {pointsOverview.totalClassPoints >= 0
                ? `+${pointsOverview.totalClassPoints}`
                : pointsOverview.totalClassPoints}
            </span>
            <span className="text-xs font-bold text-slate-400">điểm toàn lớp</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
            <span>Tổng sao thưởng:</span>
            <span className="font-bold text-purple-600">
              {pointsOverview.totalClassStars} ngôi sao 🌟
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
