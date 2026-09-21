import { useState, useEffect, useCallback, useMemo } from 'react';
import { seatingService } from '../services/seatingService';
import { seatingPresetService } from '../services/seatingPresetService';
import { studentService } from '../../students/services/studentService';
import { attendanceService } from '../../attendance/services/attendanceService';
import type {
  SeatLayout,
  SeatAssignmentWithStudent,
  SeatingMedicalAnalysis,
  SeatingPreset,
  ClassroomElementsConfig,
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

  // Lịch sử phục vụ tính năng Hoàn tác (Undo)
  const [undoSnapshot, setUndoSnapshot] = useState<SeatAssignmentWithStudent[] | null>(null);
  const [undoActionDescription, setUndoActionDescription] = useState<string | null>(null);

  // Quản lý học sinh toàn lớp & Hàng ghế chờ (Waiting Bench)
  const [allClassStudents, setAllClassStudents] = useState<Student[]>([]);
  const [selectedBenchStudent, setSelectedBenchStudent] = useState<Student | null>(null);
  const [draggedBenchStudent, setDraggedBenchStudent] = useState<Student | null>(null);

  // Quản lý Bản mẫu sơ đồ (Presets)
  const [presets, setPresets] = useState<SeatingPreset[]>(() =>
    seatingPresetService.getPresets(classId)
  );
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isLayoutConfigModalOpen, setIsLayoutConfigModalOpen] = useState(false);

  // 1. Tải sơ đồ chỗ ngồi & dữ liệu y tế dịch bệnh
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentLayout = await seatingService.getOrCreateClassLayout(classId);
      setLayout(currentLayout);

      const isClassCleared = localStorage.getItem(`gvcn_class_cleared_${classId}`) === 'true';
      const students = await studentService.getStudents(classId);
      setAllClassStudents(students);
      setPresets(seatingPresetService.getPresets(classId));
      seatingPresetService.fetchPresets(classId).then((cloudPresets) => {
        setPresets(cloudPresets);
      }).catch((err) => {
        console.warn('Lỗi đồng bộ bản mẫu sơ đồ từ Supabase Cloud:', err);
      });

      // Nếu lớp đã xóa sạch hoặc không còn học sinh nào -> Tự động làm mới lưới sơ đồ bàn học trống
      if (isClassCleared || students.length === 0) {
        setAllClassStudents([]);
        setAssignments([]);
        localStorage.removeItem(`seating_assignments_${classId}`);
        const cloudConfig = await seatingService.getClassSeatingConfig(classId);
        setIsRotationEnabled(cloudConfig.rotationEnabled);
        setSchoolYearStartDate(cloudConfig.schoolYearStartDate);
        setEpidemicAlert(null);
        return;
      }

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

      // Lọc sạch những phân công mà học sinh không còn tồn tại trong danh sách lớp thực tế
      const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));
      assigns = (assigns || [])
        .filter((a) => studentMap.has(a.studentId))
        .map((a) => ({
          ...a,
          student: studentMap.get(a.studentId) || a.student,
        }));

      const hasAnyStudent = assigns.some((a) => !!a.student);
      if (assigns.length === 0 || !hasAnyStudent) {
        assigns = await seatingService.seedDefaultAssignments(currentLayout.id, students);
      }

      setAssignments(assigns);
      if (assigns.length > 0) {
        localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(assigns));
      } else {
        localStorage.removeItem(`seating_assignments_${classId}`);
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

  // Tự động lắng nghe tín hiệu đặt lại sơ đồ chỗ ngồi khi danh sách học sinh bị xóa sạch
  useEffect(() => {
    const handleSeatingReset = (e: Event) => {
      const customEvt = e as CustomEvent<{ classId?: string }>;
      if (!customEvt.detail?.classId || customEvt.detail.classId === classId) {
        setAssignments([]);
        localStorage.removeItem(`seating_assignments_${classId}`);
      }
    };
    window.addEventListener('gvcn:seating-reset', handleSeatingReset);
    return () => {
      window.removeEventListener('gvcn:seating-reset', handleSeatingReset);
    };
  }, [classId]);

  // Danh sách phân công hiển thị (Xoay nếu chọn Tuần Chẵn và mở tính năng)
  const displayedAssignments = useMemo(() => {
    if (isRotationEnabled && activeWeekMode === 'even') {
      return seatingService.rotateAssignments(assignments, layout?.cols || 8);
    }
    return assignments;
  }, [assignments, isRotationEnabled, activeWeekMode, layout?.cols]);

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

    // Lưu snapshot hoàn tác trước khi đổi chỗ
    setUndoSnapshot([...assignments]);
    setUndoActionDescription(
      targetName
        ? `đổi chỗ em ${sourceName} ↔ ${targetName}`
        : `chuyển em ${sourceName} sang Bàn ${targetRow + 1}`
    );

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

  // Danh sách học sinh chưa có chỗ ngồi (Đang đứng ở hàng ghế chờ)
  const unassignedStudents = useMemo(() => {
    const seatedStudentIds = new Set(assignments.map((a) => a.studentId));
    return allClassStudents.filter((s) => !seatedStudentIds.has(s.id));
  }, [allClassStudents, assignments]);

  // Số lượng ghế trống còn lại trên sơ đồ
  const emptySeatCount = useMemo(() => {
    const totalDesks = (layout?.rows || 6) * (layout?.cols || 8);
    return Math.max(0, totalDesks - assignments.length);
  }, [layout?.rows, layout?.cols, assignments.length]);

  // Xếp một học sinh từ hàng ghế chờ vào một ô bàn
  const handleAssignBenchStudent = async (student: Student, targetRow: number, targetCol: number) => {
    if (!layout) return;

    // Lưu snapshot hoàn tác
    setUndoSnapshot([...assignments]);
    setUndoActionDescription(`xếp em ${student.fullName} vào Bàn ${targetRow + 1}`);

    const existingAtTarget = assignments.find(
      (a) => a.rowIndex === targetRow && a.colIndex === targetCol
    );

    const newAssignment: SeatAssignmentWithStudent = {
      id: existingAtTarget ? existingAtTarget.id : `asg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      layoutId: layout.id,
      studentId: student.id,
      rowIndex: targetRow,
      colIndex: targetCol,
      isHidden: false,
      student,
      createdAt: new Date().toISOString(),
    };

    // Loại bỏ vị trí cũ nếu trùng tọa độ
    const filtered = assignments.filter(
      (a) => !(a.rowIndex === targetRow && a.colIndex === targetCol)
    );
    const nextAssignments = [...filtered, newAssignment];

    setAssignments(nextAssignments);
    localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(nextAssignments));
    setSelectedBenchStudent(null);
    setDraggedBenchStudent(null);

    setToastMessage(`✅ Đã xếp em ${student.fullName} vào Bàn ${targetRow + 1} (Cột ${targetCol + 1})!`);
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await seatingService.saveAllAssignments(layout.id, nextAssignments);
    } catch (err) {
      console.warn('Lỗi lưu xếp chỗ từ hàng ghế chờ:', err);
    }
  };

  // Gỡ một học sinh khỏi bàn học đưa về hàng ghế chờ
  const handleVacateSeat = async (assignment: SeatAssignmentWithStudent) => {
    if (!layout) return;
    const studentName = assignment.student?.fullName || 'Học sinh';

    setUndoSnapshot([...assignments]);
    setUndoActionDescription(`gỡ em ${studentName} về ghế chờ`);

    const nextAssignments = assignments.filter((a) => a.id !== assignment.id);
    setAssignments(nextAssignments);
    localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(nextAssignments));
    setToastMessage(`↩️ Đã chuyển em ${studentName} về danh sách chờ xếp chỗ!`);
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await seatingService.saveAllAssignments(layout.id, nextAssignments);
    } catch (err) {
      console.warn('Lỗi lưu gỡ chỗ ngồi:', err);
    }
  };

  // Điền nhanh toàn bộ học sinh còn lại vào các ghế trống
  const handleAutoSeatRemaining = async () => {
    if (!layout || unassignedStudents.length === 0) return;

    const occupiedKeys = new Set(assignments.map((a) => `${a.rowIndex}_${a.colIndex}`));
    const emptySpots: Array<{ r: number; c: number }> = [];

    const maxR = layout.rows || 6;
    const maxC = layout.cols || 8;
    for (let r = 0; r < maxR; r++) {
      for (let c = 0; c < maxC; c++) {
        if (!occupiedKeys.has(`${r}_${c}`)) {
          emptySpots.push({ r, c });
        }
      }
    }

    if (emptySpots.length === 0) {
      setToastMessage('⚠️ Lớp học đã kín chỗ, không còn ô bàn trống nào!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setUndoSnapshot([...assignments]);
    setUndoActionDescription('điền nhanh vào ghế trống');

    const toSeatCount = Math.min(unassignedStudents.length, emptySpots.length);
    const newAssignedList: SeatAssignmentWithStudent[] = [];

    for (let i = 0; i < toSeatCount; i++) {
      const student = unassignedStudents[i];
      const spot = emptySpots[i];
      newAssignedList.push({
        id: `asg-fill-${Date.now()}-${i}-${student.id}`,
        layoutId: layout.id,
        studentId: student.id,
        rowIndex: spot.r,
        colIndex: spot.c,
        isHidden: false,
        student,
        createdAt: new Date().toISOString(),
      });
    }

    const nextAssignments = [...assignments, ...newAssignedList];
    setAssignments(nextAssignments);
    localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(nextAssignments));
    setToastMessage(`⚡ Đã tự động xếp ${toSeatCount} học sinh vào các ô bàn trống!`);
    setTimeout(() => setToastMessage(null), 4000);

    try {
      await seatingService.saveAllAssignments(layout.id, nextAssignments);
    } catch (err) {
      console.warn('Lỗi lưu điền nhanh chỗ ngồi:', err);
    }
  };

  const handleDropOnBench = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedSeat) {
      handleVacateSeat(draggedSeat.assignment);
      setDraggedSeat(null);
    }
  };

  // Quản lý bản mẫu sơ đồ (Presets)
  const handleSaveCurrentAsPreset = async (
    name: string,
    description: string,
    elementsConfig?: Partial<ClassroomElementsConfig>
  ) => {
    try {
      const newPreset = await seatingPresetService.savePreset(
        classId,
        name,
        description,
        assignments,
        elementsConfig
      );
      setPresets((prev) => [newPreset, ...prev.filter((p) => p.id !== newPreset.id)]);
      const dimsBadge = newPreset.elementsConfig ? ' (kèm kích thước bàn & cửa)' : '';
      setToastMessage(`☁️ Đã lưu bản mẫu "${newPreset.name}"${dimsBadge} lên Supabase Cloud thành công!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Lỗi khi lưu bản mẫu sơ đồ:', err);
      setToastMessage('❌ Lỗi khi lưu bản mẫu sơ đồ. Vui lòng thử lại!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleApplyPreset = async (preset: SeatingPreset) => {
    if (!layout) return;
    setIsLoading(true);

    // Lưu snapshot hoàn tác trước khi áp dụng bản mẫu
    setUndoSnapshot([...assignments]);
    setUndoActionDescription(`áp dụng bản mẫu "${preset.name}"`);

    try {
      const newAssignments = seatingPresetService.convertPresetToAssignments(
        preset,
        allClassStudents,
        layout.id
      );

      setAssignments(newAssignments);
      localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(newAssignments));
      await seatingService.saveAllAssignments(layout.id, newAssignments);

      setActiveWeekMode('odd');
      setToastMessage(`✅ Đã áp dụng bản mẫu "${preset.name}" (${newAssignments.length} chỗ)! Thầy có thể Hoàn tác nếu đổi ý.`);
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      console.error('Lỗi khi áp dụng bản mẫu:', err);
      setToastMessage('❌ Không thể áp dụng bản mẫu. Vui lòng thử lại!');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await seatingPresetService.deletePreset(classId, presetId);
      setPresets((prev) => prev.filter((p) => p.id !== presetId));
      setToastMessage('🗑️ Đã xóa bản mẫu sơ đồ khỏi Cloud.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi xóa bản mẫu sơ đồ:', err);
      setToastMessage('❌ Lỗi khi xóa bản mẫu sơ đồ!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleUpdatePreset = async (presetId: string, name: string, description: string) => {
    try {
      const updated = await seatingPresetService.updatePreset(classId, presetId, name, description);
      if (updated) {
        setPresets((prev) => prev.map((p) => (p.id === presetId ? updated : p)));
        setToastMessage(`✏️ Đã cập nhật bản mẫu "${updated.name}"!`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật bản mẫu:', err);
      setToastMessage('❌ Không thể cập nhật bản mẫu. Vui lòng thử lại!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Handlers tương tác Chạm & Kéo Thả
  const handleSeatClick = (r: number, c: number, assignment?: SeatAssignmentWithStudent) => {
    if (isRotationEnabled && activeWeekMode === 'even') {
      setToastMessage('💡 Thầy đang xem trước Tuần Chẵn. Bấm "Lưu Sơ Đồ Này Lên Supabase" nếu muốn chỉnh sửa từng vị trí!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    // Nếu đang chọn học sinh từ Hàng ghế chờ -> Xếp em này vào ô bàn vừa chạm
    if (selectedBenchStudent) {
      const studentToSeat = selectedBenchStudent;
      setSelectedBenchStudent(null);
      handleAssignBenchStudent(studentToSeat, r, c);
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

    // Kéo từ Hàng ghế chờ thả vào ô bàn
    if (draggedBenchStudent) {
      const student = draggedBenchStudent;
      setDraggedBenchStudent(null);
      handleAssignBenchStudent(student, targetRow, targetCol);
      return;
    }

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
    const students = await studentService.getStudents(classId);

    const confirmMsg =
      students.length === 0
        ? 'Lớp hiện chưa có học sinh. Thầy có chắc chắn muốn làm mới toàn bộ lưới sơ đồ bàn học trống?'
        : `Thầy có chắc chắn muốn sắp xếp lại chỗ ngồi ${students.length} học sinh theo 4 Tổ?`;
    const confirm = window.confirm(confirmMsg);
    if (!confirm) return;

    setIsLoading(true);
    try {
      if (students.length === 0) {
        if (assignments.length > 0) {
          setUndoSnapshot([...assignments]);
          setUndoActionDescription('làm trống sơ đồ');
        }
        await seatingService.clearClassAssignments(classId, layout.id);
        setAssignments([]);
        setActiveWeekMode('odd');
        setToastMessage('✅ Đã làm mới lưới sơ đồ bàn học trống!');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      // Lưu snapshot hoàn tác trước khi sắp xếp lại
      if (assignments.length > 0) {
        setUndoSnapshot([...assignments]);
        setUndoActionDescription('sắp xếp lại 4 Tổ');
      }

      const newAssigns = await seatingService.seedDefaultAssignments(layout.id, students);
      setAssignments(newAssigns);
      setActiveWeekMode('odd');
      setToastMessage(`✅ Đã sắp xếp lại ${students.length} học sinh theo 4 Tổ chuẩn! Thầy có thể bấm Hoàn tác nếu muốn.`);
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      console.error('Lỗi sắp xếp lại chỗ ngồi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Làm trống toàn bộ sơ đồ chỗ ngồi (vacate all desks)
  const handleClearLayout = async () => {
    if (!layout) return;
    if (assignments.length === 0) {
      setToastMessage('ℹ️ Sơ đồ bàn học hiện đã ở trạng thái trống!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const confirm = window.confirm(
      'Thầy có chắc chắn muốn làm trống toàn bộ sơ đồ chỗ ngồi? Tất cả các bàn sẽ trở thành ghế trống (danh sách học sinh vẫn được bảo toàn nguyên vẹn).'
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      // Lưu snapshot hoàn tác trước khi làm trống
      setUndoSnapshot([...assignments]);
      setUndoActionDescription('làm trống sơ đồ');

      await seatingService.clearClassAssignments(classId, layout.id);
      setAssignments([]);
      setActiveWeekMode('odd');
      setToastMessage('🧹 Đã làm trống sơ đồ lớp! Thầy có thể bấm "Hoàn tác" nếu đổi ý.');
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      console.error('Lỗi khi làm trống sơ đồ:', err);
      setToastMessage('❌ Không thể làm trống sơ đồ. Vui lòng thử lại!');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  // Hoàn tác hành động gần nhất (Undo)
  const handleUndo = async () => {
    if (!undoSnapshot || !layout) return;

    setIsLoading(true);
    const snapshotToRestore = undoSnapshot;
    const desc = undoActionDescription || 'thao tác vừa thực hiện';

    try {
      setAssignments(snapshotToRestore);
      localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(snapshotToRestore));
      await seatingService.saveAllAssignments(layout.id, snapshotToRestore);

      setUndoSnapshot(null);
      setUndoActionDescription(null);
      setToastMessage(`✅ Đã hoàn tác thành công (${desc})!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Lỗi khi hoàn tác sơ đồ:', err);
      setToastMessage('❌ Không thể hoàn tác sơ đồ. Vui lòng thử lại!');
      setTimeout(() => setToastMessage(null), 4000);
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

  // Cập nhật kích thước phòng học (Số hàng & Số cột)
  const handleUpdateLayoutDimensions = async (newRows: number, newCols: number) => {
    if (!layout) return;
    setIsLoading(true);
    try {
      const updated = await seatingService.updateClassLayout(
        layout.id,
        classId,
        newRows,
        newCols
      );
      setLayout(updated);

      // Lưu snapshot hoàn tác
      setUndoSnapshot([...assignments]);
      setUndoActionDescription(
        `cấu hình phòng học ${newCols / 2} Dãy • ${newRows} Bàn`
      );

      // Lọc sạch những phân công nằm ngoài phạm vi mới (r >= newRows || c >= newCols)
      // Những học sinh bị loại sẽ tự động chuyển về unassignedStudents (Khay Ghế Chờ)
      const validAssigns = assignments.filter(
        (a) => a.rowIndex < newRows && a.colIndex < newCols
      );
      setAssignments(validAssigns);
      localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(validAssigns));

      await seatingService.saveAllAssignments(updated.id, validAssigns);

      setToastMessage(
        `✅ Đã lưu cấu hình phòng học: ${newCols / 2} Dãy • ${newRows} Bàn (${newCols * newRows} chỗ ngồi)!`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Lỗi khi cập nhật kích thước phòng học:', err);
      setToastMessage('❌ Không thể cập nhật phòng học. Vui lòng thử lại!');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  // Dãy bàn học (Linh hoạt 3 dãy hoặc 4 dãy)
  const totalCols = layout?.cols || 8;
  const aislesCount = totalCols === 6 ? 3 : 4;

  const aisles = useMemo(() => {
    if (aislesCount === 3) {
      if (isRotationEnabled && activeWeekMode === 'even') {
        return [
          { name: 'TỔ 3', pairIndex: 0, cols: [0, 1], subTitle: '(Cửa sổ)' },
          { name: 'TỔ 1', pairIndex: 1, cols: [2, 3], subTitle: '(Giữa)' },
          { name: 'TỔ 2', pairIndex: 2, cols: [4, 5], subTitle: '(Hành lang)' },
        ];
      }
      return [
        { name: 'TỔ 1', pairIndex: 0, cols: [0, 1], subTitle: '(Cửa sổ)' },
        { name: 'TỔ 2', pairIndex: 1, cols: [2, 3], subTitle: '(Giữa)' },
        { name: 'TỔ 3', pairIndex: 2, cols: [4, 5], subTitle: '(Hành lang)' },
      ];
    }

    // Mặc định 4 Dãy (8 Cột)
    if (isRotationEnabled && activeWeekMode === 'even') {
      return [
        { name: 'TỔ 3', pairIndex: 0, cols: [0, 1], subTitle: '(Cửa sổ)' },
        { name: 'TỔ 4', pairIndex: 1, cols: [2, 3], subTitle: '(Giữa trái)' },
        { name: 'TỔ 1', pairIndex: 2, cols: [4, 5], subTitle: '(Giữa phải)' },
        { name: 'TỔ 2', pairIndex: 3, cols: [6, 7], subTitle: '(Hành lang)' },
      ];
    }
    return [
      { name: 'TỔ 4', pairIndex: 0, cols: [0, 1], subTitle: '(Cửa sổ)' },
      { name: 'TỔ 3', pairIndex: 1, cols: [2, 3], subTitle: '(Giữa trái)' },
      { name: 'TỔ 2', pairIndex: 2, cols: [4, 5], subTitle: '(Giữa phải)' },
      { name: 'TỔ 1', pairIndex: 3, cols: [6, 7], subTitle: '(Hành lang)' },
    ];
  }, [aislesCount, isRotationEnabled, activeWeekMode]);

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
    setToastMessage,
    displayedAssignments,
    medicalAnalysis,
    sickReasonMap,
    assignmentGrid,
    clusterDeskKeys,
    aisles,
    totalRows,
    totalCols,
    allClassStudents,
    handleSeatClick,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleToggleRotation,
    handleSaveStartDate,
    handleResetLayout,
    handleClearLayout,
    handleSaveCurrentWeekAsBase,
    canUndo: !!undoSnapshot,
    undoActionDescription,
    handleUndo,
    // Hàng ghế chờ (Waiting Bench)
    unassignedStudents,
    emptySeatCount,
    selectedBenchStudent,
    setSelectedBenchStudent,
    draggedBenchStudent,
    setDraggedBenchStudent,
    handleAssignBenchStudent,
    handleVacateSeat,
    handleAutoSeatRemaining,
    handleDropOnBench,
    // Bản mẫu sơ đồ (Presets)
    presets,
    isPresetsModalOpen,
    setIsPresetsModalOpen,
    handleSaveCurrentAsPreset,
    handleApplyPreset,
    handleDeletePreset,
    handleUpdatePreset,
    // Cấu hình không gian phòng học
    isLayoutConfigModalOpen,
    setIsLayoutConfigModalOpen,
    handleUpdateLayoutDimensions,
  };
};
