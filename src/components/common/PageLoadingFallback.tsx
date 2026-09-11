import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export const PageLoadingFallback: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full py-12 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu trang..." />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Hệ thống Quản trị Lớp học Web-GVCN
        </p>
      </div>
    </div>
  );
};
