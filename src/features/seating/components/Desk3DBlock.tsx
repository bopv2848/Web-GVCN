import React from 'react';
import type { SeatAssignmentWithStudent } from '../../../types/seating';
import { getShortRole, getGroupColorDot } from '../utils/seatingRoleUtils';
import { getDeskSupplies } from '../utils/seatingSuppliesUtils';
import { splitStudentName } from '../utils/seatingPrintNameUtils';
import { computeCompensatedNameSizes } from '../utils/seatingZoomUtils';
import { Desk3DFireworks } from './Desk3DFireworks';

interface Desk3DBlockProps {
  rowIndex: number;
  colLeft: number;
  colRight: number;
  leftAssign?: SeatAssignmentWithStudent;
  rightAssign?: SeatAssignmentWithStudent;
  isDeskInCluster: boolean;
  isLeftSick: boolean;
  isRightSick: boolean;
  isLeftAtRisk: boolean;
  isRightAtRisk: boolean;
  leftSickReason?: string;
  rightSickReason?: string;
  isLeftAbsent?: boolean;
  leftAbsentReason?: string;
  isRightAbsent?: boolean;
  rightAbsentReason?: string;
  isMedicalMode: boolean;
  isLeftSelected: boolean;
  isRightSelected: boolean;
  isLeftDragging: boolean;
  isRightDragging: boolean;
  isLeftDragOver: boolean;
  isRightDragOver: boolean;
  isLeftHighlighted?: boolean;
  isRightHighlighted?: boolean;
  isLeftWinner?: boolean;
  isRightWinner?: boolean;
  zoomLevel?: number;
  isLargeTextMode?: boolean;
  isFullscreen?: boolean;
  onDragStart: (e: React.DragEvent, assignment: SeatAssignmentWithStudent, r: number, c: number) => void;
  onDragOver: (e: React.DragEvent, r: number, c: number) => void;
  onDragLeave: (e: React.DragEvent, r: number, c: number) => void;
  onDrop: (e: React.DragEvent, r: number, c: number, targetAssignment?: SeatAssignmentWithStudent) => void;
  onSeatClick: (r: number, c: number, assignment?: SeatAssignmentWithStudent) => void;
}

