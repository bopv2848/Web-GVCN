import React from 'react';
import type { Student } from '../../../types/student';
import { getShortRole, getGroupColorDot } from '../utils/seatingRoleUtils';
import { splitStudentName } from '../utils/seatingPrintNameUtils';
import { computeCompensatedNameSizes } from '../utils/seatingZoomUtils';

export interface DeskCellProps {
  student?: Student;
  rowIndex: number;
  colIndex: number;
  isSick?: boolean;
  isCluster?: boolean;
  isAtRisk?: boolean;
  sickReason?: string;
  isMedicalMode?: boolean;
  isSelectedForSwap?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  isFullscreen?: boolean;
  isHighlighted?: boolean;
  isWinner?: boolean;
  isCalled?: boolean;
  isLargeTextMode?: boolean;
  zoomLevel?: number;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const DeskCell: React.FC<DeskCellProps> = ({
  student,
  rowIndex: _rowIndex,
  colIndex: _colIndex,
  isSick = false,
  isCluster = false,
  isAtRisk = false,
  sickReason,
  isMedicalMode,
  isSelectedForSwap = false,
  isDragging = false,
  isDragOver = false,
  isFullscreen = false,
  isHighlighted = false,
  isWinner = false,
  isCalled = false,
  isLargeTextMode: isLargeTextModeProp,
  zoomLevel,
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
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
        className="min-h-[6rem] h-full p-2.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group select-none"
        title="Bàn học còn trống - Kéo học sinh thả vào đây hoặc chạm để xếp chỗ"
      >
        <span className="text-sm">🪑</span>
        <span>Ghế trống</span>
        <span className="text-[9px] font-normal mt-0.5 text-slate-400">
          (Thả vào đây)
        </span>
      </div>
    );
  }

  // 2. Xác định style dựa trên trạng thái kéo thả, y tế, bốc thăm và chế độ Chữ Siêu To
  const isLargeTextMode =
    isLargeTextModeProp !== undefined ? isLargeTextModeProp : Boolean(isFullscreen);

  let cardStyle = isLargeTextMode
    ? 'bg-white border-[3px] border-slate-600 text-slate-900 shadow-none'
    : 'bg-white border-2 border-slate-400/90 shadow-2xs hover:border-slate-700 hover:shadow-xs text-slate-800';
  let badgeEl: React.ReactNode = null;

