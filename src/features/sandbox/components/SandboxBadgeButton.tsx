import React, { useState } from 'react';
import { useSandbox } from '../hooks/useSandbox';
import { SandboxControlModal } from './SandboxControlModal';

export const SandboxBadgeButton: React.FC = () => {
  const { isSandbox } = useSandbox();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
          isSandbox
            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:shadow-amber-100/50'
            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
        }`}
        title={
          isSandbox
            ? 'Đang ở Chế độ Thử nghiệm (Dữ liệu giả lập an toàn). Bấm để tùy chỉnh hoặc thoát.'
            : 'Bấm để bật Chế độ Thử nghiệm (Sandbox Mode)'
        }
        aria-label="Điều khiển chế độ thử nghiệm"
      >
        <span className="text-sm">🧪</span>
        <span className="hidden sm:inline">
          {isSandbox ? 'Thử nghiệm' : 'Thử nghiệm'}
        </span>
        {isSandbox && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        )}
      </button>

      <SandboxControlModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
