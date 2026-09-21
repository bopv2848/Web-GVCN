import { supabase } from '../../../services/supabaseClient';
import type { TimetableEntry, SubjectColor } from '../../../types/timetable';
import { DEFAULT_CLASS_6A6_TIMETABLE } from '../constants/defaultClass6A6Timetable';
import type { TimetableWeeklyOverride } from '../types/timetableOverrideTypes';

export type LessonState = 'active_period' | 'recess' | 'off';

export interface LessonCountdown {
  remainingMinutes: number;
  remainingSeconds: number;
  totalSeconds: number;
  formattedText: string; // ví dụ: "Còn 15 phút là hết tiết" hoặc "Còn 8 phút vào lớp"
}

export interface CurrentLessonStatus {
  state: LessonState;
  title: string;              // "Tiết 1: Môn Toán" hoặc "Giờ ra chơi" hoặc "Nghỉ"
  subjectName?: string;       // "Toán"
  period?: number;            // 1
  periodDisplay?: number;     // 1
  timeSlot?: string;          // "07:00 - 07:45"
  teacherName?: string;       // "Thầy Phan Văn Bộ"
  roomName?: string;          // "Phòng học 6A6"
  nextLessonText?: string;    // "Tiết tiếp theo: Tiết 2: KHTN (07:50)"
  countdown?: LessonCountdown;
  isRecess: boolean;
  isOff: boolean;
  isActiveLesson: boolean;
}

