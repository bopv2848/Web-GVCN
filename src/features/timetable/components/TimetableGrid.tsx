import React, { useMemo } from 'react';
import type { TimetableEntry } from '../../../types/timetable';
import { timetableService } from '../services/timetableService';
import { getSchoolWeekDays, type AcademicWeekInfo } from '../../../utils/academicWeekUtils';
import type { TimetableWeeklyOverride } from '../types/timetableOverrideTypes';
import { AlertTriangle } from 'lucide-react';

interface TimetableGridProps {
  entries: TimetableEntry[];
  sessionFilter: 'all' | 'morning' | 'afternoon';
  onSelectEntry: (entry: TimetableEntry) => void;
  academicWeek?: AcademicWeekInfo;
  overrides?: Record<string, TimetableWeeklyOverride>;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  sessionFilter,
  onSelectEntry,
  academicWeek,
  overrides = {},
}) => {
  const days = useMemo(() => {
    if (academicWeek?.mondayDate) {
      return getSchoolWeekDays(academicWeek.mondayDate);
    }
    return [
      { day: 2, name: 'Thứ 2', dateStr: '', fullDateStr: '', isToday: false },
      { day: 3, name: 'Thứ 3', dateStr: '', fullDateStr: '', isToday: false },
      { day: 4, name: 'Thứ 4', dateStr: '', fullDateStr: '', isToday: false },
      { day: 5, name: 'Thứ 5', dateStr: '', fullDateStr: '', isToday: false },
      { day: 6, name: 'Thứ 6', dateStr: '', fullDateStr: '', isToday: false },
    ];
  }, [academicWeek]);

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

    const ov = overrides[entry.id];
    const isOverridden = Boolean(ov && (ov.note || ov.overrideRoom || ov.overrideTeacher || ov.overrideSubject || ov.isConflict));
    const isConflict = Boolean(ov?.isConflict);

    const displaySubject = ov?.overrideSubject || entry.subjectName;
    const displayTeacher = ov?.overrideTeacher || entry.teacherName;
    const displayRoom = ov?.overrideRoom || entry.roomName || 'P.6A6';

    const color = timetableService.getSubjectColor(displaySubject);

    return (
      <div
        onClick={() => onSelectEntry(entry)}
        className={`h-full min-h-[76px] p-2.5 rounded-xl border ${color.borderClass} ${color.badgeBg} ${
          isConflict
            ? 'ring-2 ring-rose-500 border-rose-400 bg-rose-50/70'
            : isOverridden
            ? 'ring-1.5 ring-amber-400 border-amber-300 shadow-xs'
            : ''
        } hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between relative group`}
      >
        <div>
          {/* Cảnh báo xung đột nếu có */}
          {isConflict && (
            <div className="mb-1 text-[9px] font-black text-rose-700 bg-rose-100/90 px-1.5 py-0.5 rounded border border-rose-300 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
              <span className="truncate">{ov?.conflictReason || 'Xung đột!'}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            <span className={`text-xs md:text-sm font-black truncate ${color.badgeText}`}>
              {displaySubject}
            </span>
            {isOverridden && !isConflict && (
              <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1 rounded shadow-2xs">
                Tuần này
              </span>
            )}
          </div>

          {/* Ghi chú nhanh tuần nếu có */}
          {ov?.note ? (
            <p className="text-[10px] font-black text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded mt-1 line-clamp-1 border border-amber-200" title={ov.note}>
              📌 {ov.note}
            </p>
          ) : entry.lessonTopic ? (
            <p className="text-[11px] font-medium text-slate-650 mt-1 line-clamp-1">
              {entry.lessonTopic}
            </p>
          ) : null}
        </div>

        <div className="mt-1.5 pt-1 border-t border-black/5 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
          <span className={`truncate ${ov?.overrideTeacher ? 'text-emerald-700 font-black' : ''}`} title={displayTeacher}>
            {displayTeacher ? displayTeacher.split(' ')[0] : 'GV'}
          </span>
          <span
            className={`px-1 py-0.2 rounded ${
              ov?.overrideRoom
                ? 'bg-blue-100 text-blue-700 font-black border border-blue-200'
                : 'text-slate-400'
            }`}
          >
            {displayRoom}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <div className="min-w-[760px] bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Ngày trong tuần */}
        <div className="grid grid-cols-6 bg-slate-50 border-b border-slate-200 text-center text-xs font-black text-slate-700 py-3 px-3">
          <div className="text-slate-400 flex items-center justify-center">Tiết / Giờ</div>
          {days.map((d) => (
            <div
              key={d.day}
              className={`flex flex-col items-center justify-center gap-0.5 ${
                d.isToday ? 'text-emerald-700' : 'text-primary'
              }`}
            >
              <span className="font-black text-xs md:text-sm">{d.name}</span>
              {d.dateStr && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    d.isToday
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  {d.dateStr} {d.isToday && '• Hôm nay'}
                </span>
              )}
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
