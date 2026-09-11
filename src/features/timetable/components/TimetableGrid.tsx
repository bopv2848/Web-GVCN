import React from 'react';
import type { TimetableEntry } from '../../../types/timetable';
import { timetableService } from '../services/timetableService';

interface TimetableGridProps {
  entries: TimetableEntry[];
  sessionFilter: 'all' | 'morning' | 'afternoon';
  onSelectEntry: (entry: TimetableEntry) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  sessionFilter,
  onSelectEntry,
}) => {
  const days = [
    { day: 2, name: 'Thứ 2' },
    { day: 3, name: 'Thứ 3' },
    { day: 4, name: 'Thứ 4' },
    { day: 5, name: 'Thứ 5' },
    { day: 6, name: 'Thứ 6' },
  ];

  const morningPeriods = [
    { period: 1, display: 1, time: '07:00 - 07:45' },
    { period: 2, display: 2, time: '07:50 - 08:35' },
    { period: 3, display: 3, time: '09:05 - 09:50' },
    { period: 4, display: 4, time: '09:55 - 10:40' },
    { period: 5, display: 5, time: '10:45 - 11:30' },
  ];

  const afternoonPeriods = [
    { period: 6, display: 1, time: '14:00 - 14:45' },
    { period: 7, display: 2, time: '14:50 - 15:35' },
    { period: 8, display: 3, time: '16:05 - 16:50' },
  ];

  const getEntryAt = (day: number, period: number) => {
    return entries.find((e) => e.dayOfWeek === day && e.period === period);
  };

  const renderSlot = (day: number, period: number) => {
    const entry = getEntryAt(day, period);
    if (!entry) {
      return (
        <div className="h-full min-h-[72px] rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 flex items-center justify-center text-slate-300 text-xs select-none">
          --
        </div>
      );
    }

    const color = timetableService.getSubjectColor(entry.subjectName);

    return (
      <div
        onClick={() => onSelectEntry(entry)}
        className={`h-full min-h-[72px] p-2.5 rounded-xl border ${color.borderClass} ${color.badgeBg} hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className={`text-xs md:text-sm font-black truncate ${color.badgeText}`}>
              {entry.subjectName}
            </span>
          </div>
          {entry.lessonTopic && (
            <p className="text-[11px] font-medium text-slate-650 mt-1 line-clamp-1">
              {entry.lessonTopic}
            </p>
          )}
        </div>

        <div className="mt-1.5 pt-1 border-t border-black/5 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
          <span className="truncate">{entry.teacherName ? entry.teacherName.split(' ')[0] : 'GV'}</span>
          <span className="text-slate-400">P.6A6</span>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <div className="min-w-[760px] bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Ngày trong tuần */}
        <div className="grid grid-cols-6 bg-slate-50 border-b border-slate-200 text-center text-xs font-black text-slate-700 py-3.5 px-3">
          <div className="text-slate-400">Tiết / Giờ</div>
          {days.map((d) => (
            <div key={d.day} className="text-primary font-black">
              {d.name}
            </div>
          ))}
        </div>

        {/* BUỔI SÁNG */}
        {(sessionFilter === 'all' || sessionFilter === 'morning') && (
          <div>
            <div className="bg-amber-50/70 border-b border-amber-200/60 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                ☀️ Buổi Sáng (5 Tiết)
              </span>
              <span className="text-[11px] font-semibold text-amber-700/80">
                07:00 — 11:30
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {morningPeriods.map((p, idx) => (
                <React.Fragment key={p.period}>
                  <div className="grid grid-cols-6 p-2.5 items-stretch gap-2">
                    {/* Cột số tiết */}
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-1 text-center border border-slate-150">
                      <span className="text-xs md:text-sm font-black text-slate-800">
                        Tiết {p.display}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {p.time}
                      </span>
                    </div>

                    {/* 5 Cột Thứ 2 -> Thứ 6 */}
                    {days.map((d) => (
                      <div key={d.day} className="h-full">
                        {renderSlot(d.day, p.period)}
                      </div>
                    ))}
                  </div>

                  {/* Giờ ra chơi giữa tiết 2 và tiết 3 */}
                  {idx === 1 && (
                    <div className="bg-blue-50/50 py-1.5 text-center text-[11px] font-bold text-blue-600 border-y border-blue-100/80 flex items-center justify-center gap-2">
                      <span>☕ Giờ ra chơi (08:35 - 09:05 • 30 phút)</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* BUỔI CHIỀU */}
        {(sessionFilter === 'all' || sessionFilter === 'afternoon') && (
          <div className="border-t-2 border-slate-200">
            <div className="bg-indigo-50/70 border-b border-indigo-200/60 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                ⛅ Buổi Chiều (3 Tiết)
              </span>
              <span className="text-[11px] font-semibold text-indigo-700/80">
                14:00 — 16:50 (Học Thứ 2, Thứ 3, Thứ 4)
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {afternoonPeriods.map((p, idx) => (
                <React.Fragment key={p.period}>
                  <div className="grid grid-cols-6 p-2.5 items-stretch gap-2">
                    {/* Cột số tiết */}
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-1 text-center border border-slate-150">
                      <span className="text-xs md:text-sm font-black text-slate-800">
                        Tiết {p.display}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {p.time}
                      </span>
                    </div>

                    {/* 5 Cột Thứ 2 -> Thứ 6 */}
                    {days.map((d) => (
                      <div key={d.day} className="h-full">
                        {renderSlot(d.day, p.period)}
                      </div>
                    ))}
                  </div>

                  {/* Giờ ra chơi giữa tiết 2 chiều và tiết 3 chiều */}
                  {idx === 1 && (
                    <div className="bg-blue-50/50 py-1.5 text-center text-[11px] font-bold text-blue-600 border-y border-blue-100/80 flex items-center justify-center gap-2">
                      <span>☕ Giờ ra chơi chiều (15:35 - 16:05 • 30 phút)</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
