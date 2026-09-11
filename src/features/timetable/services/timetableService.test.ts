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
});