  if (isWinner) {
    cardStyle = 'bg-emerald-300 border-[4px] border-emerald-600 ring-8 ring-emerald-400/90 scale-105 z-30 shadow-2xl animate-bounce text-slate-950 font-black';
    badgeEl = (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-700 text-white font-black text-[9.5px] uppercase tracking-wider animate-pulse shadow-xs">
        👑 Trúng Thưởng
      </span>
    );
  } else if (isHighlighted) {
    cardStyle = 'bg-emerald-200 border-[4px] border-emerald-500 ring-4 ring-emerald-400 scale-105 z-20 shadow-xl text-slate-950 font-black';
    badgeEl = (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse">
        🎯 Đang Chọn
      </span>
    );
  } else if (isSelectedForSwap) {
    cardStyle = isLargeTextMode
      ? 'bg-amber-100 border-[3px] border-black ring-4 ring-black/40 text-black scale-[1.02] shadow-md'
      : 'bg-blue-50/90 border-2 border-primary ring-4 ring-primary/30 shadow-md scale-[1.02] animate-pulse';
  } else if (isDragging) {
    cardStyle = 'opacity-30 border-2 border-dashed border-primary scale-95 bg-primary/5';
  } else if (isDragOver) {
    cardStyle = isLargeTextMode
      ? 'border-[3px] border-black bg-blue-100 ring-2 ring-black scale-[1.02]'
      : 'border-2 border-primary bg-primary/15 ring-2 ring-primary/40 scale-[1.02] shadow-sm';
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

  const shortRole = getShortRole(student.classRole);
  const groupDot = getGroupColorDot(student.groupName);
  const studentNameLines = splitStudentName(student.fullName);

  // Tự động co giãn cỡ chữ với tên dài; phóng to vượt trội cho học sinh ngồi xa
  const nameWords = student.fullName.trim().split(/\s+/);
  const isVeryLongName = nameWords.length >= 5 || student.fullName.trim().length >= 22;
  const isLongName = nameWords.length >= 4 || student.fullName.trim().length >= 16;

  let firstLineClass = '';
  let secondLineClass = '';
  let singleLineClass = '';

  if (isLargeTextMode) {
    // Chế độ Chữ Siêu To: Tên chính cực to rõ, phóng lớn cho tầm nhìn xa
    if (isVeryLongName) {
      firstLineClass = 'text-[11.5px] sm:text-[12.5px] font-bold text-slate-700 leading-tight';
      secondLineClass = 'text-[18px] sm:text-[20px] md:text-[22px] font-black text-slate-950 tracking-tight leading-tight';
    } else if (isLongName) {
      firstLineClass = 'text-[12.5px] sm:text-[13.5px] font-bold text-slate-700 leading-tight';
      secondLineClass = 'text-[21px] sm:text-[23px] md:text-[26px] font-black text-slate-950 tracking-tight leading-tight';
    } else {
      firstLineClass = 'text-[13.5px] sm:text-[14.5px] font-extrabold text-slate-700 leading-tight';
      secondLineClass = 'text-[24px] sm:text-[27px] md:text-[30px] font-black text-slate-950 tracking-tight leading-tight';
    }
    singleLineClass = 'text-[22px] sm:text-[25px] md:text-[29px] font-black text-slate-950 tracking-tight leading-normal';
  } else {
    // Chế độ Chuẩn (xem gần trên máy tính)
    if (isVeryLongName) {
      firstLineClass = 'text-[9.5px] sm:text-[10px] font-semibold text-slate-600 leading-tight';
      secondLineClass = 'text-[12.5px] sm:text-[13.5px] font-black text-slate-900 tracking-tight leading-tight';
    } else if (isLongName) {
      firstLineClass = 'text-[10.5px] sm:text-[11px] font-semibold text-slate-600 leading-tight';
      secondLineClass = 'text-[13.5px] sm:text-[14.5px] font-black text-slate-900 tracking-tight leading-tight';
    } else {
      firstLineClass = 'text-[11px] sm:text-[11.5px] font-semibold text-slate-600 leading-tight';
      secondLineClass = 'text-[14.5px] sm:text-[15.5px] font-black text-slate-900 tracking-tight leading-tight';
    }
    singleLineClass = 'text-[14.5px] sm:text-[15.5px] font-black text-slate-900 tracking-tight leading-normal';
  }

  // Tự động tính toán bù trừ tỷ lệ cỡ chữ theo mức Zoom (Zoom Compensation)
  const compensatedSizes = computeCompensatedNameSizes(
    zoomLevel,
    isLargeTextMode,
    isLongName,
    isVeryLongName
  );

  return (
    <div
      data-testid="student-desk-card"
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`${
        compensatedSizes.isDeepZoom
          ? 'min-h-[7.5rem] sm:min-h-[8.2rem]'
          : isLargeTextMode
          ? 'min-h-[7.25rem] sm:min-h-[7.75rem]'
          : 'min-h-[6.5rem] sm:min-h-[7rem]'
      } h-full p-2.5 rounded-2xl transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between select-none ${cardStyle}`}
      title={
        isSelectedForSwap
          ? `Đang chọn ${student.fullName}. Chạm vào bạn khác hoặc ghế trống để đổi chỗ!`
          : isMedicalMode && isSick
          ? `${student.fullName}: Đang nghỉ ốm (${sickReason || 'Ốm sốt'})`
          : isMedicalMode && isAtRisk
          ? `${student.fullName}: Ngồi cạnh ca ốm - Cần đeo khẩu trang & đo thân nhiệt`
          : `${student.fullName} (${student.groupName}${student.classRole ? ` • ${student.classRole}` : ''}) - Kéo hoặc chạm để đổi chỗ`
      }
    >
      {/* Header cell: Avatar 2D (kèm Chấm tròn màu phân biệt Tổ) + Chức vụ viết tắt bên phải */}
      <div className="flex items-center justify-between gap-1 w-full">
        {/* Cụm bên trái: Avatar 2D (kích thước lớn, rõ nét) + Chấm tròn màu phân biệt Tổ ở viền */}
        <div className="relative inline-flex shrink-0">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center font-black text-sm ${
              isSelectedForSwap
                ? 'bg-primary text-white ring-2 ring-primary border border-slate-200/60 shadow-xs'
                : isMedicalMode && (isSick || isCluster)
                ? 'bg-rose-200 text-rose-900 border border-slate-200/60 shadow-xs'
                : student.gender === 'Nam'
                ? 'bg-blue-100 text-blue-800 border border-slate-200/60 shadow-xs'
                : 'bg-pink-100 text-pink-800 border border-slate-200/60 shadow-xs'
            }`}
          >
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {student.fullName.charAt(student.fullName.lastIndexOf(' ') + 1) || student.fullName.charAt(0)}
              </span>
            )}
          </div>

          {/* Chấm tròn màu phân biệt Tổ ở góc viền Avatar */}
          <span
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${groupDot.bgClass} ring-2 ring-white shadow-xs`}
            title={groupDot.title}
          />
        </div>

