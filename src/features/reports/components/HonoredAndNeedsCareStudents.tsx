import React from 'react';
import type { StudentReportStat } from '../types';

interface HonoredAndNeedsCareStudentsProps {
  topStudents: StudentReportStat[];
  studentsNeedingCare: StudentReportStat[];
}

export const HonoredAndNeedsCareStudents: React.FC<HonoredAndNeedsCareStudentsProps> = ({
  topStudents,
  studentsNeedingCare,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. Top 5 Học sinh Tiêu biểu */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700 text-lg">🌟</span>
            <div>
              <h3 className="text-base font-black text-slate-850 tracking-tight">
                Top Học Sinh Tiêu Biểu & Xuất Sắc
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tuyên dương nỗ lực thi đua, tích cực phát biểu và nề nếp tốt
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Vinh danh
          </span>
        </div>

        {topStudents.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Chưa có học sinh nào đạt điểm cộng trong giai đoạn này.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {topStudents.map((s, idx) => (
              <div key={s.studentId} className="py-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : idx === 2
                        ? 'bg-amber-700/30 text-amber-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-850 group-hover:text-primary transition-colors">
                      {s.fullName}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {s.groupName} • {s.classRole}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +{s.totalPoints} điểm
                  </span>
                  <p className="text-[10px] font-bold text-amber-600 mt-0.5">⭐ {s.stars} sao</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Danh sách Học sinh Cần Quan tâm & Rèn luyện */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700 text-lg">💡</span>
            <div>
              <h3 className="text-base font-black text-slate-850 tracking-tight">
                Học Sinh Cần Phối Hợp Kèm Cặp
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Theo dõi điểm trừ nề nếp hoặc vắng/muộn để kịp thời trao đổi gia đình
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            {studentsNeedingCare.length} em
          </span>
        </div>

        {studentsNeedingCare.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-xs font-bold text-emerald-700">
              Tuyệt vời! Không có học sinh nào bị điểm trừ hoặc vi phạm nề nếp đáng ngại.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {studentsNeedingCare.map((s) => (
              <div key={s.studentId} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-850">{s.fullName}</h4>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {s.groupName} • {s.code}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  {s.totalPoints < 0 && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                      {s.totalPoints} điểm
                    </span>
                  )}
                  <div className="text-[10px] font-bold text-slate-500 flex items-center justify-end gap-1.5">
                    {s.lateCount > 0 && <span className="text-amber-600">Muộn: {s.lateCount}</span>}
                    {s.unexcusedCount > 0 && (
                      <span className="text-rose-600">K.Phép: {s.unexcusedCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
