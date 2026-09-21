import React from 'react';
import { Button } from '../../../components/common/Button';
import { getSoundSettings, setMasterVolume, setSoundMuted } from '../../../utils/soundNotification';

export interface PresentationHudProps {
  cleanClassName?: string;
  viewMode: '2d' | '3d';
  onToggleViewMode: (mode: '2d' | '3d') => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onFitScreen: () => void;
  onResetZoom: () => void;
  onExitFullscreen: () => void;
  isSpinning?: boolean;
  onStartSpin?: (mode?: 'single' | 'pair' | 'group4' | 'battle') => void;
  isTimerOpen?: boolean;
  onToggleTimer?: () => void;
  isSplitMode?: boolean;
  onToggleSplitMode?: () => void;
  pickMode?: 'single' | 'pair' | 'group4' | 'battle';
  onPickModeChange?: (mode: 'single' | 'pair' | 'group4' | 'battle') => void;
  autoResetOnModeChange?: boolean;
  onToggleAutoResetOnModeChange?: () => void;
  filterGroup?: string;
  onFilterGroupChange?: (group: string) => void;
  filterGender?: string;
  onFilterGenderChange?: (gender: string) => void;
  excludeCalled?: boolean;
  onToggleExcludeCalled?: () => void;
  calledCount?: number;
  onClearSpinHistory?: () => void;
  onOpenCalledDrawer?: () => void;
  onResetView?: () => void;
  eligibleCount?: number;
  eligibleSingleCount?: number;
  eligiblePairCount?: number;
  eligibleGroup4Count?: number;
  eligibleBattleCount?: number;
  groupsList?: string[];
  isRemoteConnected?: boolean;
  onOpenRemotePairing?: () => void;
  isLargeText?: boolean;
  onToggleLargeText?: () => void;
}

