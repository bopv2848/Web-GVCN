import React from 'react';
import type { SeatAssignmentWithStudent } from '../../../types/seating';

interface FloatingSwapActionBarProps {
  selectedSourceSeat: {
    assignment: SeatAssignmentWithStudent;
    rowIndex: number;
    colIndex: number;
  } | null;
  onCancel: () => void;
}

export const FloatingSwapActionBar: React.FC<FloatingSwapActionBarProps> = ({
  selectedSourceSeat,
  onCancel,
}) => {
  if (!selectedSourceSeat) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 backdrop-blur-md max-w-lg w-[90%] sm:w-auto animate-pulse">
      <span className="text-xl">🔄</span>
      <div className="min-w-0">
        <p className="text-xs font-black truncate">
          Đang chọn: {selectedSourceSeat.assignment.student?.fullName} (Bàn {selectedSourceSeat.rowIndex + 1})
        </p>
        <p className="text-[11px] text-slate-300 truncate">
          👉 Chạm vào bạn học sinh khác hoặc ghế trống để đổi chỗ!
        </p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
      >
        Hủy
      </button>
    </div>
  );
};
