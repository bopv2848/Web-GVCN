import React, { useState } from 'react';
import { useSandbox } from '../hooks/useSandbox';

export const SandboxBanner: React.FC = () => {
  const { isSandbox, disableSandbox, resetSandbox } = useSandbox();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isSandbox) return null;

  if (isCollapsed) {
    return (
      <div className="bg-amber-500 text-slate-900 px-3 py-1 text-xs font-black flex items-center justify-between shadow-xs border-b border-amber-600">
        <div className="flex items-center gap-2">
          <span>🧪 ĐANG BẬT CHẾ ĐỘ THỬ NGHIỆM</span>
          <span className="text-[10px] font-semibold bg-amber-600 text-white px-2 py-0.5 rounded">
            CSDL an toàn
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(false)}
          className="text-slate-900 hover:text-white underline text-[11px]"
        >
          Mở rộng chi tiết ▼
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 px-4 py-2 text-xs font-bold shadow-sm border-b border-amber-500 flex flex-wrap items-center justify-between gap-2 z-40 transition-all">
      <div className="flex items-center gap-2.5">
        <span className="text-base animate-bounce">🧪</span>
        <div>
          <span className="font-black uppercase tracking-wide">Chế độ thử nghiệm an toàn:</span>{' '}
          <span className="font-medium">
            Đang sử dụng dữ liệu 40 học sinh & 50+ điểm giả lập. Dữ liệu thật trên Supabase được bảo vệ 100%.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => {
            if (window.confirm('Thầy có muốn làm mới lại dữ liệu học sinh và điểm thi đua mẫu không?')) {
              resetSandbox();
            }
          }}
          className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-slate-950 font-black rounded-lg transition-all text-[11px] border border-amber-600/40"
        >
          🔄 Tái tạo mẫu
        </button>
        <button
          onClick={disableSandbox}
          className="px-2.5 py-1 bg-slate-900 text-white hover:bg-black font-black rounded-lg transition-all text-[11px] shadow-2xs"
        >
          Thoát Sandbox
        </button>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-slate-800 hover:text-black p-1 text-sm font-bold"
          title="Thu gọn dải băng"
          aria-label="Thu gọn"
        >
          ▲
        </button>
      </div>
    </div>
  );
};
