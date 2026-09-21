import React from 'react';
import type { SpinHistoryItem } from './PresentationSidePanel';

export interface CalledStudentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: SpinHistoryItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  totalStudents?: number;
  onAwardPoints?: (
    studentId: string,
    studentName: string,
    points: number,
    reason: string
  ) => Promise<void> | void;
}

export const CalledStudentsDrawer: React.FC<CalledStudentsDrawerProps> = ({
  isOpen,
  onClose,
  historyItems,
  onRemoveItem,
  onClearAll,
  totalStudents,
  onAwardPoints,
}) => {
  const [awardingKey, setAwardingKey] = React.useState<string | null>(null);

  const handleQuickPoints = async (
    item: SpinHistoryItem,
    points: number,
    reason: string
  ) => {
    if (!onAwardPoints) return;
    const key = `${item.id}-${points}`;
    setAwardingKey(key);
    try {
      await onAwardPoints(item.studentId, item.studentName, points, reason);
    } finally {
      setTimeout(() => {
        setAwardingKey((prev) => (prev === key ? null : prev));
      }, 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Danh sách học sinh đã bốc thăm phát biểu"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Khung trượt chính từ bên phải */}
      <div
        className="w-full max-w-md h-full bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-slide-in-right z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-base shadow-xs">
              🎙️
            </span>
            <div>
              <h3 className="font-black text-sm text-white tracking-wide flex items-center gap-1.5">
                <span>ĐÃ BỐC THĂM</span>
                <span className="px-2 py-0.2 rounded-full text-[11px] bg-emerald-500 text-slate-950 font-black">
                  {historyItems.length}
                  {totalStudents ? ` / ${totalStudents}` : ''}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Danh sách các em đã lên bảng trong buổi học
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-black text-sm cursor-pointer"
            title="Đóng bảng trượt"
            aria-label="Đóng bảng trượt"
          >
            ✕
          </button>
        </div>

        {/* 2. Danh sách học sinh theo dòng thời gian */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {historyItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl">
                🎲
              </div>
              <p className="text-xs font-bold text-slate-400">
                Chưa có học sinh nào được bốc thăm trong tiết này
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Khi Thầy bấm Vòng Quay Bốc Thăm, tên các em sẽ tự động xuất hiện tại đây.
              </p>
            </div>
          ) : (
            historyItems.map((item, index) => {
              const displayName = item.studentName || 'Học sinh';
              const nameParts = displayName.trim().split(/\s+/);
              const initials =
                nameParts.length >= 2
                  ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
                  : displayName.slice(0, 2);

              return (
                <div
                  key={item.id}
                  className="group flex flex-col p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all shadow-xs"
                >
                  {/* Hàng 1: Số thứ tự + Avatar + Tên + Vị trí + Giờ & Nút gỡ */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] font-mono font-black text-slate-500 w-5 text-right shrink-0">
                        #{historyItems.length - index}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs uppercase">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate group-hover:text-emerald-300 transition-colors">
                          {displayName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-medium">
                          {item.aisleName && item.deskNumber && (
                            <span>
                              Dãy {item.aisleName} • Bàn {item.deskNumber}
                            </span>
                          )}
                          {item.groupName && (
                            <span className="px-1.5 py-0.2 rounded-md bg-slate-900 border border-slate-700/80 text-amber-300 font-bold text-[9.5px]">
                              {item.groupName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cột phải: Giờ bốc trúng + Nút xóa riêng lẻ */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
                        {item.time || '--:--'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer flex items-center justify-center text-xs"
                        title="Gỡ bạn này khỏi danh sách để có thể được bốc thăm lại"
                        aria-label={`Gỡ ${displayName} khỏi danh sách đã gọi`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Hàng 2: Thanh Thưởng/Trừ điểm nhanh trực tiếp */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    {/* Trạng thái điểm tích lũy */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.awardedPoints && item.awardedPoints !== 0 ? (
                        <span
                          className={`px-2 py-0.5 rounded-lg font-black text-[10.5px] flex items-center gap-1 border animate-scale-in ${
                            item.awardedPoints > 0
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          <span>{item.awardedPoints > 0 ? '⭐ +' : '⚠️ '}</span>
                          <span>{item.awardedPoints}đ</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Chưa có điểm</span>
                      )}
                    </div>

                    {/* Cụm nút bấm cộng/trừ điểm */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Nút -1đ (Nhắc nhở) */}
                      <button
                        type="button"
                        disabled={!onAwardPoints || awardingKey === `${item.id}--1`}
                        onClick={() => handleQuickPoints(item, -1, 'Nhắc nhở trong tiết học')}
                        className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 text-rose-400 hover:text-rose-200 border border-rose-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 active:scale-95"
                        title="Trừ 1 điểm (Nhắc nhở nề nếp)"
                      >
                        <span>-1đ</span>
                      </button>

                      {/* Nút +1đ (Phát biểu) */}
                      <button
                        type="button"
                        disabled={!onAwardPoints || awardingKey === `${item.id}-1`}
                        onClick={() => handleQuickPoints(item, 1, 'Phát biểu xây dựng bài')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 active:bg-emerald-500/40 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50 active:scale-95"
                        title="Thưởng +1 điểm (Phát biểu xây dựng bài)"
                      >
                        <span>+1đ</span>
                      </button>

                      {/* Nút +2đ (Xuất sắc) */}
                      <button
                        type="button"
                        disabled={!onAwardPoints || awardingKey === `${item.id}-2`}
                        onClick={() => handleQuickPoints(item, 2, 'Câu trả lời xuất sắc')}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/25 to-yellow-500/25 hover:from-amber-500/35 hover:to-yellow-500/35 text-amber-300 hover:text-white border border-amber-500/40 text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50 active:scale-95"
                        title="Thưởng +2 điểm (Câu trả lời xuất sắc / Giải bài khó)"
                      >
                        <span>+2đ</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 3. Footer Drawer: Các thao tác nhóm */}
        {historyItems.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-2 rounded-xl text-xs font-black text-rose-400 hover:text-white hover:bg-rose-600/30 border border-rose-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Xóa toàn bộ danh sách để bắt đầu vòng bốc thăm mới"
            >
              <span>🔄</span>
              <span>Làm mới tất cả ({historyItems.length})</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
