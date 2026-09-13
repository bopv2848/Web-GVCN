import React from 'react';
import { DeskCell } from './DeskCell';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import type {
  SeatAssignmentWithStudent,
  SeatingMedicalAnalysis,
} from '../../../types/seating';
import type { SourceSeatInfo } from '../hooks/useSeatingManagement';

export interface AisleInfo {
  name: string;
  pairIndex: number;
  cols: number[];
  subTitle: string;
}

interface SeatingGridProps {
  isLoading: boolean;
  schoolName: string;
  className: string;
  logoUrl?: string;
  isRotationEnabled: boolean;
  activeWeekMode: 'odd' | 'even';
  schoolWeekInfo: { weekNumber: number; mode: 'odd' | 'even' };
  totalRows: number;
  aisles: AisleInfo[];
  assignmentGrid: Map<string, SeatAssignmentWithStudent>;
  medicalAnalysis: SeatingMedicalAnalysis;
  clusterDeskKeys: Set<string>;
  sickReasonMap: Map<string, string>;
  isMedicalMode: boolean;
  selectedSourceSeat: SourceSeatInfo | null;
  draggedSeat: SourceSeatInfo | null;
  dragOverPos: { r: number; c: number } | null;
  onDragStart: (e: React.DragEvent, assignment: SeatAssignmentWithStudent, r: number, c: number) => void;
  onDragOver: (e: React.DragEvent, r: number, c: number) => void;
  onDragLeave: (e: React.DragEvent, r: number, c: number) => void;
  onDrop: (e: React.DragEvent, r: number, c: number, targetAssignment?: SeatAssignmentWithStudent) => void;
  onSeatClick: (r: number, c: number, assignment?: SeatAssignmentWithStudent) => void;
}

