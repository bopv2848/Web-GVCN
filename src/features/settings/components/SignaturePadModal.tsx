import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Khởi tạo Canvas khi mở modal
  useEffect(() => {
    if (isOpen) {
      setHasDrawn(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#1e3a8a'; // Màu mực xanh bút máy truyền thống
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }
  }, [isOpen]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    const mouseEvent = e as React.MouseEvent;
    return {
      x: (mouseEvent.clientX - rect.left) * scaleX,
      y: (mouseEvent.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }
  };

  const handleConfirmSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    // Chuyển sang định dạng PNG trong suốt (Transparent)
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ký Tay Trực Tiếp Bằng Ngón Tay / Chuột">
      <div className="space-y-4 text-xs">
        <p className="text-slate-600 text-[11px]">
          Thầy vui lòng ký tên vào khung giấy trắng dưới đây (màu mực xanh chuẩn học đường). Hỗ trợ cảm ứng trên điện thoại, máy tính bảng và chuột máy tính:
        </p>

        {/* Khung vẽ chữ ký */}
        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white p-2 flex justify-center items-center shadow-inner touch-none">
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            className="w-full h-44 bg-transparent cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium italic">
              ✍️ Ký tên của Thầy tại đây...
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasDrawn}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-40 cursor-pointer"
          >
            🗑️ Xóa nét vẽ
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmSave}
              disabled={!hasDrawn}
              className="text-xs font-black px-5 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              ✓ Áp Dụng Chữ Ký
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
