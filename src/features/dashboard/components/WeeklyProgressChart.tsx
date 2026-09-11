import React from 'react';
import { Card } from '../../../components/common/Card';
import type { DashboardStats } from '../../../types/dashboard';

interface WeeklyProgressChartProps {
  weeklyTrend: DashboardStats['weeklyTrend'];
}

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ weeklyTrend }) => {
  // Tìm giá trị điểm lớn nhất để scale chiều cao cột
  const maxAbsPoints = Math.max(
    ...weeklyTrend.map((d) => Math.max(d.pointsGained, d.pointsLost, Math.abs(d.netPoints))),
    10
  );

  return (
    <Card className="border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-lg font-black text-slate-850 tracking-tight">
              Biểu Đồ Tiến Độ Thi Đua & Chuyên Cần Tuần
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              ✓ Dữ liệu thật 100%
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Điểm thi đua ròng và tỷ lệ chuyên cần theo từng ngày (Từ Thứ 2 đến Chủ nhật)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
            <span>Điểm thưởng</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-400"></span>
            <span>Điểm trừ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>Chuyên cần (%)</span>
          </div>
        </div>
      </div>

      {/* Grid biểu đồ 7 ngày */}
      <div className="grid grid-cols-7 gap-2 md:gap-4 pt-4">
        {weeklyTrend.map((day, idx) => {
          const gainHeightPct = Math.round((day.pointsGained / maxAbsPoints) * 100);
          const lossHeightPct = Math.round((day.pointsLost / maxAbsPoints) * 100);
          const hasData = day.pointsGained > 0 || day.pointsLost > 0 || day.attendanceRate !== null;

          return (
            <div
              key={idx}
              className="flex flex-col items-center group relative p-2 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              {/* Tỷ lệ chuyên cần badge */}
              <div className="mb-2 h-6 flex items-center">
                {day.attendanceRate !== null ? (
                  <span className="text-[10px] md:text-xs font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100 shadow-2xs">
                    {day.attendanceRate}%
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-300">--</span>
                )}
              </div>

              {/* Vùng cột biểu đồ điểm */}
              <div className="h-32 md:h-40 w-full flex items-end justify-center gap-1 bg-slate-100/60 rounded-xl p-1 relative overflow-hidden">
                {/* Cột điểm cộng */}
                <div
                  style={{ height: `${Math.max(gainHeightPct, 6)}%` }}
                  className={`w-3 md:w-4 rounded-t-md transition-all duration-500 ${
                    day.pointsGained > 0
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                      : 'bg-transparent'
                  }`}
                  title={`+${day.pointsGained} điểm`}
                ></div>

                {/* Cột điểm trừ */}
                <div
                  style={{ height: `${Math.max(lossHeightPct, 6)}%` }}
                  className={`w-3 md:w-4 rounded-t-md transition-all duration-500 ${
                    day.pointsLost > 0
                      ? 'bg-gradient-to-t from-rose-600 to-rose-400'
                      : 'bg-transparent'
                  }`}
                  title={`-${day.pointsLost} điểm`}
                ></div>

                {!hasData && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-medium rotate-[-45deg]">
                    Nghỉ
                  </span>
                )}
              </div>

              {/* Điểm ròng */}
              <div className="mt-2 text-center">
                <span
                  className={`text-xs md:text-sm font-black ${
                    day.netPoints > 0
                      ? 'text-emerald-600'
                      : day.netPoints < 0
                        ? 'text-rose-600'
                        : 'text-slate-400'
                  }`}
                >
                  {day.netPoints > 0 ? `+${day.netPoints}` : day.netPoints}
                </span>
              </div>

              {/* Tên thứ trong tuần */}
              <div className="mt-1 text-center">
                <span className="text-xs md:text-sm font-bold text-slate-700 block">
                  {day.dayLabel}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {day.dateStr.slice(8, 10)}/{day.dateStr.slice(5, 7)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Được trích xuất từ <strong>sổ cái giao dịch Supabase</strong> thời gian thực.
        </span>
        <span className="text-slate-400 text-[11px] mt-1 sm:mt-0">
          * Đã thay thế hoàn toàn công thức tạo số ngẫu nhiên Math.sin() cũ
        </span>
      </div>
    </Card>
  );
};