export const Desk3DBlock: React.FC<Desk3DBlockProps> = ({
  rowIndex,
  colLeft,
  colRight,
  leftAssign,
  rightAssign,
  isDeskInCluster,
  isLeftSick,
  isRightSick,
  isLeftAtRisk,
  isRightAtRisk,
  leftSickReason,
  rightSickReason,
  isLeftAbsent,
  leftAbsentReason,
  isRightAbsent,
  rightAbsentReason,
  isMedicalMode,
  isLeftSelected,
  isRightSelected,
  isLeftDragging,
  isRightDragging,
  isLeftDragOver,
  isRightDragOver,
  isLeftHighlighted = false,
  isRightHighlighted = false,
  isLeftWinner = false,
  isRightWinner = false,
  zoomLevel,
  isLargeTextMode: isLargeTextModeProp,
  isFullscreen = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onSeatClick,
}) => {
  const supplies = getDeskSupplies(rowIndex, colLeft);
  const isDeskWinner = isLeftWinner || isRightWinner;
  const isDeskHighlighted = isLeftHighlighted || isRightHighlighted;

  // Render một chỗ ngồi học sinh trên mặt bàn 3D
  const renderSeatCard = (
    assignment: SeatAssignmentWithStudent | undefined,
    colIndex: number,
    isSick: boolean,
    isAtRisk: boolean,
    sickReason: string | undefined,
    isAbsent: boolean | undefined,
    absentReason: string | undefined,
    isSelected: boolean,
    isDragging: boolean,
    isDragOver: boolean,
    isHighlighted: boolean = false,
    isWinner: boolean = false
  ) => {
    const student = assignment?.student;

    if (!student) {
      // Ghế trống dạng 3D đặt trên bàn
      return (
        <div
          onClick={() => onSeatClick(rowIndex, colIndex, undefined)}
          onDragOver={(e) => onDragOver(e, rowIndex, colIndex)}
          onDragLeave={(e) => onDragLeave(e, rowIndex, colIndex)}
          onDrop={(e) => onDrop(e, rowIndex, colIndex, undefined)}
          className={`min-h-[7rem] h-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-2 text-[10px] font-bold cursor-pointer select-none relative group ${
            isWinner
              ? 'border-emerald-500 bg-emerald-200/90 ring-6 ring-emerald-400/90 scale-[1.03] shadow-xl animate-bounce'
              : isHighlighted
              ? 'border-emerald-400 bg-emerald-100/90 ring-4 ring-emerald-400/70 scale-[1.02] shadow-md'
              : isDragOver
              ? 'border-sky-500 bg-sky-100/90 ring-4 ring-sky-300/60 scale-[1.03] shadow-md'
              : isSelected
              ? 'border-amber-500 bg-amber-100/90 ring-4 ring-amber-300/60 shadow-md'
              : 'border-amber-900/30 bg-amber-50/60 text-amber-950/60 hover:bg-amber-100/80 hover:border-amber-800/60 shadow-2xs'
          }`}
          title="Bàn còn trống chỗ - Chạm hoặc thả học sinh vào đây"
        >
          <div className="w-7 h-7 rounded-xl bg-amber-200/80 flex items-center justify-center text-base mb-1 shadow-inner group-hover:scale-110 transition-transform">
            🪑
          </div>
          <span className="font-black text-amber-950/80">Chỗ trống</span>
          <span className="text-[9px] text-amber-800/70 font-medium mt-0.5">(Thả vào đây)</span>
        </div>
      );
    }

    // Xác định kiểu dáng thẻ tên học sinh 3D
    let cardWrapper =
      'bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.12),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-1';
    let badgeEl: React.ReactNode = null;

    if (isWinner) {
      cardWrapper =
        'bg-gradient-to-b from-emerald-400 via-emerald-300 to-green-200 border-[3px] border-emerald-600 ring-8 ring-emerald-400/90 shadow-2xl scale-105 -translate-y-2 z-30 animate-bounce text-slate-950 font-black';
      badgeEl = (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-700 text-white font-black text-[9.5px] uppercase tracking-wider animate-pulse shadow-xs">
          👑 Trúng Thưởng
        </span>
      );
    } else if (isHighlighted) {
      cardWrapper =
        'bg-emerald-200 border-2 border-emerald-500 ring-4 ring-emerald-400/90 shadow-xl scale-105 -translate-y-1 z-20 text-slate-950 font-black';
      badgeEl = (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse">
          🎯 Đang Chọn
        </span>
      );
    } else if (isSelected) {
      cardWrapper =
        'bg-blue-50 border-2 border-blue-600 ring-4 ring-blue-400/40 shadow-xl scale-[1.03] -translate-y-1 animate-pulse';
    } else if (isDragging) {
      cardWrapper = 'opacity-30 border-2 border-dashed border-sky-500 scale-95 bg-sky-50';
    } else if (isDragOver) {
      cardWrapper = 'border-2 border-sky-500 bg-sky-100 ring-4 ring-sky-400/40 scale-[1.03] shadow-lg';
    } else if (isAbsent) {
      // Phản hồi trực quan học sinh vắng / về sớm trên bàn học 3D (Phương án A)
      cardWrapper = 'bg-amber-50/95 border-2 border-amber-500 ring-2 ring-amber-300/60 shadow-md shadow-amber-500/10';
      const reasonLower = (absentReason || '').toLowerCase();
      const badgeIcon =
        reasonLower.includes('y tế') || reasonLower.includes('đau') || reasonLower.includes('mệt')
          ? '🏥'
          : reasonLower.includes('đón') || reasonLower.includes('về')
          ? '🚗'
          : reasonLower.includes('sốt') || reasonLower.includes('ốm')
          ? '🤒'
          : '📋';
      const badgeText =
        reasonLower.includes('y tế')
          ? 'Y tế'
          : reasonLower.includes('đón')
          ? 'Về sớm'
          : 'Vắng';

      badgeEl = (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px] shadow-xs"
          title={`Học sinh vắng / về sớm: ${absentReason || 'Nghỉ có phép'}`}
        >
          <span>{badgeIcon}</span>
          <span>{badgeText}</span>
        </span>
      );
    } else if (isMedicalMode) {
      if (isDeskInCluster && isSick) {
        cardWrapper = 'bg-rose-50 border-2 border-rose-600 ring-4 ring-rose-400/50 shadow-xl shadow-rose-500/20';
        badgeEl = (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            🚨 Cụm Ốm
          </span>
        );
      } else if (isSick) {
        cardWrapper = 'bg-rose-50/90 border-2 border-rose-500 ring-2 ring-rose-300/50 shadow-md';
        badgeEl = (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 font-black text-[9px]">
            🤒 Nghỉ ốm
          </span>
        );
      } else if (isAtRisk) {
        cardWrapper = 'bg-amber-50/90 border-2 border-amber-400 ring-2 ring-amber-300/40 shadow-md';
        badgeEl = (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-black text-[9px]">
            ⚠️ Cạnh ca ốm
          </span>
        );
      }
    }

    const shortRole = getShortRole(student.classRole);
    const groupDot = getGroupColorDot(student.groupName);
    const studentNameLines = splitStudentName(student.fullName);

    // Xác định chế độ Chữ Siêu To (Trực tiếp điều khiển bởi công tắc isLargeTextMode, fallback isFullscreen)
    const isDistanceMode = isLargeTextModeProp !== undefined ? isLargeTextModeProp : Boolean(isFullscreen);

    // Tự động co giãn cỡ chữ với tên dài; phóng to vượt trội cho học sinh ngồi xa
    const nameWords = student.fullName.trim().split(/\s+/);
    const isVeryLongName = nameWords.length >= 5 || student.fullName.trim().length >= 22;
    const isLongName = nameWords.length >= 4 || student.fullName.trim().length >= 16;

    let firstLineClass = '';
    let secondLineClass = '';
    let singleLineClass = '';

    if (isDistanceMode) {
      // Chế độ Chữ Siêu To: Tên chính phóng to vượt trội, đậm nét, cực rõ cho học sinh ngồi xa 5-10m
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
      isDistanceMode,
      isLongName,
      isVeryLongName
    );

    return (
      <div
        data-testid="student-desk-card"
        draggable={true}
        onDragStart={(e) => onDragStart(e, assignment, rowIndex, colIndex)}
        onDragOver={(e) => onDragOver(e, rowIndex, colIndex)}
        onDragLeave={(e) => onDragLeave(e, rowIndex, colIndex)}
        onDrop={(e) => onDrop(e, rowIndex, colIndex, assignment)}
        onClick={() => onSeatClick(rowIndex, colIndex, assignment)}
        className={`${
          compensatedSizes.isDeepZoom
            ? 'min-h-[7.5rem] sm:min-h-[8.2rem]'
            : isDistanceMode
            ? 'min-h-[7.25rem] sm:min-h-[7.75rem]'
            : 'min-h-[6.5rem] sm:min-h-[7rem]'
        } h-full p-2 sm:p-2.5 rounded-2xl transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col justify-between select-none relative ${cardWrapper}`}
        title={
          isSelected
            ? `Đang chọn ${student.fullName}. Chạm ô khác để chuyển chỗ!`
            : isAbsent
            ? `${student.fullName} (Đang vắng / về sớm: ${absentReason || 'Nghỉ có phép'})`
            : `${student.fullName} (${student.groupName}${student.classRole ? ` • ${student.classRole}` : ''}) - Kéo hoặc chạm để đổi chỗ`
        }
      >
        {/* Header thẻ: Avatar 3D (kèm Chấm màu Tổ) + Chức vụ viết tắt bên phải */}
        <div className="flex items-center justify-between gap-1 w-full">
          {/* Cụm bên trái: Avatar 3D (to rõ) + Chấm tròn màu phân biệt Tổ ở viền */}
          <div className="relative inline-flex shrink-0">
            <div
              className={`${
                isDistanceMode
                  ? 'w-7 h-7 sm:w-8 sm:h-8 text-xs'
                  : 'w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm'
              } rounded-xl overflow-hidden flex items-center justify-center font-black shadow-xs border border-white/60 ${
                isWinner
                  ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-amber-500/50 ring-2 ring-white'
                  : isHighlighted
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-400/50'
                  : isSelected
                  ? 'bg-blue-600 text-white shadow-blue-500/40'
                  : isAbsent
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                  : isMedicalMode && (isSick || (isDeskInCluster && isSick))
                  ? 'bg-gradient-to-br from-rose-500 to-rose-700 text-white'
                  : student.gender === 'Nam'
                  ? 'bg-gradient-to-br from-sky-500 to-blue-700 text-white'
                  : 'bg-gradient-to-br from-rose-400 to-pink-600 text-white'
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
              className={`absolute -top-1 -right-1 ${
                isDistanceMode ? 'w-2.5 h-2.5' : 'w-3 h-3'
              } rounded-full ${groupDot.bgClass} ring-2 ring-white shadow-xs`}
              title={groupDot.title}
            />
          </div>

          {/* Cụm bên phải: Chức vụ viết tắt (LT, PHT, TTt1, TPt1...) hoặc Cảnh báo Y tế (Đã bỏ T1..T4) */}
          <div className="flex items-center gap-1 shrink-0">
            {badgeEl ? (
              badgeEl
            ) : shortRole ? (
              <span
                className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-300/80 font-black text-[9.5px] shadow-2xs"
                title={`Ban cán sự: ${student.classRole}`}
              >
                {shortRole}
              </span>
            ) : null}
            <span className="text-[9px] text-slate-300 opacity-60 hidden sm:inline" title="Kéo để di chuyển">
              ⋮⋮
            </span>
          </div>
        </div>

        {/* Thân thẻ: Họ tên học sinh (Tách biệt Họ đệm và TÊN CHÍNH TO RÕ NỔI BẬT cho người ngồi xa) */}
        <div className="mt-0.5 flex-1 flex flex-col justify-center items-center text-center px-0.5 w-full">
          {studentNameLines.hasSplit ? (
            <div className="text-center w-full space-y-0.5">
              <span
                style={{ fontSize: `${compensatedSizes.firstLinePx}px` }}
                className={`block leading-tight truncate ${firstLineClass}`}
              >
                {isSelected && '👉 '}{studentNameLines.firstLine}
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
              <p
                style={{ fontSize: `${compensatedSizes.singleLinePx}px` }}
                className={`break-words text-center w-full py-0.5 leading-normal ${singleLineClass}`}
              >
                {isSelected && '👉 '}
                {student.fullName}
              </p>
            </div>
          )}
          {isAbsent && absentReason ? (
            <p className="text-[9.5px] text-amber-800 font-bold mt-0.5 text-center break-words" title={absentReason}>
              {absentReason}
            </p>
          ) : isMedicalMode && isSick && sickReason ? (
            <p className="text-[9.5px] text-rose-700 italic break-words font-bold mt-0.5 text-center">
              {sickReason}
            </p>
          ) : isSelected ? (
            <p className="text-[10px] text-blue-700 font-black mt-0.5 animate-pulse text-center">
              Chạm đích để đổi...
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div id={`desk-3d-${rowIndex}-${colLeft}`} className="relative group/desk pt-1 pb-2">
      {/* 1. KHỐI BÀN HỌC 3D (MẶT GỖ DÀY + HỘC BÀN + KHUNG KIM LOẠI) */}
      {isDeskWinner && <Desk3DFireworks />}
      {isDeskWinner && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-400 font-black text-[11px] shadow-xl z-40 animate-bounce pointer-events-none whitespace-nowrap">
          <span>✨</span>
          <span>🎉 TRÚNG THƯỞNG 🎉</span>
          <span>🌟</span>
        </div>
      )}
      <div
        className={`relative z-10 rounded-2xl transition-all duration-300 ${
          isDeskWinner
            ? 'bg-gradient-to-b from-[#a7f3d0] via-[#10b981] to-[#047857] border-2 border-emerald-400 ring-6 ring-emerald-400/90 shadow-[0_0_40px_rgba(16,185,129,0.95)] scale-[1.02] z-30'
            : isDeskHighlighted
            ? 'bg-gradient-to-b from-[#d1fae5] via-[#34d399] to-[#059669] border-2 border-emerald-400 ring-4 ring-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.75)] scale-[1.01] z-20'
            : isDeskInCluster
            ? 'bg-rose-100/90 border-2 border-rose-500 ring-4 ring-rose-400/40 shadow-xl'
            : 'bg-gradient-to-b from-[#fde68a] via-[#f59e0b] to-[#d97706] border border-amber-600/60 shadow-[0_8px_16px_-2px_rgba(180,83,9,0.3),0_4px_8px_-2px_rgba(0,0,0,0.15)]'
        }`}
      >
        {/* Mặt bàn gỗ vát cạnh bóng (Bevel Desk Surface) */}
        <div className="p-2 rounded-t-2xl bg-gradient-to-b from-amber-100/90 via-amber-50/50 to-transparent border-t-2 border-white/60">
          {/* Nhãn số bàn học sinh & Cụm đồ dùng học tập 3D */}
          <div className="relative flex items-center justify-between px-1.5 pb-1 text-[10px] font-black text-amber-950 tracking-wider uppercase min-h-[26px]">
            {/* Góc trái: Nhãn số bàn */}
            <span className="flex items-center gap-1 shrink-0 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
              BÀN {rowIndex + 1}
            </span>

            {/* Canh giữa bàn học: Cụm đồ dùng học tập 3D dùng chung giữa 2 học sinh */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/10 border border-amber-900/20 shadow-2xs text-[11px] normal-case font-normal select-none backdrop-blur-xs"
                title={`Đồ dùng học tập Bàn ${rowIndex + 1}: ${supplies.label}`}
              >
                {supplies.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="hover:scale-130 transition-transform duration-150 cursor-default filter drop-shadow-xs inline-block"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Góc phải: Huy hiệu cụm lây nhiễm y tế (nếu có) */}
            <div className="shrink-0 z-10 min-w-[20px] flex justify-end">
              {isDeskInCluster && (
                <span className="text-rose-700 font-black text-[9px] uppercase tracking-wider animate-pulse bg-rose-200/80 px-1.5 py-0.2 rounded-md">
                  🚨 Cụm
                </span>
              )}
            </div>
          </div>

          {/* 2 Chỗ ngồi học sinh (Trái - Phải) */}
          <div className="grid grid-cols-2 gap-2 items-stretch">
            {renderSeatCard(
              leftAssign,
              colLeft,
              isLeftSick,
              isLeftAtRisk,
              leftSickReason,
              isLeftAbsent,
              leftAbsentReason,
              isLeftSelected,
              isLeftDragging,
              isLeftDragOver,
              isLeftHighlighted,
              isLeftWinner
            )}
            {renderSeatCard(
              rightAssign,
              colRight,
              isRightSick,
              isRightAtRisk,
              rightSickReason,
              isRightAbsent,
              rightAbsentReason,
              isRightSelected,
              isRightDragging,
              isRightDragOver,
              isRightHighlighted,
              isRightWinner
            )}
          </div>
        </div>

        {/* 2. ĐỘ DÀY CẠNH BÀN & HỘC BÀN 3D (DESK FRONT EDGE & SHELF) */}
        <div className="h-2.5 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 rounded-b-xl border-t border-amber-950/30 flex items-center justify-between px-4">
          <div className="w-20 h-1 bg-black/30 rounded-full"></div>
          <div className="w-20 h-1 bg-black/30 rounded-full"></div>
        </div>
      </div>

      {/* 3. CHÂN BÀN KIM LOẠI 3D VÀ BÓNG ĐỔ XUỐNG SÀN */}
      <div className="flex justify-between px-6 -mt-0.5 relative z-0">
        <div className="w-2 h-2 bg-gradient-to-r from-slate-400 via-slate-600 to-slate-800 rounded-b-sm shadow-xs"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-slate-400 via-slate-600 to-slate-800 rounded-b-sm shadow-xs"></div>
      </div>
      <div className="mx-4 h-1 bg-amber-950/15 rounded-full blur-[1px] -mt-0.5"></div>

      {/* 4. 2 CHIẾC GHẾ TỰA HỌC SINH 3D QUAY MẶT HƯỚNG LÊN BẢNG (KÊ SÁT MÉP BÀN HỌC) */}
      <div className="grid grid-cols-2 gap-3 px-3 -mt-2.5 relative z-10">
        {/* Ghế bên trái */}
        <div className="flex flex-col items-center group/chair select-none" title="Ghế ngồi học sinh (hướng lên bảng)">
          {/* Mặt đệm ngồi sát mép bàn */}
          <div className="w-16 h-2.5 rounded-t-sm rounded-b-xs bg-gradient-to-b from-[#fde68a] via-[#f59e0b] to-[#d97706] border border-amber-700/60 shadow-xs flex items-center justify-center">
            <div className="w-10 h-0.5 bg-white/40 rounded-full"></div>
          </div>
          {/* 2 Cọc kim loại chịu lực đỡ lưng ghế */}
          <div className="w-12 flex justify-between px-1.5 -my-0.5 relative z-10">
            <div className="w-1.5 h-1.5 bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 rounded-b-xs shadow-xs"></div>
            <div className="w-1.5 h-1.5 bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 rounded-b-xs shadow-xs"></div>
          </div>
          {/* Thanh tựa lưng gỗ uốn cong đỡ lưng học sinh (quay mặt lên bảng) */}
          <div className="w-20 h-3 rounded-b-xl bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#b45309] border border-amber-800/60 shadow-xs flex items-center justify-center">
            <div className="w-12 h-0.5 bg-amber-200/40 rounded-full blur-[0.5px]"></div>
          </div>
          {/* Bóng đổ nhẹ chân ghế */}
          <div className="w-14 h-1 bg-amber-950/15 rounded-full blur-[1px] mt-0.5"></div>
        </div>

        {/* Ghế bên phải */}
        <div className="flex flex-col items-center group/chair select-none" title="Ghế ngồi học sinh (hướng lên bảng)">
          {/* Mặt đệm ngồi sát mép bàn */}
          <div className="w-16 h-2.5 rounded-t-sm rounded-b-xs bg-gradient-to-b from-[#fde68a] via-[#f59e0b] to-[#d97706] border border-amber-700/60 shadow-xs flex items-center justify-center">
            <div className="w-10 h-0.5 bg-white/40 rounded-full"></div>
          </div>
          {/* 2 Cọc kim loại chịu lực đỡ lưng ghế */}
          <div className="w-12 flex justify-between px-1.5 -my-0.5 relative z-10">
            <div className="w-1.5 h-1.5 bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 rounded-b-xs shadow-xs"></div>
            <div className="w-1.5 h-1.5 bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 rounded-b-xs shadow-xs"></div>
          </div>
          {/* Thanh tựa lưng gỗ uốn cong đỡ lưng học sinh (quay mặt lên bảng) */}
          <div className="w-20 h-3 rounded-b-xl bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#b45309] border border-amber-800/60 shadow-xs flex items-center justify-center">
            <div className="w-12 h-0.5 bg-amber-200/40 rounded-full blur-[0.5px]"></div>
          </div>
          {/* Bóng đổ nhẹ chân ghế */}
          <div className="w-14 h-1 bg-amber-950/15 rounded-full blur-[1px] mt-0.5"></div>
        </div>
      </div>
    </div>
  );
};
