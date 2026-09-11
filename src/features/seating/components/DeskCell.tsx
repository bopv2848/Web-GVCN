import React from 'react';
import type { Student } from '../../../types/student';

interface DeskCellProps {
  student?: Student;
  rowIndex: number;
  colIndex: number;
  isSick?: boolean;
  isCluster?: boolean;
  isAtRisk?: boolean;
  sickReason?: string;
  isMedicalMode: boolean;
  isSelectedForSwap?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const DeskCell: React.FC<DeskCellProps> = ({
  student,
  isSick = false,
  isCluster = false,
  isAtRisk = false,
  sickReason,
  isMedicalMode,
  isSelectedForSwap = false,
  isDragging = false,
  isDragOver = false,
  onClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  // 1. Trường hợp ghế trống
  if (!student) {
    return (
      <div
        onClick={onClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`h-24 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-[10px] font-semibold cursor-pointer select-none ${
          isDragOver
            ? 'border-primary bg-primary/15 ring-2 ring-primary/40 text-primary scale-[1.02]'
            : isSelectedForSwap
            ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300 text-amber-800'
            : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:border-slate-300 hover:bg-slate-100/60'
        }`}
        title="Chạm hoặc thả học sinh vào đây để chuyển ghế"
      >
        <span className="text-sm">🪑</span>
        <span>Ghế trống</span>
        <span className="text-[9px] text-slate-400 font-normal mt-0.5">(Thả vào đây)</span>
      </div>
    );
  }

  // 2. Xác định style dựa trên trạng thái kéo thả và y tế
  let cardStyle = 'bg-white border border-slate-200 hover:border-primary/50 hover:shadow-xs';
  let badgeEl: React.ReactNode = null;

  if (isSelectedForSwap) {
    cardStyle = 'bg-blue-50/90 border-2 border-primary ring-4 ring-primary/30 shadow-md scale-[1.02] animate-pulse';
  } else if (isDragging) {
    cardStyle = 'opacity-30 border-2 border-dashed border-primary scale-95 bg-primary/5';
  } else if (isDragOver) {
    cardStyle = 'border-2 border-primary bg-primary/15 ring-2 ring-primary/40 scale-[1.02] shadow-sm';
  } else if (isMedicalMode) {
    if (isCluster) {
      cardStyle = 'bg-rose-50 border-2 border-rose-500 ring-2 ring-rose-400/50 shadow-md shadow-rose-500/10';
      badgeEl = (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          🚨 Cụm Lây Nhiễm
        </span>
      );
    } else if (isSick) {
      cardStyle = 'bg-rose-50/80 border-2 border-rose-400 ring-2 ring-rose-300/40';
      badgeEl = (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[9.5px]">
          🔴 🤒 Nghỉ ốm
        </span>
      );
    } else if (isAtRisk) {
      cardStyle = 'bg-amber-50/80 border-2 border-amber-300 ring-2 ring-amber-300/30';
      badgeEl = (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px]">
          ⚠️ Cạnh ca ốm
        </span>
      );
    }
  }

  return (
    <div
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`h-24 p-2.5 rounded-2xl transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between select-none ${cardStyle}`}
      title={
        isSelectedForSwap
          ? `Đang chọn ${student.fullName}. Chạm vào bạn khác hoặc ghế trống để đổi chỗ!`
          : isMedicalMode && isSick
          ? `${student.fullName}: Đang nghỉ ốm (${sickReason || 'Ốm sốt'})`
          : isMedicalMode && isAtRisk
          ? `${student.fullName}: Ngồi cạnh ca ốm - Cần đeo khẩu trang & đo thân nhiệt`
          : `${student.fullName} (${student.groupName}) - Kéo hoặc chạm để đổi chỗ`
      }
    >
      {/* Header cell: Avatar + Role / Badge + Drag Icon */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
              isSelectedForSwap
                ? 'bg-primary text-white ring-2 ring-primary'
                : isMedicalMode && (isSick || isCluster)
                ? 'bg-rose-200 text-rose-900'
                : student.gender === 'Nam'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-pink-100 text-pink-800'
            }`}
          >
            {student.fullName.charAt(student.fullName.lastIndexOf(' ') + 1) || student.fullName.charAt(0)}
          </div>
          <span className="text-[10px] font-bold text-slate-500 truncate">{student.groupName}</span>
        </div>

        <div className="flex items-center gap-1">
          {badgeEl ? (
            badgeEl
          ) : (
            student.classRole &&
            student.classRole !== 'Học sinh' && (
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold text-[9px] shrink-0">
                {student.classRole}
              </span>
            )
          )}
          {/* Biểu tượng kéo thả nhẹ */}
          <span className="text-[10px] text-slate-300 opacity-60 hidden sm:inline" title="Kéo để di chuyển">
            ⋮⋮
          </span>
        </div>
      </div>

      {/* Tên học sinh */}
      <div>
        <p className="font-bold text-xs text-slate-850 truncate leading-snug">
          {isSelectedForSwap && '👉 '}
          {student.fullName}
        </p>
        {isMedicalMode && isSick && sickReason ? (
          <p className="text-[10px] text-rose-700 italic truncate mt-0.5 font-medium">
            {sickReason}
          </p>
        ) : isSelectedForSwap ? (
          <p className="text-[10px] text-primary font-bold mt-0.5 animate-pulse">
            Chạm đích để đổi...
          </p>
        ) : null}
      </div>
    </div>
  );
};
