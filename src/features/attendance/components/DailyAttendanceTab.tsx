import React from 'react';
import { AttendanceStatusButtons } from './AttendanceStatusButtons';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import type {
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  SessionType,
} from '../../../types/attendance';

interface DailyAttendanceTabProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedType: SessionType;
  onTypeChange: (type: SessionType) => void;
  session: AttendanceSession | null;
  records: AttendanceRecord[];
  isLoading: boolean;
  canManageLock: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGroup: string;
  onGroupChange: (g: string) => void;
  uniqueGroups: string[];
  filteredRecords: AttendanceRecord[];
  recentlyUpdatedId: string | null;
  stats: {
    total: number;
    presentCount: number;
    lateCount: number;
    excusedCount: number;
    unexcusedCount: number;
    rate: number;
  };
  onStatusChange: (recordId: string, status: AttendanceStatus) => void;
  onEditNote: (record: AttendanceRecord) => void;
  onMarkAllPresent: () => void;
  onToggleLock: () => void;
  onPrint: () => void;
}

export const DailyAttendanceTab: React.FC<DailyAttendanceTabProps> = ({
  selectedDate,
  onDateChange,
  selectedType,
  onTypeChange,
  session,
  isLoading,
  canManageLock,
  searchQuery,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  uniqueGroups,
  filteredRecords,
  recentlyUpdatedId,
  stats,
  onStatusChange,
  onEditNote,
  onMarkAllPresent,
  onToggleLock,
  onPrint,
}) => {
  return (
    <div className="space-y-6 print:hidden">
      {/* 1. Action Bar Hàng ngày */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
          />

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onTypeChange('morning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'morning'
                  ? 'bg-white text-primary shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ☀️ Buổi Sáng
            </button>
            <button
              type="button"
              onClick={() => onTypeChange('afternoon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'afternoon'
                  ? 'bg-white text-primary shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🌤️ Buổi Chiều
            </button>
          </div>

          {session?.isLocked && (
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
              🔒 Đã khóa sổ
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!session?.isLocked && (
            <Button
              type="button"
              onClick={onMarkAllPresent}
              variant="outline"
              size="sm"
              className="text-xs font-bold"
            >
              ✅ Có mặt tất cả
            </Button>
          )}

          {canManageLock && (
            <Button
              type="button"
              onClick={onToggleLock}
              variant={session?.isLocked ? 'danger' : 'outline'}
              size="sm"
              className="text-xs font-bold"
            >
              {session?.isLocked ? '🔓 Mở khóa sửa' : '🔒 Khóa sổ buổi'}
            </Button>
          )}

          <Button
            type="button"
            onClick={onPrint}
            variant="primary"
            size="sm"
            className="text-xs font-black shadow-xs shadow-primary/20"
          >
            🖨️ In Phiếu A4
          </Button>
        </div>
      </div>

      {/* 2. Thẻ KPI Thống Kê Nhanh Buổi Học */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sĩ số lớp</span>
          <p className="text-xl font-black text-slate-800 mt-0.5">{stats.total} <span className="text-xs font-semibold text-slate-400">em</span></p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Có mặt</span>
          <p className="text-xl font-black text-emerald-600 mt-0.5">{stats.presentCount} <span className="text-xs font-semibold text-slate-400">em</span></p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase">Nghỉ có phép</span>
          <p className="text-xl font-black text-blue-600 mt-0.5">{stats.excusedCount} <span className="text-xs font-semibold text-slate-400">em</span></p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase">Nghỉ K.Phép</span>
          <p className="text-xl font-black text-rose-600 mt-0.5">{stats.unexcusedCount} <span className="text-xs font-semibold text-slate-400">em</span></p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-500 uppercase">Đi muộn</span>
          <p className="text-xl font-black text-amber-500 mt-0.5">{stats.lateCount} <span className="text-xs font-semibold text-slate-400">em</span></p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-primary uppercase">Tỷ lệ chuyên cần</span>
          <p className="text-xl font-black text-primary mt-0.5">{stats.rate}%</p>
        </div>
      </div>

      {/* 3. Bộ lọc tìm kiếm & chọn Tổ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="🔍 Tìm tên học sinh..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-primary outline-none"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500">Lọc theo:</span>
          <select
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white focus:border-primary outline-none"
          >
            <option value="all">Toàn bộ 4 Tổ</option>
            {uniqueGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Danh sách học sinh điểm danh */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <LoadingSpinner size="lg" text="Đang đồng bộ điểm danh ngày..." />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-12 text-center">STT</th>
                  <th className="p-3.5">Học sinh</th>
                  <th className="p-3.5 hidden sm:table-cell">Tổ</th>
                  <th className="p-3.5 hidden md:table-cell">Chức vụ</th>
                  <th className="p-3.5 text-right">Trạng thái điểm danh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record, index) => {
                  const isHighlighted = recentlyUpdatedId === record.id;
                  return (
                    <tr
                      key={record.id}
                      className={`transition-all ${
                        isHighlighted
                          ? 'bg-amber-100/90 ring-2 ring-amber-400 shadow-md animate-pulse'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5 text-center text-slate-400 font-bold">{index + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">
                            {record.studentName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-850 block">{record.studentName}</span>
                            <span className="text-[10px] text-slate-400">{record.gender} • {record.groupName}</span>
                            {record.note && (
                              <div
                                onClick={() => !session?.isLocked && onEditNote(record)}
                                className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 px-2 py-0.5 rounded-lg w-fit cursor-pointer transition-colors max-w-xs truncate"
                                title={`Nhấp để sửa ghi chú: ${record.note}`}
                              >
                                <span>📝</span>
                                <span className="truncate">{record.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 hidden sm:table-cell font-bold text-slate-700">{record.groupName}</td>
                      <td className="p-3.5 hidden md:table-cell font-semibold text-primary">{record.classRole}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <AttendanceStatusButtons
                            currentStatus={record.status}
                            disabled={session?.isLocked}
                            onChange={(newStatus) => onStatusChange(record.id, newStatus)}
                          />
                          <button
                            type="button"
                            onClick={() => onEditNote(record)}
                            disabled={session?.isLocked}
                            className={`p-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                              record.note
                                ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title={record.note ? `Ghi chú: ${record.note} (Bấm để sửa)` : 'Thêm ghi chú lý do nghỉ / muộn'}
                          >
                            📝
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
