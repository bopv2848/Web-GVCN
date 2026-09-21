import React, { useState } from 'react';
import type { ParentStudentPortalData } from '../types';
import { getAcademicWeekInfo } from '../../../utils/academicWeekUtils';

interface ParentTimetableTabProps {
  data: ParentStudentPortalData;
}

export const ParentTimetableTab: React.FC<ParentTimetableTabProps> = ({ data }) => {
  const { timetable } = data;
  const [selectedDay, setSelectedDay] = useState<number>(2); // Thứ 2 mặc định
  const academicWeek = getAcademicWeekInfo();

  const days = [
    { day: 2, label: 'Thứ 2' },
    { day: 3, label: 'Thứ 3' },
    { day: 4, label: 'Thứ 4' },
    { day: 5, label: 'Thứ 5' },
    { day: 6, label: 'Thứ 6' },
    { day: 7, label: 'Thứ 7' },
  ];

  const currentLessons = timetable.filter((t) => t.dayOfWeek === selectedDay);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 md:p-6 space-y-5">
      <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-slate-850 tracking-tight flex items-center gap-2">
            <span>🗓️</span> Thời Khóa Biểu Học Tập — Tuần {academicWeek.weekNumber}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {academicWeek.fullAppliedText} (Thứ 2 đầu tuần) • Lịch học để phụ huynh đôn đốc con chuẩn bị sách vở
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
          {academicWeek.fullAppliedText}
        </span>
      </div>

      {/* Days buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {days.map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              selectedDay === d.day
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Lessons */}
      {currentLessons.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs italic">
          Không có tiết học nào trong ngày này.
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentLessons.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shadow-2xs">
                  T{item.periodDisplay}
                </span>
                <div>
                  <h4 className="font-black text-slate-850 text-sm">{item.subjectName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {item.teacherName ? `GV: ${item.teacherName}` : 'Giáo viên bộ môn'}
                    {item.lessonTopic && ` • Bài: ${item.lessonTopic}`}
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                  item.session === 'morning'
                    ? 'bg-amber-100/80 text-amber-800'
                    : 'bg-indigo-100/80 text-indigo-800'
                }`}
              >
                {item.session === 'morning' ? 'Sáng' : 'Chiều'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
