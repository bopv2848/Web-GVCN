import React, { useState, useRef, useEffect } from 'react';

interface SeatingZoomControlProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onFitScreen?: () => void;
  onResetZoom?: () => void;
  variant?: 'toolbar' | 'floating';
}

export const PRESET_ZOOM_LEVELS = [
  { level: 55, label: '55% • Toàn cảnh siêu nhỏ' },
  { level: 70, label: '70% • Chuẩn sắp xếp vừa màn hình' },
  { level: 85, label: '85% • Gọn gàng rõ nét' },
  { level: 100, label: '100% • Kích thước mặc định' },
  { level: 115, label: '115% • Phóng to chi tiết' },
];

export const SeatingZoomControl: React.FC<SeatingZoomControlProps> = ({
  zoomLevel,
  onZoomChange,
  onFitScreen,
  onResetZoom,
  variant = 'toolbar',
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPresetsMenu(false);
      }
    };
    if (showPresetsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPresetsMenu]);

  const handleZoomIn = () => {
    onZoomChange(Math.min(130, zoomLevel + 10));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(50, zoomLevel - 10));
  };

  // 1. Giao diện Floating Widget (Ghim góc phải dưới màn hình)
  if (variant === 'floating') {
    return (
      <aside
        aria-label="Thanh điều khiển thu phóng nổi"
        className="fixed bottom-6 right-6 z-30 print:hidden select-none"
      >
        <div
          ref={menuRef}
          className="relative flex items-center gap-1.5 p-1.5 bg-slate-900/92 hover:bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all"
        >
          {/* Nút Thu Nhỏ */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 50}
            className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-200"
            title="Thu nhỏ sơ đồ 10% (để thấy trọn các dãy bàn)"
            aria-label="Thu nhỏ sơ đồ"
          >
            －
          </button>

          {/* Nút hiển thị % và mở danh sách mức thu phóng */}
          <button
            type="button"
            onClick={() => setShowPresetsMenu((prev) => !prev)}
            className="px-2.5 py-1 rounded-xl text-xs font-black bg-white/15 hover:bg-white/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-amber-300"
            title="Bấm để chọn mức thu phóng sẵn có"
          >
            <span>🔍</span>
            <span>{zoomLevel}%</span>
            <span className="text-[9px] opacity-70">▾</span>
          </button>

          {/* Nút Phóng To */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 130}
            className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-200"
            title="Phóng to sơ đồ 10%"
            aria-label="Phóng to sơ đồ"
          >
            ＋
          </button>

          {/* Nút Vừa Màn Hình */}
          {onFitScreen && (
            <button
              type="button"
              onClick={onFitScreen}
              className="px-2.5 py-1 rounded-xl text-xs font-black bg-sky-500/30 hover:bg-sky-500/50 text-sky-200 border border-sky-400/40 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              title="Tự động thu nhỏ vừa khít màn hình để dễ dàng kéo thả giữa các bàn xa"
            >
              <span>📐</span>
              <span className="hidden sm:inline">Vừa Màn Hình</span>
            </button>
          )}

          {/* Nút Khôi Phục 100% khi đang zoom khác 100% */}
          {zoomLevel !== 100 && onResetZoom && (
            <button
              type="button"
              onClick={onResetZoom}
              className="px-2 py-1 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 transition-all cursor-pointer"
              title="Khôi phục về kích thước chuẩn 100%"
            >
              100%
            </button>
          )}

          {/* Menu chọn nhanh các mức thu phóng (Dropdown Popover) */}
          {showPresetsMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-56 bg-slate-900/98 text-white rounded-2xl shadow-2xl border border-slate-700 py-1.5 z-50 backdrop-blur-md animate-fade-in">
              <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Mức Thu Phóng Sơ Đồ
              </div>
              <div className="p-1 space-y-0.5">
                {PRESET_ZOOM_LEVELS.map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => {
                      onZoomChange(item.level);
                      setShowPresetsMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      zoomLevel === item.level
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{item.label}</span>
                    {zoomLevel === item.level && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // 2. Giao diện tích hợp trên Toolbar (Thanh công cụ đầu trang)
  return (
    <div
      ref={menuRef}
      className="relative inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold shadow-2xs"
    >
      {/* Nút Thu Nhỏ */}
      <button
        type="button"
        onClick={handleZoomOut}
        disabled={zoomLevel <= 50}
        className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        title="Thu nhỏ sơ đồ 10%"
        aria-label="Thu nhỏ sơ đồ"
      >
        －
      </button>

      {/* Hiển thị % & Nút mở Dropdown */}
      <button
        type="button"
        onClick={() => setShowPresetsMenu((prev) => !prev)}
        className="px-2.5 py-1 rounded-xl text-xs font-black bg-white text-slate-850 hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
        title="Bấm để chọn mức thu phóng sẵn có"
      >
        <span>🔍</span>
        <span>{zoomLevel}%</span>
        <span className="text-[9px] text-slate-400">▾</span>
      </button>

      {/* Nút Phóng To */}
      <button
        type="button"
        onClick={handleZoomIn}
        disabled={zoomLevel >= 130}
        className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        title="Phóng to sơ đồ 10%"
        aria-label="Phóng to sơ đồ"
      >
        ＋
      </button>

      {/* Nút Vừa Màn Hình */}
      {onFitScreen && (
        <button
          type="button"
          onClick={onFitScreen}
          className="px-2.5 py-1.5 rounded-xl font-black bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          title="Thu nhỏ vừa vặn để thấy trọn vẹn toàn bộ các dãy bàn trên 1 màn hình"
        >
          <span>📐</span>
          <span className="hidden sm:inline">Vừa Màn Hình</span>
        </button>
      )}

      {/* Nút 100% Khôi phục */}
      {zoomLevel !== 100 && onResetZoom && (
        <button
          type="button"
          onClick={onResetZoom}
          className="px-2 py-1 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          title="Khôi phục về kích thước chuẩn 100%"
        >
          100%
        </button>
      )}

      {/* Menu chọn nhanh các mức thu phóng (Dropdown Popover) */}
      {showPresetsMenu && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Mức Thu Phóng Sơ Đồ
          </div>
          <div className="p-1 space-y-0.5">
            {PRESET_ZOOM_LEVELS.map((item) => (
              <button
                key={item.level}
                type="button"
                onClick={() => {
                  onZoomChange(item.level);
                  setShowPresetsMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                  zoomLevel === item.level
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{item.label}</span>
                {zoomLevel === item.level && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
