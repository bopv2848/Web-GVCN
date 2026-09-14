import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { AttendanceStatus } from '../../../types/attendance';

interface GroupAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  uniqueGroups: string[];
  initialGroup?: string;
  initialStatus?: AttendanceStatus;
  groupCounts?: Record<string, number>;
  onApply: (groupName: string, status: AttendanceStatus, note?: string | null) => void;
}

const QUICK_NOTES = [
  '🚩 Đi trực tuần',
  '🎭 Tập văn nghệ 20/11',
  '🏆 Thi đấu TDTT trường',
  '📚 Bồi dưỡng Học sinh giỏi',
  '🌿 Lao động vệ sinh trường',
  '🩺 Khám sức khỏe định kỳ',
];

export const GroupAttendanceModal: React.FC<GroupAttendanceModalProps> = ({
  isOpen,
  onClose,
  uniqueGroups,
  initialGroup = '',
  initialStatus = 'present',
  groupCounts = {},
  onApply,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const defaultGroup =
        initialGroup && uniqueGroups.includes(initialGroup)
          ? initialGroup
          : uniqueGroups[0] || '';
      setSelectedGroup(defaultGroup);
      setStatus(initialStatus);
      if (initialStatus === 'excused_absence') {
        setNote('🚩 Đi trực tuần');
      } else {
        setNote('');
      }
    }
  }, [isOpen, initialGroup, initialStatus, uniqueGroups]);

  if (!isOpen) return null;

  const count = groupCounts[selectedGroup] || 0;

  const handleStatusChange = (newStatus: AttendanceStatus) => {
    setStatus(newStatus);
    if (newStatus === 'present') {
      setNote('');
    } else if (newStatus === 'excused_absence' && !note) {
      setNote('🚩 Đi trực tuần');
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    onApply(selectedGroup, status, note.trim() || null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚡ Điểm Danh Nhanh Theo Tổ" size="md">
      <form onSubmit={handleApply} className="space-y-4">
        {/* 1. Chọn Tổ áp dụng */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
            1. Chọn Tổ áp dụng:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {uniqueGroups.map((g) => {
              const isSelected = selectedGroup === g;
              const memberCount = groupCounts[g];
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroup(g)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{g}</span>
                  {memberCount !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {memberCount} em
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Chọn Trạng thái điểm danh */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
            2. Trạng thái cho cả tổ:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange('present')}
              className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                status === 'present'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/20'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
              }`}
            >
              <span className="text-base">✅</span>
              <div>
                <span className="block font-black">Có mặt tất cả</span>
                <span className={`text-[10px] ${status === 'present' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  Đi học đầy đủ
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('excused_absence')}
              className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                status === 'excused_absence'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                  : 'bg-blue-50/50 border-blue-200 text-blue-800 hover:bg-blue-100/70'
              }`}
            >
              <span className="text-base">📋</span>
              <div>
                <span className="block font-black">Vắng có phép</span>
                <span className={`text-[10px] ${status === 'excused_absence' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Trực tuần, văn nghệ...
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('unexcused_absence')}
              className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                status === 'unexcused_absence'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-600/20'
                  : 'bg-rose-50/50 border-rose-200 text-rose-800 hover:bg-rose-100/70'
              }`}
            >
              <span className="text-base">❌</span>
              <div>
                <span className="block font-black">Vắng K.phép</span>
                <span className={`text-[10px] ${status === 'unexcused_absence' ? 'text-rose-100' : 'text-slate-500'}`}>
                  Nghỉ không lý do
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('late')}
              className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                status === 'late'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-amber-50/50 border-amber-200 text-amber-900 hover:bg-amber-100/70'
              }`}
            >
              <span className="text-base">⏰</span>
              <div>
                <span className="block font-black">Đi học muộn</span>
                <span className={`text-[10px] ${status === 'late' ? 'text-slate-800' : 'text-slate-500'}`}>
                  Cả tổ vào lớp trễ
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Lý do / Ghi chú chung (khi vắng hoặc muộn) */}
        {status !== 'present' && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
              3. Lý do chung cho cả tổ:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_NOTES.map((qn) => (
                <button
                  key={qn}
                  type="button"
                  onClick={() => setNote(qn)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    note === qn
                      ? 'bg-primary text-white border-primary shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {qn}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lý do cụ thể hoặc lời dặn của Thầy..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-850 bg-slate-50 focus:bg-white focus:border-primary outline-none"
            />
          </div>
        )}

        {/* Cảnh báo tác động */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <span>ℹ️</span>
          <span>
            Thao tác này sẽ áp dụng trạng thái{' '}
            <strong className="font-bold">
              {status === 'present'
                ? 'Có mặt'
                : status === 'excused_absence'
                ? 'Vắng có phép'
                : status === 'unexcused_absence'
                ? 'Vắng không phép'
                : 'Đi muộn'}
            </strong>{' '}
            cho toàn bộ <strong className="font-black text-slate-900">{count > 0 ? `${count} học sinh` : ''}</strong> của{' '}
            <strong className="font-black text-primary">{selectedGroup}</strong>.
          </span>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" className="font-black shadow-xs">
            ⚡ Áp dụng cho {selectedGroup}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
