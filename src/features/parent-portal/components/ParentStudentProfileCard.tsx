import React from 'react';
import type { ParentStudentPortalData } from '../types';

interface ParentStudentProfileCardProps {
  data: ParentStudentPortalData;
  onLogout: () => void;
}

export const ParentStudentProfileCard: React.FC<ParentStudentProfileCardProps> = ({
  data,
  onLogout,
}) => {
  const { student, totalPoints, totalStars, attendanceRate } = data;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 md:p-6 space-y-5">
      {/* Top action & Student Basic Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-primary text-white font-black text-2xl flex items-center justify-center shadow-md">
            {student.fullName.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg md:text-xl font-black text-slate-850 tracking-tight">
                {student.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-black bg-primary/10 text-primary border border-primary/20">
                {student.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {student.className} • {student.groupName} • {student.classRole}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          ← Tra cứu con khác
        </button>
      </div>

      {/* 3 Large KPI Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
        {/* Điểm thi đua */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider block">
            Điểm thi đua
          </span>
          <span
            className={`text-2xl md:text-3xl font-black tracking-tight mt-1 block ${
              totalPoints >= 0 ? 'text-primary' : 'text-rose-600'
            }`}
          >
            {totalPoints > 0 ? `+${totalPoints}` : totalPoints}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">Tích lũy nề nếp</span>
        </div>

        {/* Ngôi sao */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70">
          <span className="text-[10.5px] font-black text-amber-800 uppercase tracking-wider block">
            Sao tích lũy
          </span>
          <span className="text-2xl md:text-3xl font-black text-amber-600 tracking-tight mt-1 block">
            ⭐ {totalStars}
          </span>
          <span className="text-[10px] text-amber-700/70 font-semibold">Đổi quà khích lệ</span>
        </div>

        {/* Chuyên cần */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
          <span className="text-[10.5px] font-black text-emerald-800 uppercase tracking-wider block">
            Chuyên cần
          </span>
          <span className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight mt-1 block">
            {attendanceRate}%
          </span>
          <span className="text-[10px] text-emerald-700/70 font-semibold">Tỷ lệ đi học</span>
        </div>
      </div>

      {/* Message from Homeroom Teacher */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/50 border border-indigo-100 flex items-start gap-3">
        <span className="text-xl">📢</span>
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-black text-indigo-950">
            Lời nhắn từ GVCN: {student.teacherName}
          </p>
          <p className="text-[11.5px] leading-relaxed text-slate-600">
            Kính mong quý phụ huynh thường xuyên theo dõi nỗ lực học tập của con, nhắc nhở con chuẩn bị bài và đi học đúng giờ. Cảm ơn sự đồng hành của gia đình!
          </p>
        </div>
      </div>
    </div>
  );
};
