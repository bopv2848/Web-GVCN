import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { TimetableEntry } from '../../../types/timetable';

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimetableEntry | null;
  onSave: (updates: {
    subjectName?: string;
    teacherName?: string;
    lessonTopic?: string;
    notes?: string;
  }) => Promise<void>;
}

export const EditLessonModal: React.FC<EditLessonModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
}) => {
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setSubjectName(entry.subjectName || '');
      setTeacherName(entry.teacherName || '');
      setLessonTopic(entry.lessonTopic || '');
      setNotes(entry.notes || '');
    }
  }, [entry]);

  if (!entry) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

  const getDayName = (d: number) => {
    return d === 8 ? 'Chủ nhật' : `Thứ ${d}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi Tiết Tiết Học & Lịch Báo Giảng">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>📅 {getDayName(entry.dayOfWeek)}</span>
          <span>
            {entry.session === 'morning' ? '☀️ Buổi Sáng' : '⛅ Buổi Chiều'} • Tiết {entry.periodDisplay}
          </span>
          <span className="text-slate-500 font-medium">{entry.timeSlot}</span>
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
            Giáo Viên Bộ Môn
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
            Ghi Chú & Thiết Bị Dạy Học
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
            {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
