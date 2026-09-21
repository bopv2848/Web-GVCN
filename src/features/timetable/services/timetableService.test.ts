import { describe, it, expect } from 'vitest';
import { timetableService } from './timetableService';

describe('timetableService', () => {
  it('trả về thời gian học chính xác theo tiết', () => {
    expect(timetableService.getDefaultTimeSlot(1)).toBe('07:00 - 07:45');
    expect(timetableService.getDefaultTimeSlot(2)).toBe('07:50 - 08:35');
    expect(timetableService.getDefaultTimeSlot(3)).toBe('09:05 - 09:50');
    expect(timetableService.getDefaultTimeSlot(6)).toBe('14:00 - 14:45');
    expect(timetableService.getDefaultTimeSlot(8)).toBe('16:05 - 16:50');
  });

  it('gán mã màu nhận diện đúng chuẩn cho từng môn học', () => {
    const toanColor = timetableService.getSubjectColor('Toán');
    expect(toanColor.badgeText).toContain('blue');

    const vanColor = timetableService.getSubjectColor('Ngữ Văn');
    expect(vanColor.badgeText).toContain('rose');

    const anhColor = timetableService.getSubjectColor('Tiếng Anh');
    expect(anhColor.badgeText).toContain('amber');

    const khtnColor = timetableService.getSubjectColor('KHTN');
    expect(khtnColor.badgeText).toContain('emerald');
  });

  describe('computeCurrentLesson', () => {
    const mockEntries = [
      {
        id: 't-1',
        classId: 'c-1',
        dayOfWeek: 2, // Thứ 2
        period: 1,
        periodDisplay: 1,
        session: 'morning' as const,
        timeSlot: '07:00 - 07:45',
        subjectName: 'Chào cờ',
        teacherName: 'Thầy Phan Văn Bộ',
      },
      {
        id: 't-2',
        classId: 'c-1',
        dayOfWeek: 2,
        period: 2,
        periodDisplay: 2,
        session: 'morning' as const,
        timeSlot: '07:50 - 08:35',
        subjectName: 'Toán',
        teacherName: 'Thầy Phan Văn Bộ',
      },
    ];

    it('hiển thị môn học chính xác khi đang trong giờ học (ví dụ: Thứ Hai 07:15)', () => {
      // Giả lập Thứ 2 lúc 07:15 (2026-09-14 là Thứ Hai)
      const testTime = new Date('2026-09-14T07:15:00');
      const status = timetableService.computeCurrentLesson(mockEntries, {}, testTime);

      expect(status.state).toBe('active_period');
      expect(status.subjectName).toBe('Chào cờ');
      expect(status.title).toContain('Chào cờ');
      expect(status.isActiveLesson).toBe(true);
      // Kiểm tra đếm ngược thời gian còn lại của tiết học: Lúc 07:15, hết tiết lúc 07:45 -> Còn 30 phút là hết tiết
      expect(status.countdown).toBeDefined();
      expect(status.countdown?.formattedText).toBe('Còn 30 phút là hết tiết');
    });

    it('tính toán chính xác đếm ngược khi còn 15 phút là hết tiết (ví dụ: 07:30)', () => {
      const testTime = new Date('2026-09-14T07:30:00');
      const status = timetableService.computeCurrentLesson(mockEntries, {}, testTime);

      expect(status.state).toBe('active_period');
      expect(status.countdown).toBeDefined();
      expect(status.countdown?.formattedText).toBe('Còn 15 phút là hết tiết');
    });

    it('hiển thị Giờ ra chơi và đếm ngược thời gian vào lớp khi đang ra chơi (ví dụ: Thứ Hai 08:57)', () => {
      // Giả lập Thứ 2 lúc 08:57 (hết giờ ra chơi lúc 09:05:00 -> Còn 8 phút vào lớp)
      const testTime = new Date('2026-09-14T08:57:00');
      const status = timetableService.computeCurrentLesson(mockEntries, {}, testTime);

      expect(status.state).toBe('recess');
      expect(status.title).toBe('Giờ ra chơi');
      expect(status.isRecess).toBe(true);
      expect(status.countdown).toBeDefined();
      expect(status.countdown?.formattedText).toBe('Còn 8 phút vào lớp');
    });

    it('hiển thị Nghỉ khi ngoài giờ học (ví dụ: ban đêm 23:30 hoặc Chủ Nhật)', () => {
      // Giả lập Thứ 2 lúc 23:30
      const nightTime = new Date('2026-09-14T23:30:00');
      const statusNight = timetableService.computeCurrentLesson(mockEntries, {}, nightTime);

      expect(statusNight.state).toBe('off');
      expect(statusNight.title).toBe('Nghỉ');
      expect(statusNight.isOff).toBe(true);

      // Giả lập Chủ Nhật (2026-09-20 là Chủ Nhật)
      const sundayTime = new Date('2026-09-20T09:00:00');
      const statusSunday = timetableService.computeCurrentLesson(mockEntries, {}, sundayTime);

      expect(statusSunday.state).toBe('off');
      expect(statusSunday.title).toBe('Nghỉ');
    });
  });
});
