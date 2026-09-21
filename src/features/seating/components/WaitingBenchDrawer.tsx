import React, { useState, useMemo } from 'react';
import type { Student } from '../../../types/student';

interface WaitingBenchDrawerProps {
  unassignedStudents: Student[];
  selectedBenchStudent: Student | null;
  onSelectBenchStudent: (student: Student | null) => void;
  onDragStartBenchStudent: (e: React.DragEvent, student: Student) => void;
  onDropOnBench?: (e: React.DragEvent) => void;
  onAutoSeatRemaining?: () => void;
  emptySeatCount: number;
}

export const WaitingBenchDrawer: React.FC<WaitingBenchDrawerProps> = ({
  unassignedStudents,
  selectedBenchStudent,
  onSelectBenchStudent,
  onDragStartBenchStudent,
  onDropOnBench,
  onAutoSeatRemaining,
  emptySeatCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isDragOverBench, setIsDragOverBench] = useState(false);

  // Lọc học sinh theo ô tìm kiếm và Tổ
  const filteredStudents = useMemo(() => {
    return unassignedStudents.filter((s) => {
      const matchSearch =
        !searchQuery.trim() ||
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      const matchGroup =
        selectedGroup === 'all' ||
        (s.groupName && s.groupName.trim() === selectedGroup);

      return matchSearch && matchGroup;
    });
  }, [unassignedStudents, searchQuery, selectedGroup]);

  const groups = ['all', 'Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'];

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOverBench(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOverBench(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOverBench(false);
        if (onDropOnBench) onDropOnBench(e);
      }}
      className={`bg-white rounded-3xl border transition-all shadow-xs print:hidden ${
        isDragOverBench
          ? 'border-amber-400 bg-amber-50/50 ring-4 ring-amber-300/30 scale-[1.005]'
          : 'border-slate-200/80'
      }`}
    >
      {/* 1. Header Drawer */}
      <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl md:text-2xl">🪑</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-black text-slate-850 tracking-tight">
                  Hàng Ghế Chờ Xếp Chỗ
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black transition-colors ${
                    unassignedStudents.length === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {unassignedStudents.length === 0
                    ? '✓ Đã xếp đủ'
                    : `${unassignedStudents.length} em chưa có bàn`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {unassignedStudents.length === 0
                  ? 'Toàn bộ học sinh đã được bố trí vị trí ngồi trên sơ đồ'
                  : 'Kéo thả học sinh vào ô bàn trống hoặc chạm để chọn vị trí'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="md:hidden p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
            title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {isExpanded ? '▲ Thu gọn' : '▼ Mở rộng'}
          </button>
        </div>

        {/* Bộ lọc & Tìm kiếm nhanh */}
        {isExpanded && unassignedStudents.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Input Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên em..."
                className="pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-32 sm:w-40 font-medium"
              />
              <span className="absolute left-2 top-2 text-[11px] text-slate-400">🔍</span>
            </div>

            {/* Filter Tổ */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl text-[11px] font-bold">
              {groups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroup(g)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    selectedGroup === g
                      ? 'bg-white text-slate-900 shadow-2xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {g === 'all' ? 'Tất cả' : g}
                </button>
              ))}
            </div>

            {/* Nút Xếp nhanh vào ghế trống */}
            {onAutoSeatRemaining && emptySeatCount > 0 && (
              <button
                type="button"
                onClick={onAutoSeatRemaining}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Tự động điền các em còn lại vào các ô bàn đang trống"
              >
                <span>⚡</span>
                <span>Điền nhanh ({Math.min(unassignedStudents.length, emptySeatCount)} chỗ)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="hidden md:inline-flex px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              {isExpanded ? '▲ Thu gọn' : '▼ Mở rộng'}
            </button>
          </div>
        )}
      </div>

      {/* 2. Danh sách học sinh trên hàng ghế chờ */}
      {isExpanded && (
        <div className="p-4 md:p-5">
          {unassignedStudents.length === 0 ? (
            <div className="py-6 text-center text-slate-400 space-y-1">
              <p className="text-2xl">🎉</p>
              <p className="text-xs font-bold text-slate-600">
                Lớp học đã xếp đủ chỗ ngồi!
              </p>
              <p className="text-[11px] text-slate-400">
                Không còn học sinh nào đang đứng ở hàng ghế chờ. Kéo học sinh từ bàn xuống đây nếu Thầy muốn gỡ chỗ ngồi.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400 font-medium">
              Không tìm thấy học sinh nào phù hợp với bộ lọc tìm kiếm.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedBenchStudent && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-2 text-xs text-blue-900 animate-fade-in">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>👉</span>
                    <span>
                      Đang chọn: <strong>{selectedBenchStudent.fullName}</strong>. Thầy hãy chạm vào một ô bàn trống trên sơ đồ để xếp chỗ!
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectBenchStudent(null)}
                    className="px-2 py-0.5 rounded-lg bg-blue-200/70 hover:bg-blue-300 text-blue-900 font-bold text-[11px] cursor-pointer"
                  >
                    Hủy chọn
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredStudents.map((student) => {
                  const isSelected = selectedBenchStudent?.id === student.id;
                  const initial =
                    student.fullName.charAt(student.fullName.lastIndexOf(' ') + 1) ||
                    student.fullName.charAt(0);

                  return (
                    <div
                      key={student.id}
                      draggable={true}
                      onDragStart={(e) => onDragStartBenchStudent(e, student)}
                      onClick={() =>
                        onSelectBenchStudent(isSelected ? null : student)
                      }
                      className={`px-3 py-2 rounded-2xl border transition-all cursor-grab active:cursor-grabbing flex items-center gap-2 select-none shadow-2xs ${
                        isSelected
                          ? 'bg-blue-50 border-2 border-primary ring-2 ring-primary/30 scale-105 text-primary font-black'
                          : 'bg-slate-50/90 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs text-slate-850'
                      }`}
                      title={`${student.fullName} (${student.groupName || 'Chưa chia tổ'}) - Kéo thả vào bàn học`}
                    >
                      <span className="text-slate-300 text-[10px] hidden sm:inline">⋮⋮</span>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
                          student.gender === 'Nam'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {initial}
                      </div>

                      <div className="text-left leading-tight">
                        <p className="text-xs font-bold truncate max-w-[120px] sm:max-w-[150px]">
                          {student.fullName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {student.groupName || 'Tổ 1'}
                          {student.classRole && student.classRole !== 'Thành viên' && (
                            <span className="ml-1 text-primary font-bold">
                              • {student.classRole}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
