import React, { useState, useRef } from 'react';
import type { ClassroomElementsConfig, DoorPosition } from '../../../types/seating';

interface ClassroomDoor2DProps {
  elementsConfig?: ClassroomElementsConfig;
  onUpdateElementsConfig?: (updates: Partial<ClassroomElementsConfig>) => void;
  isInteractive?: boolean;
}

export interface ClassroomDoorArrowSVGProps {
  isPointingLeft: boolean;
  isMonochrome?: boolean;
  className?: string;
}

export const ClassroomDoorArrowSVG: React.FC<ClassroomDoorArrowSVGProps> = ({
  isPointingLeft,
  isMonochrome = false,
  className = 'w-32 sm:w-36 h-8 sm:h-9.5',
}) => {
  const strokeColor = isMonochrome ? '#000000' : '#0f172a';
  const textColor = isMonochrome ? 'fill-black' : 'fill-slate-950';
  const strokeWidth = isMonochrome ? '3' : '2.5';

  return (
    <svg
      viewBox="0 0 150 40"
      className={`${className} drop-shadow-xs transition-transform duration-200`}
      aria-label={`Mũi tên Cửa Ra Vào hướng ${isPointingLeft ? 'Trái' : 'Phải'}`}
    >
      {isPointingLeft ? (
        // MŨI TÊN CHỈ SANG TRÁI ⇦ (Đỉnh mũi tên bên trái, thân hình chữ nhật chứa chữ "Cửa ra vào")
        <g>
          <path
            d="M 2 20 L 26 3 L 26 10 L 148 10 L 148 30 L 26 30 L 26 37 Z"
            fill="#ffffff"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <text
            x="85"
            y="24.5"
            textAnchor="middle"
            className={`font-serif font-black text-sm select-none pointer-events-none ${textColor}`}
            style={{ fontFamily: "'Times New Roman', Times, Georgia, serif", letterSpacing: '0.2px' }}
          >
            Cửa ra vào
          </text>
        </g>
      ) : (
        // MŨI TÊN CHỈ SANG PHẢI ⇨
        <g>
          <path
            d="M 2 10 L 124 10 L 124 3 L 148 20 L 124 37 L 124 30 L 2 30 Z"
            fill="#ffffff"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <text
            x="65"
            y="24.5"
            textAnchor="middle"
            className={`font-serif font-black text-sm select-none pointer-events-none ${textColor}`}
            style={{ fontFamily: "'Times New Roman', Times, Georgia, serif", letterSpacing: '0.2px' }}
          >
            Cửa ra vào
          </text>
        </g>
      )}
    </svg>
  );
};