export const timetableService = {
  /**
   * Lấy toàn bộ thời khóa biểu của lớp học (Supabase -> Cache LocalStorage -> Mặc định Lớp 6A6)
   */
  async getTimetableEntries(classId: string): Promise<TimetableEntry[]> {
    const cacheKey = `gvcn_timetable_entries_${classId}`;

    try {
      const { data, error } = await supabase
        .from('timetable_entries')
        .select('*')
        .eq('class_id', classId)
        .order('day_of_week', { ascending: true })
        .order('period', { ascending: true });

      if (!error && data && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: TimetableEntry[] = data.map((item: any) => {
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

        try {
          localStorage.setItem(cacheKey, JSON.stringify(mapped));
        } catch {
          // Bỏ qua lỗi lưu cache
        }

        return mapped;
      }
    } catch {
      // Supabase offline hoặc lỗi kết nối
    }

    // Dự phòng 1: Đọc từ bộ nhớ máy LocalStorage nếu trước đó đã lưu
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Bỏ qua lỗi parse JSON
    }

    // Dự phòng 2: Trả về Thời khóa biểu chuẩn của Lớp 6A6
    return DEFAULT_CLASS_6A6_TIMETABLE;
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('timetable-updated', { detail: { id, updates } }));
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('timetable-updated', { detail: { classId } }));
    }

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

  /**
   * Tính toán tiết học / môn học hiện tại theo thời gian thực đồng bộ với TKB
   */
  computeCurrentLesson(
    entries: TimetableEntry[],
    overrides?: Record<string, TimetableWeeklyOverride>,
    date: Date = new Date()
  ): CurrentLessonStatus {
    // 1. Chuyển đổi ngày trong tuần sang chuẩn TKB Việt Nam (2: Thứ Hai ... 7: Thứ Bảy, 8: Chủ Nhật)
    const jsDay = date.getDay();
    const dayOfWeek = jsDay === 0 ? 8 : jsDay + 1;

    // Chủ Nhật: Luôn nghỉ
    if (dayOfWeek === 8) {
      return {
        state: 'off',
        title: 'Nghỉ',
        nextLessonText: 'Tiết tiếp theo: Tiết 1 Thứ Hai',
        isRecess: false,
        isOff: true,
        isActiveLesson: false,
      };
    }

    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    const currentSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

    const toMinutes = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const toSeconds = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 3600 + m * 60;
    };

    // Khung thời gian tiêu chuẩn THCS Tân Hải
    const schedule = [
      // Sáng
      { period: 1, type: 'period' as const, start: '07:00', end: '07:45', name: 'Tiết 1' },
      { type: 'recess' as const, start: '07:45', end: '07:50', name: 'Ra chơi chuyển tiết' },
      { period: 2, type: 'period' as const, start: '07:50', end: '08:35', name: 'Tiết 2' },
      { type: 'recess' as const, start: '08:35', end: '09:05', name: 'Giờ ra chơi giữa buổi' },
      { period: 3, type: 'period' as const, start: '09:05', end: '09:50', name: 'Tiết 3' },
      { type: 'recess' as const, start: '09:50', end: '09:55', name: 'Ra chơi chuyển tiết' },
      { period: 4, type: 'period' as const, start: '09:55', end: '10:40', name: 'Tiết 4' },
      { type: 'recess' as const, start: '10:40', end: '10:45', name: 'Ra chơi chuyển tiết' },
      { period: 5, type: 'period' as const, start: '10:45', end: '11:30', name: 'Tiết 5' },
      // Chiều
      { period: 6, type: 'period' as const, start: '14:00', end: '14:45', name: 'Tiết 6' },
      { type: 'recess' as const, start: '14:45', end: '14:50', name: 'Ra chơi chuyển tiết' },
      { period: 7, type: 'period' as const, start: '14:50', end: '15:35', name: 'Tiết 7' },
      { type: 'recess' as const, start: '15:35', end: '16:05', name: 'Giờ ra chơi chiều' },
      { period: 8, type: 'period' as const, start: '16:05', end: '16:50', name: 'Tiết 8' },
    ];

    // 2. Kiểm tra có đang trong GIỜ RA CHƠI hay không
    const activeRecess = schedule.find(
      (s) => s.type === 'recess' && currentMinutes >= toMinutes(s.start) && currentMinutes < toMinutes(s.end)
    );

    if (activeRecess) {
      // Tìm tiết học kế tiếp ngay sau giờ ra chơi
      const upcomingPeriodSlot = schedule.find(
        (s) => s.type === 'period' && toMinutes(s.start) >= toMinutes(activeRecess.end)
      );

      let nextLessonText: string | undefined = undefined;
      if (upcomingPeriodSlot && upcomingPeriodSlot.period) {
        const nextEntry = entries.find((e) => e.dayOfWeek === dayOfWeek && e.period === upcomingPeriodSlot.period);
        if (nextEntry && nextEntry.subjectName) {
          nextLessonText = `Tiết tiếp theo: Tiết ${nextEntry.periodDisplay || upcomingPeriodSlot.period}: Môn ${nextEntry.subjectName} (${upcomingPeriodSlot.start})`;
        }
      }

      // Đếm ngược thời gian giờ ra chơi
      const endSec = toSeconds(activeRecess.end);
      const totalSecRemaining = Math.max(0, endSec - currentSeconds);
      const remainingMinutes = Math.ceil(totalSecRemaining / 60);
      const remainingSeconds = totalSecRemaining % 60;
      const formattedText =
        totalSecRemaining <= 0
          ? 'Đã hết giờ ra chơi'
          : totalSecRemaining < 60
          ? 'Còn dưới 1 phút vào lớp'
          : `Còn ${remainingMinutes} phút vào lớp`;

      const countdown: LessonCountdown = {
        remainingMinutes,
        remainingSeconds,
        totalSeconds: totalSecRemaining,
        formattedText,
      };

      return {
        state: 'recess',
        title: 'Giờ ra chơi',
        timeSlot: `${activeRecess.start} - ${activeRecess.end}`,
        nextLessonText,
        countdown,
        isRecess: true,
        isOff: false,
        isActiveLesson: false,
      };
    }

    // 3. Kiểm tra có đang trong MỘT TIẾT HỌC CỤ THỂ hay không
    const activePeriodSlot = schedule.find(
      (s) => s.type === 'period' && currentMinutes >= toMinutes(s.start) && currentMinutes < toMinutes(s.end)
    );

    if (activePeriodSlot && activePeriodSlot.period) {
      const entry = entries.find((e) => e.dayOfWeek === dayOfWeek && e.period === activePeriodSlot.period);
      const override = entry && overrides ? overrides[entry.id] : undefined;
      const subjectName = override?.overrideSubject || entry?.subjectName;
      const teacherName = override?.overrideTeacher || entry?.teacherName;
      const roomName = override?.overrideRoom || entry?.roomName || 'Phòng học 6A6';

      if (subjectName && subjectName.trim() !== '') {
        // Tìm tiết học tiếp theo trong ngày
        const nextSlot = schedule.find(
          (s) => s.type === 'period' && toMinutes(s.start) > toMinutes(activePeriodSlot.start)
        );
        let nextLessonText: string | undefined = undefined;
        if (nextSlot && nextSlot.period) {
          const nextEntry = entries.find((e) => e.dayOfWeek === dayOfWeek && e.period === nextSlot.period);
          if (nextEntry && nextEntry.subjectName) {
            nextLessonText = `Tiếp theo: Tiết ${nextEntry.periodDisplay || nextSlot.period}: Môn ${nextEntry.subjectName}`;
          }
        }

        // Đếm ngược thời gian của tiết học
        const endSec = toSeconds(activePeriodSlot.end);
        const totalSecRemaining = Math.max(0, endSec - currentSeconds);
        const remainingMinutes = Math.ceil(totalSecRemaining / 60);
        const remainingSeconds = totalSecRemaining % 60;
        const formattedText =
          totalSecRemaining <= 0
            ? 'Đã hết tiết'
            : totalSecRemaining < 60
            ? 'Còn dưới 1 phút là hết tiết'
            : `Còn ${remainingMinutes} phút là hết tiết`;

        const countdown: LessonCountdown = {
          remainingMinutes,
          remainingSeconds,
          totalSeconds: totalSecRemaining,
          formattedText,
        };

        return {
          state: 'active_period',
          title: `Tiết ${entry?.periodDisplay || activePeriodSlot.period}: Môn ${subjectName}`,
          subjectName,
          period: activePeriodSlot.period,
          periodDisplay: entry?.periodDisplay || activePeriodSlot.period,
          timeSlot: `${activePeriodSlot.start} - ${activePeriodSlot.end}`,
          teacherName,
          roomName,
          nextLessonText,
          countdown,
          isRecess: false,
          isOff: false,
          isActiveLesson: true,
        };
      }

      // Tiết trống không có lịch
      return {
        state: 'off',
        title: 'Nghỉ',
        timeSlot: `${activePeriodSlot.start} - ${activePeriodSlot.end}`,
        nextLessonText: 'Tiết trống (Nghỉ)',
        isRecess: false,
        isOff: true,
        isActiveLesson: false,
      };
    }

    // 4. Thời gian không có tiết (trước 7h, nghỉ trưa, hoặc sau giờ học)
    let nextLessonText = '';
    const nextSlot = schedule.find((s) => s.type === 'period' && toMinutes(s.start) > currentMinutes);
    if (nextSlot && nextSlot.period) {
      const nextEntry = entries.find((e) => e.dayOfWeek === dayOfWeek && e.period === nextSlot.period);
      if (nextEntry && nextEntry.subjectName) {
        nextLessonText = `Tiết tiếp theo: Tiết ${nextEntry.periodDisplay || nextSlot.period}: Môn ${nextEntry.subjectName} (${nextSlot.start})`;
      }
    } else {
      nextLessonText = 'Đã kết thúc buổi học';
    }

    return {
      state: 'off',
      title: 'Nghỉ',
      nextLessonText,
      isRecess: false,
      isOff: true,
      isActiveLesson: false,
    };
  },
};
