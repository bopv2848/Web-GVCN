import React from 'react';
import type { AttendanceStatus } from '../../../types/attendance';

interface AttendanceStatusButtonsProps {
  currentStatus: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
}

export const AttendanceStatusButtons: React.FC<AttendanceStatusButtonsProps> = ({
  currentStatus,
  onChange,
  disabled = false,
}) => {
  const buttons: Array<{
    status: AttendanceStatus;
    label: string;
    shortLabel: string;
    activeClass: string;
    inactiveClass: string;
  }> = [
    {
      status: 'present',
      label: 'Có mặt',
      shortLabel: '✓',
      activeClass: 'bg-emerald-600 text-white font-black shadow-sm ring-2 ring-emerald-600/30',
      inactiveClass: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80',
    },
    {
      status: 'late',
      label: 'Đi muộn',
      shortLabel: '⏰',
      activeClass: 'bg-amber-500 text-slate-950 font-black shadow-sm ring-2 ring-amber-500/30',
      inactiveClass: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80',
    },
    {
      status: 'excused_absence',
      label: 'Có phép',
      shortLabel: 'P',
      activeClass: 'bg-blue-600 text-white font-black shadow-sm ring-2 ring-blue-600/30',
      inactiveClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80',
    },
    {
      status: 'unexcused_absence',
      label: 'K.Phép',
      shortLabel: 'KP',
      activeClass: 'bg-rose-600 text-white font-black shadow-sm ring-2 ring-rose-600/30',
      inactiveClass: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80',
    },
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {buttons.map((b) => {
        const isActive = currentStatus === b.status;
        return (
          <button
            key={b.status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(b.status)}
            className={`min-h-[42px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
              isActive ? b.activeClass : b.inactiveClass
            }`}
            title={b.label}
          >
            <span className="hidden sm:inline">{b.label}</span>
            <span className="sm:hidden">{b.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
};
