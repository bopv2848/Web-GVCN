import { useState, useEffect, useCallback, useMemo } from 'react';
import { seatingService } from '../services/seatingService';
import { studentService } from '../../students/services/studentService';
import { attendanceService } from '../../attendance/services/attendanceService';
import type {
  SeatLayout,
  SeatAssignmentWithStudent,
  SeatingMedicalAnalysis,
} from '../../../types/seating';
import type { EpidemicAlert } from '../../../types/attendance';
import type { Student } from '../../../types/student';

export interface SourceSeatInfo {
  assignment: SeatAssignmentWithStudent;
  rowIndex: number;
  colIndex: number;
}

export const useSeatingManagement = (classId: string) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Ngày bắt đầu năm học tùy chỉnh
  const [schoolYearStartDate, setSchoolYearStartDate] = useState<string>(() => {
    return localStorage.getItem(`school_year_start_date_${classId}`) || '2026-09-01';
  });
  const [isStartDateModalOpen, setIsStartDateModalOpen] = useState<boolean>(false);

  // Tính tuần học động
  const schoolWeekInfo = useMemo(
    () => seatingService.getCurrentSchoolWeek(schoolYearStartDate),
    [schoolYearStartDate]
  );

  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [assignments, setAssignments] = useState<SeatAssignmentWithStudent[]>([]);

  // Tùy chọn linh động: Cố định vs Đảo tuần chẵn/lẻ
  const [isRotationEnabled, setIsRotationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(`seating_rotation_enabled_${classId}`);
    return saved === 'true';
  });

  const [activeWeekMode, setActiveWeekMode] = useState<'odd' | 'even'>(schoolWeekInfo.mode);
  const [isSavingWeek, setIsSavingWeek] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMedicalMode, setIsMedicalMode] = useState<boolean>(true);
  const [epidemicAlert, setEpidemicAlert] = useState<EpidemicAlert | null>(null);
  const [isClusterModalOpen, setIsClusterModalOpen] = useState<boolean>(false);
  const [isMedicalReportOpen, setIsMedicalReportOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Đồng bộ lại cài đặt khi chuyển đổi lớp
  useEffect(() => {
    const saved = localStorage.getItem(`seating_rotation_enabled_${classId}`);
    setIsRotationEnabled(saved === 'true');
    const savedDate = localStorage.getItem(`school_year_start_date_${classId}`);
    if (savedDate) setSchoolYearStartDate(savedDate);
  }, [classId]);

  // State hỗ trợ Đổi chỗ Kéo - Thả (Desktop) & Chạm 2 bước (Mobile)
  const [selectedSourceSeat, setSelectedSourceSeat] = useState<SourceSeatInfo | null>(null);
  const [draggedSeat, setDraggedSeat] = useState<SourceSeatInfo | null>(null);
  const [dragOverPos, setDragOverPos] = useState<{ r: number; c: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Tải sơ đồ chỗ ngồi & dữ liệu y tế dịch bệnh
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentLayout = await seatingService.getOrCreateClassLayout(classId);
      setLayout(currentLayout);

      let assigns = await seatingService.getSeatAssignmentsWithStudents(currentLayout.id, classId);

      const savedLocal = localStorage.getItem(`seating_assignments_${classId}`);
      if ((!assigns || assigns.length === 0 || !assigns.some((a) => !!a.student)) && savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((a: SeatAssignmentWithStudent) => !!a.student)) {
            assigns = parsed;
          }
        } catch {
          // Bỏ qua nếu dữ liệu lưu cũ lỗi cú pháp
        }
      }

      const hasAnyStudent = assigns.some((a) => !!a.student);
      if (assigns.length === 0 || !hasAnyStudent) {
        const students = await studentService.getStudents(classId);
        assigns = await seatingService.seedDefaultAssignments(currentLayout.id, students);
      }

      setAssignments(assigns);
      if (assigns.length > 0) {
        localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(assigns));
      }

      const cloudConfig = await seatingService.getClassSeatingConfig(classId);
      setIsRotationEnabled(cloudConfig.rotationEnabled);
      setSchoolYearStartDate(cloudConfig.schoolYearStartDate);

      const alert = await attendanceService.checkEpidemicAlert(classId, todayStr);
      setEpidemicAlert(alert);

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

  // Danh sách phân công hiển thị (Xoay nếu chọn Tuần Chẵn và mở tính năng)
  const displayedAssignments = useMemo(() => {
    if (isRotationEnabled && activeWeekMode === 'even') {
      return seatingService.rotateAssignments(assignments);
    }
    return assignments;
  }, [assignments, isRotationEnabled, activeWeekMode]);

  // Phân tích cụm lây nhiễm bàn học
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

  // Ma trận tra cứu vị trí nhanh
  const assignmentGrid = useMemo(() => {
    const map = new Map<string, SeatAssignmentWithStudent>();
    displayedAssignments.forEach((a) => {
      map.set(`${a.rowIndex}_${a.colIndex}`, a);
    });
    return map;
  }, [displayedAssignments]);

  // Cụm lây nhiễm bàn học
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

  // Logic Hoán Đổi & Di Chuyển Chỗ Ngồi
  const executeSwapOrMove = async (
    source: SourceSeatInfo,
    targetRow: number,
    targetCol: number,
    targetAssignment?: SeatAssignmentWithStudent
  ) => {
    if (source.rowIndex === targetRow && source.colIndex === targetCol) return;
    if (!layout) return;

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

    if (targetName) {
      setToastMessage(`🔄 Đã đổi chỗ giữa em ${sourceName} và em ${targetName}!`);
    } else {
      setToastMessage(`➡️ Đã chuyển em ${sourceName} sang Bàn ${targetRow + 1}!`);
    }
    setTimeout(() => setToastMessage(null), 3500);

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

  // Handlers tương tác Chạm & Kéo Thả
  const handleSeatClick = (r: number, c: number, assignment?: SeatAssignmentWithStudent) => {
    if (isRotationEnabled && activeWeekMode === 'even') {
      setToastMessage('💡 Thầy đang xem trước Tuần Chẵn. Bấm "Lưu Sơ Đồ Này Lên Supabase" nếu muốn chỉnh sửa từng vị trí!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    if (!selectedSourceSeat) {
      if (assignment?.student) {
        setSelectedSourceSeat({ assignment, rowIndex: r, colIndex: c });
      }
      return;
    }

    if (selectedSourceSeat.rowIndex === r && selectedSourceSeat.colIndex === c) {
      setSelectedSourceSeat(null);
      return;
    }

    const source = selectedSourceSeat;
    setSelectedSourceSeat(null);
    executeSwapOrMove(source, r, c, assignment);
  };

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
      setActiveWeekMode('odd');
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

  // 4 Dãy bàn
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

  return {
    schoolYearStartDate,
    isStartDateModalOpen,
    setIsStartDateModalOpen,
    schoolWeekInfo,
    layout,
    assignments,
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
    displayedAssignments,
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
  };
};
