import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { Student } from '../../../types/student';

interface PickedStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onAwardPoints: (student: Student) => void;
  onSpinAgain: () => void;
}

export const PickedStudentModal: React.FC<PickedStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onAwardPoints,
  onSpinAgain,
}) => {
  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎉 Chúc Mừng Học Sinh Được Chọn!">
      <div className="text-center py-4 space-y-5">
        {/* Avatar & Icon */}
        <div className="relative inline-block">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black text-4xl flex items-center justify-center shadow-lg shadow-amber-500/30 border-4 border-white animate-bounce">
            {student.gender === 'Nam' ? '👦' : '👧'}
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black bg-primary text-white border border-white shadow-xs">
            {student.groupName || 'Tổ thi đua'}
          </span>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {student.fullName}
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Mã HS: <span className="font-mono text-primary">{student.code || '6A6'}</span>
            {student.classRole && ` • Chức vụ: ${student.classRole}`}
          </p>
        </div>

        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium max-w-sm mx-auto">
          ✨ Học sinh đã được chọn ngẫu nhiên trả lời câu hỏi hoặc tham gia hoạt động tiết học!
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            onClick={() => {
              onClose();
              onAwardPoints(student);
            }}
            className="w-full sm:w-auto text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
          >
            ⭐ Khen Thưởng / Tích Điểm
          </Button>

          <Button
            onClick={() => {
              onClose();
              onSpinAgain();
            }}
            variant="outline"
            className="w-full sm:w-auto text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
          >
            🎲 Quay Tiếp Em Khác
          </Button>

          <Button onClick={onClose} variant="ghost" size="sm" className="text-xs font-bold text-slate-400">
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
