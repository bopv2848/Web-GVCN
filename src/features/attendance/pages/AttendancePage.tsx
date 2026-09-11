import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { attendanceService } from '../services/attendanceService';
import { AttendanceStatusButtons } from '../components/AttendanceStatusButtons';
import { MonthlyAttendanceChart } from '../components/MonthlyAttendanceChart';
import { AttendancePrintReport } from '../components/AttendancePrintReport';
import { AttendanceNoteModal } from '../components/AttendanceNoteModal';
import { EpidemicAlertBanner } from '../components/EpidemicAlertBanner';
import { MedicalReportModal } from '../components/MedicalReportModal';
import type {
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  SessionType,
  MonthlyAttendanceReport,
  EpidemicAlert,
} from '../../../types/attendance';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const AttendancePage: React.FC = () => {
  const { currentClass, user } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const today = new Date();
  const todayStr = useMemo(() => today.toISOString().split('T')[0], []);

  // Chế độ xem chính: Điểm danh ngày vs Báo cáo tháng
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  // State chế độ Điểm danh hàng ngày
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedType, setSelectedType] = useState<SessionType>('morning');
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingDaily, setIsLoadingDaily] = useState<boolean>(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const [searchQueryDaily, setSearchQueryDaily] = useState<string>('');
  const [selectedGroupDaily, setSelectedGroupDaily] = useState<string>('all');
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [editingNoteRecord, setEditingNoteRecord] = useState<AttendanceRecord | null>(null);

  // State Cảnh báo Dịch bệnh học đường theo mùa
  const [epidemicAlert, setEpidemicAlert] = useState<EpidemicAlert | null>(null);
  const [isMedicalReportOpen, setIsMedicalReportOpen] = useState<boolean>(false);

  // State chế độ Báo cáo tháng
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyAttendanceReport | null>(null);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState<boolean>(false);
  const [searchQueryMonthly, setSearchQueryMonthly] = useState<string>('');
  const [selectedGroupMonthly, setSelectedGroupMonthly] = useState<string>('all');

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Tải phiên điểm danh ngày
  const loadDailySession = useCallback(async () => {
    setIsLoadingDaily(true);
    try {
      const sess = await attendanceService.getOrCreateSession(classId, selectedDate, selectedType);
      setSession(sess);

      const recs = await attendanceService.getSessionRecords(sess.id);
      setRecords(recs);
    } catch (err) {
      console.error('Lỗi nạp phiên điểm danh ngày:', err);
    } finally {
      setIsLoadingDaily(false);
    }
  }, [classId, selectedDate, selectedType]);

  useEffect(() => {
    if (activeTab === 'daily') {
      loadDailySession();
    }
  }, [activeTab, loadDailySession]);

  // 2. Kích hoạt Realtime WebSockets cho phiên ngày
  useEffect(() => {
    if (activeTab !== 'daily' || !session?.id) return;

    setIsRealtimeActive(true);

    const unsubscribe = attendanceService.subscribeToAttendance(session.id, (payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        const updatedRow = payload.new;

        setRecords((prev) =>
          prev.map((r) =>
            r.id === updatedRow.id
              ? {
                  ...r,
                  status: updatedRow.status as AttendanceStatus,
                  note: updatedRow.note,
                  updatedAt: updatedRow.updated_at,
                }
              : r
          )
        );

        setRecentlyUpdatedId(updatedRow.id);
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => {
          setRecentlyUpdatedId(null);
        }, 2500);
      } else if (payload.eventType === 'INSERT') {
        attendanceService.getSessionRecords(session.id).then(setRecords);
      }
    });

    return () => {
      setIsRealtimeActive(false);
      unsubscribe();
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, [activeTab, session?.id]);

  // 3. Tải báo cáo chuyên cần theo tháng
  const loadMonthlyReport = useCallback(async () => {
    setIsLoadingMonthly(true);
    try {
      const rep = await attendanceService.getMonthlyAttendanceReport(
        classId,
        selectedYear,
        selectedMonth
      );
      setMonthlyReport(rep);
    } catch (err) {
      console.error('Lỗi tải báo cáo chuyên cần tháng:', err);
    } finally {
      setIsLoadingMonthly(false);
    }
  }, [classId, selectedYear, selectedMonth]);

  useEffect(() => {
    if (activeTab === 'monthly') {
      loadMonthlyReport();
    }
  }, [activeTab, loadMonthlyReport]);

  // 4. Kiểm tra cảnh báo dịch bệnh theo mùa trong 7 ngày gần nhất
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

  // 5. Handlers điểm danh hàng ngày
  const handleStatusChange = async (recordId: string, newStatus: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
    );

    try {
      await attendanceService.updateRecordStatus(recordId, newStatus);
    } catch (err) {
      console.error('Lỗi cập nhật điểm danh:', err);
      if (session) {
        const fresh = await attendanceService.getSessionRecords(session.id);
        setRecords(fresh);
      }
    }
  };

  const handleSaveNote = async (note: string | null) => {
    if (!editingNoteRecord) return;
    const recordId = editingNoteRecord.id;

    // Cập nhật giao diện tức thì (Optimistic UI)
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, note } : r))
    );

    try {
      await attendanceService.updateRecordNote(recordId, note);
    } catch (err) {
      console.error('Lỗi lưu ghi chú chuyên cần:', err);
      if (session) {
        const fresh = await attendanceService.getSessionRecords(session.id);
        setRecords(fresh);
      }
    }
  };

  const handleMarkAllPresent = async () => {
    if (!session) return;
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'present' })));
    try {
      await attendanceService.markAllPresent(session.id);
    } catch (err) {
      console.error('Lỗi điểm danh tất cả:', err);
    }
  };

  const handleToggleLock = async () => {
    if (!session) return;
    const newLockState = !session.isLocked;
    setSession({ ...session, isLocked: newLockState });
    try {
      await attendanceService.toggleLockSession(session.id, newLockState);
    } catch (err) {
      console.error('Lỗi đổi trạng thái khóa:', err);
      setSession({ ...session, isLocked: !newLockState });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Bộ lọc ngày
  const uniqueGroupsDaily = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.groupName) set.add(r.groupName);
    });
    return Array.from(set).sort();
  }, [records]);

  const filteredRecordsDaily = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = r.studentName.toLowerCase().includes(searchQueryDaily.toLowerCase().trim());
      const matchGroup = selectedGroupDaily === 'all' || r.groupName === selectedGroupDaily;
      return matchSearch && matchGroup;
    });
  }, [records, searchQueryDaily, selectedGroupDaily]);

  const statsDaily = useMemo(() => {
    const total = records.length;
    if (total === 0) {
      return { total: 0, presentCount: 0, lateCount: 0, excusedCount: 0, unexcusedCount: 0, rate: 100 };
    }
    const presentCount = records.filter((r) => r.status === 'present').length;
    const lateCount = records.filter((r) => r.status === 'late').length;
    const excusedCount = records.filter((r) => r.status === 'excused_absence').length;
    const unexcusedCount = records.filter((r) => r.status === 'unexcused_absence').length;
    const rate = Math.round(((presentCount + lateCount) / total) * 100);

    return { total, presentCount, lateCount, excusedCount, unexcusedCount, rate };
  }, [records]);

  // Bộ lọc học sinh tháng
  const filteredStudentsMonthly = useMemo(() => {
    if (!monthlyReport) return [];
    return monthlyReport.studentSummaries.filter((s) => {
      const matchSearch = s.fullName.toLowerCase().includes(searchQueryMonthly.toLowerCase().trim());
      const matchGroup = selectedGroupMonthly === 'all' || s.groupName === selectedGroupMonthly;
      return matchSearch && matchGroup;
    });
  }, [monthlyReport, searchQueryMonthly, selectedGroupMonthly]);

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
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
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
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'monthly'
                ? 'bg-white text-primary shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            📊 Thống kê & Báo cáo Tháng
          </button>
        </div>
      </div>

      {/* Băng rôn Cảnh báo Dịch bệnh học đường theo mùa */}
      <EpidemicAlertBanner
        alert={epidemicAlert}
        onOpenReport={() => setIsMedicalReportOpen(true)}
      />

      {/* ========================================================================= */}
      {/* 2. TAB 1: ĐIỂM DANH HÀNG NGÀY (REALTIME LIVE) */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div className="space-y-6 print:hidden">
          {/* Action Bar Hàng ngày */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
              />

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedType('morning')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedType === 'morning'
                      ? 'bg-white text-primary shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ☀️ Buổi Sáng
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('afternoon')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedType === 'afternoon'
                      ? 'bg-white text-primary shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🌤️ Buổi Chiều
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canManageLock && (
                <Button
                  onClick={handleToggleLock}
                  variant={session?.isLocked ? 'danger' : 'outline'}
                  size="md"
                  className="text-xs font-bold"
                >
                  {session?.isLocked ? '🔒 Đã khóa sổ' : '🔓 Khóa sổ'}
                </Button>
              )}

              <Button
                onClick={handleMarkAllPresent}
                disabled={session?.isLocked}
                variant="primary"
                size="md"
                className="text-xs font-black"
              >
                ⚡ TẤT CẢ CÓ MẶT
              </Button>
            </div>
          </div>

          {/* KPI Cards Thống kê ngày */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Sĩ số lớp</span>
              <p className="text-2xl font-black text-primary mt-1">{statsDaily.total} <span className="text-xs font-semibold text-slate-400">em</span></p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Hiện diện</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {statsDaily.presentCount} <span className="text-xs font-bold text-slate-400">({statsDaily.rate}%)</span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Đi muộn</span>
              <p className="text-2xl font-black text-amber-500 mt-1">{statsDaily.lateCount} <span className="text-xs font-semibold text-slate-400">em</span></p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Vắng có phép</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{statsDaily.excusedCount} <span className="text-xs font-semibold text-slate-400">em</span></p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Vắng K.phép</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{statsDaily.unexcusedCount} <span className="text-xs font-semibold text-slate-400">em</span></p>
            </div>
          </div>

          {/* Lọc Tổ & Tìm kiếm */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedGroupDaily('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedGroupDaily === 'all'
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({records.length})
                </button>
                {uniqueGroupsDaily.map((groupName) => (
                  <button
                    key={groupName}
                    onClick={() => setSelectedGroupDaily(groupName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedGroupDaily === groupName
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {groupName}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={searchQueryDaily}
                  onChange={(e) => setSearchQueryDaily(e.target.value)}
                  placeholder="🔍 Tìm học sinh..."
                  className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bảng điểm danh ngày */}
          {isLoadingDaily ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <LoadingSpinner size="lg" text="Đang đồng bộ điểm danh ngày..." />
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 w-12 text-center">STT</th>
                      <th className="p-3.5">Học sinh</th>
                      <th className="p-3.5 hidden sm:table-cell">Tổ</th>
                      <th className="p-3.5 hidden md:table-cell">Chức vụ</th>
                      <th className="p-3.5 text-right">Trạng thái điểm danh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecordsDaily.map((record, index) => {
                      const isHighlighted = recentlyUpdatedId === record.id;
                      return (
                        <tr
                          key={record.id}
                          className={`transition-all ${
                            isHighlighted
                              ? 'bg-amber-100/90 ring-2 ring-amber-400 shadow-md animate-pulse'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3.5 text-center text-slate-400 font-bold">{index + 1}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">
                                {record.studentName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-850 block">{record.studentName}</span>
                                <span className="text-[10px] text-slate-400">{record.gender} • {record.groupName}</span>
                                {record.note && (
                                  <div
                                    onClick={() => !session?.isLocked && setEditingNoteRecord(record)}
                                    className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 px-2 py-0.5 rounded-lg w-fit cursor-pointer transition-colors max-w-xs truncate"
                                    title={`Nhấp để sửa ghi chú: ${record.note}`}
                                  >
                                    <span>📝</span>
                                    <span className="truncate">{record.note}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 hidden sm:table-cell font-bold text-slate-700">{record.groupName}</td>
                          <td className="p-3.5 hidden md:table-cell font-semibold text-primary">{record.classRole}</td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <AttendanceStatusButtons
                                currentStatus={record.status}
                                disabled={session?.isLocked}
                                onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
                              />
                              <button
                                type="button"
                                onClick={() => setEditingNoteRecord(record)}
                                disabled={session?.isLocked}
                                className={`p-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                                  record.note
                                    ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                                title={record.note ? `Ghi chú: ${record.note} (Bấm để sửa)` : 'Thêm ghi chú lý do nghỉ / muộn'}
                              >
                                📝
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: THỐNG KÊ & BÁO CÁO THÁNG (CHARTS, 4 TỔ & IN A4) */}
      {/* ========================================================================= */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* Toolbar Báo cáo Tháng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
            <div className="flex items-center gap-3">
              <label className="text-xs font-black text-slate-700 uppercase">Chọn thời gian:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
              >
                <option value={2026}>Năm 2026</option>
                <option value={2027}>Năm 2027</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrint}
                variant="accent"
                size="md"
                className="text-xs font-black text-slate-950 shadow-md shadow-amber-500/20"
              >
                🖨️ IN BÁO CÁO A4 / XUẤT PDF
              </Button>
            </div>
          </div>

          {isLoadingMonthly ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 print:hidden">
              <LoadingSpinner size="lg" text="Đang phân tích số liệu chuyên cần tháng..." />
            </div>
          ) : !monthlyReport ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 print:hidden">
              Không thể tải dữ liệu báo cáo tháng.
            </div>
          ) : (
            <>
              {/* Summary Cards Tháng */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4 print:hidden">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Buổi học trong tháng</span>
                  <p className="text-2xl font-black text-primary mt-1">{monthlyReport.totalSessions} <span className="text-xs font-semibold text-slate-400">buổi</span></p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Tỷ lệ chuyên cần</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{monthlyReport.overallRate}%</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Lượt đi muộn</span>
                  <p className="text-2xl font-black text-amber-500 mt-1">{monthlyReport.totalLate} <span className="text-xs font-semibold text-slate-400">lượt</span></p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Nghỉ có phép</span>
                  <p className="text-2xl font-black text-blue-600 mt-1">{monthlyReport.totalExcused} <span className="text-xs font-semibold text-slate-400">lượt</span></p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Nghỉ K.phép</span>
                  <p className="text-2xl font-black text-rose-600 mt-1">{monthlyReport.totalUnexcused} <span className="text-xs font-semibold text-slate-400">lượt</span></p>
                </div>
              </div>

              {/* Biểu Đồ 4 Tổ & Biểu Đồ Xu Hướng Ngày */}
              <div className="print:hidden">
                <MonthlyAttendanceChart report={monthlyReport} />
              </div>

              {/* Thống kê phân loại lý do vắng mặt trong tháng */}
              {monthlyReport.topAbsenceReasons && monthlyReport.topAbsenceReasons.length > 0 && (
                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-2xs print:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📋</span>
                      <h4 className="text-sm font-black text-slate-850 uppercase tracking-wide">
                        Cơ Cấu Lý Do Vắng Mặt & Đi Muộn Trong Tháng ({monthlyReport.topAbsenceReasons.reduce((acc, r) => acc + r.count, 0)} lượt ghi nhận)
                      </h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {monthlyReport.topAbsenceReasons.map((reasonItem) => (
                      <div
                        key={reasonItem.reason}
                        className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70 flex flex-col justify-between"
                      >
                        <span className="text-xs font-bold text-slate-800 line-clamp-1" title={reasonItem.reason}>
                          {reasonItem.reason}
                        </span>
                        <div className="flex items-baseline justify-between mt-2 pt-1.5 border-t border-slate-200/60">
                          <span className="text-sm font-black text-primary">
                            {reasonItem.count} <span className="text-[10px] font-semibold text-slate-400">lượt</span>
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {reasonItem.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách học sinh cần lưu ý (Nghỉ/Muộn nhiều) */}
              {monthlyReport.atRiskStudents.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl shadow-2xs print:hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">⚠️</span>
                    <h4 className="text-sm font-black text-rose-900 uppercase tracking-wide">
                      Danh Sách Học Sinh Cần Lưu Ý / Phối Hợp Phụ Huynh ({monthlyReport.atRiskStudents.length} em)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {monthlyReport.atRiskStudents.map((st) => (
                      <div key={st.studentId} className="bg-white p-3.5 rounded-2xl border border-rose-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-850">{st.fullName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                            {st.attendanceRate}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {st.groupName} • Muộn: <strong>{st.lateCount}</strong> • Phép: <strong>{st.excusedCount}</strong> • K.Phép: <strong className="text-rose-600">{st.unexcusedCount}</strong>
                        </p>
                        {st.absenceDetails && st.absenceDetails.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-rose-100 flex flex-wrap gap-1">
                            {st.absenceDetails.map((d, i) => (
                              <span
                                key={i}
                                className="text-[9.5px] px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200/80 rounded"
                              >
                                {d.date.slice(8, 10)}/{d.date.slice(5, 7)}: {d.note || (d.status === 'excused_absence' ? 'Có phép' : 'K.phép')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bảng Chi Tiết Toàn Bộ 47 Học Sinh Trong Tháng */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-4 print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">
                      📋 Bảng Theo Dõi Chuyên Cần Chi Tiết 47 Học Sinh
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Thống kê tổng hợp số buổi có mặt, muộn và nghỉ học của từng em trong Tháng {monthlyReport.month}/{monthlyReport.year}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchQueryMonthly}
                      onChange={(e) => setSearchQueryMonthly(e.target.value)}
                      placeholder="🔍 Tìm tên học sinh..."
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none w-48"
                    />

                    <select
                      value={selectedGroupMonthly}
                      onChange={(e) => setSelectedGroupMonthly(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
                    >
                      <option value="all">Tất cả tổ</option>
                      <option value="Tổ 1">Tổ 1</option>
                      <option value="Tổ 2">Tổ 2</option>
                      <option value="Tổ 3">Tổ 3</option>
                      <option value="Tổ 4">Tổ 4</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-12 text-center">STT</th>
                        <th className="p-3">Họ và tên</th>
                        <th className="p-3">Tổ</th>
                        <th className="p-3">Chức vụ</th>
                        <th className="p-3 text-center">Có mặt</th>
                        <th className="p-3 text-center">Đi muộn</th>
                        <th className="p-3 text-center">Có phép</th>
                        <th className="p-3 text-center">K.Phép</th>
                        <th className="p-3 text-right">Tỷ lệ chuyên cần</th>
                        <th className="p-3 text-left">Ghi chú vắng mặt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudentsMonthly.map((st, idx) => (
                        <tr key={st.studentId} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-850">{st.fullName}</td>
                          <td className="p-3 font-medium text-slate-600">{st.groupName}</td>
                          <td className="p-3 font-semibold text-primary">{st.classRole}</td>
                          <td className="p-3 text-center font-bold text-emerald-600">{st.presentCount}</td>
                          <td className="p-3 text-center font-bold text-amber-600">{st.lateCount}</td>
                          <td className="p-3 text-center font-bold text-blue-600">{st.excusedCount}</td>
                          <td className="p-3 text-center font-bold text-rose-600">{st.unexcusedCount}</td>
                          <td className="p-3 text-right">
                            <span
                              className={`font-black text-xs ${
                                st.attendanceRate >= 95
                                  ? 'text-emerald-600'
                                  : st.attendanceRate >= 90
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {st.attendanceRate}%
                            </span>
                          </td>
                          <td className="p-3 text-left">
                            {st.absenceDetails && st.absenceDetails.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {st.absenceDetails.slice(0, 2).map((d, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-medium truncate max-w-[140px]"
                                    title={`${d.date}: ${d.note || (d.status === 'excused_absence' ? 'Có phép' : 'K.phép')}`}
                                  >
                                    {d.date.slice(8, 10)}/{d.date.slice(5, 7)}: {d.note || (d.status === 'excused_absence' ? 'Có phép' : 'K.phép')}
                                  </span>
                                ))}
                                {st.absenceDetails.length > 2 && (
                                  <span className="text-[10px] font-bold text-slate-400">
                                    +{st.absenceDetails.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mẫu Báo Cáo Chuẩn In A4 (Chỉ xuất hiện khi bấm In Ctrl+P) */}
              <AttendancePrintReport
                report={monthlyReport}
                schoolName={currentClass?.schoolName || 'TRƯỜNG THCS NGUYỄN VĂN TRỖI'}
                className={currentClass?.name || 'LỚP 6A6'}
                teacherName="Thầy Phan Văn Bộ"
              />
            </>
          )}
        </div>
      )}

      {/* Modal chỉnh sửa ghi chú lý do vắng mặt / đi muộn */}
      {editingNoteRecord && (
        <AttendanceNoteModal
          isOpen={!!editingNoteRecord}
          onClose={() => setEditingNoteRecord(null)}
          studentName={editingNoteRecord.studentName}
          currentStatus={editingNoteRecord.status}
          initialNote={editingNoteRecord.note}
          onSave={handleSaveNote}
        />
      )}

      {/* Modal Báo cáo Y tế học đường & Đề xuất Khử khuẩn */}
      {epidemicAlert && (
        <MedicalReportModal
          isOpen={isMedicalReportOpen}
          onClose={() => setIsMedicalReportOpen(false)}
          alert={epidemicAlert}
          className={currentClass?.name || 'LỚP 6A6'}
          schoolName={currentClass?.schoolName || 'TRƯỜNG THCS NGUYỄN VĂN TRỖI'}
          teacherName="Thầy Phan Văn Bộ"
        />
      )}
    </div>
  );
};
