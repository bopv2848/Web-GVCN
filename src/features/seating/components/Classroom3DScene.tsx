import React, { useState, useEffect, useMemo } from 'react';
import { Desk3DBlock } from './Desk3DBlock';
import type {
  SeatAssignmentWithStudent,
  SeatingMedicalAnalysis,
} from '../../../types/seating';
import type { AisleInfo } from './SeatingGrid';
import type { SourceSeatInfo } from '../hooks/useSeatingManagement';
import { ClassroomFrontElements } from './ClassroomFrontElements';
import { useClassroomElementsConfig } from '../hooks/useClassroomElementsConfig';
import type { ClassroomElementsConfig } from '../../../types/seating';
import { useRealtimeAttendanceStats } from '../../attendance/hooks/useRealtimeAttendanceStats';
import { formatVietnameseClassroomDate } from '../../../utils/vietnameseDateUtils';
import { useRealtimeCurrentLesson } from '../../timetable/hooks/useRealtimeCurrentLesson';
import { QuickAbsenceModal } from '../../attendance/components/QuickAbsenceModal';
import { ConfettiCanvas } from './ConfettiCanvas';

interface Classroom3DSceneProps {
  schoolName: string;
  className: string;
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
  elementsConfig?: ClassroomElementsConfig;
  onUpdateElementsConfig?: (updates: Partial<ClassroomElementsConfig>) => void;
  onDragStart: (e: React.DragEvent, assignment: SeatAssignmentWithStudent, r: number, c: number) => void;
  onDragOver: (e: React.DragEvent, r: number, c: number) => void;
  onDragLeave: (e: React.DragEvent, r: number, c: number) => void;
  onDrop: (e: React.DragEvent, r: number, c: number, targetAssignment?: SeatAssignmentWithStudent) => void;
  onSeatClick: (r: number, c: number, assignment?: SeatAssignmentWithStudent) => void;
  classId?: string;
  highlightedSeatKey?: string | null;
  winnerSeatKey?: string | null;
  onResetView?: () => void;
  zoomLevel?: number;
  isLargeTextMode?: boolean;
  isFullscreen?: boolean;
}

