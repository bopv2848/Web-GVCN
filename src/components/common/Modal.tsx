import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  children: React.ReactNode;
  hideOnPrint?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  hideOnPrint = false,
  className = '',
}) => {
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
    '2xl': 'sm:max-w-3xl',
    '3xl': 'sm:max-w-4xl',
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchEndY - touchStartY.current;
      // Vuốt xuống > 70px trên thanh kéo/header để đóng modal trên di động
      if (deltaY > 70) {
        onClose();
      }
      touchStartY.current = null;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-print-hidden={hideOnPrint ? 'true' : undefined}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto ${
        hideOnPrint ? 'print:!hidden print:hidden' : ''
      } ${className}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl w-full max-w-full ${sizeClasses[size]} h-[92vh] max-h-[92vh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl border-t sm:border border-slate-200 my-0 sm:my-auto animate-slide-up overflow-hidden`}
      >
        {/* Mobile Drag Handle: Thanh kéo vuốt cảm ứng cho điện thoại */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="pt-2.5 pb-1 sm:hidden flex justify-center cursor-grab active:cursor-grabbing shrink-0 bg-white"
          data-testid="mobile-drag-handle"
          title="Kéo vuốt xuống để đóng"
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Modal Header cố định ở đầu */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex items-center justify-between px-5 py-3 sm:py-4 md:px-6 md:py-4.5 border-b border-slate-100 shrink-0 bg-white select-none"
        >
          <h2 className="text-base md:text-lg font-black text-slate-850 tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold transition-all cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Modal Body cuộn mượt mà với khoảng cách an toàn cạnh dưới */}
        <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1 overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
};
