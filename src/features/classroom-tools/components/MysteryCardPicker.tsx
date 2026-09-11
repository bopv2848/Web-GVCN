import React, { useState } from 'react';
import type { Student } from '../../../types/student';
import { soundEffects } from '../utils/soundEffects';
import { triggerConfetti } from '../utils/confetti';
import { Button } from '../../../components/common/Button';

interface MysteryCardPickerProps {
  students: Student[];
  onStudentPicked: (student: Student) => void;
  calledStudentIds: Set<string>;
}

export const MysteryCardPicker: React.FC<MysteryCardPickerProps> = ({
  students,
  onStudentPicked,
  calledStudentIds,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isShuffling, setIsShuffling] = useState(false);
  const [revealedStudent, setRevealedStudent] = useState<Student | null>(null);

  const eligibleStudents = students.filter((s) => {
    const matchGroup = selectedGroup === 'all' || s.groupName === selectedGroup;
    return matchGroup && !calledStudentIds.has(s.id);
  });

  const handlePickRandom = () => {
    if (isShuffling || eligibleStudents.length === 0) return;

    setIsShuffling(true);
    setRevealedStudent(null);

    // Hiệu ứng lướt nhanh tên qua 2.5 giây
    let count = 0;
    const interval = setInterval(() => {
      soundEffects.playTick();
      const tempWinner = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];
      setRevealedStudent(tempWinner);
      count++;

      if (count > 15) {
        clearInterval(interval);
        const finalWinner = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];
        setRevealedStudent(finalWinner);
        setIsShuffling(false);
        soundEffects.playWinnerFanfare();
        triggerConfetti();
        onStudentPicked(finalWinner);
      }
    }, 150);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center">
      {/* Bộ lọc */}
      <div className="w-full flex items-center justify-between pb-4 mb-6 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600">Phạm vi bốc thăm:</span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            disabled={isShuffling}
            className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="all">Tất cả lớp (47 HS)</option>
            <option value="Tổ 1">Tổ 1</option>
            <option value="Tổ 2">Tổ 2</option>
            <option value="Tổ 3">Tổ 3</option>
            <option value="Tổ 4">Tổ 4</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Còn {eligibleStudents.length} học sinh chưa gọi
        </span>
      </div>

      {/* Thẻ bài 3D */}
      <div className="my-6">
        <div
          className={`w-64 h-80 rounded-3xl p-6 border-4 flex flex-col items-center justify-between transition-all duration-500 shadow-xl ${
            revealedStudent && !isShuffling
              ? 'bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 border-amber-300 text-slate-900 scale-105 shadow-amber-500/30'
              : 'bg-gradient-to-br from-indigo-900 to-primary border-indigo-700 text-white shadow-indigo-950/40'
          }`}
        >
          <div className="w-full flex items-center justify-between text-xs font-black opacity-80">
            <span>6A6</span>
            <span>⭐ MAY MẮN</span>
          </div>

          <div className="text-center">
            {revealedStudent ? (
              <div className="space-y-2 animate-fade-in">
                <span className="text-5xl block">
                  {revealedStudent.gender === 'Nam' ? '👦' : '👧'}
                </span>
                <h3 className="text-xl font-black tracking-tight line-clamp-2">
                  {revealedStudent.fullName}
                </h3>
                <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-black bg-black/10">
                  {revealedStudent.groupName || 'Tổ thi đua'}
                </span>
              </div>
            ) : (
              <div className="space-y-2 opacity-90">
                <span className="text-6xl block animate-pulse">🃏</span>
                <p className="text-sm font-black tracking-wider uppercase">BỐC THĂM BÍ ẨN</p>
                <p className="text-[11px] text-slate-300">Nhấn nút bên dưới để chọn</p>
              </div>
            )}
          </div>

          <div className="text-[10px] font-bold tracking-widest uppercase opacity-70">
            {isShuffling ? 'ĐANG XÁO THẺ...' : 'WEB GVCN PRO'}
          </div>
        </div>
      </div>

      {/* Nút bốc thăm */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <Button
          onClick={handlePickRandom}
          disabled={isShuffling || eligibleStudents.length === 0}
          size="lg"
          className="px-8 py-3.5 text-base font-black bg-gradient-to-r from-primary to-indigo-700 hover:from-indigo-800 hover:to-indigo-900 text-white shadow-lg shadow-indigo-900/30 rounded-2xl active:scale-95 transition-all"
        >
          {isShuffling ? '🃏 Đang Xáo Thẻ...' : '✨ BỐC THĂM NGAY'}
        </Button>
      </div>
    </div>
  );
};