export const Classroom3DScene: React.FC<Classroom3DSceneProps> = ({
  schoolName,
  className,
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
  elementsConfig,
  onUpdateElementsConfig,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onSeatClick,
  classId,
  highlightedSeatKey = null,
  winnerSeatKey = null,
  onResetView,
  zoomLevel = 100,
  isLargeTextMode = false,
  isFullscreen = false,
}) => {
  const cleanClassName = (className || '6A6').replace(/^lớp\s+/i, '').trim();

  // Dữ liệu Môn học / Tiết học hiện tại theo Thời khóa biểu thực tế
  const {
    lessonStatus,
    isSimulated,
    setSimulationPeriod,
    resetToLive,
  } = useRealtimeCurrentLesson(classId);

  // Dữ liệu Điểm danh theo thời gian thực (SS, HD, V) - tự động đồng bộ theo từng Tiết và Buổi học (Sáng / Chiều)
  const attendanceStats = useRealtimeAttendanceStats(classId, undefined, lessonStatus.period);

  // Trạng thái mở modal Ghi nhận vắng nhanh cho tiết này (1-Click Absence Modal)
  const [isQuickAbsenceOpen, setIsQuickAbsenceOpen] = useState<boolean>(false);

  // Bản đồ học sinh vắng trong tiết/buổi hiện tại để phản hồi trực quan trên bàn ghế 3D (Phương án A)
  const absentStudentsMap = useMemo(() => {
    const map = new Map<string, string>();
    if (attendanceStats.absentStudents) {
      attendanceStats.absentStudents.forEach((st) => {
        map.set(st.id, st.reason || 'Vắng');
      });
    }
    return map;
  }, [attendanceStats.absentStudents]);

  // Bộ tập hợp chỗ ngồi đang nhảy sáng và trúng thưởng bốc thăm ngẫu nhiên (O(1) tra cứu tức thì)
  const highlightedKeysSet = useMemo(() => {
    if (!highlightedSeatKey) return new Set<string>();
    return new Set(highlightedSeatKey.split(',').map((k) => k.trim()));
  }, [highlightedSeatKey]);

  const winnerKeysSet = useMemo(() => {
    if (!winnerSeatKey) return new Set<string>();
    return new Set(winnerSeatKey.split(',').map((k) => k.trim()));
  }, [winnerSeatKey]);

  // Tự động lia khung nhìn mượt mà đến bàn học sinh trúng thưởng trong phòng học 3D
  useEffect(() => {
    if (!winnerSeatKey) return;
    const firstWinnerKey = winnerSeatKey.split(',')[0]?.trim();
    if (!firstWinnerKey) return;
    const parts = firstWinnerKey.split('_');
    if (parts.length < 2) return;
    const r = parseInt(parts[0], 10);
    const c = parseInt(parts[1], 10);
    if (isNaN(r) || isNaN(c)) return;

    const aisleColLeft = Math.floor(c / 2) * 2;
    const deskElement = document.getElementById(`desk-3d-${r}-${aisleColLeft}`);
    if (deskElement && typeof deskElement.scrollIntoView === 'function') {
      deskElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [winnerSeatKey]);

  // Đồng hồ thời gian thực tự động nhảy giây cho Thứ, Ngày/Tháng/Năm trên bảng
  const [currentRealTime, setCurrentRealTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateInfo = formatVietnameseClassroomDate(currentRealTime);

  // Hook quản lý phần tử nếu component được gọi độc lập
  const localElements = useClassroomElementsConfig();
  const activeElementsConfig = elementsConfig || localElements.config;
  const activeOnUpdateConfig = onUpdateElementsConfig || localElements.updateConfig;

  // Góc nhìn không gian 3D: Cố định góc nhìn Trực Diện (0°) trực quan, dễ quan sát
  const getPerspectiveStyle = (): React.CSSProperties => ({
    transform: 'none',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  });

  // Đưa camera 3D quay trở lại bao quát toàn cảnh bảng lớp và phòng học
  const handleResetView = () => {
    if (onResetView) {
      onResetView();
      return;
    }
    const boardEl = document.getElementById('classroom-3d-board');
    if (boardEl && typeof boardEl.scrollIntoView === 'function') {
      boardEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-amber-900/20 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] shadow-xl">
      {/* Hiệu ứng pháo hoa giấy tung bay khi bốc thăm trúng thưởng */}
      {winnerSeatKey && <ConfettiCanvas />}

      {/* 1. THANH TIÊU ĐỀ & GÓC NHÌN TRỰC DIỆN 3D */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200 z-30 relative">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-black">
            🏛️
          </span>
          <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
            Không Gian Phòng Học 3D • {className}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            {schoolName}
          </span>
        </div>

        {/* Nhóm điều khiển: Chấm Realtime Live Indicator, Nút Toàn Cảnh & Góc nhìn Trực Diện */}
        <div className="flex items-center gap-2">
          {/* Chấm đèn trạng thái kết nối Realtime WebSockets (Live Indicator) */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border transition-all duration-300 ${
              localElements.realtimeStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300/80 shadow-xs'
                : localElements.realtimeStatus === 'connecting'
                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-slate-100 text-slate-500 border-slate-300'
            }`}
            title="Trạng thái WebSockets: Tự động đồng bộ hóa thời gian thực giữa máy tính và điện thoại"
          >
            <span className="relative flex h-2 w-2">
              {localElements.realtimeStatus === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  localElements.realtimeStatus === 'connected'
                    ? 'bg-emerald-500'
                    : localElements.realtimeStatus === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              ></span>
            </span>
            <span>
              {localElements.realtimeStatus === 'connected'
                ? '🟢 Đang kết nối trực tiếp'
                : localElements.realtimeStatus === 'connecting'
                ? '🟡 Đang kết nối...'
                : '⚪ Ngoại tuyến'}
            </span>
          </div>

          {/* Nút Quay lại Toàn Cảnh Phòng Học */}
          <button
            type="button"
            onClick={handleResetView}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-600 rounded-2xl text-xs font-black shadow-xs transition-all cursor-pointer"
            title="Đưa góc nhìn camera quay trở lại bao quát toàn cảnh lớp học"
          >
            <span>👁️</span>
            <span>Toàn Cảnh</span>
          </button>

          {/* Góc nhìn Trực Diện (0°) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-xs">
            <span>📐</span>
            <span>Trực Diện (0°)</span>
          </div>
        </div>
      </div>

      {/* 2. MÔI TRƯỜNG PHÒNG HỌC 3D (CLASSROOM ENVIRONMENT) */}
      <div className="p-4 md:p-8 overflow-x-auto min-w-[850px] relative">
        {/* Khung nội thất 3D có phối cảnh */}
        <div style={getPerspectiveStyle()} className="space-y-8">
          {/* =========================================================================
              PHẦN ĐẦU PHÒNG HỌC: BẢNG LỚP, KHẨU HIỆU & BÀN GIÁO VIÊN (ĐƯỢC ĐỔI LÊN TRƯỚC DÃY BÀN HỌC)
             ========================================================================= */}
          <div className="relative w-full mx-auto space-y-4 pb-2">
            {/* Tường phòng học màu kem nhạt trải rộng toàn diện ngang với các dãy bàn học */}
            <div className="relative p-4 md:p-6 rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 shadow-lg space-y-4">
              {/* Khẩu hiệu trang trọng trên nóc bảng */}
              <div className="text-center">
                <span className="inline-block px-4 py-1 rounded-full bg-red-700 text-amber-300 font-black text-[11px] tracking-wider uppercase border border-amber-400/50 shadow-xs">
                  ★ TIÊN HỌC LỄ • HẬU HỌC VĂN ★
                </span>
              </div>

              {/* BẢNG TỪ CHỐNG LÓA MÀU XANH RÊU 3D Ở TRUNG TÂM PHÒNG HỌC */}
              <div id="classroom-3d-board" className="relative max-w-3xl mx-auto rounded-2xl bg-[#173827] border-4 border-slate-300 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.2)] p-4 text-center">
                {/* KHUNG ĐIỂM DANH THỜI GIAN THỰC (SS, HD, V) - GÓC TRÊN BÊN TRÁI BẢNG */}
                <div
                  className="absolute top-2 left-2.5 sm:left-3.5 z-10 px-2.5 py-1.5 rounded-lg bg-black/40 border border-emerald-400/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.3)] backdrop-blur-xs text-left cursor-pointer transition-all duration-200 hover:border-emerald-300 hover:bg-black/60 group/att"
                  onClick={() => setIsQuickAbsenceOpen(true)}
                  title={`Điểm danh: Sĩ số ${attendanceStats.total} • Hiện diện ${attendanceStats.present} • Vắng ${attendanceStats.absent} (${attendanceStats.sessionName || 'Sáng'}${lessonStatus.period ? ` - Tiết ${lessonStatus.period}` : ''})${
                    attendanceStats.absentStudents && attendanceStats.absentStudents.length > 0
                      ? `\nDanh sách vắng:\n${attendanceStats.absentStudents.map((s, idx) => `${idx + 1}. ${s.name} (${s.reason || 'Vắng'})`).join('\n')}`
                      : ''
                  }\n(Bấm để mở Ghi nhận vắng nhanh 1-chạm hoặc hoàn tác)`}
                >
                  <div className="flex items-center gap-1.5 mb-1 pb-0.5 border-b border-emerald-400/20">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300/90 group-hover/att:text-emerald-200">
                      Điểm danh • {attendanceStats.sessionName || 'Sáng'}
                      {lessonStatus.period ? ` (T${lessonStatus.period})` : ''}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] sm:text-[11px] leading-[1.35] font-black">
                    {/* SS: Sĩ số */}
                    <div className="flex items-center justify-between gap-3 text-slate-100">
                      <span className="text-emerald-300/80 font-bold">SS:</span>
                      <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {attendanceStats.total}
                      </span>
                    </div>

                    {/* HD: Hiện diện */}
                    <div className="flex items-center justify-between gap-3 text-emerald-300">
                      <span className="text-emerald-300/80 font-bold">HD:</span>
                      <span className="text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {attendanceStats.present}
                      </span>
                    </div>

                    {/* V: Vắng (Bấm trực tiếp vào ô số V để ghi nhận vắng nhanh) */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsQuickAbsenceOpen(true);
                      }}
                      className={`flex items-center justify-between gap-3 px-1 py-0.5 rounded cursor-pointer transition-all hover:bg-white/10 ${
                        attendanceStats.absent > 0
                          ? 'text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                          : 'text-emerald-200/70'
                      }`}
                      title="Chạm trực tiếp vào ô số V để ghi nhận vắng nhanh hoặc cho học sinh quay lại lớp"
                    >
                      <span
                        className={`flex items-center gap-1 ${
                          attendanceStats.absent > 0
                            ? 'text-amber-300/90 font-bold'
                            : 'text-emerald-300/70 font-bold'
                        }`}
                      >
                        <span>V:</span>
                        <span
                          className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30 hover:bg-amber-500 hover:text-white transition-colors"
                          title="Ghi nhận vắng nhanh 1-chạm"
                        >
                          +
                        </span>
                      </span>
                      <span
                        className={
                          attendanceStats.absent > 0
                            ? 'font-black text-amber-300'
                            : 'text-emerald-200/90'
                        }
                      >
                        {attendanceStats.absent}
                      </span>
                    </div>
                  </div>

                  {/* Popover danh sách học sinh vắng khi di chuột vào hộp điểm danh */}
                  {attendanceStats.absentStudents && attendanceStats.absentStudents.length > 0 && (
                    <div className="hidden group-hover/att:block absolute left-0 top-full mt-1.5 z-50 p-2.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-slate-100 shadow-2xl backdrop-blur-md min-w-[210px] max-w-[280px] pointer-events-none text-left animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-black text-amber-300 pb-1 mb-1 border-b border-white/10">
                        <span>Học sinh vắng ({attendanceStats.sessionName || 'Sáng'})</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold">
                          {attendanceStats.absent} em
                        </span>
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto text-[10px]">
                        {attendanceStats.absentStudents.map((st, i) => (
                          <div key={st.id || i} className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-200 truncate">
                              {i + 1}. {st.name}
                            </span>
                            <span className="text-[9px] text-amber-300/90 whitespace-nowrap">
                              {st.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 pt-1 border-t border-white/10 text-[9px] text-emerald-300 font-semibold text-center">
                        💡 Bấm vào ô V để quản lý vắng nhanh
                      </div>
                    </div>
                  )}
                </div>

                {/* THỨ, NGÀY THÁNG NĂM THEO THỜI GIAN THỰC - PHÍA TRÊN BÊN PHẢI BẢNG */}
                <div
                  className="absolute top-2 right-2.5 sm:right-3.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-emerald-400/30 text-emerald-200/95 font-bold text-[10px] sm:text-xs shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] backdrop-blur-xs select-none"
                  title={`Thời gian thực: ${currentRealTime.toLocaleTimeString('vi-VN')} — ${dateInfo.formalText}`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  </span>
                  <span className="hidden sm:inline tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {dateInfo.chalkboardText}
                  </span>
                  <span className="sm:hidden tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {dateInfo.standardText}
                  </span>
                </div>

                {/* NỘI DUNG MÔN HỌC THEO THỜI KHÓA BIỂU THỰC TẾ (CENTER CHALKBOARD) */}
                <div className="py-2 px-16 sm:px-24 text-center min-h-[54px] flex flex-col items-center justify-center relative group/lesson">
                  {/* Bấm vào để chuyển nhanh sang trang Thời khóa biểu */}
                  <div
                    className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/timetable';
                      }
                    }}
                    title="Đồng bộ theo Thời khóa biểu thực tế • Bấm để xem toàn bộ TKB tuần"
                  >
                    {lessonStatus.state === 'active_period' && (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <span className="text-amber-400 text-xs sm:text-sm animate-pulse">📖</span>
                          <h3 className="text-amber-300 font-black text-xs sm:text-sm md:text-base tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {lessonStatus.title}
                          </h3>
                          {lessonStatus.countdown?.formattedText && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[10px] sm:text-[11px] font-bold shadow-xs">
                              <span className="text-[10px]">⏳</span>
                              <span>{lessonStatus.countdown.formattedText}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-emerald-200 font-bold text-[10px] sm:text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2">
                          <span>⏰ {lessonStatus.timeSlot}</span>
                          {lessonStatus.teacherName && (
                            <span>• GV: {lessonStatus.teacherName}</span>
                          )}
                          {lessonStatus.roomName && (
                            <span className="hidden md:inline">• {lessonStatus.roomName}</span>
                          )}
                        </p>
                      </div>
                    )}

                    {lessonStatus.state === 'recess' && (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <span className="text-yellow-300 text-xs sm:text-sm animate-bounce">🔔</span>
                          <h3 className="text-yellow-300 font-black text-xs sm:text-sm md:text-base tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            GIỜ RA CHƠI
                          </h3>
                          {lessonStatus.countdown?.formattedText && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-300/40 text-yellow-200 text-[10px] sm:text-[11px] font-bold shadow-xs">
                              <span className="text-[10px]">⏱️</span>
                              <span>{lessonStatus.countdown.formattedText}</span>
                            </span>
                          )}
                          <span className="text-yellow-300 text-xs sm:text-sm">🎉</span>
                        </div>
                        <p className="text-emerald-200 font-bold text-[10px] sm:text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {lessonStatus.timeSlot && `Thời gian: ${lessonStatus.timeSlot}`}
                          {lessonStatus.nextLessonText && ` • ${lessonStatus.nextLessonText}`}
                        </p>
                      </div>
                    )}

                    {lessonStatus.state === 'off' && (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-slate-300 text-xs sm:text-sm">☕</span>
                          <h3 className="text-slate-200 font-black text-xs sm:text-sm md:text-base tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            NGHỈ
                          </h3>
                        </div>
                        <p className="text-emerald-300/80 font-medium text-[10px] sm:text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {lessonStatus.nextLessonText || 'Hiện tại không có tiết học'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Thanh điều khiển mô phỏng nhanh khi Thầy thử nghiệm ngoài giờ học */}
                  <div className="opacity-0 group-hover/lesson:opacity-100 transition-opacity duration-200 mt-1 flex items-center justify-center gap-1 text-[9px] font-bold">
                    <span className="text-emerald-400/80 hidden sm:inline">Thử nghiệm:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetToLive();
                      }}
                      className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                        !isSimulated
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'bg-black/40 text-emerald-300 hover:bg-black/60'
                      }`}
                      title="Chế độ thời gian thực theo giờ đồng hồ máy tính"
                    >
                      Live (Thực)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSimulationPeriod(1);
                      }}
                      className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-amber-600/80 text-amber-200 cursor-pointer transition-all"
                      title="Xem trước Tiết 1"
                    >
                      Tiết 1
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSimulationPeriod(999);
                      }}
                      className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-yellow-600/80 text-yellow-200 cursor-pointer transition-all"
                      title="Xem trước Giờ ra chơi"
                    >
                      Ra chơi
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSimulationPeriod(3);
                      }}
                      className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-amber-600/80 text-amber-200 cursor-pointer transition-all"
                      title="Xem trước Tiết 3"
                    >
                      Tiết 3
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSimulationPeriod(6);
                      }}
                      className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-amber-600/80 text-amber-200 cursor-pointer transition-all"
                      title="Xem trước Tiết 6 (Buổi chiều)"
                    >
                      Tiết 6 (Chiều)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSimulationPeriod(0);
                      }}
                      className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-slate-600/80 text-slate-200 cursor-pointer transition-all"
                      title="Xem trước Nghỉ"
                    >
                      Nghỉ
                    </button>
                  </div>
                </div>

                {/* KHAY ĐỂ PHẤN VÀ KHĂN LAU BẢNG 3D PHÍA DƯỚI BẢNG */}
                <div className="h-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-b-lg border-t border-amber-900 flex items-center justify-between px-6 shadow-md mt-2">
                  <div className="flex items-center gap-1.5">
                    {/* Các viên phấn trắng & vàng */}
                    <div className="w-4 h-1.5 bg-white rounded-xs shadow-2xs"></div>
                    <div className="w-4 h-1.5 bg-white rounded-xs shadow-2xs"></div>
                    <div className="w-4 h-1.5 bg-yellow-300 rounded-xs shadow-2xs"></div>
                  </div>
                  {/* Khăn lau bảng */}
                  <div className="w-7 h-2 bg-slate-700 rounded-xs border border-slate-600 shadow-xs" title="Khăn lau bảng"></div>
                </div>
              </div>

              {/* BÀN GIÁO VIÊN LINH ĐỘNG (TRÁI/GIỮA/PHẢI) & CỬA RA VÀO MŨI TÊN XOAY 360 ĐỘ (ĐẶT NGAY TRƯỚC HÀNG 1) */}
              <ClassroomFrontElements
                config={activeElementsConfig}
                onUpdateConfig={activeOnUpdateConfig}
                isInteractive={true}
              />
            </div>
          </div>

          {/* =========================================================================
              KHU VỰC SÀN LỚP HỌC & 4 DÃY BÀN HỌC SINH 3D
             ========================================================================= */}
          <div className="relative p-5 md:p-8 rounded-3xl bg-gradient-to-b from-[#fffbeb] via-[#fef3c7] to-[#fde68a] border-2 border-amber-200 shadow-inner">
            {/* Vân sàn gỗ phòng học tinh tế */}
            <div
              className="absolute inset-0 rounded-3xl opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(180,83,9,0.15) 40px, rgba(180,83,9,0.15) 41px), repeating-linear-gradient(90deg, transparent, transparent 180px, rgba(180,83,9,0.1) 180px, rgba(180,83,9,0.1) 181px)',
              }}
            ></div>

            {/* Các Dãy Bàn Học Sinh (3 Dãy hoặc 4 Dãy) */}
            <div
              className={`grid grid-cols-1 ${
                aisles.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'
              } gap-6 md:gap-8 relative z-10`}
            >
              {aisles.map((aisle) => (
                <div
                  key={aisle.name}
                  className="space-y-3.5 rounded-3xl p-3 bg-white/40 backdrop-blur-xs border border-amber-900/10 shadow-sm"
                >
                  {/* Bảng tên Dãy / Tổ 3D */}
                  <div className="text-center py-2 px-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-md border border-amber-500/50">
                    <h4 className="font-black text-xs uppercase tracking-wider">
                      DÃY {aisle.name}
                    </h4>
                    <span className="text-[10px] text-amber-200 font-medium block">
                      {aisle.subTitle}
                    </span>
                  </div>

                  {/* Danh sách 6 Hàng Bàn Học 3D */}
                  <div
                    className="space-y-3.5"
                    style={{
                      transform:
                        activeElementsConfig?.studentDeskScale && activeElementsConfig.studentDeskScale !== 100
                          ? `scale(${activeElementsConfig.studentDeskScale / 100})`
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

                      const isLeftAbsent = leftAssign ? absentStudentsMap.has(leftAssign.studentId) : false;
                      const leftAbsentReason = leftAssign ? absentStudentsMap.get(leftAssign.studentId) : undefined;
                      const isRightAbsent = rightAssign ? absentStudentsMap.has(rightAssign.studentId) : false;
                      const rightAbsentReason = rightAssign ? absentStudentsMap.get(rightAssign.studentId) : undefined;

                      const isLeftSelected = selectedSourceSeat?.rowIndex === rIdx && selectedSourceSeat?.colIndex === aisle.cols[0];
                      const isRightSelected = selectedSourceSeat?.rowIndex === rIdx && selectedSourceSeat?.colIndex === aisle.cols[1];

                      const isLeftDragOver = dragOverPos?.r === rIdx && dragOverPos?.c === aisle.cols[0];
                      const isRightDragOver = dragOverPos?.r === rIdx && dragOverPos?.c === aisle.cols[1];

                      const isLeftDragging = draggedSeat?.rowIndex === rIdx && draggedSeat?.colIndex === aisle.cols[0];
                      const isRightDragging = draggedSeat?.rowIndex === rIdx && draggedSeat?.colIndex === aisle.cols[1];

                      const leftSeatKey = `${rIdx}_${aisle.cols[0]}`;
                      const rightSeatKey = `${rIdx}_${aisle.cols[1]}`;

                      const isLeftHighlighted = highlightedKeysSet.has(leftSeatKey);
                      const isRightHighlighted = highlightedKeysSet.has(rightSeatKey);

                      const isLeftWinner = winnerKeysSet.has(leftSeatKey);
                      const isRightWinner = winnerKeysSet.has(rightSeatKey);

                      return (
                        <Desk3DBlock
                          key={rIdx}
                          rowIndex={rIdx}
                          colLeft={aisle.cols[0]}
                          colRight={aisle.cols[1]}
                          leftAssign={leftAssign}
                          rightAssign={rightAssign}
                          isDeskInCluster={isDeskInCluster}
                          isLeftSick={isLeftSick}
                          isRightSick={isRightSick}
                          isLeftAtRisk={isLeftAtRisk}
                          isRightAtRisk={isRightAtRisk}
                          leftSickReason={leftAssign ? sickReasonMap.get(leftAssign.studentId) : undefined}
                          rightSickReason={rightAssign ? sickReasonMap.get(rightAssign.studentId) : undefined}
                          isLeftAbsent={isLeftAbsent}
                          leftAbsentReason={leftAbsentReason}
                          isRightAbsent={isRightAbsent}
                          rightAbsentReason={rightAbsentReason}
                          isMedicalMode={isMedicalMode}
                          isLeftSelected={isLeftSelected}
                          isRightSelected={isRightSelected}
                          isLeftDragging={isLeftDragging}
                          isRightDragging={isRightDragging}
                          isLeftDragOver={isLeftDragOver}
                          isRightDragOver={isRightDragOver}
                          isLeftHighlighted={isLeftHighlighted}
                          isRightHighlighted={isRightHighlighted}
                          isLeftWinner={isLeftWinner}
                          isRightWinner={isRightWinner}
                          zoomLevel={zoomLevel}
                          isLargeTextMode={isLargeTextMode}
                          isFullscreen={isFullscreen}
                          onDragStart={onDragStart}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={onDrop}
                          onSeatClick={onSeatClick}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================================
              TIÊU ĐỀ 3D SƠ ĐỒ LỚP HỌC (ĐƯỢC CHUYỂN XUỐNG CUỐI DÃY PHÒNG HỌC 3D)
             ========================================================================= */}
          <div className="relative max-w-2xl mx-auto text-center pt-2">
            <div className="relative inline-flex flex-col items-center justify-center py-3 px-8 sm:px-12 rounded-3xl bg-gradient-to-b from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.15),0_6px_10px_-4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.95)] transform transition-transform hover:scale-[1.01]">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl filter drop-shadow-md select-none">
                  🗺️
                </span>
                <h2
                  className="font-black text-xl sm:text-2xl uppercase tracking-widest text-slate-850 select-none"
                  style={{
                    textShadow: '0 1px 0 #ffffff, 0 2px 0 #cbd5e1, 0 3px 0 #94a3b8, 0 4px 6px rgba(0,0,0,0.25)',
                  }}
                >
                  SƠ ĐỒ LỚP {cleanClassName || '6A6'}
                </h2>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs"></span>
                <span>{schoolName}</span>
                <span>•</span>
                <span>Năm học: 2026 - 2027</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODAL GHI NHẬN VẮNG NHANH CHO TIẾT NÀY (1-CLICK QUICK ABSENCE MODAL) */}
      <QuickAbsenceModal
        isOpen={isQuickAbsenceOpen}
        onClose={() => setIsQuickAbsenceOpen(false)}
        classId={classId}
        className={className}
        currentPeriod={lessonStatus.period}
        sessionName={attendanceStats.sessionName || 'Sáng'}
        absentStudents={attendanceStats.absentStudents || []}
      />
    </div>
  );
};
