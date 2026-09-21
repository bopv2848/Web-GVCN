import React, { useMemo } from 'react';
import type { SeatAssignmentWithStudent } from '../../../types/seating';
import type { ClassroomElementsConfig } from '../../../types/seating';
import type { Student } from '../../../types/student';
import { getDeskSupplies } from '../utils/seatingSuppliesUtils';
import { getPrintRoleBadge, getGroupColorDot } from '../utils/seatingRoleUtils';
import { ClassroomDoorArrowSVG } from './ClassroomDoor2D';

export interface AisleInfo {
  name: string;
  pairIndex: number;
  cols: number[];
  subTitle: string;
}

const getAisleTheme = (aisleName: string, subTitle: string, isMonochrome?: boolean) => {
  if (isMonochrome) {
    return {
      border: 'border-2 border-slate-900',
      bg: 'bg-white',
      headerBg: 'bg-slate-100 text-slate-950 border-2 border-slate-900 font-black',
      accentText: 'text-slate-900 font-black',
    };
  }

  const text = `${aisleName} ${subTitle}`.toLowerCase();
  if (text.includes('1') || text.includes('hành lang')) {
    return {
      border: 'border-2 border-blue-400',
      bg: 'bg-blue-50/20',
      headerBg: 'bg-blue-100/90 text-blue-950 border-blue-400',
      accentText: 'text-blue-700',
    };
  }
  if (text.includes('2') || text.includes('giữa phải')) {
    return {
      border: 'border-2 border-emerald-400',
      bg: 'bg-emerald-50/20',
      headerBg: 'bg-emerald-100/90 text-emerald-950 border-emerald-400',
      accentText: 'text-emerald-700',
    };
  }
  if (text.includes('3') || text.includes('giữa trái')) {
    return {
      border: 'border-2 border-amber-400',
      bg: 'bg-amber-50/20',
      headerBg: 'bg-amber-100/90 text-amber-950 border-amber-400',
      accentText: 'text-amber-800',
    };
  }
  if (text.includes('4') || text.includes('cửa sổ')) {
    return {
      border: 'border-2 border-rose-400',
      bg: 'bg-rose-50/20',
      headerBg: 'bg-rose-100/90 text-rose-950 border-rose-400',
      accentText: 'text-rose-700',
    };
  }
  return {
    border: 'border-2 border-slate-400',
    bg: 'bg-slate-50/40',
    headerBg: 'bg-slate-200/80 text-slate-900 border-slate-400',
    accentText: 'text-slate-600',
  };
};

import {
  getStudentPrintFontSize,
  splitStudentName,
} from '../utils/seatingPrintNameUtils';

export interface SeatingPrintCustomHeader {
  schoolName?: string;
  className?: string;
  title?: string;
  teacherName?: string;
  academicYear?: string;
  appliedDate?: string;
  modeNote?: string;
  colorMode?: 'color' | 'monochrome';
  fontSize?: 12 | 13 | 14;
  nameCase?: 'default' | 'uppercase';
  autoFitLongNames?: boolean;
  showClassSize?: boolean;
  classSizeText?: string;
  showDoorArrow?: boolean;
}

interface SeatingPrintLayoutProps {
  schoolName: string;
  className: string;
  logoUrl?: string;
  isRotationEnabled: boolean;
  activeWeekMode: 'odd' | 'even';
  schoolWeekInfo: { weekNumber: number; mode: 'odd' | 'even' };
  totalRows: number;
  aisles: AisleInfo[];
  assignmentGrid: Map<string, SeatAssignmentWithStudent>;
  elementsConfig?: ClassroomElementsConfig;
  customHeader?: SeatingPrintCustomHeader;
  totalStudentsCount?: number;
  femaleStudentsCount?: number;
}