export const PresentationHud: React.FC<PresentationHudProps> = ({
  cleanClassName = '6A6',
  viewMode,
  onToggleViewMode,
  zoomLevel,
  onZoomChange,
  onFitScreen,
  onResetZoom,
  onExitFullscreen,
  isSpinning = false,
  onStartSpin,
  isTimerOpen = false,
  onToggleTimer,
  isRemoteConnected = false,
  onOpenRemotePairing,
  isLargeText = false,
  onToggleLargeText,
  isSplitMode = false,
  onToggleSplitMode,
  pickMode = 'single',
  onPickModeChange,
  autoResetOnModeChange = false,
  onToggleAutoResetOnModeChange,
  filterGroup = 'all',
  onFilterGroupChange,
  filterGender = 'all',
  onFilterGenderChange,
  excludeCalled = false,
  onToggleExcludeCalled,
  calledCount,
  onClearSpinHistory,
  onOpenCalledDrawer,
  onResetView,
  eligibleCount,
  eligibleSingleCount,
  eligiblePairCount,
  eligibleGroup4Count,
  eligibleBattleCount,
  groupsList = ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'],
}) => {
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const [soundSettings, setSoundSettings] = React.useState(() => getSoundSettings());
  const filterContainerRef = React.useRef<HTMLDivElement>(null);
  const isFiltered = filterGroup !== 'all' || filterGender !== 'all' || excludeCalled || pickMode !== 'single';

  const handleToggleMute = () => {
    const nextMuted = !soundSettings.isMuted;
    setSoundMuted(nextMuted);
    setSoundSettings((prev) => ({ ...prev, isMuted: nextMuted }));
  };

  const handleVolumeChange = (newVol: number) => {
    setMasterVolume(newVol);
    if (soundSettings.isMuted) {
      setSoundMuted(false);
    }
    setSoundSettings({ volume: newVol, isMuted: false });
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }
    };
    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu]);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. THANH NGANG TRÊN CÙNG CANH GIỮA: HOẠT ĐỘNG BỐC THĂM, THI ĐUA & ĐẾM GIỜ */}
      {/* ========================================================================= */}
      <header
        style={{ marginLeft: '-2cm' }}
        className="fixed top-3 left-1/2 -translate-x-1/2 -ml-[2cm] z-50 bg-slate-900/95 border border-slate-700/80 rounded-2xl px-3.5 py-1.5 shadow-2xl backdrop-blur-md text-white flex items-center gap-2.5 select-none animate-fade-in max-w-[96vw]"
      >
        {/* Tên chế độ & Tên lớp */}
        <div className="flex items-center gap-2 border-r border-slate-700/80 pr-2.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-black text-xs md:text-sm tracking-wide text-amber-300 whitespace-nowrap">
            TRÌNH CHIẾU {cleanClassName}
          </span>
        </div>

        {/* Cụm Tiện Ích Trình Chiếu: Vòng Quay May Mắn (Cá Nhân / Đôi Bạn / Nhóm 4 / Đối Kháng) */}
        <div className="flex items-center gap-1.5 shrink-0 relative" ref={filterContainerRef}>
          {onStartSpin && (
            <div className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700 gap-1">
              {/* Bộ chuyển đổi 4 chế độ bốc thăm TRỰC TIẾP trên HUD (1-Chạm Quay Luôn) */}
              <div
                className="flex items-center bg-slate-950/70 p-0.5 rounded-lg border border-slate-700/70"
                role="group"
                aria-label="Hình thức bốc thăm"
              >
                <button
                  type="button"
                  onClick={() => {
                    onPickModeChange?.('single');
                    onStartSpin?.('single');
                  }}
                  disabled={isSpinning}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    pickMode === 'single'
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Bốc thăm ngay 1 học sinh may mắn (Cá nhân) - Phím R"
                >
                  <span>👤</span>
                  <span>Cá nhân</span>
                  {eligibleSingleCount !== undefined && (
                    <span
                      className={`text-[9.5px] px-1 py-0.2 rounded font-mono ${
                        pickMode === 'single'
                          ? 'bg-amber-300/80 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {eligibleSingleCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPickModeChange?.('pair');
                    onStartSpin?.('pair');
                  }}
                  disabled={isSpinning}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    pickMode === 'pair'
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Bốc thăm ngay 1 cặp đôi bạn cùng bàn (Đôi bạn)"
                >
                  <span>👥</span>
                  <span>Đôi bạn</span>
                  {eligiblePairCount !== undefined && (
                    <span
                      className={`text-[9.5px] px-1 py-0.2 rounded font-mono ${
                        pickMode === 'pair'
                          ? 'bg-amber-300/80 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {eligiblePairCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPickModeChange?.('group4');
                    onStartSpin?.('group4');
                  }}
                  disabled={isSpinning}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    pickMode === 'group4'
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Bốc thăm ngay cụm 4 học sinh ghép bàn (Nhóm 4)"
                >
                  <span>👨‍👩‍👧‍👦</span>
                  <span>Nhóm 4</span>
                  {eligibleGroup4Count !== undefined && (
                    <span
                      className={`text-[9.5px] px-1 py-0.2 rounded font-mono ${
                        pickMode === 'group4'
                          ? 'bg-amber-300/80 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {eligibleGroup4Count}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPickModeChange?.('battle');
                    onStartSpin?.('battle');
                  }}
                  disabled={isSpinning}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    pickMode === 'battle'
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Bốc thăm ngay 2 đội đối kháng giữa 2 dãy (Team Battle)"
                >
                  <span>⚔️</span>
                  <span>Đối kháng</span>
                  {eligibleBattleCount !== undefined && (
                    <span
                      className={`text-[9.5px] px-1 py-0.2 rounded font-mono ${
                        pickMode === 'battle'
                          ? 'bg-amber-300/80 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {eligibleBattleCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Nút Kích hoạt Vòng Quay / Bốc Thăm (Quay tiếp) */}
              <button
                type="button"
                onClick={() => onStartSpin?.(pickMode)}
                disabled={isSpinning}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap ${
                  isSpinning
                    ? 'bg-amber-400 text-slate-950 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950'
                }`}
                title={
                  pickMode === 'battle'
                    ? 'Bốc thăm ngẫu nhiên 2 đội đối kháng ở 2 dãy khác nhau để tranh biện / đấu trí (Phím R)'
                    : pickMode === 'group4'
                    ? 'Bốc thăm ngẫu nhiên một nhóm 4 học sinh (ghép bàn) lên bảng thuyết trình (Phím R)'
                    : pickMode === 'pair'
                    ? 'Bốc thăm ngẫu nhiên một cặp đôi bạn cùng bàn (Phím R)'
                    : 'Bốc thăm ngẫu nhiên một học sinh may mắn lên phát biểu (Phím R)'
                }
              >
                <span className={isSpinning ? 'animate-spin' : ''}>
                  {pickMode === 'battle'
                    ? '⚔️'
                    : pickMode === 'group4'
                    ? '👨‍👩‍👧‍👦'
                    : pickMode === 'pair'
                    ? '👥'
                    : '🎲'}
                </span>
                <span>
                  {isSpinning
                    ? 'Đang quay...'
                    : pickMode === 'battle'
                    ? eligibleCount !== undefined
                      ? `Bốc 2 Đội (${eligibleCount})`
                      : 'Bốc 2 Đội'
                    : pickMode === 'group4'
                    ? eligibleCount !== undefined
                      ? `Bốc Nhóm (${eligibleCount})`
                      : 'Bốc Nhóm'
                    : pickMode === 'pair'
                    ? eligibleCount !== undefined
                      ? `Bốc Cặp (${eligibleCount})`
                      : 'Bốc Cặp'
                    : eligibleCount !== undefined
                    ? `Bốc Thăm (${eligibleCount})`
                    : 'Bốc Thăm'}
                </span>
              </button>

              {/* Nút bật popup Bộ Lọc Nâng Cao */}
              <button
                type="button"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                  isFiltered
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title="Cài đặt bộ lọc nâng cao (theo Tổ, Giới tính, loại trừ đã phát biểu)"
              >
                <span>🌪️</span>
                <span className="hidden md:inline">Lọc</span>
              </button>

              {/* Nút Chuyển Nhanh: Loại trừ bạn đã phát biểu & Bảng danh sách đã gọi */}
              {(onToggleExcludeCalled || (calledCount !== undefined && calledCount > 0 && onOpenCalledDrawer)) && (
                <div className="flex items-center gap-0.5 border-l border-slate-700 pl-1">
                  {onToggleExcludeCalled && (
                    <button
                      type="button"
                      onClick={onToggleExcludeCalled}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        excludeCalled
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title={
                        excludeCalled
                          ? `Đang BẬT: Không chọn trùng học sinh đã bốc (${calledCount || 0} em đã gọi)`
                          : 'Đang TẮT: Có thể bốc thăm lặp lại học sinh đã gọi'
                      }
                    >
                      <span>{excludeCalled ? '✅' : '⚪'}</span>
                      <span className="hidden lg:inline">Không trùng</span>
                      {calledCount !== undefined && calledCount > 0 && (
                        <span
                          onClick={(e) => {
                            if (onOpenCalledDrawer) {
                              e.stopPropagation();
                              onOpenCalledDrawer();
                            }
                          }}
                          className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-mono transition-transform hover:scale-110 cursor-pointer ${
                            excludeCalled ? 'bg-emerald-950 text-emerald-100' : 'bg-slate-900 text-slate-300'
                          }`}
                          title="Bấm để xem danh sách chi tiết các em đã được bốc thăm"
                        >
                          {calledCount}
                        </span>
                      )}
                    </button>
                  )}
                  {calledCount !== undefined && calledCount > 0 && onOpenCalledDrawer && (
                    <button
                      type="button"
                      onClick={onOpenCalledDrawer}
                      className="p-1 rounded-lg text-[11px] font-black text-emerald-400 hover:text-emerald-200 hover:bg-slate-700 cursor-pointer"
                      title="Xem danh sách chi tiết học sinh đã bốc thăm"
                    >
                      📋
                    </button>
                  )}
                  {calledCount !== undefined && calledCount > 0 && onClearSpinHistory && (
                    <button
                      type="button"
                      onClick={onClearSpinHistory}
                      className="p-1 rounded-lg text-[11px] font-black text-slate-400 hover:text-rose-300 hover:bg-slate-700 cursor-pointer"
                      title="Làm mới danh sách đã gọi (Bốc thăm lại từ đầu)"
                    >
                      🔄
                    </button>
                  )}
                </div>
              )}

              {/* Menu Popover Bộ lọc nâng cao */}
              {showFilterMenu && (
                <div className="absolute top-full mt-2 right-0 md:left-auto w-72 bg-slate-950/98 border-2 border-slate-700 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-white text-xs space-y-3 z-50 animate-scale-up">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-black text-amber-300 flex items-center gap-1 uppercase tracking-wider text-[11px]">
                      🌪️ Bộ Lọc Nâng Cao
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFilterMenu(false)}
                      className="text-slate-400 hover:text-white font-bold cursor-pointer"
                      title="Đóng bộ lọc"
                      aria-label="Đóng bộ lọc"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Chọn Tổ */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">Tổ học tập:</span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => onFilterGroupChange?.('all')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          filterGroup === 'all'
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        Tất cả
                      </button>
                      {groupsList.map((grp) => (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => onFilterGroupChange?.(grp)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            filterGroup === grp
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chọn Giới tính */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">Giới tính:</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'Nam', label: '👦 Nam' },
                        { id: 'Nữ', label: '👧 Nữ' },
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => onFilterGenderChange?.(g.id)}
                          className={`py-0.5 px-1 rounded-md text-[10px] font-bold border text-center ${
                            filterGender === g.id
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tùy chọn Bỏ qua bạn đã bốc */}
                  <label className="flex items-center gap-2 pt-1 border-t border-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={excludeCalled}
                      onChange={() => onToggleExcludeCalled?.()}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-300 font-medium">
                      Loại trừ bạn đã phát biểu
                    </span>
                  </label>

                  {/* Tùy chọn Tự động làm mới danh sách khi đổi hình thức */}
                  {onToggleAutoResetOnModeChange && (
                    <label className="flex items-center gap-2 pt-1 border-t border-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoResetOnModeChange}
                        onChange={() => onToggleAutoResetOnModeChange()}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-300 font-medium">
                        Làm mới danh sách khi đổi hình thức
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Nút Mở Đồng hồ đếm ngược thảo luận nhóm */}
          {onToggleTimer && (
            <button
              type="button"
              onClick={onToggleTimer}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap ${
                isTimerOpen
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              title="Mở đồng hồ đếm ngược thời gian thảo luận nhóm / sinh hoạt lớp (Phím T)"
            >
              <span>⏱️</span>
              <span>{isTimerOpen ? 'Đang Đếm Giờ' : 'Đếm Giờ'}</span>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. THANH DỌC BÊN TRÁI: ĐIỀU KHIỂN HỆ THỐNG, GÓC NHÌN & TIỆN ÍCH GIÁO VIÊN */}
      {/* ========================================================================= */}
      <aside
        aria-label="Thanh công cụ điều khiển hệ thống"
        className="fixed left-3 top-1/2 -translate-y-1/2 z-50 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2 shadow-2xl backdrop-blur-md text-white flex flex-col items-center gap-2 select-none animate-fade-in w-16"
      >
        {/* Nhóm 1: Chế độ hiển thị 3D / 2D & Toàn cảnh */}
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1 bg-slate-950/70 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onToggleViewMode('3d')}
              className={`flex-1 py-1 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                viewMode === '3d'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Chế độ phòng học 3D trực quan"
            >
              3D
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('2d')}
              className={`flex-1 py-1 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                viewMode === '2d'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Chế độ sơ đồ mặt phẳng 2D chuẩn in"
            >
              2D
            </button>
          </div>
          {viewMode === '3d' && onResetView && (
            <button
              type="button"
              onClick={onResetView}
              className="w-full py-1 px-1 rounded-lg text-[10px] font-black transition-all cursor-pointer bg-slate-800 text-amber-300 hover:text-white hover:bg-slate-700 flex items-center justify-center gap-0.5 border border-slate-700"
              title="Đưa góc nhìn camera quay trở lại bao quát toàn cảnh lớp học"
            >
              <span>👁️</span>
              <span className="text-[9px]">Toàn cảnh</span>
            </button>
          )}
        </div>

        <div className="w-full border-t border-slate-700/80" />

        {/* Nhóm 2: Bảng Phụ & Điện thoại Remote */}
        <div className="flex flex-col gap-1.5 w-full">
          {/* Nút Bảng Phụ */}
          {onToggleSplitMode && (
            <button
              type="button"
              onClick={onToggleSplitMode}
              className={`w-full py-1.5 px-1 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                isSplitMode
                  ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              title="Bật/Tắt cột tiện ích sinh hoạt lớp (Ghi chú dặn dò & Lịch sử bốc thăm)"
            >
              <span className="text-xs">◫</span>
              <span className="text-[9px] whitespace-nowrap leading-tight text-center">
                {isSplitMode ? 'Bảng Phụ: BẬT' : 'Bảng Phụ'}
              </span>
            </button>
          )}

          {/* Nút Điện Thoại Remote */}
          {onOpenRemotePairing && (
            <button
              type="button"
              onClick={onOpenRemotePairing}
              className={`w-full py-1.5 px-1 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                isRemoteConnected
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-sm'
              }`}
              title="Quét mã QR để điều khiển bốc thăm, đếm ngược từ điện thoại của Thầy"
            >
              <span className="text-xs">📱</span>
              <span className="text-[9px] whitespace-nowrap leading-tight text-center">
                {isRemoteConnected ? '🟢 Điện Thoại' : 'Điện Thoại'}
              </span>
            </button>
          )}
        </div>

        <div className="w-full border-t border-slate-700/80" />

        {/* Nhóm 3: Âm lượng */}
        <div className="flex flex-col items-center gap-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 w-full">
          <button
            type="button"
            onClick={handleToggleMute}
            className="text-slate-300 hover:text-white cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-sm"
            title={
              soundSettings.isMuted
                ? 'Bật âm thanh (Đang tắt tiếng)'
                : `Tắt âm nhanh (Âm lượng: ${Math.round(soundSettings.volume * 100)}%)`
            }
            aria-label={soundSettings.isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {soundSettings.isMuted || soundSettings.volume === 0 ? '🔇' : soundSettings.volume < 0.5 ? '🔉' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundSettings.isMuted ? 0 : soundSettings.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-11 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            title={`Điều chỉnh âm lượng: ${Math.round((soundSettings.isMuted ? 0 : soundSettings.volume) * 100)}%`}
            aria-label="Thanh điều chỉnh âm lượng"
          />
          <span className="text-[9px] font-mono font-bold text-slate-400">
            {soundSettings.isMuted ? '0%' : `${Math.round(soundSettings.volume * 100)}%`}
          </span>
        </div>

        {/* Nhóm 4: Zoom & Vừa khít */}
        <div className="flex flex-col items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 gap-0.5 w-full">
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(130, zoomLevel + 10))}
            className="w-full py-0.5 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700 font-black cursor-pointer text-xs"
            title="Phóng to sơ đồ"
          >
            +
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="text-[9.5px] font-mono font-bold text-amber-300 hover:underline cursor-pointer py-0.5"
            title="Bấm để đưa về 100%"
          >
            {zoomLevel}%
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(50, zoomLevel - 10))}
            className="w-full py-0.5 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700 font-black cursor-pointer text-xs"
            title="Thu nhỏ sơ đồ"
          >
            −
          </button>
        </div>

        {/* Nút Vừa Khít */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFitScreen}
          className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white text-[9.5px] font-bold py-1 px-1 h-auto rounded-xl w-full justify-center flex items-center gap-1"
          title="Tự động thu phóng để toàn bộ sơ đồ vừa vặn với kích thước màn hình Tivi/Máy chiếu"
        >
          <span>🎯</span>
          <span className="whitespace-nowrap">Vừa Khít</span>
        </Button>

        {/* Nút Chữ Siêu To Cho Học Sinh Ngồi Xa */}
        {onToggleLargeText && (
          <button
            type="button"
            onClick={onToggleLargeText}
            className={`border text-[9.5px] font-black py-1 px-1 rounded-xl w-full justify-center flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              isLargeText
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={
              isLargeText
                ? 'Đang BẬT Chữ Siêu To Rõ cho máy chiếu/học sinh ngồi xa (Bấm để chuyển về cỡ chữ chuẩn)'
                : 'BẬT Chữ Siêu To Rõ (Phóng to họ tên học sinh giúp các em ngồi ở xa nhìn rõ)'
            }
          >
            <span className="text-xs">🔤</span>
            <span className="text-[8.5px] whitespace-nowrap leading-tight text-center">
              {isLargeText ? 'Chữ Siêu To' : 'Cỡ Chữ'}
            </span>
          </button>
        )}

        <div className="w-full border-t border-slate-700/80" />

        {/* Nhóm 5: Thoát Toàn Màn Hình */}
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={onExitFullscreen}
          className="text-[9.5px] font-black py-1.5 px-1 h-auto rounded-xl shadow-md shadow-rose-600/30 flex flex-col items-center justify-center gap-0.5 cursor-pointer w-full"
          title="Bấm hoặc nhấn phím ESC để quay về giao diện bình thường"
        >
          <span className="text-xs">✕</span>
          <span className="whitespace-nowrap leading-tight">Thu Nhỏ (ESC)</span>
        </Button>
      </aside>
    </>
  );
};
