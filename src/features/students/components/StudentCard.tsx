import React from 'react';
import type { Student } from '../../../types/student';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onShowInvite: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onEdit,
  onDelete,
  onShowInvite,
}) => {
  const isFemale = student.gender === 'Nữ';

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top Banner Accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          student.groupName.includes('1')
            ? 'bg-rose-500'
            : student.groupName.includes('2')
              ? 'bg-emerald-500'
              : student.groupName.includes('3')
                ? 'bg-amber-500'
                : 'bg-blueAccent'
        }`}
      />

      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-xs ${
                    isFemale ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {student.fullName.charAt(0)}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 text-xs px-1 rounded-full ${
                  isFemale ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                } border border-white shadow-2xs`}
                title={student.gender}
              >
                {isFemale ? '♀' : '♂'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-850 group-hover:text-primary transition-colors leading-tight">
                {student.fullName}
              </h3>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {student.birthDate ? `🎂 ${student.birthDate}` : 'Chưa có ngày sinh'}
              </p>
            </div>
          </div>

          {/* Group Tag */}
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 whitespace-nowrap">
            {student.groupName}
          </span>
        </div>

        {/* Roles & Attributes */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
            {student.classRole}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/50">
            {student.boardingType || 'Bán trú'}
          </span>
          {student.guardianStatus === 'active' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span>✓</span>
              <span>Đã kết nối PH</span>
            </span>
          ) : (
            <button
              onClick={() => onShowInvite(student)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1"
            >
              <span>🔗</span>
              <span>Mời Phụ huynh</span>
            </button>
          )}
        </div>

        {/* Goals & Talents Preview */}
        {(student.goals || student.talents) && (
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-4">
            {student.goals && (
              <p className="truncate">
                🎯 <strong>Mục tiêu:</strong> {student.goals}
              </p>
            )}
            {student.talents && (
              <p className="truncate">
                🎨 <strong>Năng khiếu:</strong> {student.talents}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Points & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-100">
            +{student.points}đ
          </span>
          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-xl border border-amber-100">
            ⭐ {student.stars}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onShowInvite(student)}
            className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-indigo-50 transition-colors"
            title="Lấy mã liên kết phụ huynh"
            aria-label="Liên kết phụ huynh"
          >
            🔗
          </button>
          <button
            onClick={() => onEdit(student)}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Sửa thông tin học sinh"
            aria-label="Sửa thông tin"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(student)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Xóa học sinh"
            aria-label="Xóa học sinh"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};