export const SeatingGrid: React.FC<SeatingGridProps> = ({
  isLoading,
  schoolName,
  className,
  logoUrl,
  isRotationEnabled,
  activeWeekMode,
  schoolWeekInfo,
  totalRows,
  aisles,
  assignmentGrid,
  medicalAnalysis,
  clusterDeskKeys,
  sickReasonMap,
  isMedicalMode,
  selectedSourceSeat,
  draggedSeat,
  dragOverPos,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onSeatClick,
}) => {
  if (isLoading) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
        <LoadingSpinner size="lg" text="Đang đồng bộ Sơ đồ chỗ ngồi 47 học sinh..." />
      </div>
    );
  }

  return (
    <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 overflow-x-auto">
      {/* Tiêu đề in chuẩn A4 khi bấm In */}
      <div className="hidden print:block pb-4 border-b border-slate-300 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl || '/logo-truong-thcs-Tan-Hai.jpg'}
              alt="Logo Trường"
              className="w-14 h-14 object-contain rounded-full border border-slate-300"
            />
            <div className="text-left">
              <h1 className="text-sm font-black uppercase text-slate-900">{schoolName}</h1>
              <p className="text-xs font-bold text-slate-700">{className}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black text-slate-850">
              {isRotationEnabled
                ? `SƠ ĐỒ CHỖ NGỒI — ÁP DỤNG ${
                    activeWeekMode === 'even'
                      ? 'TUẦN CHẴN (TỔ 3 - 4 - 1 - 2)'
                      : 'TUẦN LẺ (TỔ 4 - 3 - 2 - 1)'
                  }`
                : 'SƠ ĐỒ CHỖ NGỒI HỌC SINH'}
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              GVCN: Thầy Phan Văn Bộ • Năm học: 2026 - 2027 •{' '}
              {isRotationEnabled
                ? `Tuần hiện tại: Tuần ${schoolWeekInfo.weekNumber}`
                : 'Chế độ: Chỗ ngồi cố định'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. BỤC GIẢNG & BÀN GIÁO VIÊN (PHÍA TRƯỚC) */}
      <div className="max-w-2xl mx-auto space-y-3 text-center">
        <div className="py-2.5 px-6 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-md">
          🏫 BẢNG LỚP HỌC (TRUNG TÂM PHÒNG HỌC 6A6)
        </div>

        <div className="flex justify-end pr-4">
          <div className="w-48 py-2 px-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
            <span>👩‍🏫</span>
            <span>Bàn Giáo Viên</span>
          </div>
        </div>
      </div>

      {/* 2. 4 DÃY BÀN HỌC (TỔ 4, TỔ 3, TỔ 2, TỔ 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-[760px]">
        {aisles.map((aisle) => (
          <div
            key={aisle.name}
            className="bg-slate-50/70 p-4 rounded-3xl border border-slate-200/70 space-y-4"
          >
            {/* Header Dãy / Tổ */}
            <div className="text-center pb-2 border-b border-slate-200">
              <h4 className="font-black text-sm text-slate-850 uppercase tracking-wide">
                DÃY {aisle.name}
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">
                ({aisle.subTitle})
              </span>
            </div>

            {/* 6 Hàng bàn học (Mỗi bàn 2 chỗ ngồi) */}
            <div className="space-y-3">
              {Array.from({ length: totalRows }).map((_, rIdx) => {
                const deskKey = `${rIdx}_${aisle.pairIndex}`;
                const isDeskInCluster = isMedicalMode && clusterDeskKeys.has(deskKey);

                const leftAssign = assignmentGrid.get(`${rIdx}_${aisle.cols[0]}`);
                const rightAssign = assignmentGrid.get(`${rIdx}_${aisle.cols[1]}`);

                const isLeftSick = leftAssign ? medicalAnalysis.sickStudentIds.has(leftAssign.studentId) : false;
                const isRightSick = rightAssign ? medicalAnalysis.sickStudentIds.has(rightAssign.studentId) : false;

                const isLeftAtRisk = leftAssign ? medicalAnalysis.atRiskNeighborStudentIds.has(leftAssign.studentId) : false;
                const isRightAtRisk = rightAssign ? medicalAnalysis.atRiskNeighborStudentIds.has(rightAssign.studentId) : false;

                const isLeftSelected = selectedSourceSeat?.rowIndex === rIdx && selectedSourceSeat?.colIndex === aisle.cols[0];
                const isRightSelected = selectedSourceSeat?.rowIndex === rIdx && selectedSourceSeat?.colIndex === aisle.cols[1];

                const isLeftDragOver = dragOverPos?.r === rIdx && dragOverPos?.c === aisle.cols[0];
                const isRightDragOver = dragOverPos?.r === rIdx && dragOverPos?.c === aisle.cols[1];

                const isLeftDragging = draggedSeat?.rowIndex === rIdx && draggedSeat?.colIndex === aisle.cols[0];
                const isRightDragging = draggedSeat?.rowIndex === rIdx && draggedSeat?.colIndex === aisle.cols[1];

                return (
                  <div
                    key={rIdx}
                    className={`p-2 rounded-2xl transition-all ${
                      isDeskInCluster
                        ? 'bg-rose-100/60 border-2 border-rose-500 ring-2 ring-rose-400/40 shadow-sm'
                        : 'bg-white/80 border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    {/* Nhãn số bàn */}
                    <div className="flex items-center justify-between px-1 mb-1.5 text-[10px] font-bold text-slate-400">
                      <span>BÀN {rIdx + 1}</span>
                      {isDeskInCluster && (
                        <span className="text-rose-700 font-black text-[9px] uppercase tracking-wider animate-pulse">
                          🚨 Cụm Lây Nhiễm
                        </span>
                      )}
                    </div>

                    {/* 2 Chỗ ngồi của bàn */}
                    <div className="grid grid-cols-2 gap-2">
                      <DeskCell
                        student={leftAssign?.student}
                        rowIndex={rIdx}
                        colIndex={aisle.cols[0]}
                        isSick={isLeftSick}
                        isCluster={isDeskInCluster && isLeftSick}
                        isAtRisk={isLeftAtRisk}
                        sickReason={leftAssign ? sickReasonMap.get(leftAssign.studentId) : undefined}
                        isMedicalMode={isMedicalMode}
                        isSelectedForSwap={isLeftSelected}
                        isDragging={isLeftDragging}
                        isDragOver={isLeftDragOver}
                        onDragStart={(e) => leftAssign && onDragStart(e, leftAssign, rIdx, aisle.cols[0])}
                        onDragOver={(e) => onDragOver(e, rIdx, aisle.cols[0])}
                        onDragLeave={(e) => onDragLeave(e, rIdx, aisle.cols[0])}
                        onDrop={(e) => onDrop(e, rIdx, aisle.cols[0], leftAssign)}
                        onClick={() => onSeatClick(rIdx, aisle.cols[0], leftAssign)}
                      />

                      <DeskCell
                        student={rightAssign?.student}
                        rowIndex={rIdx}
                        colIndex={aisle.cols[1]}
                        isSick={isRightSick}
                        isCluster={isDeskInCluster && isRightSick}
                        isAtRisk={isRightAtRisk}
                        sickReason={rightAssign ? sickReasonMap.get(rightAssign.studentId) : undefined}
                        isMedicalMode={isMedicalMode}
                        isSelectedForSwap={isRightSelected}
                        isDragging={isRightDragging}
                        isDragOver={isRightDragOver}
                        onDragStart={(e) => rightAssign && onDragStart(e, rightAssign, rIdx, aisle.cols[1])}
                        onDragOver={(e) => onDragOver(e, rIdx, aisle.cols[1])}
                        onDragLeave={(e) => onDragLeave(e, rIdx, aisle.cols[1])}
                        onDrop={(e) => onDrop(e, rIdx, aisle.cols[1], rightAssign)}
                        onClick={() => onSeatClick(rIdx, aisle.cols[1], rightAssign)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. PHÍA SAU PHÒNG HỌC */}
      <div className="text-center pt-4 border-t border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
        🚪 CỬA RA VÀO PHÍA SAU & KHU VỰC VỆ SINH LỚP HỌC
      </div>
    </div>
  );
};
