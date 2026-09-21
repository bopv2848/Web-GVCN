import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { TimetableEntry } from '../../../types/timetable';
import type { AcademicWeekInfo } from '../../../utils/academicWeekUtils';
import type {
  TimetableWeeklyOverride,
  OverrideType,
} from '../types/timetableOverrideTypes';
import { AlertTriangle, Building, Calendar, RefreshCw, UserCheck } from 'lucide-react';

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimetableEntry | null;
  academicWeek?: AcademicWeekInfo;
  currentOverride?: TimetableWeeklyOverride;
  onSave: (updates: {
    subjectName?: string;
    teacherName?: string;
    lessonTopic?: string;
    notes?: string;
  }) => Promise<void>;
  onSaveOverride?: (override: TimetableWeeklyOverride) => void;
  onRemoveOverride?: (entryId: string) => void;
}

export const EditLessonModal: React.FC<EditLessonModalProps> = ({
  isOpen,
  onClose,
  entry,
  academicWeek,
  currentOverride,
  onSave,
  onSaveOverride,
  onRemoveOverride,
}) => {
  const [activeTab, setActiveTab] = useState<'week_note' | 'master_tkb'>('week_note');

  // Form TKB gốc
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form Ghi chú riêng tuần
  const [overrideType, setOverrideType] = useState<OverrideType>('general_note');
  const [overrideRoom, setOverrideRoom] = useState('');
  const [overrideTeacher, setOverrideTeacher] = useState('');
  const [overrideSubject, setOverrideSubject] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [isConflict, setIsConflict] = useState(false);
  const [conflictReason, setConflictReason] = useState('');

  const weekNum = academicWeek?.weekNumber || 2;

  useEffect(() => {
    if (entry) {
      setSubjectName(entry.subjectName || '');
      setTeacherName(entry.teacherName || '');
      setLessonTopic(entry.lessonTopic || '');
      setNotes(entry.notes || '');

      // Nạp ghi chú tuần nếu có
      if (currentOverride) {
        setOverrideType(currentOverride.overrideType || 'general_note');
        setOverrideRoom(currentOverride.overrideRoom || '');
        setOverrideTeacher(currentOverride.overrideTeacher || '');
        setOverrideSubject(currentOverride.overrideSubject || '');
        setQuickNote(currentOverride.note || '');
        setIsConflict(Boolean(currentOverride.isConflict));
        setConflictReason(currentOverride.conflictReason || '');
      } else {
        setOverrideType('general_note');
        setOverrideRoom('');
        setOverrideTeacher('');
        setOverrideSubject('');
        setQuickNote('');
        setIsConflict(false);
        setConflictReason('');
      }
    }
  }, [entry, currentOverride]);

  if (!entry) return null;

  const handleMasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        subjectName,
        teacherName,
        lessonTopic,
        notes,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWeeklyOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveOverride) return;

    const newOverride: TimetableWeeklyOverride = {
      id: currentOverride?.id || `ov_${entry.id}_w${weekNum}`,
      classId: entry.classId,
      weekNumber: weekNum,
      entryId: entry.id,
      overrideType,
      overrideRoom: overrideRoom.trim() || undefined,
      overrideTeacher: overrideTeacher.trim() || undefined,
      overrideSubject: overrideSubject.trim() || undefined,
      note: quickNote.trim() || undefined,
      isConflict,
      conflictReason: isConflict ? conflictReason.trim() || 'Xung đột tiết học' : undefined,
      createdAt: currentOverride?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveOverride(newOverride);
    onClose();
  };

  const handleRemoveOverride = () => {
    if (onRemoveOverride && entry) {
      onRemoveOverride(entry.id);
      onClose();
    }
  };

  const applyPreset = (text: string, type: OverrideType, room?: string, teacher?: string) => {
    setQuickNote(text);
    setOverrideType(type);
    if (room) setOverrideRoom(room);
    if (teacher) setOverrideTeacher(teacher);
  };

  const getDayName = (d: number) => {
    return d === 8 ? 'Chủ nhật' : `Thứ ${d}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi Tiết Tiết Học • ${entry.subjectName} (${getDayName(entry.dayOfWeek)})`}
    >
      <div className="space-y-4">
        {/* Thanh thông tin tóm tắt */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between text-xs font-bold text-slate-700 gap-2">
          <span>📅 {getDayName(entry.dayOfWeek)}</span>
          <span>
            {entry.session === 'morning' ? '☀️ Buổi Sáng' : '⛅ Buổi Chiều'} • Tiết {entry.periodDisplay}
          </span>
          <span className="text-slate-500 font-medium">{entry.timeSlot}</span>
          <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            Môn: {entry.subjectName}
          </span>
        </div>

        {/* Tab chuyển đổi giữa Ghi chú riêng tuần & Sửa TKB gốc */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setActiveTab('week_note')}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'week_note'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>📌 Ghi Chú & Đổi Phòng (Tuần {weekNum})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('master_tkb')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'master_tkb'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span>⚙️ Sửa TKB Gốc (Cố định cả năm)</span>
          </button>
        </div>

        {/* TAB 1: GHI CHÚ & ĐỔI PHÒNG RIÊNG TUẦN NÀY */}
        {activeTab === 'week_note' && (
          <form onSubmit={handleWeeklyOverrideSubmit} className="space-y-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
              <span className="text-base">💡</span>
              <span>
                Thay đổi tại tab này <strong>CHỈ ÁP DỤNG RIÊNG CHO TUẦN {weekNum}</strong> ({academicWeek?.appliedDateText || 'tuần này'}). Thời khóa biểu gốc của lớp vẫn được bảo toàn nguyên vẹn.
              </span>
            </div>

            {/* Nút gợi ý nhanh */}
            <div>
              <span className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">
                Gợi ý nhanh một chạm:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('Tiết 3 học phòng Tin', 'room_change', 'Phòng Tin học 1')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all active:scale-95"
                >
                  🏢 Tiết 3 học phòng Tin
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Đổi tiết môn Văn', 'subject_change', undefined, undefined)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all active:scale-95"
                >
                  🔄 Đổi tiết môn Văn
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Thực hành phòng Lab', 'room_change', 'Phòng Thực hành Hóa - Sinh')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all active:scale-95"
                >
                  🧪 Thực hành phòng Lab
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Học tại Sân thể dục', 'room_change', 'Sân thể dục')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all active:scale-95"
                >
                  🏃 Sân thể dục
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Kiểm tra 15 phút', 'general_note')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all active:scale-95"
                >
                  📝 Kiểm tra 15 phút
                </button>
              </div>
            </div>

            {/* Ô ghi chú nhanh */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi Chú Nhanh Hiển Thị Trên Thời Khóa Biểu
              </label>
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Ví dụ: Tiết 3 học phòng Tin, Đổi tiết môn Văn..."
              />
            </div>

            {/* Đổi phòng học */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Đổi Phòng Học Riêng Tuần {weekNum}</span>
                </label>
                <input
                  type="text"
                  value={overrideRoom}
                  onChange={(e) => setOverrideRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ví dụ: Phòng Tin 1, Lab Hóa - Sinh..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Giáo Viên Dạy Thay Tuần Này</span>
                </label>
                <input
                  type="text"
                  value={overrideTeacher}
                  onChange={(e) => setOverrideTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ví dụ: Cô Lan (Dạy thay)..."
                />
              </div>
            </div>

            {/* Cảnh báo xung đột */}
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isConflict}
                  onChange={(e) => setIsConflict(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Đánh dấu cảnh báo xung đột phòng / trùng tiết trong tuần</span>
                </span>
              </label>

              {isConflict && (
                <input
                  type="text"
                  value={conflictReason}
                  onChange={(e) => setConflictReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-rose-300 text-xs font-medium text-rose-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Lý do xung đột: Trùng phòng Tin với lớp 9A1, GV đi coi thi..."
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {currentOverride ? (
                <button
                  type="button"
                  onClick={handleRemoveOverride}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
                >
                  🗑️ Xóa ghi chú tuần (Khôi phục TKB gốc)
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Đóng
                </Button>
                <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  💾 Lưu Riêng Cho Tuần {weekNum}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: SỬA THỜI KHÓA BIỂU GỐC CẢ NĂM */}
        {activeTab === 'master_tkb' && (
          <form onSubmit={handleMasterSubmit} className="space-y-4">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium">
              ℹ️ Thay đổi tại tab này sẽ cập nhật Thời Khóa Biểu gốc cố định cho cả năm học 2026 - 2027.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Môn Học <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Ví dụ: Toán, Ngữ Văn, Tiếng Anh..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giáo Viên Bộ Môn Cố Định
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Ví dụ: Thầy Phan Văn Bộ..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Bài Dạy (Lịch Báo Giảng)
              </label>
              <textarea
                rows={2}
                value={lessonTopic}
                onChange={(e) => setLessonTopic(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Ví dụ: Tiết 1: Tập hợp các số tự nhiên..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi Chú & Thiết Bị Dạy Học Cố Định
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Phòng học, máy chiếu, đồ dùng thí nghiệm..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
                Đóng
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu TKB Gốc'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

