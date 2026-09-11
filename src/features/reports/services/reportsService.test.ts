import { describe, it, expect } from 'vitest';
import { reportsService } from './reportsService';
import type { ReportFilterState } from '../types';

describe('reportsService Unit Tests', () => {
  it('tính toán chính xác khoảng ngày theo Tháng', () => {
    const filter: ReportFilterState = {
      periodType: 'month',
      weekNumber: 1,
      month: 9,
      year: 2026,
      semester: 'I',
      startDate: '',
      endDate: '',
    };

    const result = reportsService.calculateDateRange(filter);
    expect(result.startDate).toBe('2026-09-01');
    expect(result.endDate).toBe('2026-09-30');
    expect(result.title).toContain('THÁNG 9 NĂM 2026');
  });

  it('tính toán chính xác khoảng ngày theo Tuần học', () => {
    const filter: ReportFilterState = {
      periodType: 'week',
      weekNumber: 1,
      month: 9,
      year: 2026,
      semester: 'I',
      startDate: '',
      endDate: '',
    };

    const result = reportsService.calculateDateRange(filter);
    expect(result.startDate).toBe('2026-09-01');
    expect(result.endDate).toBe('2026-09-07');
    expect(result.title).toContain('TUẦN 1');
  });

  it('tính toán chính xác khoảng ngày theo Học kỳ I và Học kỳ II', () => {
    const filterHk1: ReportFilterState = {
      periodType: 'semester',
      weekNumber: 1,
      month: 9,
      year: 2026,
      semester: 'I',
      startDate: '',
      endDate: '',
    };

    const res1 = reportsService.calculateDateRange(filterHk1);
    expect(res1.startDate).toBe('2026-09-01');
    expect(res1.endDate).toBe('2027-01-15');
    expect(res1.title).toContain('HỌC KỲ I');

    const filterHk2: ReportFilterState = {
      periodType: 'semester',
      weekNumber: 1,
      month: 2,
      year: 2026,
      semester: 'II',
      startDate: '',
      endDate: '',
    };

    const res2 = reportsService.calculateDateRange(filterHk2);
    expect(res2.startDate).toBe('2027-01-16');
    expect(res2.endDate).toBe('2027-05-31');
    expect(res2.title).toContain('HỌC KỲ II');
  });
});
