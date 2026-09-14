import React, { useEffect, useState } from 'react';

interface AttendanceUndoToastProps {
  isVisible: boolean;
  message: string;
  durationSeconds?: number;
  onUndo: () => void;
  onDismiss: () => void;
}

export const AttendanceUndoToast: React.FC<AttendanceUndoToastProps> = ({
  isVisible,
  message,
  durationSeconds = 5,
  onUndo,
  onDismiss,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      return;
    }

    const intervalTime = 50; // cập nhật mỗi 50ms
    const step = (intervalTime / (durationSeconds * 1000)) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isVisible, durationSeconds]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-bounce-short shadow-2xl"
      role="alert"
      aria-live="assertive"
    >
      <div className="relative overflow-hidden bg-slate-900/95 text-white rounded-2xl border border-slate-700/60 p-3 sm:p-4 backdrop-blur-md flex items-center justify-between gap-3 sm:gap-4 shadow-xl">
        {/* Nội dung thông báo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white text-sm font-black shadow-xs">
            ⚡
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold truncate text-slate-100">{message}</p>
            <p className="text-[10px] text-slate-400 font-medium">Bấm Hoàn tác nếu Thầy chọn nhầm tổ</p>
          </div>
        </div>

        {/* Các nút tương tác */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Khôi phục trạng thái cũ của học sinh trong tổ"
          >
            <span>↩️</span>
            <span>Hoàn tác</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            ✕
          </button>
        </div>

        {/* Thanh tiến trình đếm ngược 5 giây */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-primary transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
