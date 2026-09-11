import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../components/common/Button';
import { soundEffects } from '../utils/soundEffects';

export const ClassroomTimer: React.FC = () => {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');

  // State cho Timer Đếm ngược
  const [initialSeconds, setInitialSeconds] = useState<number>(300); // Mặc định 5 phút (300s)
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

  // State cho Đồng hồ bấm giờ (Stopwatch)
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);

  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getMuted());

  useEffect(() => {
    const unsub = soundEffects.subscribeMute((muted) => {
      setIsMuted(muted);
    });
    return unsub;
  }, []);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Quản lý luồng Đếm ngược
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            setIsTimeUp(true);
            soundEffects.playTimerChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  // 2. Quản lý luồng Bấm giờ (Stopwatch)
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }

    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  // Điều khiển Timer
  const handleStartTimer = () => {
    setIsTimeUp(false);
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  /**
   * Sửa triệt để lỗi thiếu hàm resetTimer() trong bản nguyên mẫu cũ!
   */
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setIsTimeUp(false);
    setTimeLeft(initialSeconds);
  };

  const handleSetPreset = (secs: number) => {
    setIsTimerRunning(false);
    setIsTimeUp(false);
    setInitialSeconds(secs);
    setTimeLeft(secs);
  };

  const handleAddExtraTime = (extraSecs: number) => {
    setTimeLeft((prev) => prev + extraSecs);
    setInitialSeconds((prev) => prev + extraSecs);
  };

  // Format thời gian hiển thị (MM:SS)
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tính tỷ lệ % còn lại để vẽ vòng tròn tiến trình
  const progressPct = initialSeconds > 0 ? (timeLeft / initialSeconds) * 100 : 0;

  // Đổi màu vòng tròn theo thời gian
  const getProgressColor = () => {
    if (progressPct <= 20) return '#ef4444'; // Đỏ khi dưới 20%
    if (progressPct <= 50) return '#f59e0b'; // Vàng khi dưới 50%
    return '#10b981'; // Xanh lá mặc định
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center">
      {/* Header & Chế độ */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setMode('timer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'timer'
                ? 'bg-white text-primary shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⏳ Đếm Ngược
          </button>
          <button
            onClick={() => setMode('stopwatch')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'stopwatch'
                ? 'bg-white text-primary shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⏱️ Bấm Giờ
          </button>
        </div>

        <button
          onClick={() => {
            soundEffects.setMuted(!isMuted);
          }}
          className={`p-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
            isMuted
              ? 'bg-rose-50 text-rose-600 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          <span>{isMuted ? '🔇 Tắt chuông' : '🔔 Bật chuông'}</span>
        </button>
      </div>

      {mode === 'timer' ? (
        /* CHẾ ĐỘ ĐẾM NGƯỢC */
        <div className="flex flex-col items-center w-full">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {[
              { label: '30s', secs: 30 },
              { label: '1 phút', secs: 60 },
              { label: '2 phút', secs: 120 },
              { label: '3 phút', secs: 180 },
              { label: '5 phút', secs: 300 },
              { label: '10 phút', secs: 600 },
              { label: '15 phút', secs: 900 },
            ].map((p) => (
              <button
                key={p.secs}
                onClick={() => handleSetPreset(p.secs)}
                disabled={isTimerRunning}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  initialSeconds === p.secs && !isTimeUp
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Đồng hồ số dạng tròn (Visual Circular Clock) */}
          <div className="relative w-64 h-64 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Vòng nền chìm */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="7"
              />
              {/* Vòng tiến trình động */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={getProgressColor()}
                strokeWidth="7"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 * (1 - progressPct / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Số đếm ngược điện tử */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className={`text-5xl md:text-6xl font-black font-mono tracking-tight ${
                  isTimeUp
                    ? 'text-rose-600 animate-pulse'
                    : progressPct <= 20
                      ? 'text-rose-600'
                      : 'text-slate-850'
                }`}
              >
                {formatTime(timeLeft)}
              </span>

              <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {isTimeUp ? '🚨 HẾT GIỜ LÀM BÀI!' : isTimerRunning ? 'ĐANG ĐẾM...' : 'SẴN SÀNG'}
              </span>
            </div>
          </div>

          {/* Bộ điều khiển Start / Pause / Reset */}
          <div className="flex items-center gap-3 mt-6">
            {!isTimerRunning ? (
              <Button
                onClick={handleStartTimer}
                size="lg"
                className="px-6 font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md shadow-emerald-600/20"
              >
                ▶ Bắt Đầu
              </Button>
            ) : (
              <Button
                onClick={handlePauseTimer}
                size="lg"
                variant="outline"
                className="px-6 font-black bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 rounded-2xl"
              >
                ⏸ Tạm Dừng
              </Button>
            )}

            {/* Nút Đặt lại - Sửa lỗi resetTimer() */}
            <Button
              onClick={handleResetTimer}
              variant="outline"
              size="lg"
              className="px-6 font-bold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-2xl"
            >
              🔄 Đặt Lại
            </Button>

            {/* Thêm nhanh thời gian */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => handleAddExtraTime(30)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                +30s
              </button>
              <button
                onClick={() => handleAddExtraTime(60)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                +1p
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CHẾ ĐỘ BẤM GIỜ */
        <div className="flex flex-col items-center w-full py-6">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-inner my-4">
            <span className="text-6xl md:text-7xl font-black font-mono text-slate-850 tracking-tight">
              {formatTime(stopwatchSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            {!isStopwatchRunning ? (
              <Button
                onClick={() => setIsStopwatchRunning(true)}
                size="lg"
                className="px-8 font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl"
              >
                ▶ Bấm Giờ
              </Button>
            ) : (
              <Button
                onClick={() => setIsStopwatchRunning(false)}
                size="lg"
                variant="outline"
                className="px-8 font-black bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 rounded-2xl"
              >
                ⏸ Dừng
              </Button>
            )}

            <Button
              onClick={() => {
                setIsStopwatchRunning(false);
                setStopwatchSeconds(0);
              }}
              variant="outline"
              size="lg"
              className="px-6 font-bold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-2xl"
            >
              🔄 Đặt Lại 00:00
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
