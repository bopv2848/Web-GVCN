import React from 'react';
import type { MonthlyAttendanceReport } from '../../../types/attendance';

interface MonthlyAttendanceChartProps {
  report: MonthlyAttendanceReport;
}

export const MonthlyAttendanceChart: React.FC<MonthlyAttendanceChartProps> = ({ report }) => {
  const rankMedals = ['🥇', '🥈', '🥉', '🎗️'];

  return (
    <div className="space-y-6">
      {/* 1. Biểu đồ thanh so sánh 4 Tổ */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">
              🏆 Xếp Hạng Chuyên Cần 4 Tổ (Tháng {report.month}/{report.year})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              So sánh tỷ lệ hiện diện và tổng số lượt vắng/muộn giữa các tổ thi đua
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            Tổng {report.totalSessions} buổi học
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.groupStats.map((grp, idx) => {
            const isLeader = idx === 0;
            return (
              <div
                key={grp.groupId}
                className={`p-4 rounded-2xl border transition-all ${
                  isLeader
                    ? 'bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 border-emerald-300 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black">{rankMedals[idx] || '🎗️'}</span>
                    <div>
                      <h4 className="font-black text-sm text-slate-850">{grp.groupName}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Sĩ số: {grp.memberCount} học sinh
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-black ${
                        grp.attendanceRate >= 95
                          ? 'text-emerald-600'
                          : grp.attendanceRate >= 90
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {grp.attendanceRate}%
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Chuyên cần
                    </span>
                  </div>
                </div>

                {/* Thanh tiến trình chuyên cần */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      grp.attendanceRate >= 95
                        ? 'bg-emerald-500'
                        : grp.attendanceRate >= 90
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(5, Math.min(100, grp.attendanceRate))}%` }}
                  />
                </div>

                {/* Chi tiết phân loại */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] pt-2 border-t border-slate-200/60 font-medium">
                  <div className="bg-white/80 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px] uppercase">Có mặt</span>
                    <span className="font-bold text-emerald-700">{grp.presentCount}</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px] uppercase">Đi muộn</span>
                    <span className="font-bold text-amber-700">{grp.lateCount}</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px] uppercase">Có phép</span>
                    <span className="font-bold text-blue-700">{grp.excusedCount}</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px] uppercase">K.Phép</span>
                    <span className="font-bold text-rose-700">{grp.unexcusedCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Biểu đồ xu hướng chuyên cần theo từng ngày */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">
              📅 Biểu Đồ Xu Hướng Chuyên Cần Theo Ngày Trong Tháng
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cột cao biểu thị tỷ lệ % học sinh đi học đầy đủ; chấm đỏ cảnh báo ngày có học sinh vắng
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ≥95%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 90-94%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> &lt;90%
            </span>
          </div>
        </div>

        {report.dailyTrends.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-semibold">
            Tháng {report.month}/{report.year} chưa có phiên điểm danh nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-end gap-2 min-w-[500px] h-44 pt-6 px-2">
              {report.dailyTrends.map((d) => {
                const dayNumber = d.date.split('-')[2];
                const colorBg =
                  d.attendanceRate >= 95
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : d.attendanceRate >= 90
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-rose-500 hover:bg-rose-600';

                return (
                  <div
                    key={`${d.date}-${d.sessionType}`}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Tooltip khi hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                        Ngày {d.date} ({d.sessionType === 'morning' ? 'Sáng' : 'Chiều'}): {d.attendanceRate}%
                        <br />
                        Có mặt: {d.presentCount} • Vắng: {d.absentCount} • Muộn: {d.lateCount}
                      </div>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                    </div>

                    {/* Tỷ lệ % trên cột */}
                    <span className="text-[9px] font-bold text-slate-500 mb-1 group-hover:text-primary transition-colors">
                      {d.attendanceRate}%
                    </span>

                    {/* Cột tỷ lệ */}
                    <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg h-28 flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${colorBg}`}
                        style={{ height: `${Math.max(10, d.attendanceRate)}%` }}
                      />
                    </div>

                    {/* Nhãn Ngày */}
                    <span className="text-[10px] font-black text-slate-750 mt-1.5">
                      {dayNumber}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">
                      {d.sessionType === 'morning' ? 'S' : 'C'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
