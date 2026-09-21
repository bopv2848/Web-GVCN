import React, { useState, useRef, useEffect } from 'react';
import type { ClassroomElementsConfig, TeacherDeskPosition } from '../../../types/seating';

interface TeacherDesk2DProps {
  elementsConfig?: ClassroomElementsConfig;
  onUpdateElementsConfig?: (updates: Partial<ClassroomElementsConfig>) => void;
  isInteractive?: boolean;
}

export const TeacherDesk2D: React.FC<TeacherDesk2DProps> = ({
  elementsConfig,
  onUpdateElementsConfig,
  isInteractive = true,
}) => {
  const currentPosition: TeacherDeskPosition = elementsConfig?.teacherDeskPosition || 'right';
  const deskLabel = elementsConfig?.teacherDeskLabel || 'Bàn Giáo Viên';

  const [isEditingLabel, setIsEditingLabel] = useState<boolean>(false);
  const [labelInput, setLabelInput] = useState<string>(deskLabel);

  useEffect(() => {
    setLabelInput(deskLabel);
  }, [deskLabel]);

  const handleSaveLabel = () => {
    setIsEditingLabel(false);
    const trimmed = labelInput.trim();
    if (trimmed && trimmed !== deskLabel) {
      onUpdateElementsConfig?.({ teacherDeskLabel: trimmed });
    } else {
      setLabelInput(deskLabel);
    }
  };

  const handleCancelLabel = () => {
    setIsEditingLabel(false);
    setLabelInput(deskLabel);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [dragTargetZone, setDragTargetZone] = useState<TeacherDeskPosition | null>(null);

  const dragStartPosRef = useRef<{ clientX: number } | null>(null);
  const currentDragTargetZoneRef = useRef<TeacherDeskPosition | null>(null);

  const calculateZoneFromClientX = (clientX: number, deltaX: number = 0): TeacherDeskPosition => {
    if (!containerRef.current) return currentPosition;
    const rect = containerRef.current.getBoundingClientRect();
    const safeX = Number.isFinite(clientX) ? clientX : 0;
    const relativeX = safeX - (rect?.left || 0);
    const containerWidth = rect?.width > 0 ? rect.width : 1000;
    const ratio = Math.max(0, Math.min(1, relativeX / containerWidth));

    // Tính toán vùng thả nhạy bén kết hợp cả vị trí chuột và quãng đường dịch chuyển (deltaX)
    if (currentPosition === 'left') {
      if (ratio > 0.65 || deltaX > containerWidth * 0.45) return 'right';
      if (ratio > 0.25 || deltaX > 50) return 'center';
      return 'left';
    }
    if (currentPosition === 'right') {
      if (ratio < 0.35 || deltaX < -containerWidth * 0.45) return 'left';
      if (ratio < 0.75 || deltaX < -50) return 'center';
      return 'right';
    }
    // currentPosition === 'center'
    if (ratio < 0.35 || deltaX < -60) return 'left';
    if (ratio > 0.65 || deltaX > 60) return 'right';
    return 'center';
  };

  const handlePointerDown = (e: React.PointerEvent) => {
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
    isDraggingRef.current = false;
    currentDragTargetZoneRef.current = currentPosition;
    setDragTargetZone(currentPosition);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartPosRef.current || !containerRef.current) return;

    const clientX = Number.isFinite(e.clientX) ? e.clientX : 0;
    const deltaX = clientX - dragStartPosRef.current.clientX;

    if (!isDraggingRef.current && Math.abs(deltaX) > 5) {
      isDraggingRef.current = true;
      setIsDragging(true);
      setDragTargetZone(currentPosition);
    }

    if (isDraggingRef.current) {
      setDragOffset(deltaX);
      const newZone = calculateZoneFromClientX(clientX, deltaX);
      currentDragTargetZoneRef.current = newZone;
      setDragTargetZone(newZone);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartPosRef.current) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const clientX = Number.isFinite(e.clientX) ? e.clientX : 0;
    const deltaX = clientX - dragStartPosRef.current.clientX;
    const absDeltaX = Math.abs(deltaX);
    const target = currentDragTargetZoneRef.current || calculateZoneFromClientX(clientX, deltaX);
    const wasDragging = isDraggingRef.current;

    dragStartPosRef.current = null;
    isDraggingRef.current = false;
    currentDragTargetZoneRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
    setDragTargetZone(null);

    if (wasDragging && absDeltaX > 20 && target && target !== currentPosition) {
      onUpdateElementsConfig?.({ teacherDeskPosition: target });
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragStartPosRef.current = null;
    isDraggingRef.current = false;
    currentDragTargetZoneRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
    setDragTargetZone(null);
  };

  const handleMoveLeft = () => {
    if (!isInteractive || !onUpdateElementsConfig) return;
    if (currentPosition === 'right') {
      onUpdateElementsConfig({ teacherDeskPosition: 'center' });
    } else if (currentPosition === 'center') {
      onUpdateElementsConfig({ teacherDeskPosition: 'left' });
    }
  };

  const handleMoveRight = () => {
    if (!isInteractive || !onUpdateElementsConfig) return;
    if (currentPosition === 'left') {
      onUpdateElementsConfig({ teacherDeskPosition: 'center' });
    } else if (currentPosition === 'center') {
      onUpdateElementsConfig({ teacherDeskPosition: 'right' });
    }
  };

  return (
    <div className="w-full space-y-2.5">
      {/* VÙNG CHỨA BÀN GIÁO VIÊN & CÁC VÙNG THẢ HƯỚNG DẪN */}
      <div
        ref={containerRef}
        className={`relative flex items-center w-full px-2 sm:px-6 transition-all duration-300 ease-out min-h-[58px] ${
          currentPosition === 'left'
            ? 'justify-start'
            : currentPosition === 'center'
            ? 'justify-center'
            : 'justify-end'
        }`}
      >
        {/* VÙNG THẢ HƯỚNG DẪN 3 VỊ TRÍ KHI ĐANG KÉO THẢ CHUỘT / CẢM ỨNG */}
        {isDragging && (
          <div className="absolute inset-0 grid grid-cols-3 gap-2 sm:gap-4 pointer-events-none z-20 px-2 sm:px-6 animate-fadeIn">
            {/* Vùng Trái */}
            <div
              className={`rounded-2xl border-2 border-dashed flex items-center justify-center p-2 transition-all duration-150 ${
                dragTargetZone === 'left'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-950 font-black scale-[1.02] shadow-sm'
                  : 'border-slate-300 bg-slate-100/60 text-slate-400 font-semibold'
              }`}
            >
              <span className="text-[11px] sm:text-xs">⬅ Vùng Bên Trái</span>
            </div>

            {/* Vùng Giữa */}
            <div
              className={`rounded-2xl border-2 border-dashed flex items-center justify-center p-2 transition-all duration-150 ${
                dragTargetZone === 'center'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-950 font-black scale-[1.02] shadow-sm'
                  : 'border-slate-300 bg-slate-100/60 text-slate-400 font-semibold'
              }`}
            >
              <span className="text-[11px] sm:text-xs">⏺ Vùng Ở Giữa</span>
            </div>

            {/* Vùng Phải */}
            <div
              className={`rounded-2xl border-2 border-dashed flex items-center justify-center p-2 transition-all duration-150 ${
                dragTargetZone === 'right'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-950 font-black scale-[1.02] shadow-sm'
                  : 'border-slate-300 bg-slate-100/60 text-slate-400 font-semibold'
              }`}
            >
              <span className="text-[11px] sm:text-xs">Vùng Bên Phải ➡</span>
            </div>
          </div>
        )}

        {/* KHỐI BÀN GIÁO VIÊN TƯƠNG TÁC (KÉO THẢ HOẶC BẤM MŨI TÊN CHUYỂN HƯỚNG) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          tabIndex={isInteractive ? 0 : undefined}
          role="region"
          aria-label={`Bàn Giáo Viên đang ở ${
            currentPosition === 'left' ? 'Bên Trái' : currentPosition === 'center' ? 'Ở Giữa' : 'Bên Phải'
          }`}
          onKeyDown={(e) => {
            if (!isInteractive || !onUpdateElementsConfig) return;
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              handleMoveLeft();
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              handleMoveRight();
            }
          }}
          style={{
            transform: isDragging ? `translateX(${dragOffset}px) scale(1.04)` : undefined,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          className={`touch-none select-none rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-between gap-2 shadow-xs transition-all ${
            isInteractive
              ? isDragging
                ? 'cursor-grabbing z-30 ring-4 ring-amber-400/80 shadow-2xl'
                : 'cursor-grab hover:shadow-md hover:border-amber-400 active:scale-95'
              : 'cursor-default'
          } py-1.5 px-2.5 sm:px-3 min-w-[210px] sm:min-w-[240px]`}
          title={
            isInteractive
              ? 'Chạm giữ để kéo Bàn Giáo Viên sang Trái / Giữa / Phải hoặc bấm nút mũi tên ◀ ▶'
              : undefined
          }
        >
          {/* Nút mũi tên sang Trái */}
          {isInteractive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveLeft();
              }}
              disabled={currentPosition === 'left'}
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                currentPosition === 'left'
                  ? 'opacity-25 cursor-not-allowed bg-slate-200/50 text-slate-400'
                  : 'bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 cursor-pointer shadow-2xs font-black'
              }`}
              title={
                currentPosition === 'left'
                  ? 'Bàn Giáo Viên đã ở ngoài cùng bên trái'
                  : 'Bấm để di chuyển Bàn Giáo Viên sang Trái (◀)'
              }
              aria-label="Di chuyển Bàn Giáo Viên sang trái"
            >
              ◀
            </button>
          )}

          {/* Biểu tượng & Nhãn Bàn Giáo Viên (Hỗ trợ Nhấp đúp chuột để sửa nhanh) */}
          <div
            className="flex items-center gap-1.5 px-1 flex-1 justify-center min-w-0"
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (isInteractive) setIsEditingLabel(true);
            }}
          >
            <span className="text-base sm:text-lg shrink-0">👩‍🏫</span>
            {isEditingLabel ? (
              <input
                type="text"
                autoFocus
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onBlur={handleSaveLabel}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') handleSaveLabel();
                  if (e.key === 'Escape') handleCancelLabel();
                }}
                className="px-2 py-0.5 text-xs font-black rounded-lg border-2 border-amber-500 bg-white text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400 w-32 sm:w-36 text-center shadow-xs"
                placeholder="Nhập tên bàn..."
                aria-label="Nhập tên Bàn Giáo Viên"
              />
            ) : (
              <div
                className="text-center group/label cursor-pointer"
                title="Nhấp đúp chuột để đổi nhanh tên Bàn Giáo Viên"
              >
                <div className="font-black text-xs text-amber-950 whitespace-nowrap flex items-center justify-center gap-1">
                  <span>{deskLabel}</span>
                  {isInteractive && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingLabel(true);
                      }}
                      className="opacity-0 group-hover/label:opacity-100 hover:scale-125 transition-all text-[10px] text-amber-600 cursor-pointer"
                      title="Sửa tên nhanh"
                    >
                      ✏️
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-amber-800 font-bold whitespace-nowrap">
                  {currentPosition === 'left'
                    ? '(Bên Trái)'
                    : currentPosition === 'center'
                    ? '(Ở Giữa)'
                    : '(Bên Phải)'}
                </div>
              </div>
            )}
          </div>

          {/* Nút mũi tên sang Phải */}
          {isInteractive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveRight();
              }}
              disabled={currentPosition === 'right'}
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                currentPosition === 'right'
                  ? 'opacity-25 cursor-not-allowed bg-slate-200/50 text-slate-400'
                  : 'bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 cursor-pointer shadow-2xs font-black'
              }`}
              title={
                currentPosition === 'right'
                  ? 'Bàn Giáo Viên đã ở ngoài cùng bên phải'
                  : 'Bấm để di chuyển Bàn Giáo Viên sang Phải (▶)'
              }
              aria-label="Di chuyển Bàn Giáo Viên sang phải"
            >
              ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
