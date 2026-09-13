import { backupService } from './backupService';
import type { PreRestoreSnapshot, RestoreResult } from '../types/backupTypes';

const SNAPSHOT_PREFIX = 'web_gvcn_snapshot_';

export const backupSnapshotService = {
  /**
   * Tạo bản chụp tự động (Snapshot) toàn bộ dữ liệu lớp học trước khi phục hồi
   */
  async createPreRestoreSnapshot(
    classId: string,
    className = 'LỚP 6A6',
    schoolName = 'TRƯỜNG THCS TÂN HẢI'
  ): Promise<PreRestoreSnapshot> {
    const payload = await backupService.collectClassBackupPayload(classId, className, schoolName);

    const snapshot: PreRestoreSnapshot = {
      classId,
      timestamp: new Date().toISOString(),
      className: payload.meta.className || className,
      schoolName: payload.meta.schoolName || schoolName,
      payload,
    };

    try {
      localStorage.setItem(`${SNAPSHOT_PREFIX}${classId}`, JSON.stringify(snapshot));
    } catch (err) {
      console.warn('Không thể lưu bản chụp snapshot vào LocalStorage (có thể do đầy bộ nhớ):', err);
    }

    return snapshot;
  },

  /**
   * Lấy thông tin bản chụp dự phòng gần nhất của lớp học
   */
  getLatestSnapshot(classId: string): PreRestoreSnapshot | null {
    try {
      const raw = localStorage.getItem(`${SNAPSHOT_PREFIX}${classId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PreRestoreSnapshot;
      if (!parsed || !parsed.payload || !parsed.timestamp) return null;
      return parsed;
    } catch (err) {
      console.warn('Lỗi đọc bản chụp dự phòng từ LocalStorage:', err);
      return null;
    }
  },

  /**
   * Xóa bỏ bản chụp dự phòng khi Thầy xác nhận dữ liệu đã chuẩn xác
   */
  clearSnapshot(classId: string): void {
    try {
      localStorage.removeItem(`${SNAPSHOT_PREFIX}${classId}`);
    } catch (err) {
      console.warn('Lỗi khi xóa bản chụp dự phòng:', err);
    }
  },

  /**
   * Thực hiện hoàn tác (Undo): Phục hồi lại nguyên vẹn trạng thái trước lần nạp gần nhất
   */
  async restoreSnapshot(classId: string): Promise<RestoreResult> {
    const snapshot = this.getLatestSnapshot(classId);
    if (!snapshot) {
      throw new Error('Không tìm thấy bản sao lưu dự phòng (Snapshot) để hoàn tác.');
    }

    const result = await backupService.restoreFullClassBackup(classId, snapshot.payload, {
      restoreConfig: true,
      restoreStudents: true,
      restoreSeating: true,
      restoreAttendance: true,
      restorePoints: true,
    });

    return {
      ...result,
      message: `Đã hoàn tác dữ liệu thành công về thời điểm trước lần nạp (${new Date(snapshot.timestamp).toLocaleTimeString('vi-VN')} ${new Date(snapshot.timestamp).toLocaleDateString('vi-VN')})!`,
    };
  },
};