        {/* Cụm bên phải: Chức vụ viết tắt (LT, PHT, TTt1, TPt1...) hoặc Cảnh báo Y tế + Huy hiệu đã phát biểu */}
        <div className="flex items-center gap-1 shrink-0">
          {isCalled && (
            <span
              className="px-1 py-0.5 rounded-md font-black shadow-none flex items-center gap-0.5 select-none bg-amber-100 text-amber-900 border border-amber-300 text-[9px]"
              title="Đã được bốc thăm phát biểu trong buổi học này"
            >
              <span>🎙️</span>
            </span>
          )}
          {badgeEl ? (
            badgeEl
          ) : shortRole ? (
            <span
              className="px-1.5 py-0.5 rounded-md font-black shadow-none bg-blue-100 text-blue-900 border border-blue-300/80 text-[9.5px]"
              title={`Ban cán sự: ${student.classRole}`}
            >
              {shortRole}
            </span>
          ) : null}
          {/* Biểu tượng kéo thả nhẹ */}
          <span className="text-[9px] text-slate-300 opacity-60 hidden sm:inline" title="Kéo để di chuyển">
            ⋮⋮
          </span>
        </div>
      </div>

      {/* Tên học sinh (Canh giữa & Tự động co giãn cỡ chữ, đồng bộ đưa chữ lót + tên xuống hàng dưới) */}
      <div className="mt-1 flex-1 flex flex-col justify-center items-center text-center px-0.5 w-full">
        {studentNameLines.hasSplit ? (
          <div className="text-center w-full space-y-0.5">
            <span
              style={{ fontSize: `${compensatedSizes.firstLinePx}px` }}
              className={`block leading-tight truncate ${firstLineClass}`}
            >
              {isSelectedForSwap && '👉 '}{studentNameLines.firstLine}
            </span>
            <span
              style={{ fontSize: `${compensatedSizes.secondLinePx}px` }}
              className={`block leading-tight truncate ${secondLineClass}`}
            >
              {studentNameLines.secondLine}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full min-h-[26px] my-auto">
            <span
              style={{ fontSize: `${compensatedSizes.singleLinePx}px` }}
              className={`block text-center w-full truncate leading-normal py-0.5 ${singleLineClass}`}
            >
              {isSelectedForSwap && '👉 '}{student.fullName}
            </span>
          </div>
        )}
        {isMedicalMode && isSick && sickReason ? (
          <p className="text-[9.5px] text-rose-700 italic break-words mt-0.5 font-medium text-center">
            {sickReason}
          </p>
        ) : isSelectedForSwap ? (
          <p className="text-[10px] text-primary font-bold mt-0.5 animate-pulse text-center">
            Chạm đích để đổi...
          </p>
        ) : null}
      </div>
    </div>
  );
};
