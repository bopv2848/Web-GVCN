import React, { useState, useEffect, useRef } from 'react';
import type {
  ClassroomElementsConfig,
  TeacherDeskPosition,
} from '../../../types/seating';
import { seatingDimensionUtils } from '../utils/seatingDimensionUtils';
import { ClassroomDoor2D } from './ClassroomDoor2D';

interface ClassroomFrontElementsProps {
  config: ClassroomElementsConfig;
  onUpdateConfig: (updates: Partial<ClassroomElementsConfig>) => void;
  isInteractive?: boolean;
  isDarkMode?: boolean;
}

export const ClassroomFrontElements: React.FC<ClassroomFrontElementsProps> = ({
  config,
  onUpdateConfig,
  isInteractive = true,
  isDarkMode: propIsDarkMode,
}) => {
  const { teacherDeskPosition } = config;
  const teacherDeskWidth = config.teacherDeskWidth ?? 384;
  const teacherDeskScale = config.teacherDeskScale ?? 100;

  // Tự động nhận diện Chủ đề Ban Ngày (Viền vàng đồng) hoặc Ban Đêm/Tối (Màu dạ quang phản quang)
  const [detectedDarkMode, setDetectedDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isDarkClass =
      document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark');
    const isDarkMedia =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 18 || currentHour < 6;
    return isDarkClass || isDarkMedia || isNightTime;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    const updateTheme = () => {
      const isDarkClass =
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark');
      const isDarkMedia = mediaQuery ? mediaQuery.matches : false;
      const currentHour = new Date().getHours();
      const isNightTime = currentHour >= 18 || currentHour < 6;
      setDetectedDarkMode(isDarkClass || isDarkMedia || isNightTime);
    };

    if (mediaQuery && mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateTheme);
    }

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      if (mediaQuery && mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateTheme);
      }
      observer.disconnect();
    };
  }, []);

  const isThemeDark = propIsDarkMode !== undefined ? propIsDarkMode : detectedDarkMode;

  // State phục vụ kéo giãn kích thước trực tiếp (Direct Resizing)
  const [resizingDesk, setResizingDesk] = useState<'left' | 'right' | 'bottom' | null>(null);

  // State hỗ trợ đổi tên & nhãn Bàn Giáo Viên
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [deskLabelInput, setDeskLabelInput] = useState(config.teacherDeskLabel || 'Bàn Giáo Viên');

  // State & Ref hỗ trợ thao tác chụm 2 ngón tay (Pinch-to-zoom / Gesture resize)
  const [isPinchingDesk, setIsPinchingDesk] = useState(false);
  const deskPinchStartDistRef = useRef<number | null>(null);
  const deskPinchStartWidthRef = useRef<number>(teacherDeskWidth);

  useEffect(() => {
    if (config.teacherDeskLabel) {
      setDeskLabelInput(config.teacherDeskLabel);
    }
  }, [config.teacherDeskLabel]);

  // Xử lý Kéo giãn độ rộng & chiều dài Bàn Giáo Viên trực tiếp (Direct Resize Teacher Desk)
  const handleDeskResizePointerDown = (
    e: React.PointerEvent,
    direction: 'left' | 'right' | 'bottom'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isInteractive) return;

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = teacherDeskWidth;
    const startScale = teacherDeskScale;

    setResizingDesk(direction);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (direction === 'right') {
        const newWidth = Math.max(220, Math.min(580, Math.round(startWidth + deltaX)));
        onUpdateConfig({ teacherDeskWidth: newWidth });
      } else if (direction === 'left') {
        const newWidth = Math.max(220, Math.min(580, Math.round(startWidth - deltaX)));
        onUpdateConfig({ teacherDeskWidth: newWidth });
      } else if (direction === 'bottom') {
        const newScale = Math.max(75, Math.min(135, Math.round(startScale + deltaY * 0.8)));
        onUpdateConfig({ teacherDeskScale: newScale });
      }
    };

    const handlePointerUp = () => {
      setResizingDesk(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // State hỗ trợ Kéo - Thả trực tiếp Bàn Giáo Viên (Direct Drag-and-Drop)
  const [isDraggingDesk, setIsDraggingDesk] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragTargetZone, setDragTargetZone] = useState<TeacherDeskPosition | null>(null);
  const tier2Ref = useRef<HTMLDivElement>(null);
  const dragStartPosRef = useRef<{ clientX: number } | null>(null);
  const currentDragTargetZoneRef = useRef<TeacherDeskPosition | null>(null);

  // Tính toán vùng thả tương ứng với tọa độ chuột / chạm
  const calculateZoneFromClientX = (clientX: number): TeacherDeskPosition => {
    if (!tier2Ref.current) return 'center';
    const rect = tier2Ref.current.getBoundingClientRect();
    const safeX = Number.isFinite(clientX) ? clientX : 0;
    const relativeX = safeX - (rect?.left || 0);
    const containerWidth = rect?.width > 0 ? rect.width : 1000;
    const ratio = Math.max(0, Math.min(1, relativeX / containerWidth));

    if (ratio < 0.35) return 'left';
    if (ratio > 0.65) return 'right';
    return 'center';
  };

  // Xử lý kéo thả trực tiếp (Pointer Events: chuột trên máy tính + cảm ứng trên điện thoại)
  const handleDeskPointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    if (e.button !== undefined && e.button > 0) return;
    if ((e.target as HTMLElement).closest('button')) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const clientX = Number.isFinite(e.clientX) ? e.clientX : 0;
    dragStartPosRef.current = { clientX };
    currentDragTargetZoneRef.current = teacherDeskPosition;
    setIsDraggingDesk(true);
    setDragTargetZone(teacherDeskPosition);
  };

  const handleDeskPointerMove = (e: React.PointerEvent) => {
    if (!dragStartPosRef.current || !tier2Ref.current) return;

    const clientX = Number.isFinite(e.clientX) ? e.clientX : 0;
    const deltaX = clientX - dragStartPosRef.current.clientX;
    setDragOffset(deltaX);

    const newZone = calculateZoneFromClientX(clientX);
    currentDragTargetZoneRef.current = newZone;
    setDragTargetZone(newZone);
  };

  const handleDeskPointerUp = (e: React.PointerEvent) => {
    if (!dragStartPosRef.current) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const clientX = Number.isFinite(e.clientX) ? e.clientX : 0;
    const deltaX = Math.abs(clientX - dragStartPosRef.current.clientX);
    const target = currentDragTargetZoneRef.current || calculateZoneFromClientX(clientX);
    dragStartPosRef.current = null;
    currentDragTargetZoneRef.current = null;
    setIsDraggingDesk(false);
    setDragOffset(0);

    if (deltaX > 15 && target && target !== teacherDeskPosition) {
      onUpdateConfig({ teacherDeskPosition: target });
    }
    setDragTargetZone(null);
  };

  const handleDeskPointerCancel = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragStartPosRef.current = null;
    currentDragTargetZoneRef.current = null;
    setIsDraggingDesk(false);
    setDragOffset(0);
    setDragTargetZone(null);
  };

  // Thao tác chụm 2 ngón tay (Pinch-to-resize) trên Bàn Giáo Viên
  const handleDeskTouchStart = (e: React.TouchEvent) => {
    if (!isInteractive) return;
    if (e.touches.length === 2) {
      // Hủy kéo chuột/pointer đơn nếu đang chạm 2 ngón
      setIsDraggingDesk(false);
      setDragOffset(0);
      dragStartPosRef.current = null;

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      deskPinchStartDistRef.current = dist;
      deskPinchStartWidthRef.current = teacherDeskWidth;
      setIsPinchingDesk(true);
    }
  };

  const handleDeskTouchMove = (e: React.TouchEvent) => {
    if (!isInteractive || !deskPinchStartDistRef.current) return;
    if (e.touches.length === 2) {
      if (e.cancelable) e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / deskPinchStartDistRef.current;
      const rawWidth = deskPinchStartWidthRef.current * ratio;
      const clampedWidth = Math.round(Math.min(560, Math.max(220, rawWidth)) / 10) * 10;
      onUpdateConfig({ teacherDeskWidth: clampedWidth });
    }
  };

  const handleDeskTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      deskPinchStartDistRef.current = null;
      setIsPinchingDesk(false);
    }
  };

  // Render Component Bàn Giáo Viên 3D (Hỗ trợ kéo thả dời vị trí & kéo giãn kích thước trực tiếp)
  const renderTeacherDesk = () => (
    <div className="flex flex-col items-center gap-1.5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
      {/* Khối Bàn Giáo Viên 3D hỗ trợ chạm giữ kéo thả (Direct Drag-and-Drop) & co giãn trực tiếp */}
      <div
        onPointerDown={handleDeskPointerDown}
        onPointerMove={handleDeskPointerMove}
        onPointerUp={handleDeskPointerUp}
        onPointerCancel={handleDeskPointerCancel}
        onTouchStart={handleDeskTouchStart}
        onTouchMove={handleDeskTouchMove}
        onTouchEnd={handleDeskTouchEnd}
        onTouchCancel={handleDeskTouchEnd}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (isInteractive) setIsEditingLabel(true);
        }}
        style={{
          width: `${teacherDeskWidth}px`,
          maxWidth: '100%',
          transform: isDraggingDesk
            ? `translateX(${dragOffset}px) scale(${1.05 * (teacherDeskScale / 100)})`
            : `scale(${teacherDeskScale / 100})`,
          transformOrigin:
            teacherDeskPosition === 'left'
              ? 'left center'
              : teacherDeskPosition === 'center'
              ? 'center center'
              : 'right center',
          transition:
            isDraggingDesk || resizingDesk !== null
              ? 'none'
              : 'transform 0.3s ease-out, width 0.2s ease-out',
        }}
        className={`relative group touch-none select-none transition-all duration-300 ${
          isInteractive
            ? isDraggingDesk
              ? 'cursor-grabbing z-30 ring-4 ring-amber-400/80 shadow-2xl scale-105'
              : resizingDesk !== null
              ? 'z-30 ring-2 ring-amber-500/80 shadow-2xl'
              : 'cursor-grab hover:scale-105 active:scale-95'
            : 'cursor-default'
        }`}
        title={
          isInteractive
            ? 'Chạm giữ giữa bàn để di chuyển vị trí (Trái / Giữa / Phải) • Kéo các tay nắm ở mép bàn ↔ ↕ để chỉnh kích thước • Nhấp đúp chuột để đổi tên bàn'
            : undefined
        }
      >
        {/* Bong bóng chỉ dẫn kích thước thời gian thực khi đang kéo giãn trực tiếp */}
        {resizingDesk && (
          <div
            className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-black shadow-2xl border pointer-events-none animate-pulse z-50 flex items-center gap-1.5 ${
              isThemeDark
                ? 'bg-slate-950/95 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-slate-950/95 text-amber-300 border-amber-400/80 shadow-2xl'
            }`}
          >
            <span>📏</span>
            <span>Bàn: {teacherDeskWidth}px • {teacherDeskScale}%</span>
            <span className={`text-[10px] font-semibold ${isThemeDark ? 'text-emerald-200' : 'text-amber-200'}`}>
              ({seatingDimensionUtils.formatTeacherDesk(teacherDeskWidth, teacherDeskScale)})
            </span>
          </div>
        )}

        {/* Bong bóng chỉ dẫn khi đang chụm 2 ngón tay kéo giãn */}
        {isPinchingDesk && !resizingDesk && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-amber-950/95 text-amber-200 font-black text-xs shadow-xl border border-amber-400 pointer-events-none animate-pulse z-40 flex items-center gap-1.5">
            <span>🤏</span>
            <span>Bàn GV: {teacherDeskWidth}px</span>
            <span className="text-[10px] text-amber-300 font-semibold">({seatingDimensionUtils.formatTeacherDesk(teacherDeskWidth, teacherDeskScale)})</span>
          </div>
        )}

        {/* Bong bóng chỉ dẫn khi đang kéo bàn dời vị trí */}
        {isDraggingDesk && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-slate-900/90 text-amber-300 font-black text-[10px] shadow-lg border border-amber-400/50 pointer-events-none animate-bounce z-40">
            🎯 Thả vào: {dragTargetZone === 'left' ? '⬅ Trái' : dragTargetZone === 'center' ? '⏺ Giữa' : 'Phải ➡'}
          </div>
        )}

        {/* TAY NẮM CO GIÃN KÍCH THƯỚC TRỰC TIẾP (TÀNG HÌNH & THEME-AWARE: VÀNG ĐỒNG BAN NGÀY / DẠ QUANG BAN ĐÊM) */}
        {isInteractive && (
          <>
            {/* Tay nắm cạnh trái: Kéo ngang thu ngắn / kéo dài */}
            <div
              role="slider"
              aria-label="Kéo dài bàn sang trái"
              onPointerDown={(e) => handleDeskResizePointerDown(e, 'left')}
              className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-8 rounded-full border-2 shadow-md flex items-center justify-center cursor-ew-resize transition-all duration-300 z-30 select-none ${
                resizingDesk !== null
                  ? 'opacity-100 pointer-events-auto scale-110'
                  : 'opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
              } ${
                isThemeDark
                  ? 'bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857] border-[#a7f3d0] text-white shadow-[0_0_12px_rgba(16,185,129,0.9),0_0_20px_rgba(52,211,153,0.6)] ring-2 ring-emerald-300/80 animate-pulse'
                  : 'bg-gradient-to-b from-[#d97706] via-[#b45309] to-[#92400e] border-[#fef08a] text-[#fffbeb] shadow-[0_2px_8px_rgba(180,83,9,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-1 ring-amber-800'
              }`}
              title={
                isThemeDark
                  ? 'Dạ quang ban đêm • Kéo sang trái/phải để thu ngắn hoặc kéo dài bàn (Chiều dài)'
                  : 'Viền vàng đồng • Kéo sang trái/phải để thu ngắn hoặc kéo dài bàn (Chiều dài)'
              }
            >
              <span className="text-[10px] font-black pointer-events-none select-none drop-shadow-xs">↔</span>
            </div>

            {/* Tay nắm cạnh phải: Kéo ngang thu ngắn / kéo dài */}
            <div
              role="slider"
              aria-label="Kéo dài bàn sang phải"
              onPointerDown={(e) => handleDeskResizePointerDown(e, 'right')}
              className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-8 rounded-full border-2 shadow-md flex items-center justify-center cursor-ew-resize transition-all duration-300 z-30 select-none ${
                resizingDesk !== null
                  ? 'opacity-100 pointer-events-auto scale-110'
                  : 'opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
              } ${
                isThemeDark
                  ? 'bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857] border-[#a7f3d0] text-white shadow-[0_0_12px_rgba(16,185,129,0.9),0_0_20px_rgba(52,211,153,0.6)] ring-2 ring-emerald-300/80 animate-pulse'
                  : 'bg-gradient-to-b from-[#d97706] via-[#b45309] to-[#92400e] border-[#fef08a] text-[#fffbeb] shadow-[0_2px_8px_rgba(180,83,9,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-1 ring-amber-800'
              }`}
              title={
                isThemeDark
                  ? 'Dạ quang ban đêm • Kéo sang trái/phải để thu ngắn hoặc kéo dài bàn (Chiều dài)'
                  : 'Viền vàng đồng • Kéo sang trái/phải để thu ngắn hoặc kéo dài bàn (Chiều dài)'
              }
            >
              <span className="text-[10px] font-black pointer-events-none select-none drop-shadow-xs">↔</span>
            </div>

            {/* Tay nắm cạnh dưới: Kéo dọc độ rộng / to nhỏ */}
            <div
              role="slider"
              aria-label="Kéo độ rộng bàn"
              onPointerDown={(e) => handleDeskResizePointerDown(e, 'bottom')}
              className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-5 rounded-full border-2 shadow-md flex items-center justify-center cursor-ns-resize transition-all duration-300 z-30 select-none ${
                resizingDesk !== null
                  ? 'opacity-100 pointer-events-auto scale-110'
                  : 'opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
              } ${
                isThemeDark
                  ? 'bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857] border-[#a7f3d0] text-white shadow-[0_0_12px_rgba(16,185,129,0.9),0_0_20px_rgba(52,211,153,0.6)] ring-2 ring-emerald-300/80 animate-pulse'
                  : 'bg-gradient-to-b from-[#d97706] via-[#b45309] to-[#92400e] border-[#fef08a] text-[#fffbeb] shadow-[0_2px_8px_rgba(180,83,9,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-1 ring-amber-800'
              }`}
              title={
                isThemeDark
                  ? 'Dạ quang ban đêm • Kéo lên/xuống để co giãn độ rộng bàn (To ↕ Nhỏ)'
                  : 'Viền vàng đồng • Kéo lên/xuống để co giãn độ rộng bàn (To ↕ Nhỏ)'
              }
            >
              <span className="text-[10px] font-black pointer-events-none select-none drop-shadow-xs">↕</span>
            </div>
          </>
        )}

        {/* Bề mặt bàn giáo viên gỗ sồi viền vàng 3D - Tự thích ứng để chữ luôn trọn vẹn */}
        <div
          className={`w-full rounded-2xl bg-gradient-to-b from-[#fde68a] via-[#f59e0b] to-[#b45309] border-2 border-amber-700/80 shadow-lg flex items-center justify-between gap-1 sm:gap-2 text-amber-950 font-black text-xs select-none transition-all duration-300 hover:shadow-xl ${
            teacherDeskWidth < 280 ? 'px-2 py-1.5' : 'px-3 sm:px-4 py-2.5'
          }`}
        >
          {/* Cụm công cụ bên trái: Tay nắm kéo + Laptop (+ Sổ giáo án khi bàn đủ rộng) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {isInteractive && (
              <span
                className="text-amber-800/70 text-[10px] font-bold select-none tracking-tighter"
                title="Tay nắm kéo dời vị trí bàn"
              >
                ⋮⋮
              </span>
            )}
            <span className="text-sm sm:text-base filter drop-shadow-xs" title="Laptop giáo viên giảng dạy">
              💻
            </span>
            {teacherDeskWidth >= 300 && (
              <span className="text-sm sm:text-base filter drop-shadow-xs" title="Sổ điểm danh & giáo án điện tử">
                📋
              </span>
            )}
          </div>

          {/* Nhãn trung tâm hoặc ô input nhập tên bàn - ĐẢM BẢO KHÔNG CẮT CHỮ BÀN GIÁO VIÊN */}
          <div className="flex-1 min-w-0 flex items-center justify-center px-1 text-center">
            {isEditingLabel ? (
              <input
                type="text"
                autoFocus
                value={deskLabelInput}
                onChange={(e) => setDeskLabelInput(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => {
                  setIsEditingLabel(false);
                  const finalLabel = deskLabelInput.trim() || 'Bàn Giáo Viên';
                  onUpdateConfig({ teacherDeskLabel: finalLabel });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingLabel(false);
                    const finalLabel = deskLabelInput.trim() || 'Bàn Giáo Viên';
                    onUpdateConfig({ teacherDeskLabel: finalLabel });
                  } else if (e.key === 'Escape') {
                    setIsEditingLabel(false);
                    setDeskLabelInput(config.teacherDeskLabel || 'Bàn Giáo Viên');
                  }
                }}
                className="px-2 py-0.5 rounded-lg bg-white/95 text-amber-950 font-black text-xs border-2 border-amber-600 shadow-inner outline-none w-full max-w-[170px] text-center"
                placeholder="Nhập tên bàn..."
              />
            ) : (
              <span
                className={`font-black cursor-pointer hover:underline whitespace-nowrap select-none ${
                  teacherDeskWidth < 260
                    ? 'text-[11px] tracking-tight'
                    : teacherDeskWidth < 320
                    ? 'text-xs tracking-tight'
                    : 'text-xs sm:text-sm tracking-wide'
                }`}
                title={
                  isInteractive
                    ? 'Bấm đúp chuột để đổi nhãn tên bàn (ví dụ: Bàn Cô Lan)'
                    : undefined
                }
              >
                {config.teacherDeskLabel || 'Bàn Giáo Viên'}
              </span>
            )}
          </div>

          {/* Cụm trang trí bên phải: Lọ hoa (+ Tách trà khi bàn đủ rộng) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <span className="text-sm sm:text-base filter drop-shadow-xs" title="Lọ hoa trang trí bàn giáo viên">
              🌸
            </span>
            {teacherDeskWidth >= 330 && (
              <span className="text-xs filter drop-shadow-xs opacity-80" title="Tách trà / cà phê">
                ☕
              </span>
            )}
          </div>
        </div>

        {/* Chân bàn giáo viên & bóng đổ */}
        <div className="flex justify-between px-6 -mt-0.5">
          <div className="w-2.5 h-2.5 bg-amber-900 rounded-b-sm shadow-md"></div>
          <div className="w-2.5 h-2.5 bg-amber-900 rounded-b-sm shadow-md"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-4 relative w-full space-y-2 sm:space-y-3">
      {/* TẦNG 1 (PHÍA TRÊN): BÀN GIÁO VIÊN (TRÁI / GIỮA / PHẢI) */}
      <div
        ref={tier2Ref}
        className={`relative flex items-center w-full px-2 sm:px-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          teacherDeskPosition === 'left'
            ? 'justify-start pl-8 sm:pl-16 md:pl-20'
            : teacherDeskPosition === 'center'
            ? 'justify-center'
            : 'justify-end pr-8 sm:pr-16 md:pr-20'
        }`}
      >
        {/* VÙNG THẢ HƯỚNG DẪN 3 VỊ TRÍ KHI ĐANG KÉO THẢ */}
        {isDraggingDesk && (
          <div className="absolute inset-0 grid grid-cols-3 gap-2 sm:gap-4 pointer-events-none z-20 px-2 sm:px-4 animate-fadeIn">
            {/* Vùng Trái */}
            <div
              className={`rounded-2xl border-2 border-dashed flex items-center justify-center p-2 transition-all duration-200 ${
                dragTargetZone === 'left'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-950 font-black scale-[1.02] shadow-sm'
                  : 'border-slate-300/70 bg-slate-100/40 text-slate-400'
              }`}
            >
              <span className="text-[11px] font-bold">⬅ Vùng Trái</span>
            </div>

            {/* Vùng Giữa */}
            <div
              className={`rounded-2xl border-2 border-dashed flex items-center justify-center p-2 transition-all duration-200 ${
                dragTargetZone === 'center'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-950 font-black scale-[1.02] shadow-sm'
                  : 'border-slate-300/70 bg-slate-100/40 text-slate-400'
              }`}
            >
              <span className="text-[11px] font-bold">⏺ Vùng Giữa</span>
            </div>

            {/* Vùng Phải */}
            <div
              className={`rounded-2xl border-2 border-dashed flex items-center justify-center p-2 transition-all duration-200 ${
                dragTargetZone === 'right'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-950 font-black scale-[1.02] shadow-sm'
                  : 'border-slate-300/70 bg-slate-100/40 text-slate-400'
              }`}
            >
              <span className="text-[11px] font-bold">Vùng Phải ➡</span>
            </div>
          </div>
        )}

        <div className="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
          {renderTeacherDesk()}
        </div>
      </div>

      {/* TẦNG 2 (PHÍA DƯỚI): CỬA RA VÀO MŨI TÊN (HÌNH MŨI TÊN NHƯ SƠ ĐỒ 2D) */}
      <ClassroomDoor2D
        elementsConfig={config}
        onUpdateElementsConfig={onUpdateConfig}
        isInteractive={isInteractive}
      />
    </div>
  );
};
