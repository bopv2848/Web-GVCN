import React, { useState, useMemo } from 'react';
import type { Student, Group } from '../../../types/student';

export interface AwardStudentBatchListProps {
  students: Student[];
  groups: Group[];
  selectedStudentIds: string[];
  onToggleStudent: (studentId: string) => void;
  onSelectAllFiltered: (filteredIds: string[]) => void;
  onClearSelectedStudents: () => void;
}

export const AwardStudentBatchList: React.FC<AwardStudentBatchListProps> = ({
  students,
  groups,
  selectedStudentIds,
  onToggleStudent,
  onSelectAllFiltered,
  onClearSelectedStudents,
}) => {
  const [studentSearchKeyword, setStudentSearchKeyword] = useState<string>('');
  const [studentGroupFilter, setStudentGroupFilter] = useState<string>('all');

  // Lọc danh sách học sinh theo từ khóa tìm kiếm và theo Tổ
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !studentSearchKeyword.trim() ||
        s.fullName.toLowerCase().includes(studentSearchKeyword.trim().toLowerCase());

      const matchGroup =
        studentGroupFilter === 'all' ||
        s.groupId === studentGroupFilter ||
        s.groupName === groups.find((g) => g.id === studentGroupFilter)?.name;

      return matchSearch && matchGroup;
    });
  }, [students, studentSearchKeyword, studentGroupFilter, groups]);

  const handleSelectAll = () => {
    const visibleIds = filteredStudents.map((s) => s.id);
    onSelectAllFiltered(visibleIds);
  };

  return (
    <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90">
      {/* Thanh tìm kiếm & Lọc theo tổ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Tìm nhanh học sinh theo tên..."
            value={studentSearchKeyword}
            onChange={(e) => setStudentSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 outline-none focus:border-primary font-medium"
          />
          {studentSearchKeyword && (
            <button
              type="button"
              onClick={() => setStudentSearchKeyword('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Nhóm nút lọc theo tổ */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStudentGroupFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              studentGroupFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất cả ({students.length})
          </button>
          {groups.map((g) => {
            const countInGroup = students.filter(
              (s) => s.groupId === g.id || s.groupName === g.name
            ).length;
            const isSelected = studentGroupFilter === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setStudentGroupFilter(g.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {g.name} ({countInGroup})
              </button>
            );
          })}
        </div>
      </div>

      {/* Thanh thao tác nhanh */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/60 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            ✓ Chọn tất cả ({filteredStudents.length} em)
          </button>
          {selectedStudentIds.length > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onClearSelectedStudents}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                ✕ Bỏ chọn tất cả
              </button>
            </>
          )}
        </div>

        <span data-testid="selected-students-count" className="font-bold text-slate-700">
          Đã chọn: <span className="text-primary font-black text-sm">{selectedStudentIds.length}</span> / {students.length} em
        </span>
      </div>

      {/* Danh sách các chip học sinh đã chọn */}
      {selectedStudentIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
          {selectedStudentIds.map((sid) => {
            const std = students.find((s) => s.id === sid);
            if (!std) return null;
            return (
              <span
                key={sid}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20"
              >
                <span>{std.fullName}</span>
                <button
                  type="button"
                  onClick={() => onToggleStudent(sid)}
                  className="hover:text-rose-600 transition-colors font-black ml-0.5 cursor-pointer"
                  title="Bỏ chọn học sinh này"
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Danh sách học sinh dạng lưới Checkbox */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-0.5">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-6 text-center text-xs font-semibold text-slate-400">
            Không tìm thấy học sinh nào phù hợp
          </div>
        ) : (
          filteredStudents.map((s) => {
            const isChecked = selectedStudentIds.includes(s.id);
            return (
              <label
                key={s.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-primary/5 border-primary shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleStudent(s.id)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-850 truncate">
                      {s.fullName}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {s.groupName || 'Tổ ?'}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Điểm: <span className="font-bold text-slate-700">{s.points ?? 0}đ</span>
                    {s.stars ? <span className="text-amber-500 ml-1">⭐ {s.stars}</span> : null}
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};
