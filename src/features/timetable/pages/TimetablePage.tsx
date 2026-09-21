import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { timetableService } from '../services/timetableService';
import { timetableOverrideService } from '../services/timetableOverrideService';
import type { TimetableEntry } from '../../../types/timetable';
import type { TimetableWeeklyOverride } from '../types/timetableOverrideTypes';
import { getAcademicWeekInfo } from '../../../utils/academicWeekUtils';
import { TimetableGrid } from '../components/TimetableGrid';
import { EditLessonModal } from '../components/EditLessonModal';
import { TimetablePrintModal } from '../components/TimetablePrintModal';
import { TimetableZaloExportModal } from '../components/TimetableZaloExportModal';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const { currentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isZaloModalOpen, setIsZaloModalOpen] = useState<boolean>(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // Ghi chú đổi phòng, giáo viên dạy thay và cảnh báo xung đột của tuần
  const [overrides, setOverrides] = useState<Record<string, TimetableWeeklyOverride>>({});

  // Thời gian thực để tính toán tuần học và ngày áp dụng Thứ 2 đầu tuần
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Cập nhật khi có sự kiện thay đổi cấu hình tuần học từ Cài đặt
    const handleConfigChange = () => {
      setCurrentTime(new Date());
    };
    window.addEventListener('academic-week-config-changed', handleConfigChange);
    return () => {
      window.removeEventListener('academic-week-config-changed', handleConfigChange);
    };
  }, []);

  const academicWeek = getAcademicWeekInfo(currentTime);

  // Tải ghi chú riêng theo tuần hiện tại
  const loadOverrides = useCallback(() => {
    const data = timetableOverrideService.getWeekOverrides(classId, academicWeek.weekNumber);
    setOverrides(data);
  }, [classId, academicWeek.weekNumber]);

  useEffect(() => {
    loadOverrides();
  }, [loadOverrides]);

  useEffect(() => {
    const handleOverridesUpdate = () => {
      loadOverrides();
    };
    window.addEventListener('timetable-overrides-updated', handleOverridesUpdate);
    return () => {
      window.removeEventListener('timetable-overrides-updated', handleOverridesUpdate);
    };
  }, [loadOverrides]);

  // Quét và phát hiện xung đột
  const conflicts = useMemo(() => {
    return timetableOverrideService.detectConflicts(entries, overrides);
  }, [entries, overrides]);

  const handleSaveOverride = (override: TimetableWeeklyOverride) => {
    timetableOverrideService.saveOverride(override);
    loadOverrides();
  };

  const handleRemoveOverride = (entryId: string) => {
    timetableOverrideService.removeOverride(classId, academicWeek.weekNumber, entryId);
    loadOverrides();
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await timetableService.getTimetableEntries(classId);
      setEntries(data);
    } catch (err) {
      console.error('Lỗi nạp thời khóa biểu:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectEntry = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleSaveEntry = async (updates: {
    subjectName?: string;
    teacherName?: string;
    lessonTopic?: string;
    notes?: string;
  }) => {
    if (!selectedEntry) return;
    await timetableService.updateEntry(selectedEntry.id, updates);
    await loadData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setImportMessage('Đang phân tích tệp Excel và cập nhật thời khóa biểu...');
    try {
      const count = await timetableService.importFromExcel(file, classId);
      setImportMessage(`🎉 Đã nạp thành công ${count} tiết học từ tệp Excel!`);
      await loadData();
      setTimeout(() => setImportMessage(null), 4000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setImportMessage(`⚠️ Lỗi nhập file: ${error.message || 'Không hợp lệ'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Tính toán số liệu thống kê
  const totalPeriods = entries.length;
  const morningCount = entries.filter((e) => e.session === 'morning').length;
  const afternoonCount = entries.filter((e) => e.session === 'afternoon').length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Thời Khóa Biểu Tuần {academicWeek.weekNumber} — Lớp 6A6
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200 uppercase">
              Học 2 Buổi / Ngày
            </span>

            {/* Badge thể hiện rõ tuần và ngày áp dụng tính từ Thứ Hai đầu tuần */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-bold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{academicWeek.fullAppliedText}</span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded">
                Thứ 2 đầu tuần
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Năm học {academicWeek.academicYear}</span>
            <span>•</span>
            <span className="font-bold text-slate-700">{academicWeek.fullAppliedText}</span>
            <span>•</span>
            <span>GVCN: Thầy Phan Văn Bộ</span>
            <span>•</span>
            <span>Trích xuất từ tệp Excel TKB-LOP-6A6.xlsx</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nút Xuất ảnh gửi Zalo */}
          <Button
            onClick={() => setIsZaloModalOpen(true)}
            variant="outline"
            size="md"
            className="text-xs font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs flex items-center gap-1.5"
          >
            <span>📸 Xuất ảnh gửi Zalo</span>
          </Button>

          {/* Nút nhập Excel */}
          <label className="cursor-pointer inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700">
            <span>📥 Nhập TKB từ Excel</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Nút In TKB */}
          <Button
            onClick={() => setIsPrintModalOpen(true)}
            variant="outline"
            size="md"
            className="text-xs font-bold bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
          >
            🖨️ In Thời Khóa Biểu
          </Button>

          {/* Nút Làm mới */}
          <Button onClick={loadData} variant="ghost" size="md" className="text-xs font-bold">
            🔄 Làm mới
          </Button>
        </div>
      </div>

      {importMessage && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>{importMessage}</span>
          <button onClick={() => setImportMessage(null)} className="text-blue-500 hover:text-blue-800">
            ✕
          </button>
        </div>
      )}

      {/* Cảnh báo xung đột phòng / giáo viên tuần nếu phát hiện */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-start justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <p className="font-black text-rose-900 text-sm">
                Phát hiện {conflicts.length} cảnh báo xung đột tiết học trong Tuần {academicWeek.weekNumber}!
              </p>
              <ul className="text-rose-700 font-semibold mt-1 list-disc list-inside space-y-0.5">
                {conflicts.map((c, idx) => (
                  <li key={idx}>
                    Thứ {c.dayOfWeek} (Tiết {c.period} - {c.subjectName}): {c.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. Thẻ KPI Thống Kê Tiết Học & Bộ Lọc Buổi */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng số tiết</span>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{totalPeriods} tiết/tuần</p>
          </div>
          <span className="text-2xl">📚</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Buổi Sáng</span>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{morningCount} tiết (T2-T6)</p>
          </div>
          <span className="text-2xl">☀️</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Buổi Chiều</span>
            <p className="text-2xl font-black text-indigo-600 mt-0.5">{afternoonCount} tiết (T2-T4)</p>
          </div>
          <span className="text-2xl">⛅</span>
        </div>

        {/* Bộ lọc buổi */}
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-1">
          <button
            onClick={() => setSessionFilter('all')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              sessionFilter === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cả Ngày
          </button>
          <button
            onClick={() => setSessionFilter('morning')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              sessionFilter === 'morning'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sáng
          </button>
          <button
            onClick={() => setSessionFilter('afternoon')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              sessionFilter === 'afternoon'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chiều
          </button>
        </div>
      </div>

      {/* 3. Lưới Thời Khóa Biểu Ma Trận Tương Tác */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-bold text-slate-500">Đang tải thời khóa biểu Lớp 6A6...</p>
        </div>
      ) : (
        <TimetableGrid
          entries={entries}
          sessionFilter={sessionFilter}
          onSelectEntry={handleSelectEntry}
          academicWeek={academicWeek}
          overrides={overrides}
        />
      )}

      {/* 4. Modal chỉnh sửa chi tiết bài dạy & Ghi chú riêng tuần */}
      <EditLessonModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entry={selectedEntry}
        academicWeek={academicWeek}
        currentOverride={selectedEntry ? overrides[selectedEntry.id] : undefined}
        onSave={handleSaveEntry}
        onSaveOverride={handleSaveOverride}
        onRemoveOverride={handleRemoveOverride}
      />

      {/* 5. Modal in Thời khóa biểu khổ A4 */}
      <TimetablePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        entries={entries}
        classNameTitle={currentClass?.name || 'LỚP 6A6'}
        schoolName={currentClass?.schoolName || 'TRƯỜNG THCS TÂN HẢI'}
        logoUrl={currentClass?.logoUrl || '/logo-truong-thcs-Tan-Hai.jpg'}
        academicWeek={academicWeek}
      />

      {/* 6. Modal Xuất Thẻ Ảnh TKB Gửi Zalo Nhóm Lớp 1 Chạm */}
      <TimetableZaloExportModal
        isOpen={isZaloModalOpen}
        onClose={() => setIsZaloModalOpen(false)}
        entries={entries}
        classNameTitle={currentClass?.name || 'LỚP 6A6'}
        schoolName={currentClass?.schoolName || 'TRƯỜNG THCS TÂN HẢI'}
        logoUrl={currentClass?.logoUrl || '/logo-truong-thcs-Tan-Hai.jpg'}
        academicWeek={academicWeek}
        overrides={overrides}
        teacherName="Thầy Phan Văn Bộ"
      />
    </div>
  );
};
