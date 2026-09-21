import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../components/common/Button';
import { ConfettiCanvas } from './ConfettiCanvas';
import type { BattleMatch } from '../types/battleTypes';
import { playCountdownBeep, playTimerAlarm } from '../../../utils/soundNotification';

export interface TeamBattleModalProps {
  isOpen: boolean;
  battle: BattleMatch | null;
  onSpinAgain: () => void;
  onClose: () => void;
  onAwardPoints?: (team: 'teamA' | 'teamB' | 'both', points: number, reason: string) => Promise<void> | void;
  onAssignTask?: (task: string) => void;
}

export const TeamBattleModal: React.FC<TeamBattleModalProps> = ({
  isOpen,
  battle,
  onSpinAgain,
  onClose,
  onAwardPoints,
  onAssignTask,
}) => {
  const [awardedWinner, setAwardedWinner] = useState<'teamA' | 'teamB' | 'both' | null>(null);
  const [isAwarding, setIsAwarding] = useState(false);
  const [assignedTask, setAssignedTask] = useState<string | null>(null);
  const [isCustomTaskOpen, setIsCustomTaskOpen] = useState(false);
  const [customTaskInput, setCustomTaskInput] = useState('');

  // Bộ đếm thời gian đấu trí đối kháng (Quick Battle Timer)
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [battleSeconds, setBattleSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerFinished, setIsTimerFinished] = useState(false);
  const [isCustomTimerOpen, setIsCustomTimerOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const [applySpeedBonus, setApplySpeedBonus] = useState(true);
  const lastBeepedRef = useRef<number | null>(null);

  // Reset state khi mở cặp đấu mới
  useEffect(() => {
    setAwardedWinner(null);
    setIsAwarding(false);
    setAssignedTask(null);
    setIsCustomTaskOpen(false);
    setCustomTaskInput('');
    setBattleSeconds(null);
    setTimerDuration(null);
    setIsTimerRunning(false);
    setIsTimerFinished(false);
    setIsCustomTimerOpen(false);
    setCustomMinutesInput('');
    setApplySpeedBonus(true);
    lastBeepedRef.current = null;
  }, [battle?.id]);

  // Logic đếm ngược thời gian đấu trí
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTimerRunning && battleSeconds !== null && battleSeconds > 0) {
      timer = setInterval(() => {
        setBattleSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, battleSeconds]);

  // Phát âm thanh cảnh báo 5 giây cuối và chuông kẻng kết thúc
  useEffect(() => {
    if (!isTimerRunning || battleSeconds === null) return;
    if (battleSeconds > 0 && battleSeconds <= 5 && lastBeepedRef.current !== battleSeconds) {
      lastBeepedRef.current = battleSeconds;
      playCountdownBeep(battleSeconds);
    }
    if (battleSeconds === 0 && lastBeepedRef.current !== 0) {
      lastBeepedRef.current = 0;
      setIsTimerFinished(true);
      setIsTimerRunning(false);
      playTimerAlarm('gong');
    }
  }, [battleSeconds, isTimerRunning]);

  const handleStartTimerPreset = (sec: number) => {
    setBattleSeconds(sec);
    setTimerDuration(sec);
    setIsTimerRunning(true);
    setIsTimerFinished(false);
    lastBeepedRef.current = null;
  };

  const handleStartCustomMinutes = (minsStr: string) => {
    const mins = parseFloat(minsStr);
    if (!isNaN(mins) && mins > 0) {
      handleStartTimerPreset(Math.round(mins * 60));
      setIsCustomTimerOpen(false);
      setCustomMinutesInput('');
    }
  };

  const handleResetTimer = () => {
    setBattleSeconds(null);
    setTimerDuration(null);
    setIsTimerRunning(false);
    setIsTimerFinished(false);
    setIsCustomTimerOpen(false);
    setCustomMinutesInput('');
    lastBeepedRef.current = null;
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !battle) return null;

  const { teamA, teamB, label } = battle;

  const handleAward = async (winner: 'teamA' | 'teamB' | 'both', points: number, reason: string) => {
    if (isAwarding || awardedWinner !== null || !onAwardPoints) return;
    try {
      setIsAwarding(true);
      await onAwardPoints(winner, points, reason);
      setAwardedWinner(winner);
    } catch (err) {
      console.error('Lỗi khi cộng điểm thi đấu đối kháng:', err);
    } finally {
      setIsAwarding(false);
    }
  };

  const handleSelectTask = (taskText: string) => {
    if (!taskText.trim()) return;
    const finalTask = taskText.trim();
    setAssignedTask(finalTask);
    setIsCustomTaskOpen(false);
    onAssignTask?.(finalTask);
  };

  const suggestedTasks = [
    '🎤 Tranh biện chủ đề tiết sinh hoạt',
    '📐 Thi giải nhanh bài tập nâng cao',
    '🔔 Rung chuông vàng: Ai nhanh hơn?',
    '🎯 Thử thách hùng biện đối đầu',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none"
    >
      {/* Pháo hoa giấy tung bay khi có đội chiến thắng hoặc hòa */}
      {awardedWinner && <ConfettiCanvas />}

      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-5 md:p-7 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-white text-center animate-scale-up overflow-hidden">
        {/* Nút Đóng Popup */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/80 transition-colors z-20 cursor-pointer"
          aria-label="Đóng bảng đối kháng"
        >
          ✕
        </button>

        {/* Tiêu đề Modal Đối Kháng */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black tracking-widest uppercase">
            <span>⚔️</span>
            <span>Đấu Trí Đối Kháng • Tiết Sinh Hoạt Lớp</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>CUỘC ĐỐI ĐẦU 2 DÃY:</span>
            <span className="text-amber-400">{label}</span>
          </h2>
        </div>

        {/* Khung 2 Chiến Tuyến: Đội A vs Đội B */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-stretch mb-5">
          {/* CỘT ĐỘI A (Dãy 1 / Dãy Trái - Xanh Sky) */}
          <div
            className={`md:col-span-5 rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
              awardedWinner === 'teamA'
                ? 'bg-sky-950/70 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.4)]'
                : awardedWinner === 'teamB'
                ? 'bg-slate-900/40 border-slate-800 opacity-60'
                : 'bg-sky-950/40 border-sky-600/50 hover:border-sky-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-sky-800/60 pb-2 mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
                  <span className="text-xs font-black text-sky-400 uppercase tracking-wider truncate">
                    {teamA.name}
                  </span>
                  {battle.uncalledCountTeamA !== undefined && battle.uncalledCountTeamA > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black shrink-0">
                      ⭐ {battle.uncalledCountTeamA === teamA.students.length ? '100% Mới' : `${battle.uncalledCountTeamA}/${teamA.students.length} mới`}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-300 bg-sky-900/60 px-2 py-0.5 rounded-md border border-sky-700/50 shrink-0">
                  {teamA.deskLabel}
                </span>
              </div>

              {/* Danh sách học sinh Đội A */}
              <div className="space-y-2">
                {teamA.students.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-xl border border-sky-900/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-600/30 border border-sky-400/50 flex items-center justify-center font-black text-sky-300 text-sm shrink-0">
                      {st.fullName.trim().charAt(0)}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-black text-sm text-white truncate">{st.fullName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{st.groupName || 'Chưa chia tổ'}</span>
                        {st.classRole && (
                          <span className="text-amber-400 font-bold bg-amber-400/10 px-1 rounded text-[10px]">
                            {st.classRole}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút cộng điểm cho Đội A */}
            <div className="mt-4 pt-3 border-t border-sky-900/50 space-y-1.5">
              {battleSeconds !== null && battleSeconds > 0 && awardedWinner === null && (
                <div className="flex items-center justify-between px-2 py-1 text-[10px] text-sky-300 font-bold bg-sky-950/80 rounded-lg border border-sky-800/60">
                  <span>⚡ Còn {formatTimer(battleSeconds)}</span>
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={applySpeedBonus}
                      onChange={(e) => setApplySpeedBonus(e.target.checked)}
                      className="rounded text-sky-500 focus:ring-sky-400 cursor-pointer"
                    />
                    <span>+1đ Tốc độ</span>
                  </label>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  const bonus = (applySpeedBonus && battleSeconds !== null && battleSeconds > 0) ? 1 : 0;
                  const pts = 5 + bonus;
                  const reason = bonus > 0
                    ? `Chiến thắng cuộc thi Đối kháng (${teamA.name}) - Kèm thưởng tốc độ phản xạ (${formatTimer(battleSeconds!)})`
                    : `Chiến thắng cuộc thi Đối kháng (${teamA.name})`;
                  handleAward('teamA', pts, reason);
                }}
                disabled={isAwarding || awardedWinner !== null}
                className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                  awardedWinner === 'teamA'
                    ? 'bg-sky-500 text-white shadow-sky-500/40'
                    : 'bg-sky-600 hover:bg-sky-500 text-white hover:scale-[1.02]'
                }`}
              >
                <span>🏆</span>
                <span>
                  {awardedWinner === 'teamA'
                    ? '✓ Đội A Đã Nhận Điểm'
                    : (applySpeedBonus && battleSeconds !== null && battleSeconds > 0)
                    ? '+6 Điểm Đội A Thắng (+1đ tốc độ)'
                    : '+5 Điểm Đội A Thắng'}
                </span>
              </button>
            </div>
          </div>

          {/* CỘT GIỮA: BIỂU TƯỢNG VS & BỘ ĐẾM GIỜ ĐẤU TRÍ ĐỐI KHÁNG */}
          <div className="md:col-span-2 flex flex-col items-center justify-between py-3 px-2 bg-slate-950/70 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center font-black text-amber-300 text-base shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
              VS
            </div>

            {/* Bộ đếm giờ đấu trí đối kháng */}
            <div className="w-full my-2 text-center space-y-2">
              {isTimerFinished ? (
                <div className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-1.5 rounded-lg border border-rose-500/40 animate-pulse">
                  🔔 HẾT GIỜ TRANH TÀI!
                </div>
              ) : battleSeconds !== null ? (
                <div className="space-y-1">
                  <div
                    className={`font-mono text-xl sm:text-2xl font-black tracking-widest ${
                      battleSeconds <= 5
                        ? 'text-rose-400 animate-ping'
                        : battleSeconds <= 15
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {formatTimer(battleSeconds)}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning((prev) => !prev)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-black cursor-pointer transition-colors ${
                        isTimerRunning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      }`}
                    >
                      {isTimerRunning ? '⏸️ Dừng' : '▶️ Tiếp'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTimer}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 font-bold cursor-pointer transition-colors"
                      title="Đặt lại đồng hồ"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 font-bold block">⏱️ Hẹn giờ thi:</span>
              )}

              {/* Các mốc thời gian 30s, 1p, 2p, 3p, 5p, 7p */}
              <div className="grid grid-cols-2 gap-1 w-full">
                {[
                  { label: '30s', sec: 30 },
                  { label: '1 Phút', sec: 60 },
                  { label: '2 Phút', sec: 120 },
                  { label: '3 Phút', sec: 180 },
                  { label: '5 Phút', sec: 300 },
                  { label: '7 Phút', sec: 420 },
                ].map((preset) => {
                  const isSelected = timerDuration === preset.sec && !isTimerFinished;
                  return (
                    <button
                      key={preset.sec}
                      type="button"
                      onClick={() => handleStartTimerPreset(preset.sec)}
                      className={`px-1 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs scale-[1.02]'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400/60'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Nút tùy chỉnh số phút đối kháng */}
              <button
                type="button"
                onClick={() => setIsCustomTimerOpen(!isCustomTimerOpen)}
                className={`w-full py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  isCustomTimerOpen
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-900 text-slate-400 border-dashed border-slate-700 hover:border-amber-400/50 hover:text-amber-300'
                }`}
              >
                ✏️ Tùy chỉnh phút
              </button>

              {isCustomTimerOpen && (
                <div className="flex items-center gap-1 pt-1 animate-fade-in">
                  <input
                    type="number"
                    min="0.5"
                    max="60"
                    step="0.5"
                    value={customMinutesInput}
                    onChange={(e) => setCustomMinutesInput(e.target.value)}
                    placeholder="Số phút..."
                    className="w-full px-1.5 py-1 text-[10px] bg-slate-900 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 text-center"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleStartCustomMinutes(customMinutesInput);
                    }}
                  />
                  <button
                    type="button"
                    disabled={!customMinutesInput.trim()}
                    onClick={() => handleStartCustomMinutes(customMinutesInput)}
                    className="px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-[10px] font-black cursor-pointer shrink-0"
                  >
                    Bắt đầu
                  </button>
                </div>
              )}
            </div>

            {/* Nút Hòa Nhau */}
            <button
              type="button"
              onClick={() => {
                const bonus = (applySpeedBonus && battleSeconds !== null && battleSeconds > 0) ? 1 : 0;
                const pts = 3 + bonus;
                const reason = bonus > 0
                  ? `Hòa nhau trong cuộc thi Đối kháng (${teamA.name} vs ${teamB.name}) - Kèm thưởng tốc độ (${formatTimer(battleSeconds!)})`
                  : `Hòa nhau trong cuộc thi Đối kháng (${teamA.name} vs ${teamB.name})`;
                handleAward('both', pts, reason);
              }}
              disabled={isAwarding || awardedWinner !== null}
              className={`w-full py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                awardedWinner === 'both'
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
              title="Cả hai đội ngang tài ngang sức: cộng 3 điểm thi đua cho cả 2 đội"
            >
              {awardedWinner === 'both'
                ? '✓ Đã Thưởng Cả 2'
                : (applySpeedBonus && battleSeconds !== null && battleSeconds > 0)
                ? '🤝 Hòa (+4đ có tốc độ)'
                : '🤝 Hòa (+3đ)'}
            </button>
          </div>

          {/* CỘT ĐỘI B (Dãy 2 / Dãy Phải - Vàng Cam Amber) */}
          <div
            className={`md:col-span-5 rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
              awardedWinner === 'teamB'
                ? 'bg-amber-950/70 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                : awardedWinner === 'teamA'
                ? 'bg-slate-900/40 border-slate-800 opacity-60'
                : 'bg-amber-950/40 border-amber-600/50 hover:border-amber-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-amber-800/60 pb-2 mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider truncate">
                    {teamB.name}
                  </span>
                  {battle.uncalledCountTeamB !== undefined && battle.uncalledCountTeamB > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black shrink-0">
                      ⭐ {battle.uncalledCountTeamB === teamB.students.length ? '100% Mới' : `${battle.uncalledCountTeamB}/${teamB.students.length} mới`}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-300 bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-700/50 shrink-0">
                  {teamB.deskLabel}
                </span>
              </div>

              {/* Danh sách học sinh Đội B */}
              <div className="space-y-2">
                {teamB.students.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-xl border border-amber-900/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-600/30 border border-amber-400/50 flex items-center justify-center font-black text-amber-300 text-sm shrink-0">
                      {st.fullName.trim().charAt(0)}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-black text-sm text-white truncate">{st.fullName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{st.groupName || 'Chưa chia tổ'}</span>
                        {st.classRole && (
                          <span className="text-amber-400 font-bold bg-amber-400/10 px-1 rounded text-[10px]">
                            {st.classRole}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút cộng điểm cho Đội B */}
            <div className="mt-4 pt-3 border-t border-amber-900/50 space-y-1.5">
              {battleSeconds !== null && battleSeconds > 0 && awardedWinner === null && (
                <div className="flex items-center justify-between px-2 py-1 text-[10px] text-amber-300 font-bold bg-amber-950/80 rounded-lg border border-amber-800/60">
                  <span>⚡ Còn {formatTimer(battleSeconds)}</span>
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={applySpeedBonus}
                      onChange={(e) => setApplySpeedBonus(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                    <span>+1đ Tốc độ</span>
                  </label>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  const bonus = (applySpeedBonus && battleSeconds !== null && battleSeconds > 0) ? 1 : 0;
                  const pts = 5 + bonus;
                  const reason = bonus > 0
                    ? `Chiến thắng cuộc thi Đối kháng (${teamB.name}) - Kèm thưởng tốc độ phản xạ (${formatTimer(battleSeconds!)})`
                    : `Chiến thắng cuộc thi Đối kháng (${teamB.name})`;
                  handleAward('teamB', pts, reason);
                }}
                disabled={isAwarding || awardedWinner !== null}
                className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                  awardedWinner === 'teamB'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-amber-500/40'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-[1.02]'
                }`}
              >
                <span>🏆</span>
                <span>
                  {awardedWinner === 'teamB'
                    ? '✓ Đội B Đã Nhận Điểm'
                    : (applySpeedBonus && battleSeconds !== null && battleSeconds > 0)
                    ? '+6 Điểm Đội B Thắng (+1đ tốc độ)'
                    : '+5 Điểm Đội B Thắng'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Khu vực Gán nhiệm vụ đối kháng (Quick Challenge Assignment) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 mb-5 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <span>🎯</span>
              <span>Gán thử thách đối kháng cho 2 đội:</span>
            </span>
            {assignedTask && (
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ✓ Đã gán: {assignedTask}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            {suggestedTasks.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleSelectTask(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  assignedTask === t
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomTaskOpen(!isCustomTaskOpen)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
            >
              ✏️ Tự nhập
            </button>
          </div>

          {isCustomTaskOpen && (
            <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-800">
              <input
                type="text"
                value={customTaskInput}
                onChange={(e) => setCustomTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelectTask(customTaskInput);
                }}
                placeholder="Nhập thử thách thi đua cho 2 đội..."
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleSelectTask(customTaskInput)}
                disabled={!customTaskInput.trim()}
                className="text-xs py-1 px-3 h-auto"
              >
                Gán
              </Button>
            </div>
          )}
        </div>

        {/* Thanh Điều Khiển Dưới Cùng */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-slate-700 text-slate-400 hover:text-white"
          >
            Đóng (ESC)
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onSpinAgain}
            className="font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <span>⚔️</span>
            <span>Bốc Cặp Đấu Khác (Phím R)</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
