import React, { useState } from 'react';
import { useSandbox } from '../hooks/useSandbox';
import { SandboxControlModal } from './SandboxControlModal';

export const SandboxBadgeButton: React.FC = () => {
  const { isSandbox, isCloudTest } = useSandbox();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAnyTest = isSandbox || isCloudTest;

  const buttonStyle = isCloudTest
    ? 'bg-amber-50 text-amber-900 border-amber-400 hover:bg-amber-100 hover:shadow-amber-100/50'
    : isSandbox
      ? 'bg-indigo-50 text-indigo-900 border-indigo-400 hover:bg-indigo-100 hover:shadow-indigo-100/50'
      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900';

  const label = isCloudTest
    ? 'Cloud Test'
    : isSandbox
      ? 'Sandbox'
      : 'Thử nghiệm';

  const tooltip = isCloudTest
    ? 'Đang ở Chế độ Thử Nghiệm Đám Mây (Supabase Test Class). Bấm để tùy chỉnh hoặc thoát.'
    : isSandbox
      ? 'Đang ở Chế độ Sandbox Máy Tính (Dữ liệu giả lập an toàn). Bấm để tùy chỉnh hoặc thoát.'
      : 'Bấm để quản lý Môi trường Thử nghiệm (Supabase Cloud Test / Sandbox)';

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs ${buttonStyle}`}
        title={tooltip}
        aria-label="Điều khiển chế độ thử nghiệm"
      >
        <span className="text-sm">{isCloudTest ? '☁️' : '🧪'}</span>
        <span className="hidden sm:inline font-bold">
          {label}
        </span>
        {isAnyTest && (
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCloudTest ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isCloudTest ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
            ></span>
          </span>
        )}
      </button>

      <SandboxControlModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
