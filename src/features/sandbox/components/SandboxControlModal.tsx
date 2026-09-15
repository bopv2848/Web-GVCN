import React from 'react';
import { useSandbox } from '../hooks/useSandbox';

interface SandboxControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SandboxControlModal: React.FC<SandboxControlModalProps> = ({ isOpen, onClose }) => {
  const { isSandbox, stats, enableSandbox, disableSandbox, resetSandbox, clearSandbox } = useSandbox();

  if (!isOpen) return null;

  const handleToggle = () => {
    if (isSandbox) {
      disableSandbox();
    } else {
      enableSandbox();
    }
  };

  const handleReset = () => {
    if (window.confirm('Thầy có chắc chắn muốn tái tạo lại toàn bộ 40 học sinh và 50+ điểm thi đua mẫu ban đầu không?')) {
      resetSandbox();
    }
  };

  const handleClear = () => {
    if (window.confirm('Thầy có chắc chắn muốn dọn sạch toàn bộ dữ liệu thử nghiệm khỏi trình duyệt không?')) {
      clearSandbox();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shadow-xs">
              🧪
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Chế Độ Thử Nghiệm (Sandbox)</h3>
              <p className="text-xs text-slate-500">Môi trường giả lập an toàn 100% trên trình duyệt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border ${
              isSandbox
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">Trạng thái hiện tại</span>
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  isSandbox ? 'bg-amber-200 text-amber-900 animate-pulse' : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                {isSandbox ? '● ĐANG BẬT SANDBOX' : '● DỮ LIỆU ĐÁM MÂY (SUPABASE)'}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed opacity-90">
              {isSandbox
                ? 'Mọi hành động thêm/sửa/xóa học sinh, cộng/trừ điểm và điểm danh chỉ diễn ra trong bộ nhớ máy tính này. Cơ sở dữ liệu thật trên Supabase được bảo vệ an toàn 100%.'
                : 'Hệ thống đang đồng bộ và lưu trữ trực tiếp với máy chủ Supabase Cloud. Dữ liệu thay đổi sẽ ảnh hưởng trực tiếp tới lớp học.'}
            </p>
          </div>

          {/* Stats Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
              Dữ liệu giả lập sẵn sàng ({stats.totalStudents > 0 ? 'Đã nạp' : 'Chưa nạp'}):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                <span className="block text-lg font-black text-primary">{stats.totalStudents}</span>
                <span className="text-[11px] font-semibold text-slate-500">Học sinh</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                <span className="block text-lg font-black text-amber-600">{stats.totalGroups}</span>
                <span className="text-[11px] font-semibold text-slate-500">Tổ học tập</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                <span className="block text-lg font-black text-emerald-600">{stats.totalPointTransactions}</span>
                <span className="text-[11px] font-semibold text-slate-500">Điểm thi đua</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                <span className="block text-lg font-black text-indigo-600">{stats.totalAttendanceSessions}</span>
                <span className="text-[11px] font-semibold text-slate-500">Buổi điểm danh</span>
              </div>
            </div>
            {stats.lastGeneratedAt && (
              <p className="mt-2 text-[10px] text-slate-400 text-center">
                Khởi tạo lần cuối: {new Date(stats.lastGeneratedAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleToggle}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
              isSandbox
                ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200'
                : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'
            }`}
          >
            <span>{isSandbox ? 'Thoát Chế Độ Thử Nghiệm (Về Dữ Liệu Thật)' : 'Kích Hoạt Chế Độ Thử Nghiệm Ngay'}</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleReset}
              className="py-2.5 px-3 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
            >
              🔄 Tái tạo dữ liệu mẫu
            </button>
            <button
              onClick={handleClear}
              className="py-2.5 px-3 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1.5"
            >
              🗑️ Dọn sạch bộ nhớ
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
