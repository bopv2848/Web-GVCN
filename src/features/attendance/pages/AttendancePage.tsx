import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { attendanceService } from '../services/attendanceService';
import { useDailyAttendance } from '../hooks/useDailyAttendance';
import { useMonthlyAttendance } from '../hooks/useMonthlyAttendance';
import { DailyAttendanceTab } from '../components/DailyAttendanceTab';
import { MonthlyAttendanceTab } from '../components/MonthlyAttendanceTab';
import { EpidemicAlertBanner } from '../components/EpidemicAlertBanner';
import { AttendanceNoteModal } from '../components/AttendanceNoteModal';
import { MedicalReportModal } from '../components/MedicalReportModal';
import { AttendancePrintReport } from '../components/AttendancePrintReport';
import type { EpidemicAlert } from '../../../types/attendance';

export const AttendancePage: React.FC = () => {
  const { currentClass, user } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  // Chế độ xem chính: Điểm danh ngày vs Báo cáo tháng
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  // State Cảnh báo Dịch bệnh học đường theo mùa
  const [epidemicAlert, setEpidemicAlert] = useState<EpidemicAlert | null>(null);
  const [isMedicalReportOpen, setIsMedicalReportOpen] = useState<boolean>(false);

  // Hook Điểm danh hàng ngày
  const {
    selectedDate,
    setSelectedDate,
    selectedType,
    setSelectedType,
    session,
    records,
    isLoadingDaily,
    isRealtimeActive,
    searchQueryDaily,
    setSearchQueryDaily,
    selectedGroupDaily,
    setSelectedGroupDaily,
    recentlyUpdatedId,
    editingNoteRecord,
    setEditingNoteRecord,
    handleStatusChange,
    handleSaveNote,
    handleMarkAllPresent,
    handleMarkGroupStatus,
    undoAction,
    handleUndoGroupAction,
    handleDismissUndo,
    handleToggleLock,
    uniqueGroupsDaily,
    filteredRecordsDaily,
    statsDaily,
  } = useDailyAttendance(classId, todayStr);

  // Hook Báo cáo chuyên cần tháng
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    monthlyReport,
    isLoadingMonthly,
    searchQueryMonthly,
    setSearchQueryMonthly,
    selectedGroupMonthly,
    setSelectedGroupMonthly,
    filteredStudentsMonthly,
  } = useMonthlyAttendance(classId, today.getFullYear(), today.getMonth() + 1);

  // Kiểm tra cảnh báo dịch bệnh theo mùa trong 7 ngày gần nhất
  const loadEpidemicAlert = useCallback(async () => {
    try {
      const alertData = await attendanceService.checkEpidemicAlert(classId, selectedDate);
      setEpidemicAlert(alertData);
    } catch (err) {
      console.error('Lỗi kiểm tra cảnh báo dịch bệnh:', err);
    }
  }, [classId, selectedDate]);

  useEffect(() => {
    loadEpidemicAlert();
  }, [loadEpidemicAlert, records]);

  const canManageLock = user?.role === 'gvcn' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* 1. Header & Tab Chuyển Đổi Chế Độ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Quản Lý Điểm Danh & Chuyên Cần 6A6
            </h2>
            {activeTab === 'daily' && isRealtimeActive && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Realtime Live</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Điểm danh 1 chạm thời gian thực • Báo cáo thống kê 4 Tổ & Mẫu in A4 chuẩn Ban Giám Hiệu
          </p>
        </div>

        {/* Tab chuyển đổi Điểm danh ngày vs Báo cáo tháng */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white text-primary shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            ⚡ Điểm danh hàng ngày
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-white text-primary shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            📊 Thống kê & Báo cáo Tháng
          </button>
        </div>
      </div>

      {/* 2. Băng rôn Cảnh báo Dịch bệnh học đường theo mùa */}
      <EpidemicAlertBanner
        alert={epidemicAlert}
        onOpenReport={() => setIsMedicalReportOpen(true)}
      />

      {/* 3. TAB 1: ĐIỂM DANH HÀNG NGÀY */}
      {activeTab === 'daily' && (
        <DailyAttendanceTab
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          session={session}
          records={records}
          isLoading={isLoadingDaily}
          canManageLock={canManageLock}
          searchQuery={searchQueryDaily}
          onSearchChange={setSearchQueryDaily}
          selectedGroup={selectedGroupDaily}
          onGroupChange={setSelectedGroupDaily}
          uniqueGroups={uniqueGroupsDaily}
          filteredRecords={filteredRecordsDaily}
          recentlyUpdatedId={recentlyUpdatedId}
          stats={statsDaily}
          onStatusChange={handleStatusChange}
          onEditNote={setEditingNoteRecord}
          onMarkAllPresent={handleMarkAllPresent}
          onMarkGroupStatus={handleMarkGroupStatus}
          undoAction={undoAction}
          onUndoGroupAction={handleUndoGroupAction}
          onDismissUndo={handleDismissUndo}
          onToggleLock={handleToggleLock}
          onPrint={() => window.print()}
        />
      )}

      {/* 4. TAB 2: THỐNG KÊ & BÁO CÁO THÁNG */}
      {activeTab === 'monthly' && (
        <MonthlyAttendanceTab
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          isLoading={isLoadingMonthly}
          monthlyReport={monthlyReport}
          searchQuery={searchQueryMonthly}
          onSearchChange={setSearchQueryMonthly}
          selectedGroup={selectedGroupMonthly}
          onGroupChange={setSelectedGroupMonthly}
          filteredStudents={filteredStudentsMonthly}
          onPrint={() => window.print()}
        />
      )}

      {/* 5. Mẫu Báo Cáo Chuẩn In A4 (Chỉ xuất hiện khi bấm In Ctrl+P) */}
      {monthlyReport && (
        <AttendancePrintReport
          report={monthlyReport}
          schoolName={currentClass?.schoolName || 'TRƯỜNG THCS TÂN HẢI'}
          className={currentClass?.name || 'LỚP 6A6'}
          teacherName="Thầy Phan Văn Bộ"
        />
      )}

      {/* 6. MODALS */}
      {/* 6.1. Modal Thêm/Sửa ghi chú lý do vắng / muộn */}
      {editingNoteRecord && (
        <AttendanceNoteModal
          isOpen={Boolean(editingNoteRecord)}
          onClose={() => setEditingNoteRecord(null)}
          studentName={editingNoteRecord.studentName}
          currentStatus={editingNoteRecord.status}
          initialNote={editingNoteRecord.note}
          onSave={handleSaveNote}
        />
      )}

      {/* 6.2. Modal Chi tiết Báo cáo Y tế */}
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
    </div>
  );
};
