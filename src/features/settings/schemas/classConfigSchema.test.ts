import { describe, it, expect } from 'vitest';
import { classConfigSchema } from './classConfigSchema';

describe('Class Config Schema Zod Validation', () => {
  it('validates a complete class branding config', () => {
    const validConfig = {
      name: 'LỚP 12A1',
      schoolName: 'THPT THANH XUÂN',
      academicYear: '2026 - 2027',
      gradeLevel: 12,
      themeMonth: 'CHỦ ĐIỂM THÁNG 9',
      themeTitle: 'CHUYẾN TÀU THANH XUÂN',
      bannerColorClass: 'from-[#1e1b4b] to-[#312e81]',
    };

    const result = classConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('rejects grade level outside 1-12', () => {
    const invalidConfig = {
      name: 'LỚP 12A1',
      schoolName: 'THPT THANH XUÂN',
      academicYear: '2026 - 2027',
      gradeLevel: 15,
      themeMonth: 'CHỦ ĐIỂM THÁNG 9',
      themeTitle: 'CHUYẾN TÀU THANH XUÂN',
    };

    const result = classConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});
