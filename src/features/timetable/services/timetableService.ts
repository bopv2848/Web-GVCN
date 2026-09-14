import { supabase } from '../../../services/supabaseClient';
import type { TimetableEntry, SubjectColor } from '../../../types/timetable';

export const timetableService = {
  /**
   * Lấy toàn bộ thời khóa biểu của lớp học
   */
  async getTimetableEntries(classId: string): Promise<TimetableEntry[]> {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*')
      .eq('class_id', classId)
      .order('day_of_week', { ascending: true })
      .order('period', { ascending: true });

    if (error || !data) {
      console.warn('Lỗi lấy thời khóa biểu:', error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => {
      const isMorning = item.period <= 5;
      const periodDisplay = isMorning ? item.period : item.period - 5;
      const timeSlot = this.getDefaultTimeSlot(item.period);

      return {
        id: item.id,
        classId: item.class_id,
        dayOfWeek: item.day_of_week,
        period: item.period,
        periodDisplay,
        session: isMorning ? ('morning' as const) : ('afternoon' as const),
        timeSlot,
        subjectName: item.subject_name,
        teacherName: item.teacher_name || undefined,
        lessonTopic: item.lesson_topic || undefined,
        notes: item.notes || undefined,
      };
    });
  },

  /**
   * Cập nhật thông tin một tiết học (Môn, Giáo viên, Bài dạy, Ghi chú)
   */
  async updateEntry(
    id: string,
    updates: {
      subjectName?: string;
      teacherName?: string;
      lessonTopic?: string;
      notes?: string;
    }
  ): Promise<boolean> {
    const updatePayload: Record<string, string | null> = {};
    if (updates.subjectName !== undefined) updatePayload.subject_name = updates.subjectName;
    if (updates.teacherName !== undefined) updatePayload.teacher_name = updates.teacherName || null;
    if (updates.lessonTopic !== undefined) updatePayload.lesson_topic = updates.lessonTopic || null;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes || null;

    const { error } = await supabase
      .from('timetable_entries')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Lỗi cập nhật tiết học:', error);
      throw error;
    }
    return true;
  },

  /**
   * Bóc tách và nhập dữ liệu từ file Excel TKB được tải lên
   * Tối ưu: Chỉ tải động thư viện xlsx khi người dùng chọn tải tệp TKB lên (Code-Splitting)
   */
  async importFromExcel(file: File, classId: string): Promise<number> {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });

    const dayColumns = [
      { col: 3, day: 2 },
      { col: 4, day: 3 },
      { col: 5, day: 4 },
      { col: 6, day: 5 },
      { col: 7, day: 6 },
    ];

    const morningRows = [
      { row: 4, period: 1 },
      { row: 5, period: 2 },
      { row: 7, period: 3 },
      { row: 8, period: 4 },
      { row: 9, period: 5 },
    ];

    const afternoonRows = [
      { row: 11, period: 6 },
      { row: 12, period: 7 },
      { row: 14, period: 8 },
    ];

    const newEntries: Array<{
      class_id: string;
      day_of_week: number;
      period: number;
      subject_name: string;
      teacher_name?: string;
      lesson_topic?: string;
      notes?: string;
    }> = [];

    // Parse Sáng
    morningRows.forEach((m) => {
      const r = rows[m.row];
      if (!r) return;
      dayColumns.forEach((d) => {
        const subj = r[d.col];
        if (subj && String(subj).trim()) {
          const name = String(subj).trim();
          newEntries.push({
            class_id: classId,
            day_of_week: d.day,
            period: m.period,
            subject_name: name,
            notes: `Phòng: Lớp 6A6`,
          });
        }
      });
    });

    // Parse Chiều
    afternoonRows.forEach((a) => {
      const r = rows[a.row];
      if (!r) return;
      dayColumns.forEach((d) => {
        const subj = r[d.col];
        if (subj && String(subj).trim()) {
          const name = String(subj).trim();
          newEntries.push({
            class_id: classId,
            day_of_week: d.day,
            period: a.period,
            subject_name: name,
            notes: `Phòng: Lớp 6A6`,
          });
        }
      });
    });

    if (newEntries.length === 0) {
      throw new Error('Không tìm thấy cấu trúc thời khóa biểu hợp lệ trong tệp Excel.');
    }

    // Xóa TKB cũ và thêm mới
    await supabase.from('timetable_entries').delete().eq('class_id', classId);
    const { data, error } = await supabase.from('timetable_entries').insert(newEntries).select();

    if (error) throw error;
    return data?.length || 0;
  },

  /**
   * Thời gian chuẩn của từng tiết học
   */
  getDefaultTimeSlot(period: number): string {
    switch (period) {
      case 1:
        return '07:00 - 07:45';
      case 2:
        return '07:50 - 08:35';
      case 3:
        return '09:05 - 09:50';
      case 4:
        return '09:55 - 10:40';
      case 5:
        return '10:45 - 11:30';
      case 6:
        return '14:00 - 14:45';
      case 7:
        return '14:50 - 15:35';
      case 8:
        return '16:05 - 16:50';
      default:
        return 'Tiết học';
    }
  },

  /**
   * Bảng màu nhận diện môn học chuẩn mực và dễ nhìn
   */
  getSubjectColor(subjectName: string): SubjectColor {
    const s = subjectName.toLowerCase();
    if (s.includes('toán')) {
      return { badgeBg: 'bg-blue-100/80', badgeText: 'text-blue-800', borderClass: 'border-blue-300' };
    }
    if (s.includes('văn')) {
      return { badgeBg: 'bg-rose-100/80', badgeText: 'text-rose-800', borderClass: 'border-rose-300' };
    }
    if (s.includes('anh')) {
      return { badgeBg: 'bg-amber-100/80', badgeText: 'text-amber-800', borderClass: 'border-amber-300' };
    }
    if (s.includes('khtn') || s.includes('khoa học')) {
      return { badgeBg: 'bg-emerald-100/80', badgeText: 'text-emerald-800', borderClass: 'border-emerald-300' };
    }
    if (s.includes('lịch sử') || s.includes('địa lý') || s.includes('sử')) {
      return { badgeBg: 'bg-orange-100/80', badgeText: 'text-orange-800', borderClass: 'border-orange-300' };
    }
    if (s.includes('tin học') || s.includes('tin')) {
      return { badgeBg: 'bg-cyan-100/80', badgeText: 'text-cyan-800', borderClass: 'border-cyan-300' };
    }
    if (s.includes('gdtc') || s.includes('thể dục')) {
      return { badgeBg: 'bg-indigo-100/80', badgeText: 'text-indigo-800', borderClass: 'border-indigo-300' };
    }
    if (s.includes('nghệ thuật') || s.includes('âm nhạc') || s.includes('mỹ thuật')) {
      return { badgeBg: 'bg-fuchsia-100/80', badgeText: 'text-fuchsia-800', borderClass: 'border-fuchsia-300' };
    }
    if (s.includes('công nghệ')) {
      return { badgeBg: 'bg-teal-100/80', badgeText: 'text-teal-800', borderClass: 'border-teal-300' };
    }
    if (s.includes('gdcd') || s.includes('công dân') || s.includes('gdđp')) {
      return { badgeBg: 'bg-lime-100/80', badgeText: 'text-lime-800', borderClass: 'border-lime-300' };
    }
    if (s.includes('chào cờ') || s.includes('shl') || s.includes('hđtnhn')) {
      return { badgeBg: 'bg-purple-100/80', badgeText: 'text-purple-800', borderClass: 'border-purple-300' };
    }
    return { badgeBg: 'bg-slate-100', badgeText: 'text-slate-800', borderClass: 'border-slate-300' };
  },
};
