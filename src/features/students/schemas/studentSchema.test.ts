import { describe, it, expect } from 'vitest';
import { studentSchema } from './studentSchema';

describe('Student Schema Zod Validation', () => {
  it('validates a correct student record', () => {
    const validData = {
      fullName: 'Nguyễn Văn An',
      gender: 'Nam',
      birthDate: '2008-03-15',
      classRole: 'Thành viên',
      boardingType: 'Bán trú',
      goals: 'Đỗ Bách Khoa',
      talents: 'Bóng đá',
    };

    const result = studentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails when full name is missing or too short', () => {
    const invalidData = {
      fullName: 'A',
      gender: 'Nam',
    };

    const result = studentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Họ và tên học sinh phải có ít nhất 2 ký tự');
    }
  });

  it('fails when gender is invalid', () => {
    const invalidData = {
      fullName: 'Trần Thị Bình',
      gender: 'Khác',
    };

    const result = studentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