export const ClassroomDoor2D: React.FC<ClassroomDoor2DProps> = ({
  elementsConfig,
  onUpdateElementsConfig,
  isInteractive = true,
}) => {
  const doorPosition: DoorPosition = elementsConfig?.doorPosition || 'right';
  const doorAngle = elementsConfig?.doorAngle ?? 180;

  // Hướng mũi tên: Góc từ 90 đến 269 độ là hướng sang Trái (⇦), còn lại là hướng sang Phải (⇨)
  const isPointingLeft = doorAngle >= 90 && doorAngle < 270;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [dragTargetZone, setDragTargetZone] = useState<DoorPosition | null>(null);

  const dragStartPosRef = useRef<{ clientX: number } | null>(null);
  const currentDragTargetZoneRef = useRef<DoorPosition | null>(null);

  const calculateZoneFromClientX = (clientX: number, deltaX: number = 0): DoorPosition => {
    if (!containerRef.current) return doorPosition;
    const rect = containerRef.current.getBoundingClientRect();
    const safeX = Number.isFinite(clientX) ? clientX : 0;
    const relativeX = safeX - (rect?.left || 0);
    const containerWidth = rect?.width > 0 ? rect.width : 1000;
    const ratio = Math.max(0, Math.min(1, relativeX / containerWidth));

    if (doorPosition === 'left') {
      if (ratio > 0.4 || deltaX > 50) return 'right';
      return 'left';
    } else {
      if (ratio < 0.6 || deltaX < -50) return 'left';
      return 'right';
    }
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
    currentDragTargetZoneRef.current = doorPosition;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartPosRef.current) return;

    const clientX = Number.isFinite(e.clientX) ? e.clientX : 0;
    const deltaX = clientX - dragStartPosRef.current.clientX;

    if (!isDraggingRef.current && Math.abs(deltaX) > 5) {
      isDraggingRef.current = true;
      setIsDragging(true);
      setDragTargetZone(doorPosition);
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

    // Kéo thả rõ ràng sang vị trí đối diện
    if (wasDragging && absDeltaX > 25 && target !== doorPosition) {
      onUpdateElementsConfig?.({ doorPosition: target });
      return;
    }

    // Nhấp chuột tại chỗ (không kéo) -> Xoay đổi chiều mũi tên
    if (!wasDragging && absDeltaX <= 5) {
      const newAngle = isPointingLeft ? 0 : 180;
      onUpdateElementsConfig?.({ doorAngle: newAngle });
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

  const handleRotateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInteractive || !onUpdateElementsConfig) return;
    const newAngle = isPointingLeft ? 0 : 180;
    onUpdateElementsConfig({ doorAngle: newAngle });
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center w-full px-2 sm:px-6 min-h-[44px] transition-all duration-300 ease-out select-none ${
        doorPosition === 'left' ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* VÙNG THẢ HƯỚNG DẪN 2 BÊN KHI ĐANG KÉO THẢ CỬA RA VÀO */}
      {isDragging && (
        <div className="absolute inset-0 grid grid-cols-2 gap-3 sm:gap-6 pointer-events-none z-20 px-2 sm:px-6 animate-fadeIn">
          {/* Vùng Hành lang Trái */}
          <div
            className={`rounded-2xl border-2 border-dashed flex items-center justify-center p-2 transition-all duration-150 ${
              dragTargetZone === 'left'
                ? 'border-sky-500 bg-sky-500/20 text-sky-950 font-black scale-[1.01] shadow-xs'
                : 'border-slate-300 bg-slate-100/60 text-slate-400 font-semibold'
            }`}
          >
            <span className="text-[11px] sm:text-xs">🚪 Thả vào đây: Cửa Hành lang Trái</span>
          </div>

          {/* Vùng Hành lang Phải */}
          <div
            className={`rounded-2xl border-2 border-dashed flex items-center justify-center p-2 transition-all duration-150 ${
              dragTargetZone === 'right'
                ? 'border-sky-500 bg-sky-500/20 text-sky-950 font-black scale-[1.01] shadow-xs'
                : 'border-slate-300 bg-slate-100/60 text-slate-400 font-semibold'
            }`}
          >
            <span className="text-[11px] sm:text-xs">Thả vào đây: Cửa Hành lang Phải 🚪</span>
          </div>
        </div>
      )}

      {/* KHỐI MŨI TÊN CỬA RA VÀO KÉO THẢ TRỰC TIẾP */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        tabIndex={isInteractive ? 0 : undefined}
        role="button"
        aria-label={`Cửa ra vào đang ở bên ${doorPosition === 'left' ? 'Trái' : 'Phải'}`}
        onKeyDown={(e) => {
          if (!isInteractive || !onUpdateElementsConfig) return;
          if (e.key === 'ArrowLeft' && doorPosition !== 'left') {
            e.preventDefault();
            onUpdateElementsConfig({ doorPosition: 'left' });
          } else if (e.key === 'ArrowRight' && doorPosition !== 'right') {
            e.preventDefault();
            onUpdateElementsConfig({ doorPosition: 'right' });
          } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onUpdateElementsConfig({ doorAngle: isPointingLeft ? 0 : 180 });
          }
        }}
        style={{
          transform: isDragging ? `translateX(${dragOffset}px) scale(1.05)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        className={`relative group touch-none select-none transition-all duration-150 ${
          isInteractive
            ? isDragging
              ? 'cursor-grabbing z-30 drop-shadow-xl ring-2 ring-sky-400/80 rounded-lg'
              : 'cursor-grab hover:scale-105 active:scale-95'
            : 'cursor-default'
        }`}
        title={
          isInteractive
            ? `Cửa Ra Vào (${
                doorPosition === 'left' ? 'Hành lang Trái' : 'Hành lang Phải'
              }): Kéo thả sang Trái / Phải để đổi vị trí • Nhấp chuột để xoay đổi chiều mũi tên`
            : undefined
        }
      >
        <ClassroomDoorArrowSVG isPointingLeft={isPointingLeft} />

        {/* Nút xoay nhanh nhỏ ở góc */}
        {isInteractive && (
          <button
            type="button"
            onClick={handleRotateClick}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-700 shadow-xs hover:bg-slate-100 hover:text-black cursor-pointer opacity-80 hover:opacity-100"
            title="Đổi chiều mũi tên (Trái ⇦ ↔ Phải ⇨)"
            aria-label="Xoay hướng mũi tên"
          >
            🔄
          </button>
        )}
      </div>
    </div>
  );
};
