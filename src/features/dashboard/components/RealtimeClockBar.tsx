import React, { useState, useEffect } from 'react';
import { Calendar, Clock, GraduationCap } from 'lucide-react';
import { getAcademicWeekInfo } from '../../../utils/academicWeekUtils';

const DAYS_OF_WEEK = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

export const RealtimeClockBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleConfigChange = () => {
      setCurrentTime(new Date());
    };
    window.addEventListener('academic-week-config-changed', handleConfigChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('academic-week-config-changed', handleConfigChange);
    };
  }, []);

  const dayOfWeek = DAYS_OF_WEEK[currentTime.getDay()];
  const day = String(currentTime.getDate()).padStart(2, '0');
  const month = String(currentTime.getMonth() + 1).padStart(2, '0');
  const year = currentTime.getFullYear();

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  // Tính tuần học hiện tại trong năm học (tự động áp dụng cấu hình tùy biến từ Cài đặt)
  const academicWeek = getAcademicWeekInfo(currentTime);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Khung hiển thị thời gian thực theo chuẩn phong cách Dashboard */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
        <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-50 text-blue-600">
          <Calendar className="w-4 h-4" />
        </span>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm">
          <span className="font-bold text-slate-800">
            {dayOfWeek}, ngày {day} tháng {month} năm {year}
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>

          {/* Badge Tuần học & Học kỳ */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs hover:bg-indigo-100/70 transition-colors cursor-default"
            title={`Tuần học từ ${academicWeek.weekStartDate} đến ${academicWeek.weekEndDate}`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600 inline" />
            <span>{academicWeek.weekLabel}</span>
          </span>

          <span className="text-slate-300 hidden sm:inline">•</span>

          {/* Đồng hồ thời gian thực */}
          <div className="flex items-center gap-1.5 font-mono font-bold text-primary">
            <span
              className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
              title="Đồng hồ thời gian thực"
            ></span>
            <Clock className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>
              {hours}:{minutes}:{seconds}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
