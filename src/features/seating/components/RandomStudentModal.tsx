import React from 'react';
import { Button } from '../../../components/common/Button';
import type { Student } from '../../../types/student';
import { ConfettiCanvas } from './ConfettiCanvas';
import { playCountdownBeep, playTimerAlarm } from '../../../utils/soundNotification';

export interface WinnerStudentInfo {
  student: Student;
  seatKey: string;
  aisleName: string;
  deskNumber: number;
  partnerStudent?: Student;
  partnerSeatKey?: string;
  isPair?: boolean;
  isGroup4?: boolean;
  groupStudents?: Student[];
  groupDeskLabel?: string;
  uncalledCount?: number;
  totalMembers?: number;
}

export interface RandomStudentModalProps {
  isOpen: boolean;
  winner: WinnerStudentInfo | null;
  onSpinAgain: () => void;
  onClose: () => void;
  onAwardPoints?: (points: number, reason: string) => Promise<void> | void;
  onAssignTask?: (task: string) => void;
}

export const RandomStudentModal: React.FC<RandomStudentModalProps> = ({
  isOpen,
  winner,
  onSpinAgain,
  onClose,
  onAwardPoints,
  onAssignTask,
}) => {
  const [awardedPoints, setAwardedPoints] = React.useState<number | null>(null);
  const [isAwarding, setIsAwarding] = React.useState<boolean>(false);
  const [assignedTask, setAssignedTask] = React.useState<string | null>(null);
  const [isCustomTaskOpen, setIsCustomTaskOpen] = React.useState<boolean>(false);
  const [customTaskInput, setCustomTaskInput] = React.useState<string>('');

  // Bộ đếm thời gian trả lời / thảo luận nhanh (Quick Challenge Timer)
  const [timerDuration, setTimerDuration] = React.useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = React.useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = React.useState<boolean>(false);
  const [isTimerFinished, setIsTimerFinished] = React.useState<boolean>(false);
  const [isCustomTimerOpen, setIsCustomTimerOpen] = React.useState<boolean>(false);
  const [customMinutesInput, setCustomMinutesInput] = React.useState<string>('');
  const [applySpeedBonus, setApplySpeedBonus] = React.useState<boolean>(true);
  const lastBeepedRef = React.useRef<number | null>(null);

  // Reset trạng thái khi bốc trúng học sinh/đôi bạn/nhóm mới
  React.useEffect(() => {
    setAwardedPoints(null);
    setAssignedTask(null);
    setIsCustomTaskOpen(false);
    setCustomTaskInput('');
    setTimerDuration(null);
    setTimerSecondsLeft(null);
    setIsTimerRunning(false);
    setIsTimerFinished(false);
    setIsCustomTimerOpen(false);
    setCustomMinutesInput('');
    setApplySpeedBonus(true);
    lastBeepedRef.current = null;
  }, [winner?.student.id, winner?.partnerStudent?.id, winner?.groupStudents?.[0]?.id]);

  // Logic đếm lùi từng giây
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  // Âm thanh cảnh báo 5s cuối và chuông hết giờ
  React.useEffect(() => {
    if (!isTimerRunning || timerSecondsLeft === null) return;
    if (timerSecondsLeft > 0 && timerSecondsLeft <= 5 && lastBeepedRef.current !== timerSecondsLeft) {
      lastBeepedRef.current = timerSecondsLeft;
      playCountdownBeep(timerSecondsLeft);
    }
    if (timerSecondsLeft === 0 && lastBeepedRef.current !== 0) {
      lastBeepedRef.current = 0;
      setIsTimerFinished(true);
      setIsTimerRunning(false);
      playTimerAlarm('school');
    }
  }, [timerSecondsLeft, isTimerRunning]);

  const handleStartPreset = (seconds: number) => {
    setTimerDuration(seconds);
    setTimerSecondsLeft(seconds);
    setIsTimerRunning(true);
    setIsTimerFinished(false);
    lastBeepedRef.current = null;
  };

  const handleStartCustomMinutes = (minutesStr: string) => {
    const mins = parseFloat(minutesStr);
    if (!isNaN(mins) && mins > 0) {
      const sec = Math.round(mins * 60);
      handleStartPreset(sec);
      setIsCustomTimerOpen(false);
      setCustomMinutesInput('');
    }
  };

  const handleResetTimer = () => {
    setTimerDuration(null);
    setTimerSecondsLeft(null);
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

  if (!isOpen || !winner) return null;

  const handleAward = async (points: number, reason: string) => {
    if (isAwarding || awardedPoints !== null || !onAwardPoints) return;
    try {
      setIsAwarding(true);
      await onAwardPoints(points, reason);
      setAwardedPoints(points);
    } catch (err) {
      console.error('Lỗi khi cộng điểm thi đua:', err);
    } finally {
      setIsAwarding(false);
    }
  };

  const handleSelectTask = (taskText: string) => {
    if (!taskText.trim()) return;
    setAssignedTask(taskText.trim());
    setIsCustomTaskOpen(false);
    onAssignTask?.(taskText.trim());
  };

  const { student, aisleName, deskNumber, partnerStudent, isPair, isGroup4, groupStudents, groupDeskLabel } = winner;

  // Danh sách các nhiệm vụ gợi ý nhanh tùy theo hình thức
  const suggestedTasks: string[] = isGroup4
    ? [
        '🎤 Đại diện nhóm thuyết trình',
        '🎯 Phụ trách phản biện câu hỏi',
        '📝 Thư ký ghi chép thảo luận',
        '🎨 Vẽ sơ đồ tư duy tóm tắt',
      ]
    : isPair
    ? [
        '🗣️ Cặp đối thoại A-B',
        '🧹 Đôi bạn trực nhật tuần tới',
        '🎯 Phụ trách phản biện',
        '🤝 Đôi bạn cùng tiến học tập',
      ]
    : [
        '🗣️ Trả lời câu hỏi trọng tâm',
        '🧹 Trực nhật lớp tuần tới',
        '📝 Ghi chép biên bản sinh hoạt',
        '🎯 Đặt câu hỏi phản biện',
      ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none"
    >
      <ConfettiCanvas />
      <div
        className={`relative w-full ${
          isGroup4 ? 'max-w-2xl' : isPair && partnerStudent ? 'max-w-xl' : 'max-w-md'
        } bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-400 shadow-2xl text-center space-y-5 animate-scale-up z-10 max-h-[92vh] overflow-y-auto custom-scrollbar`}
      >
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-black text-lg p-2 rounded-full hover:bg-slate-100 cursor-pointer"
          title="Đóng cửa sổ"
        >
          ✕
        </button>

        {/* Biểu tượng chúc mừng */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-400/30 animate-bounce">
            {isGroup4 ? '👨‍👩‍👧‍👦' : isPair ? '👥' : '🎲'}
          </div>
          <span className="absolute -top-2 -right-2 text-2xl animate-spin">✨</span>
          <span className="absolute -bottom-1 -left-2 text-2xl">🎉</span>
        </div>

        {/* Tiêu đề */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
              {isGroup4
                ? 'NHÓM 4 HỌC SINH • ĐẠI DIỆN THUYẾT TRÌNH'
                : isPair
                ? 'ĐÔI BẠN CÙNG BÀN • SINH HOẠT LỚP'
                : 'VÒNG QUAY MAY MẮN • SINH HOẠT LỚP'}
            </span>

            {/* Huy hiệu ưu tiên học sinh chưa gọi */}
            {winner.uncalledCount !== undefined && winner.uncalledCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-black flex items-center gap-1 shadow-2xs">
                <span>⭐</span>
                <span>
                  {winner.uncalledCount === (winner.totalMembers || (isGroup4 ? (groupStudents?.length || 4) : isPair ? 2 : 1))
                    ? '100% Bạn mới chưa gọi'
                    : `Ưu tiên: ${winner.uncalledCount}/${winner.totalMembers || (isGroup4 ? (groupStudents?.length || 4) : isPair ? 2 : 1)} bạn mới`}
                </span>
              </span>
            )}
          </div>

          <h3 className="text-xl font-black text-slate-900 mt-1">
            {isGroup4
              ? 'Nhóm Được Chọn Lên Bảng Thuyết Trình'
              : isPair
              ? 'Cặp Đôi Được Chọn Phát Biểu'
              : 'Học Sinh Được Chọn Phát Biểu'}
          </h3>
        </div>

        {/* Khu vực thông tin đối tượng trúng thưởng */}
        {isGroup4 && groupStudents && groupStudents.length > 0 ? (
          /* 1. HIỂN THỊ NHÓM 4 HỌC SINH (GHÉP BÀN) */
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-300 shadow-inner space-y-3 text-left">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {groupStudents.map((st, idx) => (
                <div
                  key={st.id}
                  className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex flex-col items-center text-center space-y-1.5 shadow-2xs"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-base font-black text-amber-900 overflow-hidden shrink-0">
                    {st.avatarUrl ? (
                      <img src={st.avatarUrl} alt={st.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{st.fullName.charAt(st.fullName.lastIndexOf(' ') + 1) || st.fullName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-[9px] font-black text-amber-600 block uppercase">Bạn {idx + 1}</span>
                    <h4 className="text-xs font-black text-slate-900 leading-tight truncate" title={st.fullName}>
                      {st.fullName}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">{st.groupName || 'Tổ học tập'}</p>
                    {st.classRole && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 text-[9px] font-bold truncate max-w-full">
                        {st.classRole}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Vị trí cụm bàn ghép */}
            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-center gap-2 text-xs sm:text-sm font-black text-amber-950">
              <span>📍 Vị trí cụm bàn:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-200/80 border border-amber-300">
                {groupDeskLabel || `DÃY ${aisleName} • BÀN ${deskNumber} & ${deskNumber + 1}`}
              </span>
            </div>
          </div>
        ) : isPair && partnerStudent ? (
          /* 2. HIỂN THỊ ĐÔI BẠN CÙNG BÀN (2 HỌC SINH) */
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-300 shadow-inner space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Học sinh 1 */}
              <div className="p-3 rounded-xl bg-white/80 border border-amber-200 flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-400 shadow-sm flex items-center justify-center text-xl font-black text-amber-900 overflow-hidden">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{student.fullName.charAt(student.fullName.lastIndexOf(' ') + 1) || student.fullName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">{student.fullName}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{student.groupName || 'Tổ học tập'}</p>
                  {student.classRole && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold">
                      {student.classRole}
                    </span>
                  )}
                </div>
              </div>

              {/* Học sinh 2 */}
              <div className="p-3 rounded-xl bg-white/80 border border-amber-200 flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-400 shadow-sm flex items-center justify-center text-xl font-black text-amber-900 overflow-hidden">
                  {partnerStudent.avatarUrl ? (
                    <img src={partnerStudent.avatarUrl} alt={partnerStudent.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{partnerStudent.fullName.charAt(partnerStudent.fullName.lastIndexOf(' ') + 1) || partnerStudent.fullName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">{partnerStudent.fullName}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{partnerStudent.groupName || 'Tổ học tập'}</p>
                  {partnerStudent.classRole && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold">
                      {partnerStudent.classRole}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vị trí bàn học chung */}
            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-center gap-2 text-xs sm:text-sm font-black text-amber-950">
              <span>📍 Vị trí bàn:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-200/80 border border-amber-300">
                DÃY {aisleName} • BÀN {deskNumber}
              </span>
            </div>
          </div>
        ) : (
          /* 3. HIỂN THỊ CÁ NHÂN (1 HỌC SINH) */
          <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-300 shadow-inner space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white border-2 border-amber-400 shadow-md flex items-center justify-center text-2xl font-black text-amber-900 overflow-hidden">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>
                  {student.fullName.charAt(student.fullName.lastIndexOf(' ') + 1) || student.fullName.charAt(0)}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {student.fullName}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5 text-xs font-bold text-slate-600">
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  {student.groupName || 'Tổ học tập'}
                </span>
                {student.classRole && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 border border-blue-200">
                    {student.classRole}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-center gap-2 text-sm font-black text-amber-950">
              <span>📍 Vị trí:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-200/80 border border-amber-300">
                DÃY {aisleName} • BÀN {deskNumber}
              </span>
            </div>
          </div>
        )}

        {/* KHU VỰC BẤM GIỜ NHANH THẢO LUẬN / TRẢ LỜI (QUICK CHALLENGE TIMER) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 text-white space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span>⏱️</span>
              <span>Bộ Bấm Giờ Thảo Luận Nhanh:</span>
            </span>

            {/* Trạng thái kết thúc hoặc đếm lùi */}
            {isTimerFinished ? (
              <span className="text-xs font-black text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
                🔔 HẾT GIỜ THẢO LUẬN!
              </span>
            ) : timerSecondsLeft !== null ? (
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-base sm:text-lg font-black tracking-widest ${
                    timerSecondsLeft <= 5
                      ? 'text-rose-400 animate-ping'
                      : timerSecondsLeft <= 15
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {formatTimer(timerSecondsLeft)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsTimerRunning((prev) => !prev)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                    isTimerRunning
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {isTimerRunning ? '⏸️ Tạm dừng' : '▶️ Tiếp tục'}
                </button>
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                  title="Đặt lại đồng hồ"
                >
                  🔄 Đặt lại
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Chọn mốc phát lệnh:</span>
            )}
          </div>

          {/* Các mốc thời gian mẫu 30s, 1p, 2p, 3p, 5p, 7p và nút tùy chỉnh */}
          <div className="flex flex-wrap gap-1.5">
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
                  onClick={() => handleStartPreset(preset.sec)}
                  className={`flex-1 min-w-[62px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-[1.02]'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400/50'
                  }`}
                >
                  <span>⏱️</span>
                  <span>{preset.label}</span>
                </button>
              );
            })}

            {/* Nút tùy chỉnh số phút */}
            <button
              type="button"
              onClick={() => setIsCustomTimerOpen((prev) => !prev)}
              className={`py-1.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                isCustomTimerOpen
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-dashed border-amber-500/40 hover:border-amber-400'
              }`}
            >
              <span>✏️</span>
              <span>Tùy chỉnh</span>
            </button>
          </div>

          {/* Hộp nhập số phút tùy ý */}
          {isCustomTimerOpen && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 animate-fade-in">
              <input
                type="number"
                min="0.5"
                max="120"
                step="0.5"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                placeholder="Nhập số phút thuyết trình (ví dụ: 4, 10, 15...)"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStartCustomMinutes(customMinutesInput);
                }}
              />
              <button
                type="button"
                disabled={!customMinutesInput.trim()}
                onClick={() => handleStartCustomMinutes(customMinutesInput)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-black cursor-pointer shadow-xs"
              >
                Hẹn Giờ
              </button>
            </div>
          )}

          {/* Thanh tiến trình thời gian */}
          {timerDuration !== null && timerSecondsLeft !== null && (
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timerSecondsLeft <= 5
                    ? 'bg-rose-500'
                    : timerSecondsLeft <= 15
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{
                  width: `${Math.min(100, (timerSecondsLeft / timerDuration) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* KHU VỰC 1: THƯỞNG ĐIỂM THI ĐUA TRỰC TIẾP */}
        <div className="pt-2 border-t border-slate-100 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <span>⭐ Thưởng Điểm Thi Đua:</span>
            </span>
            {awardedPoints !== null && (
              <span className="text-xs font-black text-emerald-600 animate-fade-in flex items-center gap-1">
                <span>
                  ✓ Đã cộng +{awardedPoints} điểm
                  {isGroup4
                    ? ` cho cả nhóm (${groupStudents?.length || 4} bạn)!`
                    : isPair && partnerStudent
                    ? ' cho cả 2 bạn!'
                    : '!'}
                </span>
              </span>
            )}
          </div>

          {/* Gợi ý thưởng tốc độ khi đồng hồ còn thời gian */}
          {timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0 && awardedPoints === null && (
            <div className="p-2 px-3 rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-300 flex items-center justify-between text-xs animate-fade-in shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                <span className="text-amber-500 animate-pulse text-base">⚡</span>
                <span>
                  Trả lời nhanh trước giờ (còn <strong>{formatTimer(timerSecondsLeft)}</strong>)!
                </span>
              </div>
              <label className="flex items-center gap-1.5 font-black text-amber-950 cursor-pointer select-none bg-white/90 px-2 py-0.5 rounded-lg border border-amber-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={applySpeedBonus}
                  onChange={(e) => setApplySpeedBonus(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>+1đ Thưởng tốc độ</span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isAwarding || awardedPoints !== null || !onAwardPoints}
              onClick={() => {
                const bonus = (applySpeedBonus && timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0) ? 1 : 0;
                const total = 2 + bonus;
                const reason = bonus > 0
                  ? `Phát biểu xây dựng bài trong tiết sinh hoạt (+1đ Thưởng tốc độ phản xạ khi còn ${formatTimer(timerSecondsLeft!)})`
                  : 'Phát biểu xây dựng bài trong tiết sinh hoạt';
                handleAward(total, reason);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                awardedPoints !== null && (awardedPoints === 2 || awardedPoints === 3)
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                  : awardedPoints !== null
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400'
              }`}
              title="Cộng 2 điểm phát biểu"
            >
              <span className="text-sm">
                ⭐ +{2 + ((applySpeedBonus && timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0) ? 1 : 0)} Điểm
              </span>
              <span className="text-[10px] font-normal opacity-80">
                {(applySpeedBonus && timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0) ? 'Phát biểu + Tốc độ' : 'Phát biểu'}
              </span>
            </button>

            <button
              type="button"
              disabled={isAwarding || awardedPoints !== null || !onAwardPoints}
              onClick={() => {
                const bonus = (applySpeedBonus && timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0) ? 1 : 0;
                const total = 5 + bonus;
                const reason = bonus > 0
                  ? `Trả lời xuất sắc trong tiết sinh hoạt (+1đ Thưởng tốc độ phản xạ khi còn ${formatTimer(timerSecondsLeft!)})`
                  : 'Trả lời xuất sắc trong tiết sinh hoạt';
                handleAward(total, reason);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                awardedPoints !== null && (awardedPoints === 5 || awardedPoints === 6)
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                  : awardedPoints !== null
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200 hover:border-amber-500 shadow-2xs'
              }`}
              title="Cộng 5 điểm phát biểu xuất sắc"
            >
              <span className="text-sm">
                🌟 +{5 + ((applySpeedBonus && timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0) ? 1 : 0)} Điểm
              </span>
              <span className="text-[10px] font-semibold text-amber-900">
                {(applySpeedBonus && timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0) ? 'Xuất sắc + Tốc độ' : 'Xuất sắc'}
              </span>
            </button>

            <button
              type="button"
              disabled={isAwarding || awardedPoints !== null || !onAwardPoints}
              onClick={() => {
                const bonus = (applySpeedBonus && timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0) ? 1 : 0;
                const total = 10 + bonus;
                const reason = bonus > 0
                  ? `Tuyên dương tích cực tiết sinh hoạt (+1đ Thưởng tốc độ phản xạ khi còn ${formatTimer(timerSecondsLeft!)})`
                  : 'Tuyên dương tích cực tiết sinh hoạt';
                handleAward(total, reason);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                awardedPoints !== null && (awardedPoints === 10 || awardedPoints === 11)
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                  : awardedPoints !== null
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-orange-50 text-orange-950 border-orange-300 hover:bg-orange-100 hover:border-orange-400'
              }`}
              title="Cộng 10 điểm tuyên dương gương mẫu"
            >
              <span className="text-sm">
                🏆 +{10 + ((applySpeedBonus && timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0) ? 1 : 0)} Điểm
              </span>
              <span className="text-[10px] font-normal opacity-80">
                {(applySpeedBonus && timerDuration !== null && timerSecondsLeft !== null && timerSecondsLeft > 0) ? 'Tuyên dương + Tốc độ' : 'Tuyên dương'}
              </span>
            </button>
          </div>
        </div>

        {/* KHU VỰC 2: GÁN NHIỆM VỤ NHANH TIẾT SINH HOẠT (QUICK TASK ASSIGNMENT) */}
        <div className="pt-2 border-t border-slate-100 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <span>📋 Gán Nhiệm Vụ Nhanh:</span>
            </span>
            {assignedTask && (
              <span className="text-xs font-black text-sky-600 animate-fade-in flex items-center gap-1">
                <span>✓ Đã gán: {assignedTask}</span>
              </span>
            )}
          </div>

          {/* Các nút nhiệm vụ có sẵn */}
          <div className="flex flex-wrap gap-1.5">
            {suggestedTasks.map((t) => {
              const isSelected = assignedTask === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleSelectTask(t)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-sky-900 hover:border-sky-300'
                  }`}
                >
                  {t}
                </button>
              );
            })}

            {/* Nút tự nhập nhiệm vụ khác */}
            <button
              type="button"
              onClick={() => setIsCustomTaskOpen((prev) => !prev)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isCustomTaskOpen
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-100 text-slate-600 border-dashed border-slate-300 hover:bg-slate-200'
              }`}
            >
              ✍️ Tự nhập...
            </button>
          </div>

          {/* Hộp nhập nhiệm vụ tùy ý */}
          {isCustomTaskOpen && (
            <div className="flex items-center gap-2 pt-1 animate-fade-in">
              <input
                type="text"
                value={customTaskInput}
                onChange={(e) => setCustomTaskInput(e.target.value)}
                placeholder="Nhập nhiệm vụ (ví dụ: Soạn bài văn số 2...)"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSelectTask(customTaskInput);
                  }
                }}
              />
              <button
                type="button"
                disabled={!customTaskInput.trim()}
                onClick={() => handleSelectTask(customTaskInput)}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-black cursor-pointer"
              >
                Gán
              </button>
            </div>
          )}
        </div>

        {/* CỤM NÚT HÀNH ĐỘNG CUỐI MODAL */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onSpinAgain}
            className="border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100 font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>🎲</span>
            <span>Bốc Thăm Bạn Khác</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-2xl shadow-md cursor-pointer"
          >
            Hoàn Thành (ESC)
          </Button>
        </div>
      </div>
    </div>
  );
};
