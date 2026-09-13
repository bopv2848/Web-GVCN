import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
}) => {
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
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto"
    >
      <div
        className={`bg-white rounded-3xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 my-auto animate-slide-up overflow-hidden`}
      >
        {/* Modal Header cố định ở đầu */}
        <div className="flex items-center justify-between px-5 py-4 md:px-6 md:py-4.5 border-b border-slate-100 shrink-0 bg-white">
          <h2 className="text-base md:text-lg font-black text-slate-850 tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold transition-all cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Modal Body cuộn mượt mà */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
