import { describe, it, expect, beforeEach } from 'vitest';
import { timetableOverrideService } from './timetableOverrideService';
import type { TimetableEntry } from '../../../types/timetable';
import type { TimetableWeeklyOverride } from '../types/timetableOverrideTypes';

describe('timetableOverrideService Unit Tests', () => {
  const classId = 'test-class-6a6';

  beforeEach(() => {
    localStorage.clear();
  });

  it('cho phép lưu và đọc ghi chú đổi phòng / đổi giáo viên riêng theo tuần', () => {
    const override: TimetableWeeklyOverride = {
      id: 'ov-1',
      classId,
      weekNumber: 2,
      entryId: 'entry-tiet3-thu2',
      overrideType: 'room_change',
      overrideRoom: 'Phòng Tin học 1',
      note: 'Tiết 3 học phòng Tin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    timetableOverrideService.saveOverride(override);

    const week2Overrides = timetableOverrideService.getWeekOverrides(classId, 2);
    expect(week2Overrides['entry-tiet3-thu2']).toBeDefined();
    expect(week2Overrides['entry-tiet3-thu2'].overrideRoom).toBe('Phòng Tin học 1');
    expect(week2Overrides['entry-tiet3-thu2'].note).toBe('Tiết 3 học phòng Tin');

    // Tuần 3 không bị ảnh hưởng (TKB gốc được bảo toàn)
    const week3Overrides = timetableOverrideService.getWeekOverrides(classId, 3);
    expect(week3Overrides['entry-tiet3-thu2']).toBeUndefined();
  });

  it('cho phép xóa ghi chú tuần để khôi phục về Thời khóa biểu gốc', () => {
    const override: TimetableWeeklyOverride = {
      id: 'ov-2',
      classId,
      weekNumber: 2,
      entryId: 'entry-van-tiet2',
      overrideType: 'subject_change',
      overrideSubject: 'Ngữ Văn (Đổi từ T5 sang)',
      note: 'Đổi tiết môn Văn',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    timetableOverrideService.saveOverride(override);
    expect(timetableOverrideService.getWeekOverrides(classId, 2)['entry-van-tiet2']).toBeDefined();

    // Xóa ghi chú
    timetableOverrideService.removeOverride(classId, 2, 'entry-van-tiet2');
    expect(timetableOverrideService.getWeekOverrides(classId, 2)['entry-van-tiet2']).toBeUndefined();
  });

  it('phát hiện chính xác cảnh báo xung đột tiết học hoặc trùng phòng', () => {
    const mockEntries: TimetableEntry[] = [
      {
        id: 'e1',
        classId,
        dayOfWeek: 2,
        period: 3,
        periodDisplay: 3,
        session: 'morning',
        timeSlot: '09:05 - 09:50',
        subjectName: 'Toán',
      },
      {
        id: 'e2',
        classId,
        dayOfWeek: 3,
        period: 2,
        periodDisplay: 2,
        session: 'morning',
        timeSlot: '07:50 - 08:35',
        subjectName: 'KHTN',
      },
    ];

    const overrides: Record<string, TimetableWeeklyOverride> = {
      e1: {
        id: 'ov-conflict',
        classId,
        weekNumber: 2,
        entryId: 'e1',
        overrideType: 'conflict_alert',
        isConflict: true,
        conflictReason: 'Trùng lịch thi tuyển HSG môn Toán',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const conflicts = timetableOverrideService.detectConflicts(mockEntries, overrides);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].entryId).toBe('e1');
    expect(conflicts[0].message).toContain('Trùng lịch thi tuyển HSG');
  });
});
