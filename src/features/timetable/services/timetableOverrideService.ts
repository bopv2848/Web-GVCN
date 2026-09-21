import type { TimetableEntry } from '../../../types/timetable';
import type {
  TimetableWeeklyOverride,
  TimetableConflictWarning,
} from '../types/timetableOverrideTypes';

const getStorageKey = (classId: string) => `gvcn_timetable_overrides_${classId}`;

export const timetableOverrideService = {
  /**
   * Lấy toàn bộ danh sách ghi chú/thay đổi theo tuần của một lớp
   */
  getAllOverrides(classId: string): Record<number, Record<string, TimetableWeeklyOverride>> {
    try {
      const raw = localStorage.getItem(getStorageKey(classId));
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Lỗi đọc ghi chú TKB theo tuần từ localStorage:', err);
      return {};
    }
  },

  /**
   * Lấy danh sách ghi chú/thay đổi của một tuần cụ thể
   */
  getWeekOverrides(classId: string, weekNumber: number): Record<string, TimetableWeeklyOverride> {
    const all = this.getAllOverrides(classId);
    return all[weekNumber] || {};
  },

  /**
   * Lưu hoặc cập nhật một ghi chú/thay đổi riêng cho tuần
   */
  saveOverride(override: TimetableWeeklyOverride): void {
    try {
      const all = this.getAllOverrides(override.classId);
      if (!all[override.weekNumber]) {
        all[override.weekNumber] = {};
      }

      all[override.weekNumber][override.entryId] = {
        ...override,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(getStorageKey(override.classId), JSON.stringify(all));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('timetable-overrides-updated', {
            detail: { classId: override.classId, weekNumber: override.weekNumber },
          })
        );
      }
    } catch (err) {
      console.error('Lỗi lưu ghi chú TKB tuần:', err);
      throw err;
    }
  },

  /**
   * Xóa ghi chú tuần này của một tiết học (khôi phục về TKB gốc)
   */
  removeOverride(classId: string, weekNumber: number, entryId: string): void {
    try {
      const all = this.getAllOverrides(classId);
      if (all[weekNumber] && all[weekNumber][entryId]) {
        delete all[weekNumber][entryId];
        localStorage.setItem(getStorageKey(classId), JSON.stringify(all));

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('timetable-overrides-updated', {
              detail: { classId, weekNumber },
            })
          );
        }
      }
    } catch (err) {
      console.error('Lỗi xóa ghi chú TKB tuần:', err);
    }
  },

  /**
   * Tự động quét và phát hiện các xung đột (trùng phòng thực hành, trùng tiết, hoặc giáo viên đánh dấu)
   */
  detectConflicts(
    entries: TimetableEntry[],
    overrides: Record<string, TimetableWeeklyOverride>
  ): TimetableConflictWarning[] {
    const conflicts: TimetableConflictWarning[] = [];

    // 1. Kiểm tra các tiết có gắn nhãn xung đột thủ công
    Object.values(overrides).forEach((ov) => {
      if (ov.isConflict) {
        const entry = entries.find((e) => e.id === ov.entryId);
        if (entry) {
          conflicts.push({
            entryId: entry.id,
            dayOfWeek: entry.dayOfWeek,
            period: entry.period,
            subjectName: ov.overrideSubject || entry.subjectName,
            conflictType: 'manual_alert',
            message: ov.conflictReason || ov.note || 'Cảnh báo xung đột tiết học trong tuần',
          });
        }
      }
    });

    // 2. Kiểm tra trùng phòng học đặc biệt trong cùng buổi/tiết (nếu có nhiều tiết cùng phòng)
    const roomOccupancy: Record<string, TimetableEntry[]> = {};
    entries.forEach((entry) => {
      const ov = overrides[entry.id];
      const activeRoom = ov?.overrideRoom || entry.roomName;
      if (activeRoom && activeRoom.trim() !== '' && !activeRoom.includes('P.6A6')) {
        const key = `${entry.dayOfWeek}_${entry.period}_${activeRoom.trim().toLowerCase()}`;
        if (!roomOccupancy[key]) {
          roomOccupancy[key] = [];
        }
        roomOccupancy[key].push(entry);
      }
    });

    Object.entries(roomOccupancy).forEach(([, occupiedEntries]) => {
      if (occupiedEntries.length > 1) {
        occupiedEntries.forEach((entry) => {
          conflicts.push({
            entryId: entry.id,
            dayOfWeek: entry.dayOfWeek,
            period: entry.period,
            subjectName: entry.subjectName,
            conflictType: 'room_duplicate',
            message: `Trùng phòng học ${overrides[entry.id]?.overrideRoom || entry.roomName} với tiết học khác!`,
          });
        });
      }
    });

    return conflicts;
  },
};
