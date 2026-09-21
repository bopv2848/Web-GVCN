import React from 'react';
import { DeskCell } from './DeskCell';
import { Classroom3DScene } from './Classroom3DScene';
import { ClassroomFrontElements2D } from './ClassroomFrontElements2D';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { getDeskSupplies } from '../utils/seatingSuppliesUtils';
import { SeatingPrintLayout, type AisleInfo, type SeatingPrintCustomHeader } from './SeatingPrintLayout';
import type {
  SeatAssignmentWithStudent,
  SeatingMedicalAnalysis,
  ClassroomElementsConfig,
} from '../../../types/seating';
import type { SourceSeatInfo } from '../hooks/useSeatingManagement';

export type { AisleInfo };

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
  viewMode?: '2d' | '3d';
  zoomLevel?: number;
  isFullscreen?: boolean;
  isLargeTextMode?: boolean;
  highlightedSeatKey?: string | null;
  winnerSeatKey?: string | null;
  onResetView?: () => void;
  elementsConfig?: ClassroomElementsConfig;
  customHeader?: SeatingPrintCustomHeader;
  totalStudentsCount?: number;
  femaleStudentsCount?: number;
  onUpdateElementsConfig?: (updates: Partial<ClassroomElementsConfig>) => void;
  onDragStart: (e: React.DragEvent, assignment: SeatAssignmentWithStudent, r: number, c: number) => void;
  onDragOver: (e: React.DragEvent, r: number, c: number) => void;
  onDragLeave: (e: React.DragEvent, r: number, c: number) => void;
  onDrop: (e: React.DragEvent, r: number, c: number, targetAssignment?: SeatAssignmentWithStudent) => void;
  onSeatClick: (r: number, c: number, assignment?: SeatAssignmentWithStudent) => void;
  classId?: string;
  calledStudentIds?: Set<string>;
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
  viewMode = '3d',
  zoomLevel = 100,
  isFullscreen = false,
  isLargeTextMode = false,
  highlightedSeatKey = null,
  winnerSeatKey = null,
  onResetView,
  elementsConfig,
  customHeader,
  totalStudentsCount,
  femaleStudentsCount,
  onUpdateElementsConfig,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onSeatClick,
  calledStudentIds,
  classId,
}) => {
  const cleanClassName = (className || '6A6').replace(/^lớp\s+/i, '').trim();

  if (isLoading) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
        <LoadingSpinner size="lg" text="Đang đồng bộ Sơ đồ chỗ ngồi 47 học sinh..." />
      </div>
    );
  }

  return (
    <>
      {/* Bản in A4 chuẩn sắc nét — Tự động hiển thị khi bấm In (Ctrl+P / Nút In trên thanh công cụ) */}
      <SeatingPrintLayout
        schoolName={schoolName}
        className={className}
        logoUrl={logoUrl}
        isRotationEnabled={isRotationEnabled}
        activeWeekMode={activeWeekMode}
        schoolWeekInfo={schoolWeekInfo}
        totalRows={totalRows}
        aisles={aisles}
        assignmentGrid={assignmentGrid}
        elementsConfig={elementsConfig}
        customHeader={customHeader}
        totalStudentsCount={totalStudentsCount}
        femaleStudentsCount={femaleStudentsCount}
      />

      {/* Giao diện tương tác trên màn hình (Ẩn hoàn toàn khi in để tránh vỡ bố cục) */}
      <div className="print:hidden">
        {viewMode === '3d' ? (
          <div className="relative">
            <div
              className="seating-zoom-container transition-all duration-200 origin-top"
              style={{
                zoom: zoomLevel / 100,
              }}
            >
              <Classroom3DScene
                schoolName={schoolName}
                className={className}
                totalRows={totalRows}
                aisles={aisles}
                assignmentGrid={assignmentGrid}
                medicalAnalysis={medicalAnalysis}
                clusterDeskKeys={clusterDeskKeys}
                sickReasonMap={sickReasonMap}
                isMedicalMode={isMedicalMode}
                selectedSourceSeat={selectedSourceSeat}
                draggedSeat={draggedSeat}
                dragOverPos={dragOverPos}
                elementsConfig={elementsConfig}
                onUpdateElementsConfig={onUpdateElementsConfig}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onSeatClick={onSeatClick}
                classId={classId}
                highlightedSeatKey={highlightedSeatKey}
                winnerSeatKey={winnerSeatKey}
                onResetView={onResetView}
                zoomLevel={zoomLevel}
                isLargeTextMode={isLargeTextMode}
                isFullscreen={isFullscreen}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 overflow-x-auto">
            {/* Khung hiển thị lớp học 2D trên màn hình (Có hỗ trợ Thu phóng) */}
            <div
              className="space-y-8 seating-zoom-container transition-all duration-200 origin-top"
              style={{
                zoom: zoomLevel / 100,
              }}
            >
              {/* 1. TIÊU ĐỀ SƠ ĐỒ LỚP HỌC (PHÍA TRÊN) - NỀN NHẠT, CHỮ TO RÕ */}
              <div className="max-w-2xl mx-auto text-center">
                <div
                  className={`${
                    isFullscreen ? 'py-2 px-6 text-lg md:text-xl' : 'py-3 px-8 md:px-12 text-xl md:text-2xl'
                  } rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-colors bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-2 border-blue-200/80 text-blue-950 shadow-xs`}
                >
                  <span className={`${isFullscreen ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} filter drop-shadow-xs`}>🗺️</span>
                  <span>SƠ ĐỒ LỚP {cleanClassName || '6A6'}</span>
                </div>
              </div>

      {/* Chỉ dẫn thao tác trên điện thoại */}
      <div className="md:hidden flex items-center justify-center gap-2 py-2 px-3 bg-slate-100/90 rounded-2xl text-[11px] font-bold text-slate-600 border border-slate-200/80 shadow-2xs">
        <span>👈</span>
        <span>Vuốt ngang để xem đủ {aisles.length} dãy bàn học</span>
        <span>👉</span>
      </div>

      {/* 2. CÁC DÃY BÀN HỌC */}
      <div
        className={`grid grid-cols-1 ${
          aisles.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'
        } ${isFullscreen ? 'gap-3 sm:gap-4' : 'gap-6'} min-w-[760px]`}
      >
        {aisles.map((aisle) => (
          <div
            key={aisle.name}
            className={`${
              isFullscreen ? 'p-2.5 sm:p-3 space-y-2.5 rounded-2xl' : 'p-4 rounded-3xl space-y-4'
            } transition-colors bg-slate-50/80 border-2 border-slate-300 shadow-sm hover:border-slate-400`}
          >
            {/* Header Dãy / Tổ */}
            <div className={`text-center ${isFullscreen ? 'pb-1.5' : 'pb-2.5'} border-b-2 border-slate-300`}>
              <h4 className={`font-black uppercase tracking-wide text-slate-900 ${isFullscreen ? 'text-sm' : 'text-sm md:text-base'}`}>
                DÃY {aisle.name}
              </h4>
            </div>

            {/* 6 Hàng bàn học (Mỗi bàn 2 chỗ ngồi) */}
            <div
              className={isFullscreen ? 'space-y-2' : 'space-y-3'}
              style={{
                transform:
                  elementsConfig?.studentDeskScale && elementsConfig.studentDeskScale !== 100
                    ? `scale(${elementsConfig.studentDeskScale / 100})`
                    : undefined,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out',
              }}
            >
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
                        ? 'bg-rose-100/70 border-2 border-rose-500 ring-2 ring-rose-400/40 shadow-sm'
                        : 'bg-white border-2 border-slate-300 hover:border-slate-400 shadow-xs'
                    }`}
                  >
                    {/* Nhãn số bàn & Cụm đồ dùng học tập 2D */}
                    <div className="relative flex items-center justify-between px-1 mb-1.5 text-[10px] font-bold text-slate-500 min-h-[24px]">
                      {/* Góc trái: Số bàn */}
                      <span className="font-black shrink-0 z-10 px-1.5 py-0.5 rounded text-[10.5px] bg-slate-100/90 text-slate-800 border border-slate-200">
                        BÀN {rIdx + 1}
                      </span>

                      {/* Canh giữa bàn học: Cụm đồ dùng học tập 2D */}
                      {(() => {
                        const supplies = getDeskSupplies(rIdx, aisle.cols[0]);
                        return (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div
                              className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/90 border border-slate-200 shadow-2xs text-[11px] normal-case font-normal select-none"
                              title={`Đồ dùng học tập Bàn ${rIdx + 1}: ${supplies.label}`}
                            >
                              {supplies.items.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="hover:scale-130 transition-transform duration-150 cursor-default inline-block"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Góc phải: Cụm lây nhiễm (nếu có) */}
                      <div className="shrink-0 z-10 min-w-[20px] flex justify-end">
                        {isDeskInCluster && (
                          <span className="text-rose-700 font-black text-[9px] uppercase tracking-wider animate-pulse">
                            🚨 Cụm
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2 Chỗ ngồi của bàn */}
                    <div className="grid grid-cols-2 gap-2 items-stretch">
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
                        isFullscreen={isFullscreen}
                        isLargeTextMode={isLargeTextMode}
                        zoomLevel={zoomLevel}
                        isHighlighted={highlightedSeatKey ? highlightedSeatKey.split(',').includes(`${rIdx}_${aisle.cols[0]}`) : false}
                        isWinner={winnerSeatKey ? winnerSeatKey.split(',').includes(`${rIdx}_${aisle.cols[0]}`) : false}
                        isCalled={leftAssign?.student ? calledStudentIds?.has(leftAssign.student.id) : false}
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
                        isFullscreen={isFullscreen}
                        isLargeTextMode={isLargeTextMode}
                        zoomLevel={zoomLevel}
                        isHighlighted={highlightedSeatKey ? highlightedSeatKey.split(',').includes(`${rIdx}_${aisle.cols[1]}`) : false}
                        isWinner={winnerSeatKey ? winnerSeatKey.split(',').includes(`${rIdx}_${aisle.cols[1]}`) : false}
                        isCalled={rightAssign?.student ? calledStudentIds?.has(rightAssign.student.id) : false}
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

      {/* BỤC GIẢNG, BÀN GIÁO VIÊN, CỬA RA VÀO & BẢNG (PHÍA DƯỚI) */}
      <ClassroomFrontElements2D
        elementsConfig={elementsConfig}
        onUpdateElementsConfig={onUpdateElementsConfig}
        cleanClassName={cleanClassName}
        isInteractive={true}
      />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
