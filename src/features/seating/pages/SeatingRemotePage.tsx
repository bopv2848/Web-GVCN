import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { seatingRemoteService, type RemoteWinnerPayload } from '../services/seatingRemoteService';

export const SeatingRemotePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId') || 'default-class';
  const sessionId = searchParams.get('session') || '';
  const initialPin = searchParams.get('pin') || '';

  const [pin, setPin] = useState<string>(initialPin);
  const [isPinEntered, setIsPinEntered] = useState<boolean>(!!initialPin);

  // Trạng thái kết nối WebSocket Realtime
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isHapticEnabled, setIsHapticEnabled] = useState<boolean>(true);

  // Học sinh vừa trúng thưởng
  const [currentWinner, setCurrentWinner] = useState<RemoteWinnerPayload | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinMode, setSpinMode] = useState<'single' | 'pair' | 'group4' | 'battle'>('single');

  // Trạng thái đồng hồ đếm ngược
  const [timerRemaining, setTimerRemaining] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Thông báo phản hồi nhanh
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  // Kích hoạt rung xúc giác (Haptic Vibration)
  const triggerVibe = (pattern: number | number[] = 50) => {
    if (isHapticEnabled) {
      seatingRemoteService.triggerHaptic(pattern);
    }
  };

  // Khởi tạo kênh kết nối Realtime
  useEffect(() => {
    if (!sessionId || !pin || !isPinEntered) return;

    setConnectionStatus('connecting');

    const channel = seatingRemoteService.initClientChannel(classId, sessionId, pin, {
      onSpinStarted: (mode) => {
        setIsSpinning(true);
        triggerVibe([40, 30, 40]);
        showFeedback(`🎯 TV đang quay số (${mode})...`);
      },
      onSpinResult: (winner) => {
        setIsSpinning(false);
        setCurrentWinner(winner);
        triggerVibe([100, 50, 150]);
        const name = winner.student?.fullName || 'Học sinh';
        showFeedback(`🎉 Kết quả: ${name}`);
      },
      onTimerUpdate: (state) => {
        setTimerRemaining(state.remainingSeconds);
        setIsTimerRunning(state.isRunning);
      },
      onPointsAwardedSuccess: (res) => {
        triggerVibe(80);
        showFeedback(`⭐ Đã cộng ${res.points}đ cho ${res.studentName}!`);
      },
    });

    channelRef.current = channel;
    setConnectionStatus('connected');

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [classId, sessionId, pin, isPinEntered]);

  // Các thao tác gửi lệnh
  const handleTriggerSpin = (mode: 'single' | 'pair' | 'group4' | 'battle') => {
    if (!channelRef.current) return;
    setSpinMode(mode);
    setIsSpinning(true);
    triggerVibe(60);
    seatingRemoteService.sendTriggerSpin(channelRef.current, pin, mode);
    showFeedback('🚀 Đã gửi lệnh bốc thăm lên TV!');
  };

  const handleAwardPoints = (points: number, reason: string) => {
    if (!channelRef.current || !currentWinner) return;
    triggerVibe(70);
    seatingRemoteService.sendAwardPoints(channelRef.current, pin, {
      studentId: currentWinner.student.id,
      points,
      reason,
    });
    showFeedback(`⭐ Đang cộng ${points} điểm cho ${currentWinner.student.fullName}...`);
  };

  const handleTimerAction = (action: 'start' | 'pause' | 'reset' | 'set_preset', seconds?: number) => {
    if (!channelRef.current) return;
    triggerVibe(50);
    if (action === 'set_preset' && seconds) {
      setTimerRemaining(seconds);
    }
    seatingRemoteService.sendTriggerTimer(channelRef.current, pin, action, seconds);
    showFeedback(
      action === 'start'
        ? '▶️ Đã bắt đầu đếm giờ trên TV'
        : action === 'pause'
        ? '⏸️ Đã tạm dừng đếm giờ'
        : action === 'reset'
        ? '🔄 Đã đặt lại đồng hồ'
        : `⏱️ Đã đặt ${seconds}s`
    );
  };

  const handleToggleView = (mode: '2d' | '3d') => {
    if (!channelRef.current) return;
    triggerVibe(50);
    seatingRemoteService.sendToggleViewMode(channelRef.current, pin, mode);
    showFeedback(`🗺️ Đã đổi TV sang chế độ xem ${mode.toUpperCase()}`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Màn hình nhập PIN thủ công nếu URL không có PIN
  if (!isPinEntered) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white p-6 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-3xl">
            📱
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Bàn Điều Khiển Giảng Dạy</h1>
            <p className="text-xs text-slate-400 mt-1">Nhập mã PIN 4 số hiển thị trên màn hình TV để kết nối</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Nhập 4 số PIN"
              className="w-full text-center py-3.5 bg-slate-900 border-2 border-slate-700 rounded-2xl text-2xl font-black tracking-widest text-amber-400 focus:outline-hidden focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => {
                if (pin.length === 4) setIsPinEntered(true);
              }}
              disabled={pin.length !== 4}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg transition-all"
            >
              Kết Nối Màn Hình TV
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col select-none font-sans pb-10">
      {/* Toast thông báo phản hồi thao tác */}
      {feedbackMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-400 text-slate-950 text-xs font-black rounded-full shadow-2xl animate-fade-in flex items-center gap-1.5 whitespace-nowrap">
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0c1220]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="text-xs font-black text-slate-200 tracking-wide">LỚP 6A6 • REMOTE DECK</h2>
            <p className="text-[10px] text-slate-400">
              {connectionStatus === 'connected' ? '🟢 Sẵn sàng điều khiển TV' : '⏳ Đang đồng bộ...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút bật tắt rung */}
          <button
            type="button"
            onClick={() => setIsHapticEnabled((prev) => !prev)}
            className={`p-2 rounded-xl text-xs font-bold transition-all border ${
              isHapticEnabled
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title="Bật/Tắt rung khi bấm nút"
          >
            📳
          </button>

          {/* Mã PIN badge */}
          <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
            PIN: {pin}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {/* KHUNG KẾT QUẢ HỌC SINH VỪA TRÚNG THĂM (Winner Spotlight Card) */}
        {currentWinner ? (
          <div className="p-4 rounded-3xl bg-linear-to-b from-amber-500/20 via-slate-900 to-slate-900 border-2 border-amber-400/70 shadow-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                👑 Học sinh vừa gọi
              </span>
              <span className="text-xs text-amber-300 font-bold">
                {currentWinner.student.groupName || 'Tổ học tập'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 border-2 border-amber-300 shadow-md">
                {currentWinner.student.fullName.charAt(currentWinner.student.fullName.lastIndexOf(' ') + 1) || 'E'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black text-white truncate">{currentWinner.student.fullName}</h3>
                <p className="text-xs text-slate-300">
                  {currentWinner.student.classRole ? `Chức vụ: ${currentWinner.student.classRole}` : 'Thành viên lớp'}
                </p>
              </div>
            </div>

            {/* Các nút cộng / trừ điểm nhanh cho em này */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Thưởng / Phạt điểm ngay:
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAwardPoints(1, 'Phát biểu tốt')}
                  className="py-2.5 bg-emerald-600/80 active:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md"
                >
                  +1 ⭐
                </button>
                <button
                  type="button"
                  onClick={() => handleAwardPoints(2, 'Trả lời xuất sắc')}
                  className="py-2.5 bg-emerald-500 active:bg-emerald-400 text-white rounded-xl text-xs font-black shadow-md"
                >
                  +2 ⭐
                </button>
                <button
                  type="button"
                  onClick={() => handleAwardPoints(5, 'Điểm mười sáng tạo')}
                  className="py-2.5 bg-amber-500 active:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md"
                >
                  +5 ⭐
                </button>
                <button
                  type="button"
                  onClick={() => handleAwardPoints(-1, 'Nhắc nhở mất trật tự')}
                  className="py-2.5 bg-rose-600/80 active:bg-rose-500 text-white rounded-xl text-xs font-black shadow-md"
                >
                  -1 ⚠️
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            💡 Thầy bấm một trong các nút bốc thăm bên dưới để gọi học sinh phát biểu
          </div>
        )}

        {/* CỤM NÚT BỐC THĂM THẦN TỐC (RANDOM PICKER) */}
        <section className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            🎯 Bốc thăm ngẫu nhiên (Vòng quay TV):
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Cá nhân */}
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => handleTriggerSpin('single')}
              className={`p-4 rounded-2xl text-left border transition-all active:scale-95 flex flex-col justify-between h-24 ${
                spinMode === 'single'
                  ? 'bg-linear-to-br from-blue-600 to-indigo-700 border-blue-400/80 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-xs font-black">Bốc 1 Cá Nhân</p>
                <p className="text-[10px] text-slate-300 opacity-80">Gọi 1 bạn bất kỳ</p>
              </div>
            </button>

            {/* 2. Đôi bạn cùng bàn */}
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => handleTriggerSpin('pair')}
              className={`p-4 rounded-2xl text-left border transition-all active:scale-95 flex flex-col justify-between h-24 ${
                spinMode === 'pair'
                  ? 'bg-linear-to-br from-teal-600 to-emerald-700 border-teal-400/80 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-xs font-black">Đôi Bạn Cùng Bàn</p>
                <p className="text-[10px] text-slate-300 opacity-80">2 bạn cùng 1 bàn</p>
              </div>
            </button>

            {/* 3. Nhóm 4 bạn */}
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => handleTriggerSpin('group4')}
              className={`p-4 rounded-2xl text-left border transition-all active:scale-95 flex flex-col justify-between h-24 ${
                spinMode === 'group4'
                  ? 'bg-linear-to-br from-purple-600 to-pink-700 border-purple-400/80 shadow-lg shadow-purple-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <span className="text-2xl">🧩</span>
              <div>
                <p className="text-xs font-black">Nhóm 4 Bạn Ghép</p>
                <p className="text-[10px] text-slate-300 opacity-80">2 bàn trước sau</p>
              </div>
            </button>

            {/* 4. Đối kháng 2 dãy */}
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => handleTriggerSpin('battle')}
              className={`p-4 rounded-2xl text-left border transition-all active:scale-95 flex flex-col justify-between h-24 ${
                spinMode === 'battle'
                  ? 'bg-linear-to-br from-amber-500 to-orange-600 border-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <span className="text-2xl">⚔️</span>
              <div>
                <p className="text-xs font-black">Đối Kháng 2 Dãy</p>
                <p className="text-[10px] opacity-80">Thi đấu 2 phe</p>
              </div>
            </button>
          </div>
        </section>

        {/* CỤM ĐỒNG HỒ ĐẾM NGƯỢC THỜI GIAN (CLASSROOM TIMER) */}
        <section className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⏱️</span>
              <span>Đồng hồ đếm ngược:</span>
            </p>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isTimerRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500'
              }`}
            >
              {isTimerRunning ? 'ĐANG CHẠY' : 'TẠM DỪNG'}
            </span>
          </div>

          {/* Màn hình số to */}
          <div className="text-center py-2 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-4xl font-mono font-black tracking-widest text-amber-400">
              {formatTime(timerRemaining)}
            </span>
          </div>

          {/* Các nút chọn mốc nhanh */}
          <div className="grid grid-cols-4 gap-1.5">
            {[30, 60, 120, 300].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handleTimerAction('set_preset', sec)}
                className="py-1.5 rounded-xl bg-slate-800 text-[11px] font-bold text-slate-300 hover:bg-slate-700 active:bg-slate-600 transition-colors"
              >
                {sec < 60 ? `${sec}s` : `${sec / 60}p`}
              </button>
            ))}
          </div>

          {/* Các nút điều khiển Bắt đầu / Tạm dừng / Đặt lại */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleTimerAction('start')}
              className="py-2.5 bg-emerald-600 active:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-md"
            >
              <span>▶️</span>
              <span>Bắt đầu</span>
            </button>
            <button
              type="button"
              onClick={() => handleTimerAction('pause')}
              className="py-2.5 bg-amber-600 active:bg-amber-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-md"
            >
              <span>⏸️</span>
              <span>Tạm dừng</span>
            </button>
            <button
              type="button"
              onClick={() => handleTimerAction('reset')}
              className="py-2.5 bg-slate-800 active:bg-slate-700 text-slate-300 rounded-xl text-xs font-black flex items-center justify-center gap-1 border border-slate-700"
            >
              <span>🔄</span>
              <span>Đặt lại</span>
            </button>
          </div>
        </section>

        {/* TIỆN ÍCH CHUYỂN CHẾ ĐỘ XEM TRÊN TV */}
        <section className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleToggleView('3d')}
            className="py-2.5 px-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-black text-slate-300 flex items-center justify-center gap-1.5 active:bg-slate-800"
          >
            <span>🏛️</span>
            <span>Chuyển 3D TV</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleView('2d')}
            className="py-2.5 px-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-black text-slate-300 flex items-center justify-center gap-1.5 active:bg-slate-800"
          >
            <span>🗺️</span>
            <span>Chuyển 2D TV</span>
          </button>
        </section>
      </main>
    </div>
  );
};