export const SeatingPrintLayout: React.FC<SeatingPrintLayoutProps> = ({
  schoolName,
  className,
  logoUrl,
  isRotationEnabled,
  activeWeekMode,
  schoolWeekInfo,
  totalRows,
  aisles,
  assignmentGrid,
  elementsConfig,
  customHeader,
  totalStudentsCount,
  femaleStudentsCount,
}) => {
  const cleanClassName = (className || '6A6').replace(/^lớp\s+/i, '').trim();
  const teacherDeskPos = elementsConfig?.teacherDeskPosition || 'right';
  const doorPos = elementsConfig?.doorPosition || 'right';
  const doorAngle = elementsConfig?.doorAngle ?? 180;
  const isPointingLeft = doorAngle >= 90 && doorAngle < 270;
  const showDoorArrow = customHeader?.showDoorArrow !== false;
  const isMonochrome = customHeader?.colorMode === 'monochrome';

  const displaySchool = customHeader?.schoolName?.trim() || schoolName || 'TRƯỜNG THCS TÂN HẢI';
  const rawClass = customHeader?.className?.trim() || cleanClassName;
  const displayClass = rawClass.toUpperCase().startsWith('LỚP') ? rawClass.toUpperCase() : `LỚP ${rawClass.toUpperCase()}`;
  const displayTitle = customHeader?.title?.trim() || 'SƠ ĐỒ CHỖ NGỒI HỌC SINH';
  const displayTeacher = customHeader?.teacherName?.trim() || 'Thầy Phan Văn Bộ';
  const displayAcademicYear = customHeader?.academicYear?.trim() || '2026 - 2027';
  const displayModeNote = customHeader?.modeNote?.trim() || (isRotationEnabled
    ? `Chế độ: Áp dụng ${
        activeWeekMode === 'even' ? 'Tuần Chẵn (Tổ 3-4-1-2)' : 'Tuần Lẻ (Tổ 4-3-2-1)'
      } • Tuần ${schoolWeekInfo.weekNumber}`
    : 'Chế độ: Chỗ ngồi cố định');
  const displayAppliedDate = customHeader?.appliedDate?.trim() || new Date().toLocaleDateString('vi-VN');
  const baseFontSize = customHeader?.fontSize || 14;
  const nameCase = customHeader?.nameCase || 'default';
  const autoFitLongNames = customHeader?.autoFitLongNames !== false;

  const seatedStudents = useMemo(() => {
    const unique = new Map<string, Student>();
    assignmentGrid.forEach((assignment) => {
      if (assignment.student) {
        unique.set(assignment.student.id, assignment.student);
      }
    });
    return Array.from(unique.values());
  }, [assignmentGrid]);

  const totalCount = (totalStudentsCount !== undefined && totalStudentsCount > 0)
    ? totalStudentsCount
    : seatedStudents.length;
  const femaleCount = (totalStudentsCount !== undefined && totalStudentsCount > 0 && femaleStudentsCount !== undefined)
    ? femaleStudentsCount
    : seatedStudents.filter((s) => s.gender === 'Nữ').length;

  const showClassSize = customHeader?.showClassSize !== false;
  const rawClassSize = customHeader?.classSizeText?.trim();
  const defaultClassSize = `(Sĩ số: ${totalCount}/Nữ: ${femaleCount})`;
  const displayClassSize = rawClassSize
    ? (rawClassSize.startsWith('(') ? rawClassSize : `(${rawClassSize})`)
    : defaultClassSize;

  return (
    <div
      id="seating-print-layout"
      style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
      className={`hidden print:flex flex-col justify-between w-full max-w-none m-0 ${
        isMonochrome ? 'bg-white text-black' : 'bg-white text-slate-900'
      } print-sheet font-serif select-none h-[200mm] max-h-[200mm] box-border`}
    >
      {/* 1. Header bản in: Thông tin Trường, Lớp, Sơ đồ phòng học, Năm học, Giáo viên */}
      <div className={`flex items-center justify-between pb-1.5 border-b-2 mb-1.5 shrink-0 ${
        isMonochrome ? 'border-slate-900' : 'border-slate-800'
      }`}>
        {/* Khối bên trái: Logo & Trường học */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={logoUrl || '/logo-truong-thcs-Tan-Hai.jpg'}
            alt="Logo Trường"
            className={`w-12 h-12 object-contain rounded-full border shrink-0 ${
              isMonochrome ? 'border-slate-800 grayscale contrast-125' : 'border-slate-300'
            }`}
          />
          <div>
            <h1 className="text-xs font-black uppercase text-slate-900 tracking-wider leading-tight">
              {displaySchool}
            </h1>
            <p className={`text-sm font-black uppercase tracking-wide leading-tight ${
              isMonochrome ? 'text-black' : 'text-blue-900'
            }`}>
              {displayClass}
            </p>
          </div>
        </div>

        {/* Khối ở giữa: Icon và Phòng học lớp kèm Sĩ số (Canh giữa trang trọng, loại bỏ ô ngang cũ) */}
        <div className="text-center px-2">
          <div className={`font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-1.5 ${
            isMonochrome ? 'text-black font-black' : 'text-slate-850'
          }`}>
            <span>🗺️ PHÒNG HỌC {displayClass}</span>
            {showClassSize && (
              <span className={`font-bold normal-case text-xs md:text-sm ${
                isMonochrome ? 'text-black font-bold' : 'text-slate-700'
              }`}>
                {displayClassSize}
              </span>
            )}
          </div>
        </div>

        {/* Khối bên phải: Tiêu đề sơ đồ, GVCN, Năm học */}
        <div className="text-right">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            {displayTitle}
          </h2>
          <p className="text-[11px] font-bold text-slate-700 leading-tight mt-0.5">
            GVCN: {displayTeacher} • Năm học: {displayAcademicYear}
          </p>
          <p className={`text-[9.5px] leading-tight ${
            isMonochrome ? 'text-slate-800 font-bold' : 'text-slate-500 font-semibold'
          }`}>
            {displayModeNote}
          </p>
        </div>
      </div>

      {/* 3. Lưới các Dãy Bàn Học (Chiếm trọn không gian chiều dọc) */}
      <div
        className="grid gap-2 w-full flex-1 min-h-0"
        style={{
          gridTemplateColumns: `repeat(${aisles.length}, minmax(0, 1fr))`,
        }}
      >
        {aisles.map((aisle) => {
          const theme = getAisleTheme(aisle.name, aisle.subTitle, isMonochrome);

          return (
            <div
              key={aisle.name}
              className={`border ${theme.border} rounded-xl p-1.5 ${theme.bg} flex flex-col h-full min-h-0`}
            >
              {/* Tiêu đề Dãy với dải màu sắc nét cho máy in màu hoặc viền đen đậm cho máy in laser */}
              <div className={`text-center py-1 rounded-md border shrink-0 mb-1 ${theme.headerBg}`}>
                <span className="font-black text-xs uppercase tracking-wide">
                  DÃY {aisle.name}
                </span>
                <span className={`text-[9.5px] font-bold ml-1 ${theme.accentText}`}>
                  ({aisle.subTitle.replace(/^\(|\)$/g, '')})
                </span>
              </div>

              {/* Các hàng bàn học (Từ Bàn 1 đến Bàn totalRows - giãn đều 100% chiều cao) */}
              <div className="flex-1 flex flex-col justify-between gap-1 min-h-0">
                {Array.from({ length: totalRows }).map((_, rIdx) => {
                  const leftAssign = assignmentGrid.get(`${rIdx}_${aisle.cols[0]}`);
                  const rightAssign = assignmentGrid.get(`${rIdx}_${aisle.cols[1]}`);
                  const supplies = getDeskSupplies(rIdx, aisle.cols[0]);

                  const leftStudent = leftAssign?.student;
                  const rightStudent = rightAssign?.student;

                  const leftFontSize = leftStudent ? getStudentPrintFontSize(leftStudent.fullName, baseFontSize, autoFitLongNames) : baseFontSize;
                  const leftSplit = leftStudent ? splitStudentName(leftStudent.fullName, nameCase) : null;

                  const rightFontSize = rightStudent ? getStudentPrintFontSize(rightStudent.fullName, baseFontSize, autoFitLongNames) : baseFontSize;
                  const rightSplit = rightStudent ? splitStudentName(rightStudent.fullName, nameCase) : null;

                  const leftBadge = leftStudent ? getPrintRoleBadge(leftStudent.classRole, isMonochrome) : null;
                  const rightBadge = rightStudent ? getPrintRoleBadge(rightStudent.classRole, isMonochrome) : null;

                  const leftGroupDot = leftStudent ? getGroupColorDot(leftStudent.groupName) : null;
                  const rightGroupDot = rightStudent ? getGroupColorDot(rightStudent.groupName) : null;

                  return (
                    <div
                      key={rIdx}
                      className={`rounded-lg p-1 bg-white flex-1 min-h-0 flex flex-col justify-between shadow-none ${
                        isMonochrome ? 'border-2 border-slate-900' : 'border-2 border-slate-400'
                      }`}
                    >
                      {/* Hàng nhãn: Số bàn & Đồ dùng học tập */}
                      <div className={`flex items-center justify-between text-[9px] font-bold mb-0.5 px-0.5 shrink-0 ${
                        isMonochrome ? 'text-black font-black' : 'text-slate-600'
                      }`}>
                        <span className="font-black text-slate-900">BÀN {rIdx + 1}</span>

                        {/* Đồ dùng học tập trên bàn */}
                        <div
                          className="flex items-center gap-0.5 text-[9.5px]"
                          title={supplies.label}
                        >
                          {supplies.items.map((item, idx) => (
                            <span key={idx}>{item}</span>
                          ))}
                        </div>

                        <span className={`text-[8px] font-medium ${
                          isMonochrome ? 'text-slate-700 font-bold' : 'text-slate-400'
                        }`}>
                          H{rIdx + 1}
                        </span>
                      </div>

                      {/* 2 Chỗ ngồi của bàn */}
                      <div className="grid grid-cols-2 gap-1 flex-1 min-h-0">
                        {/* Chỗ bên trái */}
                        <div
                          className={`border rounded px-1 py-0.5 text-center flex flex-col items-center justify-center overflow-hidden h-full ${
                            leftStudent
                              ? isMonochrome
                                ? 'bg-white border-2 border-slate-900 text-black'
                                : leftStudent.gender === 'Nam'
                                ? 'bg-sky-50/50 border-sky-200'
                                : 'bg-rose-50/50 border-rose-200'
                              : isMonochrome
                              ? 'bg-white border border-dashed border-slate-400 text-slate-400'
                              : 'bg-slate-50/50 border-slate-200'
                          }`}
                        >
                          {leftStudent ? (
                            <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 py-0.5">
                              <div className="flex items-center justify-center gap-1 w-full my-auto">
                                {leftGroupDot && !isMonochrome && (
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${leftGroupDot.bgClass} shrink-0 inline-block`}
                                    title={leftStudent.groupName}
                                  />
                                )}
                                <div
                                  data-student-name-box="true"
                                  className={`font-bold text-center w-full flex flex-col items-center justify-center ${
                                    isMonochrome ? 'text-black' : 'text-slate-900'
                                  }`}
                                  style={{
                                    fontFamily: "'Times New Roman', Times, Georgia, serif",
                                    fontSize: `${leftFontSize}px`,
                                  }}
                                >
                                  {leftSplit?.hasSplit ? (
                                    <>
                                      <span className="block leading-[1.18] truncate max-w-full">{leftSplit.firstLine}</span>
                                      <span className="block leading-[1.18] truncate max-w-full">{leftSplit.secondLine}</span>
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center w-full min-h-[26px] my-auto">
                                      <span className="block leading-normal truncate max-w-full py-0.5">
                                        {leftSplit?.fullFormatted || ''}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {leftBadge && (
                                <span
                                  className={`mt-0.5 px-1 py-0.2 rounded text-[8px] border leading-none inline-flex items-center gap-0.5 shrink-0 ${leftBadge.className}`}
                                  style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                                >
                                  {leftBadge.icon && <span>{leftBadge.icon}</span>}
                                  <span>{leftBadge.label}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span
                              className="text-slate-400 italic text-[11px]"
                              style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                            >
                              (Chỗ trống)
                            </span>
                          )}
                        </div>

                        {/* Chỗ bên phải */}
                        <div
                          className={`border rounded px-1 py-0.5 text-center flex flex-col items-center justify-center overflow-hidden h-full ${
                            rightStudent
                              ? isMonochrome
                                ? 'bg-white border-2 border-slate-900 text-black'
                                : rightStudent.gender === 'Nam'
                                ? 'bg-sky-50/50 border-sky-200'
                                : 'bg-rose-50/50 border-rose-200'
                              : isMonochrome
                              ? 'bg-white border border-dashed border-slate-400 text-slate-400'
                              : 'bg-slate-50/50 border-slate-200'
                          }`}
                        >
                          {rightStudent ? (
                            <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 py-0.5">
                              <div className="flex items-center justify-center gap-1 w-full my-auto">
                                {rightGroupDot && !isMonochrome && (
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${rightGroupDot.bgClass} shrink-0 inline-block`}
                                    title={rightStudent.groupName}
                                  />
                                )}
                                <div
                                  data-student-name-box="true"
                                  className={`font-bold text-center w-full flex flex-col items-center justify-center ${
                                    isMonochrome ? 'text-black' : 'text-slate-900'
                                  }`}
                                  style={{
                                    fontFamily: "'Times New Roman', Times, Georgia, serif",
                                    fontSize: `${rightFontSize}px`,
                                  }}
                                >
                                  {rightSplit?.hasSplit ? (
                                    <>
                                      <span className="block leading-[1.18] truncate max-w-full">{rightSplit.firstLine}</span>
                                      <span className="block leading-[1.18] truncate max-w-full">{rightSplit.secondLine}</span>
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center w-full min-h-[26px] my-auto">
                                      <span className="block leading-normal truncate max-w-full py-0.5">
                                        {rightSplit?.fullFormatted || ''}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {rightBadge && (
                                <span
                                  className={`mt-0.5 px-1 py-0.2 rounded text-[8px] border leading-none inline-flex items-center gap-0.5 shrink-0 ${rightBadge.className}`}
                                  style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                                >
                                  {rightBadge.icon && <span>{rightBadge.icon}</span>}
                                  <span>{rightBadge.label}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span
                              className="text-slate-400 italic text-[11px]"
                              style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                            >
                              (Chỗ trống)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Phía trước phòng học: Cửa Ra Vào (trên cùng), Bàn Giáo Viên (ở giữa) & Bảng Lớp Học (dưới cùng) */}
      <div className={`mt-0.5 pt-0.5 border-t-2 flex flex-col gap-0.5 text-xs shrink-0 ${
        isMonochrome ? 'border-slate-900' : 'border-slate-800'
      }`}>
        {/* Hàng 1: Cửa Ra Vào (nằm phía trên so với bàn giáo viên, hơi chệch về phía mép ngoài hành lang) */}
        {showDoorArrow && (
          <div className={`flex w-full ${doorPos === 'left' ? 'justify-start pl-0.5' : 'justify-end pr-0.5'}`}>
            <ClassroomDoorArrowSVG
              isPointingLeft={isPointingLeft}
              isMonochrome={isMonochrome}
              className="w-22 sm:w-26 h-5 shrink-0"
            />
          </div>
        )}

        {/* Hàng 2: Bàn Giáo Viên (nằm phía trên so với Bảng, hơi thụt vào so với Cửa) */}
        <div className={`flex w-full ${
          teacherDeskPos === 'left'
            ? 'justify-start pl-4 sm:pl-6'
            : teacherDeskPos === 'center'
            ? 'justify-center'
            : 'justify-end pr-4 sm:pr-6'
        }`}>
          <div className={`py-0.5 px-2.5 rounded-lg font-bold text-[9.5px] flex items-center gap-1 shrink-0 ${
            isMonochrome ? 'bg-white border-2 border-slate-900 text-black font-black' : 'bg-amber-50 border border-amber-400 text-amber-900'
          }`}>
            <span>👩‍🏫</span>
            <span>{elementsConfig?.teacherDeskLabel || 'Bàn Giáo Viên'}</span>
          </div>
        </div>

        {/* Hàng 3: Bảng Lớp Học (ở phía dưới cùng, trung tâm phòng học) */}
        <div className="w-full flex justify-center">
          <div className={`w-full max-w-3xl py-1 px-4 rounded-lg text-white font-black text-[10px] uppercase text-center tracking-widest shadow-xs ${
            isMonochrome ? 'bg-black border-2 border-black' : 'bg-slate-800'
          }`}>
            🏫 BẢNG LỚP HỌC
          </div>
        </div>
      </div>

      {/* 5. Chân trang bản in */}
      <div className={`mt-1 pt-1 flex items-center justify-between text-[8.5px] shrink-0 ${
        isMonochrome ? 'border-t-2 border-slate-900 text-slate-800 font-bold' : 'border-t border-slate-200 text-slate-400 font-semibold'
      }`}>
        <span>Web-GVCN • Hệ thống Quản trị Lớp học Thông minh</span>
        <span>Ngày lập: {displayAppliedDate}</span>
      </div>
    </div>
  );
};
