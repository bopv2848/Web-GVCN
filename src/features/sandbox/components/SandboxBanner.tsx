import React, { useState } from 'react';
import { useSandbox } from '../hooks/useSandbox';

export const SandboxBanner: React.FC = () => {
  const {
    isCloudTest,
    isSandbox,
    disableCloudTest,
    resetCloudTest,
    disableSandbox,
    resetSandbox,
  } = useSandbox();

  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isCloudTest && !isSandbox) return null;

  if (isCollapsed) {
    return (
      <div
        className={`text-slate-950 px-3 py-1 text-xs font-black flex items-center justify-between shadow-xs border-b ${
          isCloudTest
            ? 'bg-amber-400 border-amber-500'
            : 'bg-indigo-400 border-indigo-500 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>{isCloudTest ? '☁️ ĐANG BẬT TEST SUPABASE' : '💻 ĐANG BẬT SANDBOX MÁY TÍNH'}</span>
          <span className="text-[10px] font-semibold bg-black/20 px-2 py-0.5 rounded">
            CSDL thật được bảo vệ an toàn 100%
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(false)}
          className="hover:underline text-[11px]"
        >
          Mở rộng chi tiết ▼
        </button>
      </div>
    );
  }

  // Chế độ Cloud Test Supabase
  if (isCloudTest) {
    return (
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-sm border-b border-amber-500 flex flex-wrap items-center justify-between gap-2 z-40 transition-all">
        <div className="flex items-center gap-2.5">
          <span className="text-base animate-bounce">☁️</span>
          <div>
            <span className="font-black uppercase tracking-wide">
              Chế độ Thử nghiệm Đám Mây (Supabase Test Class):
            </span>{' '}
            <span className="font-medium text-slate-900">
              Đang thao tác trên Lớp Test cách ly (is_demo = true). Dữ liệu Lớp 6A6 thật trên Supabase được bảo vệ an toàn 100%.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={async () => {
              if (window.confirm('Thầy có muốn làm mới lại danh sách học sinh và điểm mẫu của Lớp Thử Nghiệm trên Supabase không?')) {
                await resetCloudTest();
              }
            }}
            className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-slate-950 font-black rounded-lg transition-all text-[11px] border border-amber-600/40"
          >
            🔄 Tái tạo mẫu
          </button>
          <button
            onClick={disableCloudTest}
            className="px-2.5 py-1 bg-slate-900 text-white hover:bg-black font-black rounded-lg transition-all text-[11px] shadow-2xs"
          >
            Thoát Test (Về Lớp Thật)
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
  }

  // Chế độ Offline Sandbox máy tính
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white px-4 py-2 text-xs font-bold shadow-sm border-b border-indigo-700 flex flex-wrap items-center justify-between gap-2 z-40 transition-all">
      <div className="flex items-center gap-2.5">
        <span className="text-base animate-bounce">💻</span>
        <div>
          <span className="font-black uppercase tracking-wide">Sandbox Cục Bộ Máy Tính:</span>{' '}
          <span className="font-normal opacity-95">
            Dữ liệu giả lập lưu trong bộ nhớ máy tính. Không đồng bộ đám mây, an toàn 100%.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => {
            if (window.confirm('Thầy có muốn nạp lại 40 học sinh và 50+ điểm thi đua mẫu trên máy tính không?')) {
              resetSandbox();
            }
          }}
          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white font-black rounded-lg transition-all text-[11px] border border-white/30"
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
          className="text-white hover:text-slate-200 p-1 text-sm font-bold"
          title="Thu gọn dải băng"
          aria-label="Thu gọn"
        >
          ▲
        </button>
      </div>
    </div>
  );
};
