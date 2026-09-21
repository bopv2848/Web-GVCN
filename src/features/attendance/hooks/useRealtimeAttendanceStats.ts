import { useState, useEffect, useCallback, useRef } from 'react';
import { attendanceService } from '../services/attendanceService';
import { CLASS_6A6_ID } from '../../students/constants/defaultClass6A6Students';
import type { SessionType } from '../../../types/attendance';

export interface ClassroomAttendanceStats {
  total: number;       // SS: Sĩ số
  present: number;     // HD: Hiện diện (Có mặt + Đi trễ)
  absent: number;      // V: Vắng (Có phép + Không phép)
  excused: number;     // Nghỉ có phép
  unexcused: number;   // Nghỉ không phép
  sessionType?: SessionType;
  sessionName?: string; // 'Sáng' | 'Chiều'
  absentStudents?: Array<{ id: string; name: string; reason?: string }>;
  isLoading: boolean;
  lastUpdated: Date;
}

/**
 * Hook theo dõi số liệu điểm danh lớp học theo thời gian thực (Real-time WebSockets + Custom Events + Polling)
 * Hỗ trợ đồng bộ riêng biệt theo Tiết học (Period) và Buổi (Sáng / Chiều)
 */
export const useRealtimeAttendanceStats = (
  classId?: string,
  targetDate?: string,
  period?: number | null
) => {
  const targetClassId = classId || CLASS_6A6_ID;
  const [stats, setStats] = useState<ClassroomAttendanceStats>({
    total: 47,
    present: 47,
    absent: 0,
    excused: 0,
    unexcused: 0,
    sessionType: 'morning',
    sessionName: 'Sáng',
    absentStudents: [],
    isLoading: true,
    lastUpdated: new Date(),
  });

  const activeSessionIdRef = useRef<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const todayStr = targetDate || new Date().toISOString().split('T')[0];
      const data = await attendanceService.getTodayClassAttendanceStats(
        targetClassId,
        todayStr,
        period
      );
      setStats({
        ...data,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.warn('Lỗi đồng bộ số liệu điểm danh thời gian thực:', err);
      setStats((prev) => ({ ...prev, isLoading: false }));
    }
  }, [targetClassId, targetDate, period]);

  useEffect(() => {
    fetchStats();

    // 1. Lắng nghe Custom Event khi giáo viên cập nhật điểm danh trên trang Điểm Danh
    const handleAttendanceChange = () => {
      fetchStats();
    };
    window.addEventListener('gvcn:attendance-changed', handleAttendanceChange);

    // 2. Lắng nghe sự kiện StorageEvent khi mở nhiều tab hoặc thiết bị khác cập nhật
    const handleStorage = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('gvcn_attendance_records_') || e.key.includes('attendance'))) {
        fetchStats();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Heartbeat polling chu kỳ 15 giây giữ số liệu luôn tươi mới
    const interval = setInterval(fetchStats, 15000);

    // 4. Lắng nghe Realtime WebSockets nếu có Supabase
    let unsubscribeRealtime: (() => void) | null = null;
    const initRealtime = async () => {
      try {
        const todayStr = targetDate || new Date().toISOString().split('T')[0];
        const sessionType =
          period !== undefined && period !== null
            ? period > 5
              ? 'afternoon'
              : 'morning'
            : new Date().getHours() >= 12
            ? 'afternoon'
            : 'morning';

        const sess = await attendanceService.getOrCreateSession(targetClassId, todayStr, sessionType);
        if (sess?.id) {
          activeSessionIdRef.current = sess.id;
          unsubscribeRealtime = attendanceService.subscribeToAttendance(sess.id, () => {
            fetchStats();
          });
        }
      } catch {
        // Dự phòng bằng polling
      }
    };
    initRealtime();

    return () => {
      window.removeEventListener('gvcn:attendance-changed', handleAttendanceChange);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
      if (unsubscribeRealtime) unsubscribeRealtime();
    };
  }, [fetchStats, targetClassId, targetDate, period]);

  return stats;
};
