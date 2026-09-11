import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { seatingService } from '../services/seatingService';
import { studentService } from '../../students/services/studentService';
import { attendanceService } from '../../attendance/services/attendanceService';
import { DeskCell } from '../components/DeskCell';
import { SeatingLegend } from '../components/SeatingLegend';
import { ClusterDetailModal } from '../components/ClusterDetailModal';
import { MedicalReportModal } from '../../attendance/components/MedicalReportModal';
import { SchoolYearStartModal } from '../components/SchoolYearStartModal';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import type {
  SeatLayout,
  SeatAssignmentWithStudent,
  SeatingMedicalAnalysis,
} from '../../../types/seating';
import type { EpidemicAlert } from '../../../types/attendance';
import type { Student } from '../../../types/student';

export const SeatingPage: React.FC = () => {
  const { currentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Ngày bắt đầu năm học tùy chỉnh (Lưu Cloud và LocalStorage)
  const [schoolYearStartDate, setSchoolYearStartDate] = useState<string>(() => {
    return localStorage.getItem(`school_year_start_date_${classId}`) || '2026-09-01';
  });
  const [isStartDateModalOpen, setIsStartDateModalOpen] = useState<boolean>(false);

  // Tính tuần học động dựa trên ngày bắt đầu năm học thực tế của địa phương
  const schoolWeekInfo = useMemo(
    () => seatingService.getCurrentSchoolWeek(schoolYearStartDate),
    [schoolYearStartDate]
  );

  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [assignments, setAssignments] = useState<SeatAssignmentWithStudent[]>([]);

  // Tùy chọn linh động: Bình thường tắt tính năng tuần chẵn/lẻ (Cố định), có thể mở cho lớp muốn đảo
  const [isRotationEnabled, setIsRotationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(`seating_rotation_enabled_${classId}`);
    return saved === 'true'; // Mặc định tắt (false) nếu chưa cài đặt
  });

  const [activeWeekMode, setActiveWeekMode] = useState<'odd' | 'even'>(schoolWeekInfo.mode);
  const [isSavingWeek, setIsSavingWeek] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMedicalMode, setIsMedicalMode] = useState<boolean>(true);
  const [epidemicAlert, setEpidemicAlert] = useState<EpidemicAlert | null>(null);
  const [isClusterModalOpen, setIsClusterModalOpen] = useState<boolean>(false);
  const [isMedicalReportOpen, setIsMedicalReportOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Đồng bộ lại cài đặt chế độ xoay và ngày khai giảng khi chuyển đổi lớp học
  useEffect(() => {
    const saved = localStorage.getItem(`seating_rotation_enabled_${classId}`);
    setIsRotationEnabled(saved === 'true');
    const savedDate = localStorage.getItem(`school_year_start_date_${classId}`);
    if (savedDate) setSchoolYearStartDate(savedDate);
  }, [classId]);

  // State hỗ trợ Đổi chỗ Kéo - Thả (Desktop) & Chạm 2 bước (Mobile)
  const [selectedSourceSeat, setSelectedSourceSeat] = useState<{
    assignment: SeatAssignmentWithStudent;
    rowIndex: number;
    colIndex: number;
  } | null>(null);

  const [draggedSeat, setDraggedSeat] = useState<{
    assignment: SeatAssignmentWithStudent;
    rowIndex: number;
    colIndex: number;
  } | null>(null);

  const [dragOverPos, setDragOverPos] = useState<{ r: number; c: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Tải sơ đồ chỗ ngồi & dữ liệu y tế dịch bệnh
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1.1. Lấy Layout và Danh sách phân công chỗ ngồi
      const currentLayout = await seatingService.getOrCreateClassLayout(classId);
      setLayout(currentLayout);

      let assigns = await seatingService.getSeatAssignmentsWithStudents(currentLayout.id, classId);

      // 1.1b. Nếu Supabase chưa có hoặc đang chờ cấp quyền RLS, thử khôi phục từ bộ nhớ trình duyệt (LocalStorage)
      const savedLocal = localStorage.getItem(`seating_assignments_${classId}`);
      if ((!assigns || assigns.length === 0 || !assigns.some((a) => !!a.student)) && savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((a: any) => !!a.student)) {
            assigns = parsed;
          }
        } catch {
          // Bỏ qua nếu dữ liệu lưu cũ lỗi cú pháp
        }
      }

      // Nếu chưa có phân công nào hoặc toàn bộ ghế trống, tự động gán mặc định từ 47 học sinh
      const hasAnyStudent = assigns.some((a) => !!a.student);
      if (assigns.length === 0 || !hasAnyStudent) {
        const students = await studentService.getStudents(classId);
        assigns = await seatingService.seedDefaultAssignments(currentLayout.id, students);
      }

      setAssignments(assigns);
      if (assigns.length > 0) {
        localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(assigns));
      }

      // 1.2. Lấy cấu hình lớp từ Cloud (Chế độ xoay & Ngày bắt đầu năm học)
      const cloudConfig = await seatingService.getClassSeatingConfig(classId);
      setIsRotationEnabled(cloudConfig.rotationEnabled);
      setSchoolYearStartDate(cloudConfig.schoolYearStartDate);

      // 1.3. Lấy dữ liệu cảnh báo dịch bệnh trong 7 ngày
      const alert = await attendanceService.checkEpidemicAlert(classId, todayStr);
      setEpidemicAlert(alert);

      // Tự động bật chế độ y tế nếu phát hiện có học sinh nghỉ ốm
      if (alert.sickStudentCount >= 1) {
        setIsMedicalMode(true);
      }
    } catch (err) {
      console.error('Lỗi nạp sơ đồ lớp:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId, todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 1.3. Danh sách phân công hiển thị
  // - Nếu tắt tính năng đảo tuần => luôn giữ sơ đồ cố định gốc (assignments)
  // - Nếu mở tính năng đảo tuần => tự động xoay nếu chọn Tuần Chẵn
  const displayedAssignments = useMemo(() => {
    if (isRotationEnabled && activeWeekMode === 'even') {
      return seatingService.rotateAssignments(assignments);
    }
    return assignments;
  }, [assignments, isRotationEnabled, activeWeekMode]);

  // 2. Thuật toán phân tích cụm lây nhiễm bàn học dựa trên sơ đồ hiển thị
  const medicalAnalysis: SeatingMedicalAnalysis = useMemo(() => {
    const sickIds = new Set<string>(
      epidemicAlert?.sickStudents.map((s) => s.studentId) || []
    );
    return seatingService.analyzeInfectionClusters(displayedAssignments, sickIds);
  }, [displayedAssignments, epidemicAlert]);

  // Map lý do ốm của từng học sinh
  const sickReasonMap = useMemo(() => {
    const map = new Map<string, string>();
    epidemicAlert?.sickStudents.forEach((st) => {
      map.set(st.studentId, st.reasons.join(', '));
    });
    return map;
  }, [epidemicAlert]);

  // Ma trận tra cứu vị trí nhanh: "rowIndex_colIndex" -> SeatAssignmentWithStudent
  const assignmentGrid = useMemo(() => {
    const map = new Map<string, SeatAssignmentWithStudent>();
    displayedAssignments.forEach((a) => {
      map.set(`${a.rowIndex}_${a.colIndex}`, a);
    });
    return map;
  }, [displayedAssignments]);

  // Set các bàn thuộc cụm lây nhiễm: "rowIndex_deskPair" (deskPair = 0, 1, 2, 3)
  const clusterDeskKeys = useMemo(() => {
    const set = new Set<string>();
    medicalAnalysis.clusters.forEach((c) => {
      c.sickStudentIds.forEach((sid) => {
        const a = displayedAssignments.find((asg) => asg.studentId === sid);
        if (a) {
          set.add(`${a.rowIndex}_${Math.floor(a.colIndex / 2)}`);
        }
      });
    });
    return set;
  }, [medicalAnalysis.clusters, displayedAssignments]);

  // 3. Logic Hoán Đổi & Di Chuyển Chỗ Ngồi (Cả Drag & Drop và Tap-to-Swap)
  const executeSwapOrMove = async (
    source: { assignment: SeatAssignmentWithStudent; rowIndex: number; colIndex: number },
    targetRow: number,
    targetCol: number,
    targetAssignment?: SeatAssignmentWithStudent
  ) => {
    if (source.rowIndex === targetRow && source.colIndex === targetCol) {
      return; // Cùng vị trí
    }

    if (!layout) return;

    // 1. Cập nhật giao diện tức thì (Optimistic UI)
    const sourceName = source.assignment.student?.fullName || 'Học sinh';
    const targetName = targetAssignment?.student?.fullName;

    const newAssignments = assignments.map((a) => {
      if (a.id === source.assignment.id) {
        return { ...a, rowIndex: targetRow, colIndex: targetCol };
      }
      if (targetAssignment && a.id === targetAssignment.id) {
        return { ...a, rowIndex: source.rowIndex, colIndex: source.colIndex };
      }
      return a;
    });

    setAssignments(newAssignments);
    localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(newAssignments));

    // Thông báo Toast thân thiện
    if (targetName) {
      setToastMessage(`🔄 Đã đổi chỗ giữa em ${sourceName} và em ${targetName}!`);
    } else {
      setToastMessage(`➡️ Đã chuyển em ${sourceName} sang Bàn ${targetRow + 1}!`);
    }

    setTimeout(() => setToastMessage(null), 3500);

    // 2. Gửi cập nhật an toàn lên Supabase
    try {
      await seatingService.swapOrMoveSeats(
        layout.id,
        source.assignment,
        targetRow,
        targetCol,
        targetAssignment
      );
    } catch (err) {
      console.warn('Lưu vị trí lên Supabase (chưa chạy SQL RLS hoặc lỗi mạng), đã lưu vào bộ nhớ máy:', err);
    }
  };

  // Handler Chạm 2 bước (Tap-to-Swap)
  const handleSeatClick = (
    r: number,
    c: number,
    assignment?: SeatAssignmentWithStudent
  ) => {
    if (isRotationEnabled && activeWeekMode === 'even') {
      setToastMessage('💡 Thầy đang xem trước Tuần Chẵn. Bấm "Lưu Sơ Đồ Này Lên Supabase" nếu muốn chỉnh sửa từng vị trí!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    // Nếu chưa chọn học sinh nguồn
    if (!selectedSourceSeat) {
      if (assignment?.student) {
        setSelectedSourceSeat({ assignment, rowIndex: r, colIndex: c });
      }
      return;
    }

    // Nếu bấm lại chính ghế đó => Hủy chọn
    if (selectedSourceSeat.rowIndex === r && selectedSourceSeat.colIndex === c) {
      setSelectedSourceSeat(null);
      return;
    }

    // Đã có nguồn và bấm vào ghế khác (có học sinh hoặc ghế trống) => Đổi chỗ!
    const source = selectedSourceSeat;
    setSelectedSourceSeat(null);
    executeSwapOrMove(source, r, c, assignment);
  };

  // Handlers Kéo Thả Chuột (HTML5 Drag & Drop)
  const handleDragStart = (
    e: React.DragEvent,
    assignment: SeatAssignmentWithStudent,
    r: number,
    c: number
  ) => {
    if (isRotationEnabled && activeWeekMode === 'even') {
      e.preventDefault();
      setToastMessage('💡 Thầy đang xem trước Tuần Chẵn. Bấm "Lưu Sơ Đồ Này Lên Supabase" nếu muốn kéo thả đổi chỗ!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    e.dataTransfer.setData('text/plain', assignment.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSeat({ assignment, rowIndex: r, colIndex: c });
  };

  const handleDragOver = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverPos?.r !== r || dragOverPos?.c !== c) {
      setDragOverPos({ r, c });
    }
  };

  const handleDragLeave = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    if (dragOverPos?.r === r && dragOverPos?.c === c) {
      setDragOverPos(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    targetRow: number,
    targetCol: number,
    targetAssignment?: SeatAssignmentWithStudent
  ) => {
    e.preventDefault();
    setDragOverPos(null);
    if (!draggedSeat) return;

    const source = draggedSeat;
    setDraggedSeat(null);
    executeSwapOrMove(source, targetRow, targetCol, targetAssignment);
  };

  // Handler chuyển đổi 2 chế độ: Cố định (Tắt đảo tuần) và Mở đảo tuần chẵn/lẻ linh động
  const handleToggleRotation = async (enabled: boolean) => {
    setIsRotationEnabled(enabled);
    if (!enabled) {
      setActiveWeekMode('odd');
      setToastMessage('📌 Đã tắt tính năng: Lưu chế độ Chỗ ngồi Cố định lên Cloud!');
    } else {
      setToastMessage('🔄 Đã mở tính năng: Lưu chế độ Đảo Dãy Tuần Chẵn/Lẻ lên Cloud!');
    }
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await seatingService.updateSeatingRotationConfig(classId, enabled);
    } catch (err) {
      console.error('Lỗi lưu cấu hình xoay chỗ ngồi lên Supabase Cloud:', err);
    }
  };

  // Handler lưu ngày bắt đầu năm học tùy chỉnh lên Cloud
  const handleSaveStartDate = async (newStartDate: string) => {
    setSchoolYearStartDate(newStartDate);
    const newWeek = seatingService.getCurrentSchoolWeek(newStartDate);
    setActiveWeekMode(newWeek.mode);
    setToastMessage(
      `✅ Đã lưu ngày bắt đầu năm học (${newStartDate}) lên Cloud! Tuần học hiện tại là: Tuần ${newWeek.weekNumber} (${
        newWeek.mode === 'odd' ? 'Tuần Lẻ' : 'Tuần Chẵn'
      }).`
    );
    setTimeout(() => setToastMessage(null), 4000);

    try {
      await seatingService.updateClassSeatingConfig(classId, {
        schoolYearStartDate: newStartDate,
      });
    } catch (err) {
      console.error('Lỗi lưu ngày bắt đầu năm học lên Cloud:', err);
    }
  };

  // Handler sắp xếp lại theo 4 Tổ
  const handleResetLayout = async () => {
    if (!layout) return;
    const confirm = window.confirm('Thầy có chắc chắn muốn sắp xếp lại chỗ ngồi 47 học sinh theo 4 Tổ?');
    if (!confirm) return;

    setIsLoading(true);
    try {
      const students = await studentService.getStudents(classId);
      const newAssigns = await seatingService.seedDefaultAssignments(layout.id, students);
      setAssignments(newAssigns);
      setActiveWeekMode('odd');
      setToastMessage('✅ Đã sắp xếp lại 47 học sinh theo 4 Tổ chuẩn!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi sắp xếp lại chỗ ngồi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Lưu cấu hình Tuần Chẵn làm sơ đồ gốc trên Supabase
  const handleSaveCurrentWeekAsBase = async () => {
    if (!layout) return;
    const confirm = window.confirm(
      'Thầy có chắc chắn muốn lưu sơ đồ dãy bàn Tuần Chẵn (Đã đảo Dãy 1↔2 và Dãy 3↔4) làm vị trí chính thức trên Supabase?'
    );
    if (!confirm) return;

    setIsSavingWeek(true);
    try {
      await seatingService.saveAllAssignments(layout.id, displayedAssignments);
      setAssignments(displayedAssignments);
      setActiveWeekMode('odd'); // Sơ đồ đã trở thành bản gốc chính thức
      setToastMessage('✅ Đã lưu sơ đồ Tuần Chẵn làm vị trí chính thức trên Supabase!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Lỗi lưu sơ đồ tuần mới:', err);
      setToastMessage('❌ Không thể lưu sơ đồ lên Supabase. Vui lòng thử lại!');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSavingWeek(false);
    }
  };

  // Định nghĩa 4 dãy bàn (Nếu mở tính năng và ở Tuần Chẵn thì xoay dãy, còn bình thường/cố định thì giữ Tổ 4 - 3 - 2 - 1)
  const aisles = useMemo(() => {
    if (isRotationEnabled && activeWeekMode === 'even') {
      return [
        { name: 'TỔ 3', pairIndex: 0, cols: [0, 1], subTitle: 'Dãy 1 (Cửa sổ)' },
        { name: 'TỔ 4', pairIndex: 1, cols: [2, 3], subTitle: 'Dãy 2 (Giữa trái)' },
        { name: 'TỔ 1', pairIndex: 2, cols: [4, 5], subTitle: 'Dãy 3 (Giữa phải)' },
        { name: 'TỔ 2', pairIndex: 3, cols: [6, 7], subTitle: 'Dãy 4 (Hành lang)' },
      ];
    }
    return [
      { name: 'TỔ 4', pairIndex: 0, cols: [0, 1], subTitle: 'Dãy 1 (Cửa sổ)' },
      { name: 'TỔ 3', pairIndex: 1, cols: [2, 3], subTitle: 'Dãy 2 (Giữa trái)' },
      { name: 'TỔ 2', pairIndex: 2, cols: [4, 5], subTitle: 'Dãy 3 (Giữa phải)' },
      { name: 'TỔ 1', pairIndex: 3, cols: [6, 7], subTitle: 'Dãy 4 (Hành lang)' },
    ];
  }, [isRotationEnabled, activeWeekMode]);

  const totalRows = layout?.rows || 6;

  return (
    <div className="space-y-6">
      {/* Toast thông báo thành công */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border border-slate-700 backdrop-blur-md animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Action Bar khi chọn đổi chỗ trên điện thoại */}
      {selectedSourceSeat && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 backdrop-blur-md max-w-lg w-[90%] sm:w-auto animate-pulse">
          <span className="text-xl">🔄</span>
          <div className="min-w-0">
            <p className="text-xs font-black truncate">
              Đang chọn: {selectedSourceSeat.assignment.student?.fullName} (Bàn {selectedSourceSeat.rowIndex + 1})
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              👉 Chạm vào bạn học sinh khác hoặc ghế trống để đổi chỗ!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedSourceSeat(null)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            Hủy
          </button>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Sơ Đồ Chỗ Ngồi Lớp 6A6
            </h2>
            {isMedicalMode && medicalAnalysis.totalSickInSeats > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Chế độ Giám sát Dịch bệnh</span>
              </span>
            )}
            {isRotationEnabled ? (
              <button
                type="button"
                onClick={() => setIsStartDateModalOpen(true)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Bấm để tùy chỉnh ngày bắt đầu năm học của địa phương"
              >
                <span>🔄 Đảo Tuần Chẵn/Lẻ • Tuần {schoolWeekInfo.weekNumber} ({schoolWeekInfo.mode === 'odd' ? 'Tuần Lẻ' : 'Tuần Chẵn'})</span>
                <span className="text-[10px] opacity-75">⚙️</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsStartDateModalOpen(true)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Bấm để tùy chỉnh ngày bắt đầu năm học của địa phương"
              >
                <span>📌 Chế độ: Chỗ ngồi Cố định</span>
                <span className="text-[10px] opacity-75">⚙️</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {isRotationEnabled
              ? `Đảo dãy định kỳ theo SO-DO-LOP.xlsx • Tự động tính tuần từ ngày ${schoolYearStartDate} • Kéo thả đổi chỗ • Lưu Supabase`
              : `Chỗ ngồi cố định cho lớp • Ngày bắt đầu: ${schoolYearStartDate} • Kéo - thả chuột để đổi chỗ • Lưu Supabase`}
          </p>
        </div>

        {/* Nút thao tác & 2 Chế độ Sắp Xếp Chỗ Ngồi */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bộ 2 Nút Chạm: Cố định (Tắt) vs Đảo Tuần Chẵn/Lẻ (Mở) */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleToggleRotation(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                !isRotationEnabled
                  ? 'bg-white text-slate-850 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Bình thường: Tắt tính năng tuần chẵn/lẻ cho lớp giữ chỗ ngồi cố định"
            >
              <span>📌</span>
              <span>Cố Định</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleRotation(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                isRotationEnabled
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Mở tính năng: Đảo dãy tuần chẵn / tuần lẻ linh động cho lớp có nhu cầu"
            >
              <span>🔄</span>
              <span>Đảo Tuần Chẵn/Lẻ</span>
            </button>
          </div>

          {/* Nếu mở tính năng Đảo tuần: Hiển thị bộ chọn Tuần Lẻ / Tuần Chẵn */}
          {isRotationEnabled && (
            <div className="inline-flex items-center p-1 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveWeekMode('odd')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  activeWeekMode === 'odd'
                    ? 'bg-white text-blue-700 shadow-xs border border-blue-200/80'
                    : 'text-blue-700/70 hover:text-blue-900'
                }`}
              >
                <span>☀️</span>
                <span>Tuần Lẻ</span>
                {schoolWeekInfo.mode === 'odd' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveWeekMode('even')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  activeWeekMode === 'even'
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200/80'
                    : 'text-emerald-700/70 hover:text-emerald-900'
                }`}
              >
                <span>🌤️</span>
                <span>Tuần Chẵn</span>
                {schoolWeekInfo.mode === 'even' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                )}
              </button>
            </div>
          )}

          {/* Nút tùy chỉnh ngày bắt đầu năm học */}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setIsStartDateModalOpen(true)}
            className="text-xs font-bold flex items-center gap-1.5"
            title="Tùy chỉnh ngày khai giảng/tựu trường thực tế của địa phương"
          >
            <span>📅</span>
            <span>Lịch Năm Học</span>
          </Button>

          {medicalAnalysis.clusters.length > 0 && (
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={() => setIsClusterModalOpen(true)}
              className="text-xs font-black shadow-md shadow-rose-500/20"
            >
              🚨 XEM {medicalAnalysis.clusters.length} CỤM LÂY NHIỄM
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleResetLayout}
            className="text-xs font-bold"
          >
            🔄 Sắp Xếp Lại 4 Tổ
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => window.print()}
            className="text-xs font-black shadow-md shadow-primary/20"
          >
            🖨️ IN SƠ ĐỒ LỚP A4
          </Button>
        </div>
      </div>

      {/* Banner thông báo khi đang xem trước Tuần Chẵn (Chỉ hiện khi mở tính năng và ở Tuần Chẵn) */}
      {isRotationEnabled && activeWeekMode === 'even' && (
        <div className="bg-emerald-50/90 border border-emerald-200 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌤️</span>
            <div>
              <p className="font-black text-emerald-900">
                Đang xem trước Sơ đồ đảo dãy Tuần Chẵn (Tổ 3 ↔ Tổ 4 | Tổ 1 ↔ Tổ 2)
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Sơ đồ đã xoay chuẩn theo file SO-DO-LOP.xlsx của nhà trường. Thầy có thể in ngay hoặc bấm lưu để cố định làm sơ đồ chính thức.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveCurrentWeekAsBase}
            disabled={isSavingWeek}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-sm cursor-pointer"
          >
            {isSavingWeek ? 'Đang lưu Supabase...' : '💾 Lưu Sơ Đồ Này Lên Supabase'}
          </Button>
        </div>
      )}

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
      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <LoadingSpinner size="lg" text="Đang đồng bộ Sơ đồ chỗ ngồi 47 học sinh..." />
        </div>
      ) : (
        <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 overflow-x-auto">
          {/* Tiêu đề in chuẩn A4 khi bấm In */}
          <div className="hidden print:block text-center pb-4 border-b border-slate-300 mb-6 space-y-1">
            <h1 className="text-lg font-black uppercase text-slate-900">
              TRƯỜNG THCS TÂN HẢI — LỚP 6A6
            </h1>
            <h2 className="text-base font-black text-slate-850">
              {isRotationEnabled
                ? `SƠ ĐỒ CHỖ NGỒI HỌC SINH — ÁP DỤNG ${
                    activeWeekMode === 'even'
                      ? 'TUẦN CHẴN (TỔ 3 - 4 - 1 - 2)'
                      : 'TUẦN LẺ (TỔ 4 - 3 - 2 - 1)'
                  }`
                : 'SƠ ĐỒ CHỖ NGỒI HỌC SINH'}
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              GVCN: Thầy Phan Văn Bộ • Năm học: 2026 - 2027 •{' '}
              {isRotationEnabled
                ? `Tuần hiện tại: Tuần ${schoolWeekInfo.weekNumber}`
                : 'Chế độ: Chỗ ngồi cố định'}
            </p>
          </div>

          {/* 3.1. BỤC GIẢNG & BÀN GIÁO VIÊN (PHÍA TRƯỚC) */}
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

          {/* 3.2. 4 DÃY BÀN HỌC (TỔ 4, TỔ 3, TỔ 2, TỔ 1) */}
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
                            onDragStart={(e) => leftAssign && handleDragStart(e, leftAssign, rIdx, aisle.cols[0])}
                            onDragOver={(e) => handleDragOver(e, rIdx, aisle.cols[0])}
                            onDragLeave={(e) => handleDragLeave(e, rIdx, aisle.cols[0])}
                            onDrop={(e) => handleDrop(e, rIdx, aisle.cols[0], leftAssign)}
                            onClick={() => handleSeatClick(rIdx, aisle.cols[0], leftAssign)}
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
                            onDragStart={(e) => rightAssign && handleDragStart(e, rightAssign, rIdx, aisle.cols[1])}
                            onDragOver={(e) => handleDragOver(e, rIdx, aisle.cols[1])}
                            onDragLeave={(e) => handleDragLeave(e, rIdx, aisle.cols[1])}
                            onDrop={(e) => handleDrop(e, rIdx, aisle.cols[1], rightAssign)}
                            onClick={() => handleSeatClick(rIdx, aisle.cols[1], rightAssign)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 3.3. PHÍA SAU PHÒNG HỌC */}
          <div className="text-center pt-4 border-t border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
            🚪 CỬA RA VÀO PHÍA SAU & KHU VỰC VỆ SINH LỚP HỌC
          </div>
        </div>
      )}

      {/* 4. MODALS */}
      {/* 4.1. Modal Chi tiết học sinh khi cần xem */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg font-black">
                {selectedStudent.fullName.charAt(selectedStudent.fullName.lastIndexOf(' ') + 1) || 'H'}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-850">{selectedStudent.fullName}</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  {selectedStudent.gender} • {selectedStudent.groupName} • {selectedStudent.classRole}
                </p>
              </div>
            </div>

            {/* Trạng thái y tế */}
            {medicalAnalysis.sickStudentIds.has(selectedStudent.id) ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 text-rose-900">
                <span className="font-black block">🔴 Đang nghỉ ốm sốt theo mùa</span>
                <p className="text-[11px] text-rose-800">
                  Lý do ghi nhận: {sickReasonMap.get(selectedStudent.id) || 'Ốm sốt'}
                </p>
              </div>
            ) : medicalAnalysis.atRiskNeighborStudentIds.has(selectedStudent.id) ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1 text-amber-900">
                <span className="font-black block">⚠️ Ngồi cạnh học sinh đang nghỉ ốm</span>
                <p className="text-[11px] text-amber-800">
                  Khuyến nghị: Nhắc nhở em đeo khẩu trang trong giờ học, kiểm tra thân nhiệt đầu giờ và bố trí ngồi giãn cách nếu có bàn trống.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold">
                ✅ Sức khỏe bình thường • Không ghi nhận triệu chứng
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

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
