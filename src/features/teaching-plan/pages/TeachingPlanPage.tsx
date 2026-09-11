import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { timetableService } from '../../timetable/services/timetableService';
import type { TimetableEntry } from '../../../types/timetable';
import { EditLessonModal } from '../../timetable/components/EditLessonModal';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const TeachingPlanPage: React.FC = () => {
  const { currentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await timetableService.getTimetableEntries(classId);
      setEntries(data);
    } catch (err) {
      console.error('Lỗi tải lịch báo giảng:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updates: {
    subjectName?: string;
    teacherName?: string;
    lessonTopic?: string;
    notes?: string;
  }) => {
    if (!selectedEntry) return;
    await timetableService.updateEntry(selectedEntry.id, updates);
    setSaveSuccessMsg('Đã cập nhật bài học lịch báo giảng thành công!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    await loadData();
  };

  const handlePrint = () => {
    window.print();
  };

  const getDayName = (d: number) => {
    return d === 8 ? 'Chủ nhật' : `Thứ ${d}`;
  };

  // Lọc theo thứ
  const filteredEntries = entries.filter((e) => {
    if (selectedDayFilter === 'all') return true;
    return e.dayOfWeek === selectedDayFilter;
  });

  const daysNav = [
    { day: 'all', label: 'Cả Tuần (30 Tiết)' },
    { day: 2, label: 'Thứ 2' },
    { day: 3, label: 'Thứ 3' },
    { day: 4, label: 'Thứ 4' },
    { day: 5, label: 'Thứ 5' },
    { day: 6, label: 'Thứ 6' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Lịch Báo Giảng Tiết Dạy
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              Hợp nhất chuẩn mực
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Kế hoạch giảng dạy theo tuần, phân phối chương trình, tên bài dạy và thiết bị đồ dùng dạy học
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm" className="text-xs font-bold">
            🖨️ In Lịch Báo Giảng A4
          </Button>
          <Button onClick={loadData} variant="ghost" size="sm" className="text-xs font-bold">
            🔄 Làm mới
          </Button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl animate-fade-in">
          ✓ {saveSuccessMsg}
        </div>
      )}

      {/* 2. Bộ lọc Tab Thứ trong tuần */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {daysNav.map((nav) => (
          <button
            key={String(nav.day)}
            onClick={() => setSelectedDayFilter(nav.day as number | 'all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedDayFilter === nav.day
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {nav.label}
          </button>
        ))}
      </div>

      {/* 3. Bảng Lịch Báo Giảng Chi Tiết */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-bold text-slate-500">Đang tải lịch báo giảng...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[11px] tracking-wider">
                  <th className="p-3.5 w-24 text-center">Thứ</th>
                  <th className="p-3.5 w-20 text-center">Buổi</th>
                  <th className="p-3.5 w-16 text-center">Tiết</th>
                  <th className="p-3.5 w-36">Môn học</th>
                  <th className="p-3.5 w-48">Giáo viên</th>
                  <th className="p-3.5">Tên bài dạy (Phân phối chương trình)</th>
                  <th className="p-3.5 w-44">Ghi chú & Thiết bị</th>
                  <th className="p-3.5 w-20 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => {
                  const color = timetableService.getSubjectColor(entry.subjectName);

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Thứ */}
                      <td className="p-3 text-center font-black text-slate-800">
                        {getDayName(entry.dayOfWeek)}
                      </td>

                      {/* Buổi */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            entry.session === 'morning'
                              ? 'bg-amber-100/80 text-amber-800'
                              : 'bg-indigo-100/80 text-indigo-800'
                          }`}
                        >
                          {entry.session === 'morning' ? 'Sáng' : 'Chiều'}
                        </span>
                      </td>

                      {/* Tiết */}
                      <td className="p-3 text-center font-bold text-slate-700">
                        Tiết {entry.periodDisplay}
                      </td>

                      {/* Môn học */}
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-black ${color.badgeBg} ${color.badgeText}`}
                        >
                          {entry.subjectName}
                        </span>
                      </td>

                      {/* Giáo viên */}
                      <td className="p-3 font-semibold text-slate-700">
                        {entry.teacherName || 'Chưa phân công'}
                      </td>

                      {/* Tên bài dạy */}
                      <td className="p-3 font-medium text-slate-900">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-850">
                            {entry.lessonTopic || (
                              <span className="text-slate-400 italic">Nhấp Sửa để nhập tên bài dạy</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Ghi chú */}
                      <td className="p-3 text-slate-500 font-medium truncate max-w-[180px]">
                        {entry.notes || '--'}
                      </td>

                      {/* Nút sửa */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                        >
                          ✏️ Sửa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Tiết Báo Giảng */}
      <EditLessonModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entry={selectedEntry}
        onSave={handleSave}
      />
    </div>
  );
};
