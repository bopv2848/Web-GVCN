import React from 'react';
import type { ParentStudentPortalData } from '../types';

interface ParentAttendanceTabProps {
  data: ParentStudentPortalData;
}

export const ParentAttendanceTab: React.FC<ParentAttendanceTabProps> = ({ data }) => {
  const {
    presentCount,
    lateCount,
    excusedCount,
    unexcusedCount,
    attendanceHistory,
  } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ Có mặt
          </span>
        );
      case 'late':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-amber-100 text-amber-800 border border-amber-200">
            ⏰ Đi muộn
          </span>
        );
      case 'excused':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-blue-100 text-blue-800 border border-blue-200">
            📋 Nghỉ có phép
          </span>
        );
      case 'unexcused':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            ✕ Nghỉ K.Phép
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 md:p-6 space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-black text-slate-850 tracking-tight flex items-center gap-2">
          <span>📅</span> Nhật Ký Chuyên Cần & Điểm Danh
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Chi tiết từng buổi học và ghi chú của thầy cô tại lớp
        </p>
      </div>

      {/* Metric counters */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl">
          <span className="text-[10.5px] font-bold text-emerald-800 block">Có mặt</span>
          <span className="text-lg font-black text-emerald-700">{presentCount}</span>
        </div>
        <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
          <span className="text-[10.5px] font-bold text-amber-800 block">Đi muộn</span>
          <span className="text-lg font-black text-amber-700">{lateCount}</span>
        </div>
        <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-2xl">
          <span className="text-[10.5px] font-bold text-blue-800 block">Có phép</span>
          <span className="text-lg font-black text-blue-700">{excusedCount}</span>
        </div>
        <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-2xl">
          <span className="text-[10.5px] font-bold text-rose-800 block">K.Phép</span>
          <span className="text-lg font-black text-rose-700">{unexcusedCount}</span>
        </div>
      </div>

      {/* Attendance records list */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
          Lịch sử các ngày gần nhất ({attendanceHistory.length} buổi)
        </h4>

        {attendanceHistory.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Chưa có ghi chép điểm danh nào trong hệ thống.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
            {attendanceHistory.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Ngày {item.sessionDate} • Buổi {item.sessionType === 'morning' ? 'Sáng' : 'Chiều'}
                  </span>
                  {item.note && (
                    <span className="text-[11px] text-slate-500 italic mt-0.5 block">
                      Ghi chú: "{item.note}"
                    </span>
                  )}
                </div>

                <div>{getStatusBadge(item.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
