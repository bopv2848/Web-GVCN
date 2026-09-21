import React, { useState } from 'react';
import { useSandbox } from '../hooks/useSandbox';

interface SandboxControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SandboxControlModal: React.FC<SandboxControlModalProps> = ({ isOpen, onClose }) => {
  const {
    currentMode,
    isSandbox,
    stats,
    enableSandbox,
    disableSandbox,
    resetSandbox,
    clearSandbox,
    isCloudTest,
    cloudStats,
    enableCloudTest,
    disableCloudTest,
    resetCloudTest,
    clearCloudTest,
    refreshCloudStats,
  } = useSandbox();

  const [activeTab, setActiveTab] = useState<'cloud' | 'offline'>(
    isCloudTest ? 'cloud' : isSandbox ? 'offline' : 'cloud'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // --- THAO TÁC CLOUD TEST (SUPABASE) ---
  const handleToggleCloudTest = async () => {
    setIsProcessing(true);
    try {
      if (isCloudTest) {
        disableCloudTest();
        showFeedback('Đã thoát Chế độ Thử nghiệm Đám mây. Quay lại Dữ liệu Thật của lớp!');
      } else {
        await enableCloudTest();
        showFeedback('Đã kích hoạt Chế độ Thử nghiệm Đám mây (Supabase)!');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetCloudTest = async () => {
    if (
      !window.confirm(
        'Thầy có chắc chắn muốn TÁI TẠO lại dữ liệu mẫu (4 học sinh, 4 tổ, điểm thi đua) cho Lớp Thử Nghiệm trên Supabase không?'
      )
    ) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await resetCloudTest();
      showFeedback(res.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCloudTest = async () => {
    if (
      !window.confirm(
        'Thầy có chắc chắn muốn XÓA SẠCH toàn bộ học sinh và điểm thi đua của Lớp Thử Nghiệm trên Supabase để thử nhập danh sách mới không?'
      )
    ) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await clearCloudTest();
      showFeedback(res.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- THAO TÁC OFFLINE SANDBOX ---
  const handleToggleOfflineSandbox = () => {
    if (isSandbox) {
      disableSandbox();
      showFeedback('Đã tắt Sandbox máy tính. Quay lại Dữ liệu Thật!');
    } else {
      enableSandbox();
      showFeedback('Đã bật Sandbox cục bộ trên máy tính!');
    }
  };

  const handleResetOffline = () => {
    if (window.confirm('Thầy có muốn nạp lại 40 học sinh và 50+ điểm mẫu trên máy tính không?')) {
      resetSandbox();
      showFeedback('Đã nạp lại dữ liệu mẫu trên bộ nhớ máy tính!');
    }
  };

  const handleClearOffline = () => {
    if (window.confirm('Thầy có muốn dọn sạch bộ nhớ tạm trên máy tính không?')) {
      clearSandbox();
      showFeedback('Đã dọn sạch bộ nhớ tạm!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shadow-xs">
              🧪
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Quản Lý Môi Trường Dữ Liệu</h3>
              <p className="text-xs text-slate-500">Tách biệt an toàn dữ liệu Thử Nghiệm và Dữ Liệu Thật</p>
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

        {/* Notification Toast */}
        {feedbackMessage && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-bold text-center animate-in fade-in slide-in-from-top-1">
            {feedbackMessage}
          </div>
        )}

        {/* Tabs: Cloud Test vs Offline Sandbox */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`pb-3 px-4 text-xs font-black rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'cloud'
                ? 'border-amber-600 text-amber-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>☁️ Thử Nghiệm Đám Mây (Supabase)</span>
            {isCloudTest && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`pb-3 px-4 text-xs font-black rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'offline'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>💻 Sandbox Máy Tính (Offline)</span>
            {isSandbox && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* TAB 1: CLOUD TEST SUPABASE */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {/* Status Box */}
              <div
                className={`p-4 rounded-2xl border ${
                  isCloudTest
                    ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trạng thái kết nối Supabase
                  </span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                      isCloudTest
                        ? 'bg-amber-200 text-amber-900 animate-pulse border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {isCloudTest ? '● ĐANG BẬT TEST ĐÁM MÂY' : '● DỮ LIỆU CHÍNH THỨC (PROD)'}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed opacity-90">
                  {isCloudTest
                    ? 'Hệ thống đang trỏ vào Lớp Thử Nghiệm riêng biệt trên Supabase (ID: 77777777-...). Thầy có thể test đồng bộ thời gian thực (Realtime), quét mã QR phụ huynh trên điện thoại mà KHÔNG BAO GIỜ ảnh hưởng dữ liệu Lớp 6A6 thật!'
                    : 'Hệ thống đang hoạt động ở chế độ Vận hành Thực tế (Production). Mọi thao tác thêm/xóa/sửa học sinh và điểm danh sẽ áp dụng trực tiếp cho lớp chính thức.'}
                </p>
              </div>

              {/* Cloud Stats Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Số liệu Lớp Thử Nghiệm trên Supabase:
                  </h4>
                  <button
                    onClick={refreshCloudStats}
                    disabled={cloudStats.isLoading}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    {cloudStats.isLoading ? 'Đang tải...' : '🔄 Làm mới số liệu'}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="block text-lg font-black text-primary">
                      {cloudStats.totalStudents}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Học sinh test</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="block text-lg font-black text-amber-600">
                      {cloudStats.totalGroups}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Tổ học tập</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="block text-lg font-black text-emerald-600">
                      {cloudStats.totalPointTransactions}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Điểm thi đua</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="block text-lg font-black text-indigo-600">
                      {cloudStats.totalAttendanceSessions}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Buổi điểm danh</span>
                  </div>
                </div>
                {cloudStats.lastCheckedAt && (
                  <p className="mt-2 text-[10px] text-slate-400 text-center">
                    Cập nhật lúc: {new Date(cloudStats.lastCheckedAt).toLocaleTimeString('vi-VN')}
                  </p>
                )}
              </div>

              {/* Primary Button */}
              <button
                onClick={handleToggleCloudTest}
                disabled={isProcessing}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                  isCloudTest
                    ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'
                } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>
                  {isProcessing
                    ? 'Đang xử lý...'
                    : isCloudTest
                      ? 'Thoát Chế Độ Test (Về Dữ Liệu Thật 6A6)'
                      : 'Bật Thử Nghiệm Đám Mây (Supabase Test Class)'}
                </span>
              </button>

              {/* Reset / Clear Buttons for Cloud Test */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleResetCloudTest}
                  disabled={isProcessing}
                  className="py-2.5 px-3 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
                  title="Khôi phục lại danh sách 4 tổ và học sinh mẫu trên Supabase"
                >
                  🔄 Tái tạo dữ liệu mẫu
                </button>
                <button
                  onClick={handleClearCloudTest}
                  disabled={isProcessing}
                  className="py-2.5 px-3 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                  title="Xóa toàn bộ học sinh và điểm của lớp thử nghiệm để tự nhập Excel"
                >
                  🗑️ Xóa sạch dữ liệu test
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OFFLINE SANDBOX */}
          {activeTab === 'offline' && (
            <div className="space-y-4">
              {/* Status Box */}
              <div
                className={`p-4 rounded-2xl border ${
                  isSandbox
                    ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trạng thái bộ nhớ máy tính
                  </span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                      isSandbox
                        ? 'bg-indigo-200 text-indigo-900 animate-pulse border border-indigo-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSandbox ? '● ĐANG BẬT OFFLINE SANDBOX' : '● ĐANG TẮT'}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed opacity-90">
                  Dữ liệu được lưu trữ hoàn toàn trong LocalStorage của trình duyệt máy tính này. Không kết nối Supabase, không tốn dữ liệu mạng, hoạt động 100% ngay cả khi mất kết nối Internet.
                </p>
              </div>

              {/* Offline Stats */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  Dữ liệu trong bộ nhớ máy tính:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="block text-lg font-black text-indigo-600">
                      {stats.totalStudents}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Học sinh</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="block text-lg font-black text-amber-600">
                      {stats.totalGroups}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Tổ học tập</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="block text-lg font-black text-emerald-600">
                      {stats.totalPointTransactions}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Điểm thi đua</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="block text-lg font-black text-blue-600">
                      {stats.totalAttendanceSessions}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Buổi điểm danh</span>
                  </div>
                </div>
              </div>

              {/* Primary Button */}
              <button
                onClick={handleToggleOfflineSandbox}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                  isSandbox
                    ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                <span>
                  {isSandbox ? 'Tắt Sandbox Máy Tính (Về Mặc Định)' : 'Bật Sandbox Cục Bộ Trên Máy Tính'}
                </span>
              </button>

              {/* Reset / Clear Buttons for Offline */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleResetOffline}
                  className="py-2.5 px-3 bg-indigo-50 text-indigo-900 hover:bg-indigo-100 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  🔄 Nạp 40 học sinh mẫu
                </button>
                <button
                  onClick={handleClearOffline}
                  className="py-2.5 px-3 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  🗑️ Dọn sạch bộ nhớ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Chế độ hiện tại: <strong className="text-slate-700 capitalize">{currentMode}</strong>
          </span>
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
