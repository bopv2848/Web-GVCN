import { describe, it, expect } from 'vitest';
import { classBackupSchema } from './backupSchema';

describe('classBackupSchema Zod Validation', () => {
  it('validates a correct Web-GVCN backup JSON structure', () => {
    const validPayload = {
      meta: {
        app: 'Web-GVCN',
        version: '2.0.0',
        exportedAt: '2026-09-13T12:00:00.000Z',
        className: 'LỚP 6A6',
        schoolName: 'TRƯỜNG THCS TÂN HẢI',
        totalStudents: 47,
      },
      data: {
        classConfig: { name: 'LỚP 6A6' },
        students: [{ id: 'st-1', full_name: 'Nguyễn Văn A' }],
        groups: [{ id: 'g-1', name: 'Tổ 1' }],
        seating: {
          assignments: [],
        },
      },
    };

    const result = classBackupSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects backup if app name is not Web-GVCN', () => {
    const invalidPayload = {
      meta: {
        app: 'Another-App',
        version: '1.0.0',
        exportedAt: '2026-09-13T12:00:00.000Z',
      },
      data: {},
    };

    const result = classBackupSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('không phải là bản sao lưu');
    }
  });

  it('rejects backup if missing version in meta', () => {
    const invalidPayload = {
      meta: {
        app: 'Web-GVCN',
        version: '',
        exportedAt: '2026-09-13T12:00:00.000Z',
      },
      data: {},
    };

    const result = classBackupSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
