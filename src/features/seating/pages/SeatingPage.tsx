import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useSeatingManagement } from '../hooks/useSeatingManagement';
import { SeatingToolbar } from '../components/SeatingToolbar';
import { SeatingLegend } from '../components/SeatingLegend';
import { SeatingGrid } from '../components/SeatingGrid';
import { FloatingSwapActionBar } from '../components/FloatingSwapActionBar';
import { StudentMedicalModal } from '../components/StudentMedicalModal';
import { ClusterDetailModal } from '../components/ClusterDetailModal';
import { MedicalReportModal } from '../../attendance/components/MedicalReportModal';
import { SchoolYearStartModal } from '../components/SchoolYearStartModal';

export const SeatingPage: React.FC = () => {
  const { currentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const {
    schoolYearStartDate,
    isStartDateModalOpen,
    setIsStartDateModalOpen,
    schoolWeekInfo,
    isRotationEnabled,
    activeWeekMode,
    setActiveWeekMode,
    isSavingWeek,
    isLoading,
    isMedicalMode,
    setIsMedicalMode,
    epidemicAlert,
    isClusterModalOpen,
    setIsClusterModalOpen,
    isMedicalReportOpen,
    setIsMedicalReportOpen,
    selectedStudent,
    setSelectedStudent,
    selectedSourceSeat,
    setSelectedSourceSeat,
    draggedSeat,
    dragOverPos,
    toastMessage,
    medicalAnalysis,
    sickReasonMap,
    assignmentGrid,
    clusterDeskKeys,
    aisles,
    totalRows,
    handleSeatClick,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleToggleRotation,
    handleSaveStartDate,
    handleResetLayout,
    handleSaveCurrentWeekAsBase,
  } = useSeatingManagement(classId);

  return (
    <div className="space-y-6">
      {/* Toast thông báo thành công */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border border-slate-700 backdrop-blur-md animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Action Bar khi chọn đổi chỗ trên điện thoại/máy tính */}
      <FloatingSwapActionBar
        selectedSourceSeat={selectedSourceSeat}
        onCancel={() => setSelectedSourceSeat(null)}
      />

      {/* 1. Header & Actions Toolbar */}
      <SeatingToolbar
        isMedicalMode={isMedicalMode}
        medicalAnalysis={medicalAnalysis}
        isRotationEnabled={isRotationEnabled}
        schoolWeekInfo={schoolWeekInfo}
        schoolYearStartDate={schoolYearStartDate}
        activeWeekMode={activeWeekMode}
        isSavingWeek={isSavingWeek}
        onToggleRotation={handleToggleRotation}
        onSelectWeekMode={setActiveWeekMode}
        onOpenStartDateModal={() => setIsStartDateModalOpen(true)}
        onOpenClusterModal={() => setIsClusterModalOpen(true)}
        onResetLayout={handleResetLayout}
        onSaveCurrentWeekAsBase={handleSaveCurrentWeekAsBase}
      />

      {/* 2. Bảng Chú Thích & Công Tắc Giám Sát Y Tế */}
      <SeatingLegend
        isMedicalMode={isMedicalMode}
        onToggleMedicalMode={() => setIsMedicalMode((prev) => !prev)}
        totalSick={medicalAnalysis.totalSickInSeats}
        totalClusters={medicalAnalysis.clusters.length}
        totalAtRisk={medicalAnalysis.atRiskNeighborStudentIds.size}
        onOpenClusterModal={() => setIsClusterModalOpen(true)}
      />

      {/* 3. Khung Sơ Đồ Lớp Học Tương Tác */}
      <SeatingGrid
        isLoading={isLoading}
        schoolName={currentClass?.schoolName || 'TRƯỜNG THCS TÂN HẢI'}
        className={currentClass?.name || 'LỚP 6A6'}
        logoUrl={currentClass?.logoUrl}
        isRotationEnabled={isRotationEnabled}
        activeWeekMode={activeWeekMode}
        schoolWeekInfo={schoolWeekInfo}
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
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onSeatClick={(r, c, assignment) => {
          if (assignment?.student && isMedicalMode && (medicalAnalysis.sickStudentIds.has(assignment.student.id) || medicalAnalysis.atRiskNeighborStudentIds.has(assignment.student.id))) {
            setSelectedStudent(assignment.student);
          }
          handleSeatClick(r, c, assignment);
        }}
      />

      {/* 4. MODALS */}
      {/* 4.1. Modal Chi tiết học sinh khi xem trong chế độ y tế */}
      <StudentMedicalModal
        student={selectedStudent}
        medicalAnalysis={medicalAnalysis}
        sickReasonMap={sickReasonMap}
        onClose={() => setSelectedStudent(null)}
      />

      {/* 4.2. Modal Cụm Lây Nhiễm Bàn Học */}
      <ClusterDetailModal
        isOpen={isClusterModalOpen}
        onClose={() => setIsClusterModalOpen(false)}
        clusters={medicalAnalysis.clusters}
        onOpenMedicalReport={() => setIsMedicalReportOpen(true)}
      />

      {/* 4.3. Modal Báo Cáo Y Tế Học Đường */}
      {epidemicAlert && (
        <MedicalReportModal
          isOpen={isMedicalReportOpen}
          onClose={() => setIsMedicalReportOpen(false)}
          alert={epidemicAlert}
          className={currentClass?.name || 'LỚP 6A6'}
          schoolName={currentClass?.schoolName || 'TRƯỜNG THCS TÂN HẢI'}
          teacherName="Thầy Phan Văn Bộ"
        />
      )}

      {/* 4.4. Modal Tùy Chỉnh Ngày Bắt Đầu Năm Học */}
      <SchoolYearStartModal
        isOpen={isStartDateModalOpen}
        onClose={() => setIsStartDateModalOpen(false)}
        currentStartDate={schoolYearStartDate}
        onSave={handleSaveStartDate}
      />
    </div>
  );
};
