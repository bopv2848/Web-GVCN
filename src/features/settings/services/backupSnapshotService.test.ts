import { describe, it, expect, beforeEach, vi } from 'vitest';
import { backupSnapshotService } from './backupSnapshotService';
import { backupService } from './backupService';
import type { ClassBackupPayload } from '../types/backupTypes';

describe('backupSnapshotService Unit Tests', () => {
  const mockClassId = 'class-6a6-test';

  const mockPayload: ClassBackupPayload = {
    meta: {
      app: 'Web-GVCN',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      classId: mockClassId,
      className: 'LỚP 6A6',
      schoolName: 'TRƯỜNG THCS TÂN HẢI',
      totalStudents: 47,
    },
    data: {
      classConfig: { name: 'LỚP 6A6' },
      students: [{ id: 's1', fullName: 'Nguyễn Văn An' }],
      seating: { assignments: [{ seatNumber: 1, studentId: 's1' }] },
    },
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('tạo và lưu thành công bản chụp snapshot vào LocalStorage', async () => {
    vi.spyOn(backupService, 'collectClassBackupPayload').mockResolvedValue(mockPayload);

    const snapshot = await backupSnapshotService.createPreRestoreSnapshot(mockClassId, 'LỚP 6A6', 'TRƯỜNG THCS TÂN HẢI');

    expect(snapshot.classId).toBe(mockClassId);
    expect(snapshot.className).toBe('LỚP 6A6');
    expect(snapshot.payload).toEqual(mockPayload);

    const saved = backupSnapshotService.getLatestSnapshot(mockClassId);
    expect(saved).not.toBeNull();
    expect(saved?.classId).toBe(mockClassId);
  });

  it('xóa bản chụp snapshot thành công khi clearSnapshot được gọi', async () => {
    vi.spyOn(backupService, 'collectClassBackupPayload').mockResolvedValue(mockPayload);
    await backupSnapshotService.createPreRestoreSnapshot(mockClassId);

    expect(backupSnapshotService.getLatestSnapshot(mockClassId)).not.toBeNull();
    backupSnapshotService.clearSnapshot(mockClassId);
    expect(backupSnapshotService.getLatestSnapshot(mockClassId)).toBeNull();
  });

  it('hoàn tác thành công khi gọi restoreSnapshot từ bản chụp có sẵn', async () => {
    vi.spyOn(backupService, 'collectClassBackupPayload').mockResolvedValue(mockPayload);
    vi.spyOn(backupService, 'restoreFullClassBackup').mockResolvedValue({
      success: true,
      message: 'Khôi phục thành công',
      restoredStudentsCount: 47,
      restoredSeatingCount: 1,
      restoredConfigName: 'LỚP 6A6',
    });

    await backupSnapshotService.createPreRestoreSnapshot(mockClassId);
    const result = await backupSnapshotService.restoreSnapshot(mockClassId);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Đã hoàn tác dữ liệu thành công');
  });

  it('ném ngoại lệ nếu gọi restoreSnapshot khi không có bản chụp nào', async () => {
    await expect(backupSnapshotService.restoreSnapshot(mockClassId)).rejects.toThrow(
      'Không tìm thấy bản sao lưu dự phòng'
    );
  });
});
