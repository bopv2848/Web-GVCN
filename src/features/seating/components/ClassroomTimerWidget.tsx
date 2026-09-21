import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../components/common/Button';
import { playTimerAlarm, playCountdownBeep, type TimerAlarmSoundType } from '../../../utils/soundNotification';

interface TimerPreset {
  label: string;
  seconds: number;
  badge?: string;
}

const TIMER_PRESETS: TimerPreset[] = [
  { label: '1 Phút', seconds: 60 },
  { label: '1P 30S', seconds: 90 },
  { label: '2 Phút', seconds: 120 },
  { label: '3 Phút', seconds: 180 },
  { label: '5 Phút', seconds: 300, badge: 'Thảo luận tổ' },
  { label: '10 Phút', seconds: 600 },
  { label: '15 Phút', seconds: 900, badge: 'Sinh hoạt chi đội' },
];

const SOUND_OPTIONS: Array<{ type: TimerAlarmSoundType; label: string; icon: string }> = [
  { type: 'school', label: 'Chuông trường', icon: '🔔' },
  { type: 'gong', label: 'Tiếng kẻng', icon: '🛎️' },
  { type: 'fun', label: 'Vui nhộn', icon: '🎵' },
  { type: 'classic', label: 'Ding-Dong', icon: '🎶' },
];

export interface ClassroomTimerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  externalAction?: {
    action: 'start' | 'pause' | 'reset' | 'set_preset';
    durationSeconds?: number;
    timestamp: number;
  } | null;
  onTimerStateChange?: (state: { remainingSeconds: number; isRunning: boolean; totalSeconds: number }) => void;
}

