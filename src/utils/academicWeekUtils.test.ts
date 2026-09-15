import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAcademicWeekInfo,
  saveStoredAcademicWeekConfig,
  getStoredAcademicWeekConfig,
  ACADEMIC_WEEK_STORAGE_KEY,
} from './academicWeekUtils';

describe('academicWeekUtils - getAcademicWeekInfo', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('tính toán chính xác Tuần 2 - Học kỳ I cho ngày 14/09/2026 (hôm nay)', () => {
    const mondayWeek2 = new Date(2026, 8, 14, 10, 0, 0); // 14/09/2026
    const info = getAcademicWeekInfo(mondayWeek2);

    expect(info.weekNumber).toBe(2);
    expect(info.semester).toBe('I');
    expect(info.semesterWeekNumber).toBe(2);
    expect(info.weekLabel).toBe('Tuần 2 - Học kỳ I');
    expect(info.academicYear).toBe('2026 - 2027');
    expect(info.weekStartDate).toBe('14/09/2026');
    expect(info.weekEndDate).toBe('20/09/2026');
  });

  it('hỗ trợ cấu hình độ lệch tuần bù (+1 tuần): biến Tuần 2 thành Tuần 3', () => {
    const mondayWeek2 = new Date(2026, 8, 14);
    const info = getAcademicWeekInfo(mondayWeek2, { weekOffset: 1 });

    expect(info.weekNumber).toBe(3);
    expect(info.weekLabel).toBe('Tuần 3 - Học kỳ I');
  });

  it('hỗ trợ cấu hình độ lệch tuần nghỉ lễ/Tết (-1 tuần): biến Tuần 2 thành Tuần 1', () => {
    const mondayWeek2 = new Date(2026, 8, 14);
    const info = getAcademicWeekInfo(mondayWeek2, { weekOffset: -1 });

    expect(info.weekNumber).toBe(1);
    expect(info.weekLabel).toBe('Tuần 1 - Học kỳ I');
  });

  it('hỗ trợ tùy chỉnh ngày bắt đầu năm học (startDate = 2026-08-31)', () => {
    const mondayWeek2 = new Date(2026, 8, 14);
    const info = getAcademicWeekInfo(mondayWeek2, { startDate: '2026-08-31' });

    // Từ 31/08 đến 14/09 là 14 ngày (2 tuần) -> Tuần thứ 3
    expect(info.weekNumber).toBe(3);
    expect(info.weekLabel).toBe('Tuần 3 - Học kỳ I');
  });

  it('lưu trữ và tải cấu hình tuần học từ localStorage bền vững', () => {
    saveStoredAcademicWeekConfig({ startDate: '2026-09-07', weekOffset: 2, semester1Weeks: 18 });
    const stored = getStoredAcademicWeekConfig();

    expect(stored.weekOffset).toBe(2);
    expect(stored.startDate).toBe('2026-09-07');
    expect(localStorage.getItem(ACADEMIC_WEEK_STORAGE_KEY)).toContain('"weekOffset":2');
  });
});
