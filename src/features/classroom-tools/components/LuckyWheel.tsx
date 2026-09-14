import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { Student } from '../../../types/student';
import { soundEffects } from '../utils/soundEffects';
import { triggerConfetti } from '../utils/confetti';
import { Button } from '../../../components/common/Button';

const SLICE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

interface LuckyWheelProps {
  students: Student[];
  onStudentPicked: (student: Student) => void;
  calledStudentIds: Set<string>;
  onResetCalled: () => void;
}

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  students,
  onStudentPicked,
  calledStudentIds,
  onResetCalled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [excludeCalled, setExcludeCalled] = useState(true);
  const [currentWinner, setCurrentWinner] = useState<Student | null>(null);

  // Lọc học sinh tham gia quay
  const eligibleStudents = useMemo(() => {
    return students.filter((s) => {
      const matchGroup = selectedGroup === 'all' || s.groupName === selectedGroup;
      const matchCalled = excludeCalled ? !calledStudentIds.has(s.id) : true;
      return matchGroup && matchCalled;
    });
  }, [students, selectedGroup, excludeCalled, calledStudentIds]);

  // Vẽ bánh xe
  const drawWheel = useCallback(
    (rotationAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 14;

      ctx.clearRect(0, 0, size, size);

      if (eligibleStudents.length === 0) {
        ctx.save();
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Đã gọi hết học sinh!', center, center);
        ctx.restore();
        return;
      }

      const sliceAngle = (2 * Math.PI) / eligibleStudents.length;

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(rotationAngle);

      eligibleStudents.forEach((student, idx) => {
        const angle = idx * sliceAngle;

        // Vẽ cung nan quạt
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = SLICE_COLORS[idx % SLICE_COLORS.length];
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Vẽ tên học sinh
        ctx.save();
        ctx.rotate(angle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 3;

        // Cắt gọn tên nếu quá dài
        const displayName = student.fullName.length > 16
          ? student.fullName.slice(0, 15) + '…'
          : student.fullName;
        ctx.fillText(displayName, radius - 15, 4);
        ctx.restore();
      });

      ctx.restore();

      // Vẽ vòng tròn tâm (Center Hub)
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, 28, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#fbbf24';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎲', center, center);
      ctx.restore();

      // Vẽ kim chỉ (Pointer) ở góc trên (12h)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center - 12, 6);
      ctx.lineTo(center + 12, 6);
      ctx.lineTo(center, 32);
      ctx.closePath();
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    },
    [eligibleStudents]
  );

  useEffect(() => {
    drawWheel(0);
  }, [drawWheel]);

  // Kích hoạt quay
  const handleSpin = () => {
    if (isSpinning || eligibleStudents.length === 0) return;

    setIsSpinning(true);
    setCurrentWinner(null);

    // Tính toán góc quay ngẫu nhiên: quay từ 5 đến 8 vòng đầy đủ + góc ngẫu nhiên
    const fullRounds = Math.floor(Math.random() * 4) + 6;
    const randomExtraAngle = Math.random() * 2 * Math.PI;
    const totalSpinAngle = fullRounds * 2 * Math.PI + randomExtraAngle;

    const duration = 4500; // 4.5 giây
    const startTime = performance.now();
    let lastTickSlice = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Hàm gia tốc giảm dần (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = easeOut * totalSpinAngle;

      drawWheel(currentAngle);

      // Tính âm thanh tích tắc khi kim lướt qua từng cung nan quạt
      if (eligibleStudents.length > 0) {
        const sliceAngle = (2 * Math.PI) / eligibleStudents.length;
        const normalizedAngle = (currentAngle % (2 * Math.PI));
        const currentSlice = Math.floor(normalizedAngle / sliceAngle);

        if (currentSlice !== lastTickSlice) {
          soundEffects.playTick();
          lastTickSlice = currentSlice;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);

        // Xác định học sinh tại vị trí kim (kim ở góc 12h = -PI/2 so với tâm)
        const finalAngle = totalSpinAngle % (2 * Math.PI);
        const sliceAngle = (2 * Math.PI) / eligibleStudents.length;

        // Vị trí kim là 3*PI/2 (hoặc -PI/2)
        const pointerAngle = (3 * Math.PI / 2 - finalAngle + 4 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(pointerAngle / sliceAngle) % eligibleStudents.length;
        const winner = eligibleStudents[winningIndex];

        if (winner) {
          setCurrentWinner(winner);
          soundEffects.playWinnerFanfare();
          triggerConfetti();
          onStudentPicked(winner);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center">
      {/* Bộ điều khiển & Bộ lọc */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600">Lọc theo:</span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            disabled={isSpinning}
            className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="all">Toàn Bộ Lớp 6A6 (47 HS)</option>
            <option value="Tổ 1">Tổ 1</option>
            <option value="Tổ 2">Tổ 2</option>
            <option value="Tổ 3">Tổ 3</option>
            <option value="Tổ 4">Tổ 4</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={excludeCalled}
              onChange={(e) => setExcludeCalled(e.target.checked)}
              disabled={isSpinning}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20"
            />
            <span>Không gọi lặp lại ({calledStudentIds.size} đã gọi)</span>
          </label>

          {calledStudentIds.size > 0 && (
            <button
              onClick={onResetCalled}
              disabled={isSpinning}
              className="text-primary hover:underline font-bold text-xs"
            >
              Đặt lại lượt
            </button>
          )}
        </div>
      </div>

      {/* Vòng quay Canvas */}
      <div className="relative my-2">
        <canvas
          ref={canvasRef}
          width={420}
          height={420}
          className="max-w-[340px] sm:max-w-[420px] aspect-square rounded-full shadow-xl shadow-slate-300/40"
        />
      </div>

      {/* Nút bấm quay lớn */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <Button
          onClick={handleSpin}
          disabled={isSpinning || eligibleStudents.length === 0}
          size="lg"
          className="px-8 py-3.5 text-base font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/30 rounded-2xl active:scale-95 transition-all"
        >
          {isSpinning ? '🌀 Đang Quay...' : '🎯 QUAY NGAY (CHỌN HỌC SINH)'}
        </Button>
        <span className="text-xs text-slate-400 font-medium">
          Còn {eligibleStudents.length} học sinh sẵn sàng trong lượt quay này
        </span>
      </div>

      {/* Thẻ học sinh trúng thưởng tức thì */}
      {currentWinner && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center animate-fade-in w-full max-w-sm">
          <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-md">
            Người may mắn
          </span>
          <h4 className="text-lg font-black text-slate-850 mt-1">{currentWinner.fullName}</h4>
          <p className="text-xs text-slate-500 font-semibold">{currentWinner.groupName || 'Lớp 6A6'}</p>
        </div>
      )}
    </div>
  );
};