export const ClassroomTimerWidget: React.FC<ClassroomTimerWidgetProps> = ({
  isOpen,
  onClose,
  externalAction,
  onTimerStateChange,
}) => {
  const [totalDuration, setTotalDuration] = useState<number>(300); // 5 phút mặc định
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [miniPos, setMiniPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('web_gvcn_timer_mini_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return { x: typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 340) : 800, y: 80 };
  });

  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - miniPos.x,
      y: e.clientY - miniPos.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const maxX = typeof window !== 'undefined' ? window.innerWidth - 290 : 1000;
    const maxY = typeof window !== 'undefined' ? window.innerHeight - 70 : 800;

    const newX = Math.max(10, Math.min(maxX, e.clientX - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(maxY, e.clientY - dragOffsetRef.current.y));

    setMiniPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        localStorage.setItem('web_gvcn_timer_mini_pos', JSON.stringify(miniPos));
      } catch {
        // ignore
      }
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const [soundType, setSoundType] = useState<TimerAlarmSoundType>(() => {
    try {
      return (localStorage.getItem('web_gvcn_timer_sound') as TimerAlarmSoundType) || 'school';
    } catch {
      return 'school';
    }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectSoundType = (type: TimerAlarmSoundType) => {
    setSoundType(type);
    try {
      localStorage.setItem('web_gvcn_timer_sound', type);
    } catch {
      // ignore
    }
    playTimerAlarm(type);
  };

  // Format giây sang MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Đếm ngược từng giây & phát tiếng bíp gấp nhịp 5 giây cuối
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            setIsAlarmPlaying(true);
            setIsMinimized(false); // Tự động mở lại bảng lớn khi hết giờ
            playTimerAlarm(soundType);
            return 0;
          }
          const nextSec = prev - 1;
          // Âm thanh tích tắc khẩn cấp ở 5 giây cuối cùng (00:05 -> 00:01)
          if (nextSec <= 5 && nextSec >= 1) {
            playCountdownBeep(nextSec);
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, soundType]);

  // Dừng chuông sau 6 giây
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isAlarmPlaying) {
      timeout = setTimeout(() => {
        setIsAlarmPlaying(false);
      }, 6000);
    }
    return () => clearTimeout(timeout);
  }, [isAlarmPlaying]);

  // Tiếp nhận lệnh đếm giờ gửi từ điện thoại của Thầy
  useEffect(() => {
    if (!externalAction) return;
    if (externalAction.action === 'start') {
      setIsAlarmPlaying(false);
      setIsRunning(true);
    } else if (externalAction.action === 'pause') {
      setIsRunning(false);
    } else if (externalAction.action === 'reset') {
      setIsRunning(false);
      setTimeLeft(totalDuration);
      setIsAlarmPlaying(false);
    } else if (externalAction.action === 'set_preset' && externalAction.durationSeconds) {
      setTotalDuration(externalAction.durationSeconds);
      setTimeLeft(externalAction.durationSeconds);
      setIsRunning(false);
      setIsAlarmPlaying(false);
    }
  }, [externalAction, totalDuration]);

  // Báo cáo trạng thái đếm giờ để SeatingPage đồng bộ về điện thoại
  useEffect(() => {
    onTimerStateChange?.({
      remainingSeconds: timeLeft,
      isRunning,
      totalSeconds: totalDuration,
    });
  }, [timeLeft, isRunning, totalDuration, onTimerStateChange]);

  if (!isOpen) return null;

  const handleSelectPreset = (seconds: number) => {
    setTotalDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
    setIsAlarmPlaying(false);
  };

  // Khi bấm Bắt Đầu -> Lập tức thu gọn lại thành viên thuốc thời gian mini để không che sơ đồ
  const handleTogglePlay = () => {
    if (timeLeft === 0) {
      setTimeLeft(totalDuration);
      setIsAlarmPlaying(false);
    }
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (nextRunning) {
      setIsMinimized(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalDuration);
    setIsAlarmPlaying(false);
  };

  const handleAddMinute = () => {
    setTimeLeft((prev) => prev + 60);
    setTotalDuration((prev) => Math.max(prev, timeLeft + 60));
  };

  const progressPercent = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
  const isDanger = timeLeft <= 15 && timeLeft > 0;
  const isFinished = timeLeft === 0;

  // Trạng thái thu gọn nhỏ gọn tinh tế có thể kéo thả di chuyển tự do trên màn hình
  if (isMinimized) {
    return (
      <aside
        aria-label="Đồng hồ đếm ngược thu gọn"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ left: `${miniPos.x}px`, top: `${miniPos.y}px` }}
        className="fixed z-50 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-2xl border-2 border-amber-400 shadow-2xl flex items-center gap-3 select-none backdrop-blur-md cursor-grab active:cursor-grabbing transition-shadow hover:shadow-amber-500/30 animate-scale-up touch-none"
      >
        <span
          className="text-slate-500 hover:text-amber-400 text-xs font-mono select-none px-0.5"
          title="Nhấp giữ chuột hoặc chạm để kéo di chuyển đồng hồ đến bất kỳ vị trí nào"
        >
          ⠿
        </span>
        <span className="text-xl animate-pulse pointer-events-none">⏱️</span>
        <div className="flex flex-col text-left pointer-events-none">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
            {isRunning ? 'Đang đếm giờ...' : 'Tạm dừng'}
          </span>
          <span
            className={`font-mono font-black text-xl leading-none ${
              isFinished
                ? 'text-rose-400 animate-ping'
                : isDanger
                ? 'text-rose-400 animate-pulse'
                : 'text-amber-300'
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-black cursor-pointer shadow-xs transition-all"
            title={isRunning ? 'Tạm dừng đếm giờ' : 'Tiếp tục đếm giờ'}
          >
            {isRunning ? '⏸ Tạm dừng' : '▶ Tiếp tục'}
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
            title="Mở rộng bảng cài đặt đồng hồ"
          >
            🗖
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
            title="Đóng đồng hồ"
          >
            ✕
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Bộ đếm thời gian thảo luận"
      className="fixed top-20 right-6 z-40 w-80 bg-slate-950/95 text-white p-5 rounded-3xl border-2 border-amber-400 shadow-2xl backdrop-blur-md animate-fade-in print:hidden select-none"
    >
      {/* Header Widget */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏱️</span>
          <div>
            <h4 className="font-black text-sm text-amber-300 tracking-wide uppercase">
              Thời Gian Thảo Luận
            </h4>
            <p className="text-[10.5px] text-slate-400 font-medium">Sinh hoạt lớp & Học nhóm</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
            title="Thu nhỏ góc màn hình"
          >
            🗕
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
            title="Đóng đồng hồ"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Hiển thị Đồng hồ số lớn */}
      <div className="my-4 text-center">
        <div
          className={`font-mono text-5xl font-black tracking-wider transition-colors ${
            isFinished
              ? 'text-rose-500 animate-bounce'
              : isDanger
              ? 'text-rose-400 animate-pulse'
              : 'text-white'
          }`}
        >
          {formatTime(timeLeft)}
        </div>

        {/* Thông báo hết giờ */}
        {isFinished ? (
          <div className="mt-2 py-1.5 px-3 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider animate-pulse flex items-center justify-center gap-1.5">
            <span>🔔</span>
            <span>ĐÃ HẾT GIỜ THẢO LUẬN!</span>
          </div>
        ) : (
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {isRunning ? '⏳ Đang đếm ngược...' : '⏸ Đang tạm dừng'}
          </p>
        )}

        {/* Thanh tiến trình thời gian */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 border border-slate-700">
          <div
            className={`h-full transition-all duration-300 ${
              isDanger || isFinished ? 'bg-rose-500' : 'bg-amber-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cụm nút điều khiển chính */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Button
          type="button"
          variant={isRunning ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleTogglePlay}
          className="font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{isRunning ? '⏸' : '▶'}</span>
          <span>{isRunning ? 'Tạm Dừng' : 'Bắt Đầu'}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMinute}
          className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-bold py-2 rounded-xl cursor-pointer"
          title="Thêm 1 phút thảo luận"
        >
          +1 Phút
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-bold py-2 rounded-xl cursor-pointer"
          title="Đặt lại về thời gian ban đầu"
        >
          🔄 Đặt Lại
        </Button>
      </div>

      {/* Chọn nhanh mốc thời gian (Presets) */}
      <div className="space-y-1.5 pt-3 border-t border-slate-800">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
          Chọn nhanh mốc thời gian:
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {TIMER_PRESETS.map((preset) => {
            const isSelected = totalDuration === preset.seconds;
            return (
              <button
                key={preset.seconds}
                type="button"
                onClick={() => handleSelectPreset(preset.seconds)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
                title={preset.badge || preset.label}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tùy chỉnh nhạc chuông báo hết giờ */}
      <div className="space-y-1.5 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            Âm báo hết giờ:
          </span>
          <span className="text-[10px] text-slate-500 font-medium">(Bấm để nghe thử)</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SOUND_OPTIONS.map((item) => {
            const isSelected = soundType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => handleSelectSoundType(item.type)}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={`Chọn âm chuông: ${item.label} (bấm để nghe thử)`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {isSelected && <span className="text-[10px] text-amber-400 font-black">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
