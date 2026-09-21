import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { WaitingBenchDrawer } from '../components/WaitingBenchDrawer';
import { SeatingPresetsModal } from '../components/SeatingPresetsModal';
import { RoomLayoutConfigModal } from '../components/RoomLayoutConfigModal';
import { PresentationHud } from '../components/PresentationHud';
import { ClassroomTimerWidget } from '../components/ClassroomTimerWidget';
import { RandomStudentModal, type WinnerStudentInfo } from '../components/RandomStudentModal';
import { TeamBattleModal } from '../components/TeamBattleModal';
import type { BattleMatch } from '../types/battleTypes';
import { PresentationSidePanel, type SpinHistoryItem } from '../components/PresentationSidePanel';
import { CalledStudentsDrawer } from '../components/CalledStudentsDrawer';
import { pointsService } from '../../points/services/pointsService';
import { playTickSound, playWinnerFanfare, playPointsChime } from '../../../utils/soundNotification';
import { useClassroomElementsConfig } from '../hooks/useClassroomElementsConfig';
import { useSeatingPrintConfig } from '../hooks/useSeatingPrintConfig';
import { SeatingPrintModal } from '../components/SeatingPrintModal';
import { pdfExportService } from '../../reports/services/pdfExportService';
import { seatingRemoteService, type RemoteSessionInfo } from '../services/seatingRemoteService';
import { RemotePairingModal } from '../components/RemotePairingModal';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const SeatingPage: React.FC = () => {
  const { currentClass, user } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  // Quản lý Modal & Tùy biến tiêu đề hành chính cho bản in / xuất PDF
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Cấu hình linh động Bàn Giáo Viên & Cửa Ra Vào xoay 360 độ
  const { config: elementsConfig, updateConfig: updateElementsConfig } =
    useClassroomElementsConfig(classId);

  // Quản lý Phiên điều khiển từ xa bằng Điện Thoại (Realtime Remote Deck)
  const remoteSession = useMemo<RemoteSessionInfo>(
    () => seatingRemoteService.getOrCreateSession(classId),
    [classId]
  );
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState<boolean>(false);
  const [isRemoteConnected, setIsRemoteConnected] = useState<boolean>(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('');
  const remoteChannelRef = useRef<RealtimeChannel | null>(null);
  const [remoteToast, setRemoteToast] = useState<string | null>(null);
  const [timerExternalAction, setTimerExternalAction] = useState<{
    action: 'start' | 'pause' | 'reset' | 'set_preset';
    durationSeconds?: number;
    timestamp: number;
  } | null>(null);

  // Chế độ hiển thị: Mặc định là Phòng học 3D sống động
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(() => {
    try {
      return (localStorage.getItem('gvcn_seating_view_mode') as '2d' | '3d') || '3d';
    } catch {
      return '3d';
    }
  });

  const handleToggleViewMode = (mode: '2d' | '3d') => {
    setViewMode(mode);
    try {
      localStorage.setItem('gvcn_seating_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // Hàm lấy khóa lưu trữ Zoom theo độ phân giải màn hình của thiết bị (TV / Máy chiếu)
  const getScreenZoomKey = (isPresentation: boolean) => {
    if (typeof window === 'undefined') return 'gvcn_seating_zoom_level';
    const resolution = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;
    return isPresentation
      ? `gvcn_seating_zoom_presentation_${resolution}`
      : `gvcn_seating_zoom_normal_${resolution}`;
  };

  // Mức thu phóng sơ đồ chỗ ngồi (50% -> 130%) tự động thích ứng với từng màn hình TV/máy chiếu
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined') {
        const screenKey = getScreenZoomKey(false);
        const savedByScreen = localStorage.getItem(screenKey);
        if (savedByScreen) {
          const parsed = parseInt(savedByScreen, 10);
          if (parsed >= 50 && parsed <= 130) return parsed;
        }
      }
      const saved = localStorage.getItem('gvcn_seating_zoom_level');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 50 && parsed <= 130) return parsed;
      }
    } catch {
      // ignore
    }
    return 100;
  });

  const handleZoomChange = (level: number) => {
    const clamped = Math.max(50, Math.min(130, Math.round(level)));
    setZoomLevel(clamped);
    try {
      const currentKey = getScreenZoomKey(isFullscreen);
      localStorage.setItem(currentKey, String(clamped));
      localStorage.setItem('gvcn_seating_zoom_level', String(clamped));
    } catch {
      // ignore
    }
  };

  // Chế độ Cỡ chữ to rõ (tối ưu khi phóng nhỏ / trình chiếu cho học sinh ngồi xa)
  const [isLargeTextMode, setIsLargeTextMode] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('gvcn_seating_large_text');
        if (saved !== null) return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // Mặc định BẬT để đảm bảo các em ngồi xa luôn nhìn thấy rõ
  });

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
    assignments,
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
    handleClearLayout,
    handleSaveCurrentWeekAsBase,
    canUndo,
    undoActionDescription,
    handleUndo,
    // Hàng ghế chờ
    unassignedStudents,
    emptySeatCount,
    selectedBenchStudent,
    setSelectedBenchStudent,
    setDraggedBenchStudent,
    handleDropOnBench,
    handleAutoSeatRemaining,
    // Bản mẫu sơ đồ (Presets)
    presets,
    isPresetsModalOpen,
    setIsPresetsModalOpen,
    handleSaveCurrentAsPreset,
    handleApplyPreset,
    handleDeletePreset,
    handleUpdatePreset,
    // Cấu hình không gian phòng học
    totalCols,
    allClassStudents,
    isLayoutConfigModalOpen,
    setIsLayoutConfigModalOpen,
    handleUpdateLayoutDimensions,
    setToastMessage,
  } = useSeatingManagement(classId);

  // Xử lý Bật/Tắt chế độ Chữ Siêu To kèm thông báo nhanh cho giáo viên
  const handleToggleLargeText = () => {
    setIsLargeTextMode((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('gvcn_seating_large_text', String(next));
        }
      } catch {
        // ignore
      }
      setToastMessage(
        next
          ? '🔤 Đã BẬT Chữ Siêu To (Phóng to họ tên học sinh rõ nét)'
          : '🔤 Đã chuyển về Cỡ Chữ Chuẩn'
      );
      setTimeout(() => setToastMessage(null), 3000);
      return next;
    });
  };

  const totalStudentsCount = allClassStudents.length;
  const femaleStudentsCount = useMemo(
    () => allClassStudents.filter((s) => s.gender === 'Nữ').length,
    [allClassStudents]
  );

  // Tính toán mức thu nhỏ tối ưu "Vừa màn hình" để toàn bộ các hàng bàn học hiển thị trọn vẹn
  const handleFitScreen = () => {
    if (typeof window !== 'undefined') {
      const estimatedHeight = totalRows * 140 + 200;
      const availableHeight = Math.max(400, window.innerHeight - (isFullscreen ? 100 : 220));
      const calculatedZoom = Math.round((availableHeight / estimatedHeight) * 100);
      const optimalZoom = Math.max(55, Math.min(isFullscreen ? 120 : 85, calculatedZoom));
      handleZoomChange(optimalZoom);
    } else {
      handleZoomChange(70);
    }
  };

  // Thẻ tham chiếu container để kích hoạt Fullscreen API thực sự
  const containerRef = useRef<HTMLDivElement>(null);

  // Chế độ Trình Chiếu Toàn Màn Hình cho Tiết Sinh Hoạt Lớp (Presentation Fullscreen)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hỗ trợ lăn chuột kết hợp Ctrl (Ctrl + Mouse Wheel) để thu phóng nhanh sơ đồ
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const step = e.deltaY < 0 ? 4 : -4;
        setZoomLevel((prev) => {
          const next = Math.max(50, Math.min(130, prev + step));
          try {
            const currentKey = getScreenZoomKey(isFullscreen);
            localStorage.setItem(currentKey, String(next));
            localStorage.setItem('gvcn_seating_zoom_level', String(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [isFullscreen]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch((err) => console.error('Lỗi bật Fullscreen:', err));
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      } else if ((el as any).msRequestFullscreen) {
        (el as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.error('Lỗi thoát Fullscreen:', err));
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);

      // Tự động khôi phục mức Zoom đã ghi nhớ tương ứng với chế độ và độ phân giải màn hình
      try {
        const targetKey = getScreenZoomKey(isNowFullscreen);
        const savedZoom = localStorage.getItem(targetKey);
        if (savedZoom) {
          const parsed = parseInt(savedZoom, 10);
          if (parsed >= 50 && parsed <= 130) {
            setZoomLevel(parsed);
            return;
          }
        }
      } catch {
        // ignore
      }

      if (isNowFullscreen) {
        // Tự động thu phóng tối ưu lần đầu nếu màn hình này chưa có mức zoom lưu trước đó
        setTimeout(() => {
          handleFitScreen();
        }, 150);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [totalRows]);

  // Chế độ Chia Đôi Màn Hình (Split Presentation Mode): Sơ đồ lớp + Bảng tiện ích
  const [isSplitMode, setIsSplitMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('web_gvcn_seating_split_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSplitMode = () => {
    setIsSplitMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('web_gvcn_seating_split_mode', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Bốc thăm ngẫu nhiên học sinh (Random Student Picker)
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedSeatKey, setHighlightedSeatKey] = useState<string | null>(null);
  const [winnerSeatKey, setWinnerSeatKey] = useState<string | null>(null);
  const [winnerStudent, setWinnerStudent] = useState<WinnerStudentInfo | null>(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);

  // Chế độ bốc thăm: Cá nhân ('single') | Đôi bạn cùng bàn ('pair') | Nhóm 4 bạn ghép bàn ('group4') | Đối kháng 2 dãy ('battle')
  const [pickMode, setPickMode] = useState<'single' | 'pair' | 'group4' | 'battle'>('single');
  const [currentBattle, setCurrentBattle] = useState<BattleMatch | null>(null);
  const [isBattleModalOpen, setIsBattleModalOpen] = useState(false);

  // Tùy chọn tự động reset lịch sử đã bốc khi chuyển đổi qua lại giữa các chế độ
  const [autoResetOnModeChange, setAutoResetOnModeChange] = useState<boolean>(() => {
    try {
      return localStorage.getItem('web_gvcn_auto_reset_on_mode_change') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleAutoResetOnModeChange = () => {
    setAutoResetOnModeChange((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('web_gvcn_auto_reset_on_mode_change', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handlePickModeChange = (newMode: 'single' | 'pair' | 'group4' | 'battle') => {
    setPickMode(newMode);
    if (autoResetOnModeChange) {
      setSpinHistory([]);
    }
  };

  // Bộ lọc bốc thăm: Theo Tổ, Giới tính và Loại trừ học sinh đã phát biểu
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [excludeCalled, setExcludeCalled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('web_gvcn_exclude_called') === 'true';
    } catch {
      return false;
    }
  });

  // Tự động lưu cài đặt loại trừ học sinh đã gọi vào LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('web_gvcn_exclude_called', String(excludeCalled));
    } catch {
      // ignore
    }
  }, [excludeCalled]);

  // Lịch sử bốc thăm học sinh trong buổi học (Spin History)
  const [spinHistory, setSpinHistory] = useState<SpinHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`web_gvcn_spin_history_${classId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Xóa lịch sử học sinh đã gọi để bốc thăm lại từ đầu
  const handleClearSpinHistory = () => {
    if (spinHistory.length === 0) return;
    if (window.confirm('Thầy có muốn làm mới danh sách học sinh đã gọi để bốc thăm lại từ đầu không?')) {
      setSpinHistory([]);
    }
  };

  // Trạng thái mở/đóng Bảng trượt danh sách học sinh đã bốc thăm
  const [isCalledDrawerOpen, setIsCalledDrawerOpen] = useState(false);

  // Gỡ riêng lẻ 1 học sinh khỏi danh sách đã gọi để có thể được bốc lại
  const handleRemoveFromSpinHistory = (historyId: string) => {
    setSpinHistory((prev) => prev.filter((item) => item.id !== historyId));
  };

  // Thưởng / Trừ điểm nhanh trực tiếp cho học sinh từ Bảng trượt danh sách đã gọi
  const handleAwardCalledStudentPoints = async (
    studentId: string,
    studentName: string,
    points: number,
    reason: string
  ) => {
    try {
      await pointsService.createTransaction({
        classId,
        targetType: 'student',
        studentId,
        points,
        stars: points > 0 ? Math.max(1, Math.floor(points / 2)) : 0,
        reason,
        note: `Cộng/trừ từ Bảng danh sách bốc thăm (${studentName})`,
      });

      if (points > 0) {
        playPointsChime();
      }

      // Cập nhật điểm đã cộng vào item trong lịch sử bốc thăm
      setSpinHistory((prev) =>
        prev.map((item) =>
          item.studentId === studentId
            ? { ...item, awardedPoints: (item.awardedPoints || 0) + points }
            : item
        )
      );

      const sign = points > 0 ? `+${points}` : `${points}`;
      setRemoteToast(`⭐ Đã ${points > 0 ? 'cộng' : 'trừ'} ${sign} điểm cho ${studentName}! (${reason})`);
      setTimeout(() => setRemoteToast(null), 3000);
    } catch (err) {
      console.error('Lỗi khi cập nhật điểm cho học sinh từ Bảng bốc thăm:', err);
    }
  };

  // Đưa camera quay lại bao quát toàn cảnh phòng học
  const handleResetView = () => {
    const boardEl = document.getElementById('classroom-3d-board');
    if (boardEl && typeof boardEl.scrollIntoView === 'function') {
      boardEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      return;
    }
    const zoomContainer = document.querySelector('.seating-zoom-container') || document.querySelector('.overflow-y-auto');
    if (zoomContainer) {
      zoomContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tự động lưu lịch sử bốc thăm vào LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`web_gvcn_spin_history_${classId}`, JSON.stringify(spinHistory));
    } catch {
      // ignore
    }
  }, [spinHistory, classId]);

  // Danh sách các tổ học tập trong lớp
  const groupsList = useMemo(() => {
    const set = new Set<string>();
    allClassStudents.forEach((s) => {
      if (s.groupName) set.add(s.groupName);
    });
    const list = Array.from(set).sort();
    return list.length > 0 ? list : ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'];
  }, [allClassStudents]);

  // Danh sách tất cả chỗ ngồi đang có học sinh trên sơ đồ
  const occupiedSeats = useMemo(() => {
    const seats: Array<{
      key: string;
      student: any;
      aisleName: string;
      deskNumber: number;
    }> = [];

    aisles.forEach((aisle) => {
      for (let r = 0; r < totalRows; r++) {
        [aisle.cols[0], aisle.cols[1]].forEach((c) => {
          const assign = assignmentGrid.get(`${r}_${c}`);
          if (assign?.student) {
            seats.push({
              key: `${r}_${c}`,
              student: assign.student,
              aisleName: aisle.name,
              deskNumber: r + 1,
            });
          }
        });
      }
    });
    return seats;
  }, [aisles, totalRows, assignmentGrid]);

  // Danh sách các cặp đôi cùng bàn (bàn có đủ 2 học sinh ngồi cạnh nhau)
  const occupiedPairs = useMemo(() => {
    const pairs: Array<{
      deskKey: string;
      aisleName: string;
      deskNumber: number;
      leftSeatKey: string;
      rightSeatKey: string;
      leftStudent: any;
      rightStudent: any;
    }> = [];

    aisles.forEach((aisle) => {
      for (let r = 0; r < totalRows; r++) {
        const leftKey = `${r}_${aisle.cols[0]}`;
        const rightKey = `${r}_${aisle.cols[1]}`;
        const leftAssign = assignmentGrid.get(leftKey);
        const rightAssign = assignmentGrid.get(rightKey);

        if (leftAssign?.student && rightAssign?.student) {
          pairs.push({
            deskKey: `${leftKey}_${rightKey}`,
            aisleName: aisle.name,
            deskNumber: r + 1,
            leftSeatKey: leftKey,
            rightSeatKey: rightKey,
            leftStudent: leftAssign.student,
            rightStudent: rightAssign.student,
          });
        }
      }
    });
    return pairs;
  }, [aisles, totalRows, assignmentGrid]);

  // Danh sách các nhóm 4 học sinh (ghép 2 bàn trên - dưới liền kề trong cùng dãy)
  const occupiedGroups = useMemo(() => {
    const groups: Array<{
      id: string;
      aisleName: string;
      deskStart: number;
      deskEnd: number;
      seatKeys: string[];
      students: any[];
      label: string;
    }> = [];

    aisles.forEach((aisle) => {
      for (let r = 0; r < totalRows; r += 2) {
        if (r + 1 < totalRows) {
          const k1 = `${r}_${aisle.cols[0]}`;
          const k2 = `${r}_${aisle.cols[1]}`;
          const k3 = `${r + 1}_${aisle.cols[0]}`;
          const k4 = `${r + 1}_${aisle.cols[1]}`;
          const seatKeys = [k1, k2, k3, k4];
          const students = seatKeys
            .map((k) => assignmentGrid.get(k)?.student)
            .filter(Boolean);

          // Nhóm có ít nhất 2 học sinh ngồi
          if (students.length >= 2) {
            groups.push({
              id: `grp_${aisle.name}_${r + 1}_${r + 2}`,
              aisleName: aisle.name,
              deskStart: r + 1,
              deskEnd: r + 2,
              seatKeys,
              students,
              label: `DÃY ${aisle.name} • BÀN ${r + 1} & ${r + 2}`,
            });
          }
        }
      }
    });
    return groups;
  }, [aisles, totalRows, assignmentGrid]);

  // Danh sách học sinh đã được bốc thăm trong buổi học
  const calledStudentIds = useMemo(
    () => new Set(spinHistory.map((item) => item.studentId)),
    [spinHistory]
  );

  // Danh sách học sinh đơn đủ điều kiện bốc thăm theo bộ lọc
  const eligibleSeats = useMemo(() => {
    return occupiedSeats.filter((seat) => {
      if (filterGroup !== 'all' && seat.student.groupName !== filterGroup) return false;
      if (filterGender !== 'all' && seat.student.gender !== filterGender) return false;
      if (excludeCalled && calledStudentIds.has(seat.student.id)) return false;
      return true;
    });
  }, [occupiedSeats, filterGroup, filterGender, excludeCalled, calledStudentIds]);

  // Danh sách các cặp bàn đủ điều kiện bốc thăm đôi bạn
  const eligiblePairs = useMemo(() => {
    return occupiedPairs.filter((pair) => {
      if (filterGroup !== 'all') {
        const leftMatch = pair.leftStudent.groupName === filterGroup;
        const rightMatch = pair.rightStudent.groupName === filterGroup;
        if (!leftMatch && !rightMatch) return false;
      }
      if (filterGender !== 'all') {
        const leftMatch = pair.leftStudent.gender === filterGender;
        const rightMatch = pair.rightStudent.gender === filterGender;
        if (!leftMatch && !rightMatch) return false;
      }
      // Nếu loại trừ đã phát biểu: chỉ loại trừ nếu CẢ HAI bạn đều đã được gọi
      if (excludeCalled) {
        if (calledStudentIds.has(pair.leftStudent.id) && calledStudentIds.has(pair.rightStudent.id)) {
          return false;
        }
      }
      return true;
    });
  }, [occupiedPairs, filterGroup, filterGender, excludeCalled, calledStudentIds]);

  // Danh sách các nhóm 4 bạn đủ điều kiện bốc thăm
  const eligibleGroups = useMemo(() => {
    return occupiedGroups.filter((grp) => {
      if (filterGroup !== 'all') {
        const hasMemberInGroup = grp.students.some((s) => s.groupName === filterGroup);
        if (!hasMemberInGroup) return false;
      }
      if (filterGender !== 'all') {
        const hasMemberGender = grp.students.some((s) => s.gender === filterGender);
        if (!hasMemberGender) return false;
      }
      if (excludeCalled) {
        // Loại trừ nếu TẤT CẢ các thành viên trong nhóm đều đã được gọi
        const allCalled = grp.students.every((s) => calledStudentIds.has(s.id));
        if (allCalled) return false;
      }
      return true;
    });
  }, [occupiedGroups, filterGroup, filterGender, excludeCalled, calledStudentIds]);

  // Danh sách các cặp đấu đối kháng giữa 2 dãy khác nhau (Team Battle)
  const occupiedBattles = useMemo(() => {
    const battles: BattleMatch[] = [];
    const pairsByAisle = new Map<string, typeof occupiedPairs>();
    occupiedPairs.forEach((p) => {
      const list = pairsByAisle.get(p.aisleName) || [];
      list.push(p);
      pairsByAisle.set(p.aisleName, list);
    });

    const aisleNames = Array.from(pairsByAisle.keys());
    for (let i = 0; i < aisleNames.length; i++) {
      for (let j = i + 1; j < aisleNames.length; j++) {
        const aisleA = aisleNames[i];
        const aisleB = aisleNames[j];
        const pairsA = pairsByAisle.get(aisleA) || [];
        const pairsB = pairsByAisle.get(aisleB) || [];

        pairsA.forEach((pA) => {
          pairsB.forEach((pB) => {
            battles.push({
              id: `battle_${pA.deskKey}_vs_${pB.deskKey}`,
              label: `DÃY ${aisleA} (BÀN ${pA.deskNumber}) vs DÃY ${aisleB} (BÀN ${pB.deskNumber})`,
              teamA: {
                name: `ĐỘI DÃY ${aisleA}`,
                aisleName: aisleA,
                deskLabel: `Bàn ${pA.deskNumber}`,
                seatKeys: [pA.leftSeatKey, pA.rightSeatKey],
                students: [pA.leftStudent, pA.rightStudent],
                color: 'sky',
              },
              teamB: {
                name: `ĐỘI DÃY ${aisleB}`,
                aisleName: aisleB,
                deskLabel: `Bàn ${pB.deskNumber}`,
                seatKeys: [pB.leftSeatKey, pB.rightSeatKey],
                students: [pB.leftStudent, pB.rightStudent],
                color: 'amber',
              },
            });
          });
        });
      }
    }
    return battles;
  }, [occupiedPairs]);

  // Danh sách các cặp đối kháng đủ điều kiện bốc thăm theo bộ lọc
  const eligibleBattles = useMemo(() => {
    return occupiedBattles.filter((b) => {
      if (filterGroup !== 'all') {
        const matchA = b.teamA.students.some((s) => s.groupName === filterGroup);
        const matchB = b.teamB.students.some((s) => s.groupName === filterGroup);
        if (!matchA && !matchB) return false;
      }
      if (filterGender !== 'all') {
        const matchA = b.teamA.students.some((s) => s.gender === filterGender);
        const matchB = b.teamB.students.some((s) => s.gender === filterGender);
        if (!matchA && !matchB) return false;
      }
      if (excludeCalled) {
        const allCalledA = b.teamA.students.every((s) => calledStudentIds.has(s.id));
        const allCalledB = b.teamB.students.every((s) => calledStudentIds.has(s.id));
        if (allCalledA && allCalledB) return false;
      }
      return true;
    });
  }, [occupiedBattles, filterGroup, filterGender, excludeCalled, calledStudentIds]);

  // Bộ đếm thời gian Thảo Luận Nhóm (Classroom Timer Widget)
  const [isTimerWidgetOpen, setIsTimerWidgetOpen] = useState(false);

  // Bắt đầu vòng quay bốc thăm ngẫu nhiên học sinh hoặc đôi bạn cùng bàn
  const handleStartRandomPick = (overrideMode?: 'single' | 'pair' | 'group4' | 'battle') => {
    if (isSpinning) return;

    const activePickMode = overrideMode || pickMode;
    if (overrideMode && overrideMode !== pickMode) {
      setPickMode(overrideMode);
    }

    if (remoteChannelRef.current) {
      seatingRemoteService.broadcastSpinStarted(remoteChannelRef.current, activePickMode);
    }

    // 0. Chế độ Đối kháng 2 phe giữa 2 dãy (Team Battle)
    if (activePickMode === 'battle') {
      if (occupiedBattles.length === 0) {
        alert('Chưa có đủ bàn học sinh ở 2 dãy khác nhau để tạo cặp đấu đối kháng!');
        return;
      }

      if (eligibleBattles.length === 0) {
        setToastMessage(
          '⚠️ Không có cặp đấu đối kháng nào phù hợp với bộ lọc hiện tại! Thầy vui lòng chọn lại bộ lọc hoặc bấm "Làm mới vòng" trên Bảng Phụ.'
        );
        return;
      }

      setIsSpinning(true);
      setWinnerSeatKey(null);
      setWinnerStudent(null);
      setCurrentBattle(null);
      setIsWinnerModalOpen(false);
      setIsBattleModalOpen(false);
      // Bộ lọc thông minh: Ưu tiên trận đối kháng có nhiều học sinh chưa gọi nhất
      const battlesWithUncalled = eligibleBattles.map((b) => {
        const uncalledA = b.teamA.students.filter((s) => !calledStudentIds.has(s.id)).length;
        const uncalledB = b.teamB.students.filter((s) => !calledStudentIds.has(s.id)).length;
        return {
          battle: b,
          uncalledCount: uncalledA + uncalledB,
          uncalledA,
          uncalledB,
        };
      });
      const maxUncalledBattle = Math.max(0, ...battlesWithUncalled.map((x) => x.uncalledCount));
      const priorityBattles =
        maxUncalledBattle > 0
          ? battlesWithUncalled.filter((x) => x.uncalledCount === maxUncalledBattle)
          : battlesWithUncalled;

      const winnerIndex = Math.floor(Math.random() * priorityBattles.length);
      const chosenMeta = priorityBattles[winnerIndex];
      const chosenBattle: BattleMatch = {
        ...chosenMeta.battle,
        uncalledCountTeamA: chosenMeta.uncalledA,
        uncalledCountTeamB: chosenMeta.uncalledB,
      };

      const totalSteps = 16;
      let step = 0;

      const runStep = () => {
        if (step < totalSteps) {
          const randIdx = Math.floor(Math.random() * occupiedBattles.length);
          const currentRand = occupiedBattles[randIdx];
          setHighlightedSeatKey(`${currentRand.teamA.seatKeys.join(',')},${currentRand.teamB.seatKeys.join(',')}`);
          playTickSound();
          step++;

          let delay = 70;
          if (step > 11) delay = 220;
          else if (step > 6) delay = 130;

          setTimeout(runStep, delay);
        } else {
          const allSeatKeys = `${chosenBattle.teamA.seatKeys.join(',')},${chosenBattle.teamB.seatKeys.join(',')}`;
          setHighlightedSeatKey(allSeatKeys);
          setWinnerSeatKey(allSeatKeys);
          setIsSpinning(false);
          playWinnerFanfare();

          setCurrentBattle(chosenBattle);

          if (remoteChannelRef.current) {
            const firstStudent = chosenBattle.teamA.students[0];
            seatingRemoteService.broadcastSpinResult(remoteChannelRef.current, {
              student: {
                id: firstStudent.id,
                fullName: firstStudent.fullName,
                gender: firstStudent.gender,
                groupName: firstStudent.groupName,
              },
              isBattle: true,
              battleInfo: {
                label: chosenBattle.label,
                teamAName: `${chosenBattle.teamA.aisleName} (${chosenBattle.teamA.students.map((s) => s.fullName).join(', ')})`,
                teamBName: `${chosenBattle.teamB.aisleName} (${chosenBattle.teamB.students.map((s) => s.fullName).join(', ')})`,
              },
            });
          }

          const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const allStudents = [...chosenBattle.teamA.students, ...chosenBattle.teamB.students];
          const historyItems: SpinHistoryItem[] = allStudents.map((st, i) => ({
            id: `spin_${Date.now() + i}_${st.id}`,
            studentId: st.id,
            studentName: st.fullName,
            groupName: st.groupName,
            aisleName: chosenBattle.teamA.students.some((s) => s.id === st.id)
              ? chosenBattle.teamA.aisleName
              : chosenBattle.teamB.aisleName,
            deskNumber: chosenBattle.teamA.students.some((s) => s.id === st.id) ? 1 : 2,
            time: timeStr,
          }));
          setSpinHistory((prev) => [...historyItems, ...prev]);

          setTimeout(() => {
            setIsBattleModalOpen(true);
          }, 350);
        }
      };

      runStep();
      return;
    }

    // 1. Chế độ Nhóm 4 bạn (Ghép 2 bàn trên - dưới)
    if (activePickMode === 'group4') {
      if (occupiedGroups.length === 0) {
        alert('Chưa có nhóm nào (tối thiểu 2 học sinh ngồi ở 2 bàn ghép trên - dưới) để bốc thăm nhóm 4!');
        return;
      }

      if (eligibleGroups.length === 0) {
        setToastMessage(
          '⚠️ Không có nhóm nào phù hợp với bộ lọc hiện tại! Thầy vui lòng chọn lại bộ lọc hoặc bấm "Làm mới vòng" trên Bảng Phụ.'
        );
        return;
      }

      setIsSpinning(true);
      setWinnerSeatKey(null);
      setWinnerStudent(null);
      setIsWinnerModalOpen(false);

      // Bộ lọc thông minh: Ưu tiên nhóm 4 bạn có nhiều học sinh chưa gọi nhất
      const groupsWithUncalled = eligibleGroups.map((g) => {
        const uncalledCount = g.students.filter((s) => !calledStudentIds.has(s.id)).length;
        return { group: g, uncalledCount };
      });
      const maxUncalledGroup = Math.max(0, ...groupsWithUncalled.map((x) => x.uncalledCount));
      const priorityGroups =
        maxUncalledGroup > 0
          ? groupsWithUncalled.filter((x) => x.uncalledCount === maxUncalledGroup).map((x) => x.group)
          : eligibleGroups;

      const winnerIndex = Math.floor(Math.random() * priorityGroups.length);
      const chosenGroup = priorityGroups[winnerIndex];
      const chosenGroupUncalledCount = chosenGroup.students.filter((s) => !calledStudentIds.has(s.id)).length;

      const totalSteps = 16;
      let step = 0;

      const runStep = () => {
        if (step < totalSteps) {
          const randIdx = Math.floor(Math.random() * occupiedGroups.length);
          const currentRand = occupiedGroups[randIdx];
          setHighlightedSeatKey(currentRand.seatKeys.join(','));
          playTickSound();
          step++;

          let delay = 70;
          if (step > 11) delay = 220;
          else if (step > 6) delay = 130;

          setTimeout(runStep, delay);
        } else {
          setHighlightedSeatKey(chosenGroup.seatKeys.join(','));
          setWinnerSeatKey(chosenGroup.seatKeys.join(','));
          setIsSpinning(false);
          playWinnerFanfare();

          const winnerInfo: WinnerStudentInfo = {
            student: chosenGroup.students[0],
            seatKey: chosenGroup.seatKeys[0],
            aisleName: chosenGroup.aisleName,
            deskNumber: chosenGroup.deskStart,
            isGroup4: true,
            groupStudents: chosenGroup.students,
            groupDeskLabel: chosenGroup.label,
            uncalledCount: chosenGroupUncalledCount,
            totalMembers: chosenGroup.students.length,
          };
          setWinnerStudent(winnerInfo);

          if (remoteChannelRef.current) {
            seatingRemoteService.broadcastSpinResult(remoteChannelRef.current, {
              student: {
                id: chosenGroup.students[0].id,
                fullName: chosenGroup.students[0].fullName,
                gender: chosenGroup.students[0].gender,
                groupName: chosenGroup.students[0].groupName,
                classRole: chosenGroup.students[0].classRole,
                avatarUrl: chosenGroup.students[0].avatarUrl,
              },
              isGroup4: true,
              groupStudents: chosenGroup.students.map((s) => ({
                id: s.id,
                fullName: s.fullName,
                groupName: s.groupName,
              })),
            });
          }

          const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const groupHistoryItems: SpinHistoryItem[] = chosenGroup.students.map((st, i) => ({
            id: `spin_${Date.now() + i}_${st.id}`,
            studentId: st.id,
            studentName: st.fullName,
            groupName: st.groupName,
            aisleName: chosenGroup.aisleName,
            deskNumber: chosenGroup.deskStart,
            time: timeStr,
          }));
          setSpinHistory((prev) => [...groupHistoryItems, ...prev]);

          setTimeout(() => {
            setIsWinnerModalOpen(true);
          }, 350);
        }
      };

      runStep();
      return;
    }

    // 2. Chế độ Đôi bạn cùng bàn (Pair)
    if (activePickMode === 'pair') {
      if (occupiedPairs.length === 0) {
        alert('Chưa có bàn nào có đủ 2 học sinh ngồi cạnh nhau trên sơ đồ để bốc thăm đôi bạn!');
        return;
      }

      if (eligiblePairs.length === 0) {
        setToastMessage(
          '⚠️ Không có bàn đôi nào phù hợp với bộ lọc hiện tại! Thầy vui lòng chọn lại bộ lọc hoặc bấm "Làm mới vòng" trên Bảng Phụ.'
        );
        return;
      }

      setIsSpinning(true);
      setWinnerSeatKey(null);
      setWinnerStudent(null);
      setIsWinnerModalOpen(false);

      // Bộ lọc thông minh: Ưu tiên cặp đôi có nhiều học sinh chưa gọi nhất
      const pairsWithUncalled = eligiblePairs.map((p) => {
        const leftUncalled = !calledStudentIds.has(p.leftStudent.id);
        const rightUncalled = !calledStudentIds.has(p.rightStudent.id);
        const uncalledCount = (leftUncalled ? 1 : 0) + (rightUncalled ? 1 : 0);
        return { pair: p, uncalledCount };
      });
      const maxUncalledPair = Math.max(0, ...pairsWithUncalled.map((x) => x.uncalledCount));
      const priorityPairs =
        maxUncalledPair > 0
          ? pairsWithUncalled.filter((x) => x.uncalledCount === maxUncalledPair).map((x) => x.pair)
          : eligiblePairs;

      const winnerIndex = Math.floor(Math.random() * priorityPairs.length);
      const chosenPair = priorityPairs[winnerIndex];
      const chosenPairUncalledCount =
        (calledStudentIds.has(chosenPair.leftStudent.id) ? 0 : 1) +
        (calledStudentIds.has(chosenPair.rightStudent.id) ? 0 : 1);

      const totalSteps = 16;
      let step = 0;

      const runStep = () => {
        if (step < totalSteps) {
          const randIdx = Math.floor(Math.random() * occupiedPairs.length);
          const currentRand = occupiedPairs[randIdx];
          setHighlightedSeatKey(`${currentRand.leftSeatKey},${currentRand.rightSeatKey}`);
          playTickSound();
          step++;

          let delay = 70;
          if (step > 11) delay = 220;
          else if (step > 6) delay = 130;

          setTimeout(runStep, delay);
        } else {
          setHighlightedSeatKey(`${chosenPair.leftSeatKey},${chosenPair.rightSeatKey}`);
          setWinnerSeatKey(`${chosenPair.leftSeatKey},${chosenPair.rightSeatKey}`);
          setIsSpinning(false);
          playWinnerFanfare();

          const winnerInfo: WinnerStudentInfo = {
            student: chosenPair.leftStudent,
            seatKey: chosenPair.leftSeatKey,
            aisleName: chosenPair.aisleName,
            deskNumber: chosenPair.deskNumber,
            partnerStudent: chosenPair.rightStudent,
            partnerSeatKey: chosenPair.rightSeatKey,
            isPair: true,
            uncalledCount: chosenPairUncalledCount,
            totalMembers: 2,
          };
          setWinnerStudent(winnerInfo);

          if (remoteChannelRef.current) {
            seatingRemoteService.broadcastSpinResult(remoteChannelRef.current, {
              student: {
                id: chosenPair.leftStudent.id,
                fullName: chosenPair.leftStudent.fullName,
                gender: chosenPair.leftStudent.gender,
                groupName: chosenPair.leftStudent.groupName,
                classRole: chosenPair.leftStudent.classRole,
                avatarUrl: chosenPair.leftStudent.avatarUrl,
              },
              isPair: true,
              partnerStudent: {
                id: chosenPair.rightStudent.id,
                fullName: chosenPair.rightStudent.fullName,
                gender: chosenPair.rightStudent.gender,
                groupName: chosenPair.rightStudent.groupName,
                classRole: chosenPair.rightStudent.classRole,
                avatarUrl: chosenPair.rightStudent.avatarUrl,
              },
            });
          }

          const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const item1: SpinHistoryItem = {
            id: `spin_${Date.now()}_${chosenPair.leftStudent.id}`,
            studentId: chosenPair.leftStudent.id,
            studentName: chosenPair.leftStudent.fullName,
            groupName: chosenPair.leftStudent.groupName,
            aisleName: chosenPair.aisleName,
            deskNumber: chosenPair.deskNumber,
            time: timeStr,
          };
          const item2: SpinHistoryItem = {
            id: `spin_${Date.now() + 1}_${chosenPair.rightStudent.id}`,
            studentId: chosenPair.rightStudent.id,
            studentName: chosenPair.rightStudent.fullName,
            groupName: chosenPair.rightStudent.groupName,
            aisleName: chosenPair.aisleName,
            deskNumber: chosenPair.deskNumber,
            time: timeStr,
          };
          setSpinHistory((prev) => [item1, item2, ...prev]);

          setTimeout(() => {
            setIsWinnerModalOpen(true);
          }, 350);
        }
      };

      runStep();
      return;
    }

    // 3. Chế độ Cá nhân (Single)
    if (occupiedSeats.length === 0) {
      alert('Chưa có học sinh nào trên sơ đồ để bốc thăm!');
      return;
    }

    if (eligibleSeats.length === 0) {
      if (excludeCalled && calledStudentIds.size > 0) {
        if (
          window.confirm(
            'Tất cả học sinh trong lớp đã được gọi phát biểu!\nThầy có muốn tự động làm mới danh sách đã gọi để bắt đầu vòng bốc thăm mới ngay không?'
          )
        ) {
          setSpinHistory([]);
          return;
        }
      }
      alert(
        'Không có học sinh nào phù hợp với bộ lọc hiện tại!\nThầy vui lòng chọn lại bộ lọc hoặc bấm nút 🔄 trên thanh điều khiển để làm mới danh sách đã gọi.'
      );
      return;
    }

    setIsSpinning(true);
    setWinnerSeatKey(null);
    setWinnerStudent(null);
    setIsWinnerModalOpen(false);

    // Chọn trước học sinh may mắn từ danh sách đủ điều kiện
    const winnerIndex = Math.floor(Math.random() * eligibleSeats.length);
    const chosen = eligibleSeats[winnerIndex];

    // Tạo chuỗi nhảy ngẫu nhiên từ nhanh đến chậm dần
    const totalSteps = 16;
    let step = 0;

    const runStep = () => {
      if (step < totalSteps) {
        const randIdx = Math.floor(Math.random() * occupiedSeats.length);
        setHighlightedSeatKey(occupiedSeats[randIdx].key);
        playTickSound();
        step++;

        let delay = 70;
        if (step > 11) delay = 220;
        else if (step > 6) delay = 130;

        setTimeout(runStep, delay);
      } else {
        setHighlightedSeatKey(chosen.key);
        setWinnerSeatKey(chosen.key);
        setIsSpinning(false);
        playWinnerFanfare();

        const winnerInfo: WinnerStudentInfo = {
          student: chosen.student,
          seatKey: chosen.key,
          aisleName: chosen.aisleName,
          deskNumber: chosen.deskNumber,
          isPair: false,
          uncalledCount: calledStudentIds.has(chosen.student.id) ? 0 : 1,
          totalMembers: 1,
        };
        setWinnerStudent(winnerInfo);

        if (remoteChannelRef.current) {
          seatingRemoteService.broadcastSpinResult(remoteChannelRef.current, {
            student: {
              id: chosen.student.id,
              fullName: chosen.student.fullName,
              gender: chosen.student.gender,
              groupName: chosen.student.groupName,
              classRole: chosen.student.classRole,
              avatarUrl: chosen.student.avatarUrl,
            },
            isPair: false,
          });
        }

        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const historyItem: SpinHistoryItem = {
          id: `spin_${Date.now()}_${chosen.student.id}`,
          studentId: chosen.student.id,
          studentName: chosen.student.fullName,
          groupName: chosen.student.groupName,
          aisleName: chosen.aisleName,
          deskNumber: chosen.deskNumber,
          time: timeStr,
        };
        setSpinHistory((prev) => [historyItem, ...prev]);

        setTimeout(() => {
          setIsWinnerModalOpen(true);
        }, 350);
      }
    };

    runStep();
  };

  // Thưởng điểm thi đua trực tiếp từ Popup bốc thăm (hỗ trợ cá nhân, đôi bạn & nhóm 4)
  const handleAwardPoints = async (points: number, reason: string) => {
    if (!winnerStudent) return;
    try {
      if (winnerStudent.isGroup4 && winnerStudent.groupStudents) {
        // Thưởng điểm đồng thời cho tất cả thành viên trong nhóm 4
        for (const st of winnerStudent.groupStudents) {
          await pointsService.createTransaction({
            classId,
            targetType: 'student',
            studentId: st.id,
            points,
            stars: Math.max(1, Math.floor(points / 2)),
            reason,
            note: `Thưởng nhóm thảo luận từ Vòng quay may mắn (${st.fullName})`,
          });
        }
      } else {
        // Cộng điểm cho học sinh chính
        await pointsService.createTransaction({
          classId,
          targetType: 'student',
          studentId: winnerStudent.student.id,
          points,
          stars: Math.max(1, Math.floor(points / 2)),
          reason,
          note: `Thưởng trực tiếp từ Vòng quay may mắn (${winnerStudent.student.fullName})`,
        });

        // Nếu là chế độ đôi bạn, cộng điểm luôn cho bạn cùng bàn
        if (winnerStudent.isPair && winnerStudent.partnerStudent) {
          await pointsService.createTransaction({
            classId,
            targetType: 'student',
            studentId: winnerStudent.partnerStudent.id,
            points,
            stars: Math.max(1, Math.floor(points / 2)),
            reason,
            note: `Thưởng trực tiếp từ Vòng quay may mắn đôi bạn (${winnerStudent.partnerStudent.fullName})`,
          });
        }
      }

      playPointsChime();

      // Cập nhật điểm đã cộng vào các item mới nhất trong lịch sử bốc thăm
      setSpinHistory((prev) =>
        prev.map((item, idx) => {
          if (winnerStudent.isGroup4 && winnerStudent.groupStudents) {
            const groupStudentIds = new Set(winnerStudent.groupStudents.map((s) => s.id));
            if (groupStudentIds.has(item.studentId) && idx < winnerStudent.groupStudents.length) {
              return { ...item, awardedPoints: points };
            }
          } else if (winnerStudent.isPair && winnerStudent.partnerStudent) {
            if (
              (idx === 0 || idx === 1) &&
              (item.studentId === winnerStudent.student.id || item.studentId === winnerStudent.partnerStudent.id)
            ) {
              return { ...item, awardedPoints: points };
            }
          } else if (idx === 0 && item.studentId === winnerStudent.student.id) {
            return { ...item, awardedPoints: points };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Lỗi khi cộng điểm thi đua:', err);
    }
  };

  // Gán nhiệm vụ nhanh cho học sinh / đôi bạn / nhóm 4 vừa bốc trúng
  const handleAssignTask = (taskText: string) => {
    if (!winnerStudent) return;

    // 1. Cập nhật nhiệm vụ vào lịch sử bốc thăm
    setSpinHistory((prev) =>
      prev.map((item, idx) => {
        if (winnerStudent.isGroup4 && winnerStudent.groupStudents) {
          const groupStudentIds = new Set(winnerStudent.groupStudents.map((s) => s.id));
          if (groupStudentIds.has(item.studentId) && idx < winnerStudent.groupStudents.length) {
            return { ...item, assignedTask: taskText };
          }
        } else if (winnerStudent.isPair && winnerStudent.partnerStudent) {
          if (
            (idx === 0 || idx === 1) &&
            (item.studentId === winnerStudent.student.id || item.studentId === winnerStudent.partnerStudent.id)
          ) {
            return { ...item, assignedTask: taskText };
          }
        } else if (idx === 0 && item.studentId === winnerStudent.student.id) {
          return { ...item, assignedTask: taskText };
        }
        return item;
      })
    );

    // 2. Tự động ghi nhật ký dặn dò vào Bảng Phụ (Presentation Notes)
    try {
      const storageKey = `web_gvcn_presentation_notes_${classId}`;
      const currentNotes = localStorage.getItem(storageKey) || '';
      let targetName = winnerStudent.student.fullName;
      if (winnerStudent.isGroup4 && winnerStudent.groupStudents) {
        targetName = `Nhóm ${winnerStudent.groupDeskLabel || ''} (${winnerStudent.groupStudents.map((s) => s.fullName).join(', ')})`;
      } else if (winnerStudent.isPair && winnerStudent.partnerStudent) {
        targetName = `Đôi bạn (${winnerStudent.student.fullName} & ${winnerStudent.partnerStudent.fullName})`;
      }
      const taskLine = `\n📌 Phân công ${targetName}: ${taskText}`;
      localStorage.setItem(storageKey, currentNotes ? `${currentNotes}${taskLine}` : taskLine.trim());
    } catch (e) {
      console.error('Lỗi khi lưu phân công nhiệm vụ vào bảng dặn dò:', e);
    }
  };

  // Thưởng điểm thi đua cho chế độ Đối kháng (teamA, teamB hoặc both)
  const handleAwardBattlePoints = async (team: 'teamA' | 'teamB' | 'both', points: number, reason: string) => {
    if (!currentBattle) return;
    try {
      const studentsToAward =
        team === 'teamA'
          ? currentBattle.teamA.students
          : team === 'teamB'
          ? currentBattle.teamB.students
          : [...currentBattle.teamA.students, ...currentBattle.teamB.students];

      for (const st of studentsToAward) {
        await pointsService.createTransaction({
          classId,
          targetType: 'student',
          studentId: st.id,
          points,
          stars: Math.max(1, Math.floor(points / 2)),
          reason,
          note: `Thưởng thi đấu đối kháng (${st.fullName})`,
        });
      }

      playPointsChime();

      // Ghi chú vào Bảng Phụ
      try {
        const noteKey = `web_gvcn_presentation_notes_${classId}`;
        const currentNotes = localStorage.getItem(noteKey) || '';
        const winText =
          team === 'teamA'
            ? `${currentBattle.teamA.name} THẮNG`
            : team === 'teamB'
            ? `${currentBattle.teamB.name} THẮNG`
            : 'HÒA NHAU';
        const appendText = `\n⚔️ Đối kháng: ${currentBattle.label} ➔ ${winText} (+${points}đ)`;
        localStorage.setItem(noteKey, currentNotes ? `${currentNotes}${appendText}` : appendText.trim());
      } catch (e) {
        console.error('Lỗi ghi nhật ký đối kháng:', e);
      }
    } catch (err) {
      console.error('Lỗi cộng điểm đối kháng:', err);
    }
  };

  // Gán nhiệm vụ đối kháng cho 2 đội
  const handleAssignBattleTask = (taskText: string) => {
    if (!currentBattle) return;
    try {
      const noteKey = `web_gvcn_presentation_notes_${classId}`;
      const currentNotes = localStorage.getItem(noteKey) || '';
      const appendText = `\n⚔️ Thử thách đối kháng [${currentBattle.label}]: ${taskText}`;
      localStorage.setItem(noteKey, currentNotes ? `${currentNotes}${appendText}` : appendText.trim());
    } catch (e) {
      console.error('Lỗi lưu thử thách đối kháng:', e);
    }
  };

  // Đồng bộ trạng thái đồng hồ đếm ngược từ TV về điện thoại của Thầy
  const handleTimerStateChange = (state: { remainingSeconds: number; isRunning: boolean; totalSeconds: number }) => {
    if (remoteChannelRef.current) {
      seatingRemoteService.broadcastTimerUpdate(remoteChannelRef.current, state);
    }
  };

  // Khởi tạo kênh Broadcast Realtime đồng bộ với Bàn Điều Khiển Điện Thoại của Thầy
  useEffect(() => {
    if (!classId || !remoteSession) return;

    const parseDeviceName = (ua?: string): string => {
      if (!ua) return 'Điện thoại của Thầy';
      if (/iPhone/i.test(ua)) return 'iPhone của Thầy';
      if (/iPad/i.test(ua)) return 'iPad của Thầy';
      if (/Android/i.test(ua)) {
        const match = ua.match(/Android[^;]+;\s*([^;)]+)/);
        if (match && match[1]) return match[1].trim();
        return 'Điện thoại Android';
      }
      return 'Điện thoại của Thầy';
    };

    const channel = seatingRemoteService.initHostChannel(
      classId,
      remoteSession.sessionId,
      remoteSession.pin,
      {
        onClientConnected: (deviceInfo) => {
          setIsRemoteConnected(true);
          const devName = parseDeviceName(deviceInfo.userAgent);
          setConnectedDeviceName(devName);
          setRemoteToast(`📱 Đã kết nối với ${devName}!`);
          setTimeout(() => setRemoteToast(null), 3500);
        },
        onTriggerSpin: (mode) => {
          setRemoteToast(`📱 Nhận lệnh bốc thăm (${mode.toUpperCase()}) từ điện thoại...`);
          setTimeout(() => setRemoteToast(null), 2500);
          handleStartRandomPick(mode);
        },
        onTriggerTimer: (action, durationSeconds) => {
          setIsTimerWidgetOpen(true);
          setTimerExternalAction({
            action,
            durationSeconds,
            timestamp: Date.now(),
          });
        },
        onAwardPoints: async (payload) => {
          try {
            if (payload.studentId) {
              const targetStudent = allClassStudents.find((s) => s.id === payload.studentId);
              const targetName = targetStudent?.fullName || (targetStudent as any)?.full_name || 'Học sinh';

              await pointsService.createTransaction({
                classId,
                targetType: 'student',
                studentId: payload.studentId,
                points: payload.points,
                stars: Math.max(1, Math.floor(payload.points / 2)),
                reason: payload.reason || 'Phát biểu xây dựng bài (Remote Deck)',
                note: `Thưởng điểm từ Điện thoại điều khiển (${targetName})`,
              });

              playPointsChime();
              setRemoteToast(`⭐ Điện thoại đã cộng ${payload.points} điểm cho ${targetName}!`);
              setTimeout(() => setRemoteToast(null), 3000);

              if (remoteChannelRef.current) {
                seatingRemoteService.broadcastPointsAwarded(remoteChannelRef.current, {
                  studentName: targetName,
                  points: payload.points,
                });
              }
            }
          } catch (err) {
            console.error('Lỗi cộng điểm từ Remote Deck:', err);
          }
        },
        onToggleViewMode: (mode) => {
          handleToggleViewMode(mode);
        },
        onToggleFullscreen: () => {
          handleToggleFullscreen();
        },
      }
    );

    remoteChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
      remoteChannelRef.current = null;
      setIsRemoteConnected(false);
    };
  }, [classId, remoteSession.sessionId, remoteSession.pin, allClassStudents]);

  // Phím tắt bàn phím cho giáo viên: F (Fullscreen), R (Bốc thăm), T (Đếm giờ), S (Bảng phụ)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleStartRandomPick(pickMode);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTimerWidgetOpen((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        if (isFullscreen) {
          e.preventDefault();
          handleToggleSplitMode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isSpinning, occupiedSeats, eligibleSeats, pickMode]);

  // Cấu hình tiêu đề hành chính cho bản in & xuất file PDF
  const { headerConfig, updateHeaderConfig, resetHeaderConfig } = useSeatingPrintConfig({
    currentClass,
    userFullName: user?.fullName,
    isRotationEnabled,
    activeWeekMode,
    schoolWeekNumber: schoolWeekInfo.weekNumber,
  });

  const handleExportPdf = async () => {
    const printEl = document.getElementById('seating-print-layout');
    if (!printEl) {
      alert('Không tìm thấy sơ đồ lớp để xuất PDF');
      return;
    }

    setIsExportingPdf(true);
    try {
      const cleanName = (headerConfig.className || '6A6').replace(/^lớp\s+/i, '').replace(/\s+/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      await pdfExportService.exportToPdf(printEl, {
        fileName: `So_Do_Cho_Ngoi_${cleanName}_${dateStr}.pdf`,
        orientation: 'landscape',
      });
    } catch (err) {
      console.error('Lỗi xuất PDF sơ đồ lớp:', err);
      alert('Có lỗi xảy ra khi xuất PDF. Thầy có thể dùng nút IN SƠ ĐỒ LỚP A4 và chọn "Lưu dưới dạng PDF" của trình duyệt.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 overflow-hidden w-screen h-screen flex flex-row'
          : 'space-y-6'
      }`}
    >
      {/* Thanh điều khiển nổi HUD khi ở Chế độ Trình Chiếu Toàn Màn Hình */}
      {isFullscreen && (
        <PresentationHud
          cleanClassName={(currentClass?.name || '6A6').replace(/^lớp\s+/i, '').trim()}
          viewMode={viewMode}
          onToggleViewMode={handleToggleViewMode}
          zoomLevel={zoomLevel}
          onZoomChange={handleZoomChange}
          onFitScreen={handleFitScreen}
          onResetZoom={() => handleZoomChange(100)}
          onExitFullscreen={handleToggleFullscreen}
          isSpinning={isSpinning}
          onStartSpin={handleStartRandomPick}
          isTimerOpen={isTimerWidgetOpen}
          onToggleTimer={() => setIsTimerWidgetOpen((prev) => !prev)}
          isSplitMode={isSplitMode}
          onToggleSplitMode={handleToggleSplitMode}
          filterGroup={filterGroup}
          onFilterGroupChange={setFilterGroup}
          filterGender={filterGender}
          onFilterGenderChange={setFilterGender}
          excludeCalled={excludeCalled}
          onToggleExcludeCalled={() => setExcludeCalled((prev) => !prev)}
          autoResetOnModeChange={autoResetOnModeChange}
          onToggleAutoResetOnModeChange={handleToggleAutoResetOnModeChange}
          eligibleCount={
            pickMode === 'battle'
              ? eligibleBattles.length
              : pickMode === 'group4'
              ? eligibleGroups.length
              : pickMode === 'pair'
              ? eligiblePairs.length
              : eligibleSeats.length
          }
          eligibleSingleCount={eligibleSeats.length}
          eligiblePairCount={eligiblePairs.length}
          eligibleGroup4Count={eligibleGroups.length}
          eligibleBattleCount={eligibleBattles.length}
          pickMode={pickMode}
          onPickModeChange={handlePickModeChange}
          groupsList={groupsList}
          isRemoteConnected={isRemoteConnected}
          onOpenRemotePairing={() => setIsRemoteModalOpen(true)}
          calledCount={calledStudentIds.size}
          onClearSpinHistory={handleClearSpinHistory}
          onOpenCalledDrawer={() => setIsCalledDrawerOpen(true)}
          onResetView={handleResetView}
          isLargeText={isLargeTextMode}
          onToggleLargeText={handleToggleLargeText}
        />
      )}

      {/* Cột chính chứa sơ đồ lớp học */}
      <div
        className={`flex-1 min-w-0 h-full ${
          isFullscreen ? 'overflow-y-auto pl-20 pr-2 sm:pr-4 pt-14 pb-16 space-y-4 bg-white' : 'space-y-6'
        }`}
      >

      {/* Toast thông báo kèm nút Hoàn tác nhanh */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-3 border border-slate-700 backdrop-blur-md animate-fade-in print:hidden">
          <span>{toastMessage}</span>
          {canUndo && (
            <button
              type="button"
              onClick={handleUndo}
              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
              title={`Khôi phục lại trạng thái trước khi ${undoActionDescription || 'thao tác'}`}
            >
              <span>↩️</span>
              <span>Hoàn tác ngay</span>
            </button>
          )}
        </div>
      )}

      {/* Toast thông báo tương tác từ Bàn điều khiển điện thoại */}
      {remoteToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border-2 border-emerald-400 backdrop-blur-md animate-fade-in print:hidden">
          <span>{remoteToast}</span>
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
        canUndo={canUndo}
        undoActionDescription={undoActionDescription}
        hasAssignments={assignments.length > 0}
        presetsCount={presets.length}
        onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
        totalRows={totalRows}
        totalCols={totalCols}
        onOpenLayoutConfigModal={() => setIsLayoutConfigModalOpen(true)}
        onToggleRotation={handleToggleRotation}
        onSelectWeekMode={setActiveWeekMode}
        onOpenStartDateModal={() => setIsStartDateModalOpen(true)}
        onOpenClusterModal={() => setIsClusterModalOpen(true)}
        onResetLayout={handleResetLayout}
        onClearLayout={handleClearLayout}
        onUndo={handleUndo}
        onSaveCurrentWeekAsBase={handleSaveCurrentWeekAsBase}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
        onFitScreen={handleFitScreen}
        onResetZoom={() => handleZoomChange(100)}
        isRemoteConnected={isRemoteConnected}
        onOpenRemotePairing={() => setIsRemoteModalOpen(true)}
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
        viewMode={viewMode}
        zoomLevel={zoomLevel}
        isFullscreen={isFullscreen}
        isLargeTextMode={isLargeTextMode}
        highlightedSeatKey={highlightedSeatKey}
        winnerSeatKey={winnerSeatKey}
        onResetView={handleResetView}
        schoolName={currentClass?.schoolName || 'TRƯỜNG THCS TÂN HẢI'}
        className={currentClass?.name || 'LỚP 6A6'}
        logoUrl={currentClass?.logoUrl}
        customHeader={headerConfig}
        totalStudentsCount={totalStudentsCount}
        femaleStudentsCount={femaleStudentsCount}
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
        elementsConfig={elementsConfig}
        onUpdateElementsConfig={updateElementsConfig}
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
        classId={classId}
        calledStudentIds={calledStudentIds}
      />

      {/* 3.1. Khay học sinh chờ xếp chỗ (Waiting Bench / Drawer) */}
      <WaitingBenchDrawer
        unassignedStudents={unassignedStudents}
        selectedBenchStudent={selectedBenchStudent}
        onSelectBenchStudent={setSelectedBenchStudent}
        onDragStartBenchStudent={(_e, s) => setDraggedBenchStudent(s)}
        onDropOnBench={handleDropOnBench}
        onAutoSeatRemaining={handleAutoSeatRemaining}
        emptySeatCount={emptySeatCount}
      />
      </div>

      {/* Cột bảng tiện ích sinh hoạt lớp (chỉ xuất hiện khi Toàn màn hình & Bật Bảng Phụ) */}
      {isFullscreen && isSplitMode && (
        <PresentationSidePanel
          classId={classId}
          classNameTitle={currentClass?.name || 'Lớp Học'}
          spinHistory={spinHistory}
          onClearHistory={() => setSpinHistory([])}
          onClose={() => setIsSplitMode(false)}
          isOpen={isSplitMode}
        />
      )}

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

      {/* 4.5. Modal Quản lý Bản Mẫu Sơ Đồ (Seating Presets) */}
      <SeatingPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        presets={presets}
        currentAssignments={assignments}
        currentElementsConfig={elementsConfig}
        onSaveCurrentAsPreset={handleSaveCurrentAsPreset}
        onApplyPreset={(preset) => {
          handleApplyPreset(preset);
          if (preset.elementsConfig) {
            updateElementsConfig(preset.elementsConfig);
          }
        }}
        onDeletePreset={handleDeletePreset}
        onUpdatePreset={handleUpdatePreset}
      />

      {/* 4.6. Modal Cấu Hình Không Gian Phòng Học */}
      <RoomLayoutConfigModal
        isOpen={isLayoutConfigModalOpen}
        onClose={() => setIsLayoutConfigModalOpen(false)}
        currentRows={totalRows}
        currentCols={totalCols}
        totalStudents={allClassStudents.length}
        elementsConfig={elementsConfig}
        onSave={handleUpdateLayoutDimensions}
        onSaveElementsConfig={updateElementsConfig}
      />

      {/* 4.7. Modal Tùy Chỉnh Tiêu Đề Văn Bản Hành Chính & In / Xuất PDF A4 */}
      <SeatingPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        headerConfig={headerConfig}
        onUpdateHeaderConfig={updateHeaderConfig}
        onResetHeaderConfig={resetHeaderConfig}
        logoUrl={currentClass?.logoUrl}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        totalStudents={totalStudentsCount}
        femaleStudents={femaleStudentsCount}
        elementsConfig={elementsConfig}
      />

      {/* 4.8. Widget Đếm Ngược Thời Gian Thảo Luận Nhóm / Sinh Hoạt Lớp */}
      <ClassroomTimerWidget
        isOpen={isTimerWidgetOpen}
        onClose={() => setIsTimerWidgetOpen(false)}
        externalAction={timerExternalAction}
        onTimerStateChange={handleTimerStateChange}
      />

      {/* 4.9. Modal Chúc Mừng Học Sinh Trúng Thưởng Vòng Quay May Mắn */}
      <RandomStudentModal
        isOpen={isWinnerModalOpen}
        winner={winnerStudent}
        onSpinAgain={handleStartRandomPick}
        onAwardPoints={handleAwardPoints}
        onAssignTask={handleAssignTask}
        onClose={() => {
          setIsWinnerModalOpen(false);
          setWinnerSeatKey(null);
          setHighlightedSeatKey(null);
        }}
      />

      {/* 4.10. Modal Đấu Trí Đối Kháng 2 Dãy (Team Battle Mode) */}
      <TeamBattleModal
        isOpen={isBattleModalOpen}
        battle={currentBattle}
        onSpinAgain={handleStartRandomPick}
        onAwardPoints={handleAwardBattlePoints}
        onAssignTask={handleAssignBattleTask}
        onClose={() => {
          setIsBattleModalOpen(false);
          setWinnerSeatKey(null);
          setHighlightedSeatKey(null);
        }}
      />

      {/* 4.11. Modal Quét QR Ghép Nối Điện Thoại Điều Khiển Từ Xa (Remote Deck) */}
      <RemotePairingModal
        isOpen={isRemoteModalOpen}
        onClose={() => setIsRemoteModalOpen(false)}
        session={remoteSession}
        isConnected={isRemoteConnected}
        connectedDeviceName={connectedDeviceName}
      />

      {/* 4.12. Bảng Trượt Xem Danh Sách Học Sinh Đã Bốc Thăm (Called Students Drawer) */}
      <CalledStudentsDrawer
        isOpen={isCalledDrawerOpen}
        onClose={() => setIsCalledDrawerOpen(false)}
        historyItems={spinHistory}
        onRemoveItem={handleRemoveFromSpinHistory}
        onClearAll={handleClearSpinHistory}
        totalStudents={allClassStudents.length}
        onAwardPoints={handleAwardCalledStudentPoints}
      />
    </div>
  );
};
