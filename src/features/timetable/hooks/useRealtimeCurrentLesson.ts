import { useState, useEffect, useCallback, useMemo } from 'react';
import { timetableService, type CurrentLessonStatus } from '../services/timetableService';
import { timetableOverrideService } from '../services/timetableOverrideService';
import { getAcademicWeekInfo } from '../../../utils/academicWeekUtils';
import type { TimetableEntry } from '../../../types/timetable';
import type { TimetableWeeklyOverride } from '../types/timetableOverrideTypes';
import { CLASS_6A6_ID } from '../../students/constants/defaultClass6A6Students';

export interface UseRealtimeCurrentLessonResult {
  lessonStatus: CurrentLessonStatus;
  entries: TimetableEntry[];
  isLoading: boolean;
  isSimulated: boolean;
  simulationPeriod: number | null;
  setSimulationPeriod: (period: number | null) => void;
  resetToLive: () => void;
  refresh: () => void;
}

/**
 * Hook đồng bộ môn học theo Thời khóa biểu thực tế theo thời gian thực (Real-time)
 * - Trong giờ học: Hiển thị môn học (ví dụ: Tiết 1: Môn Toán)
 * - Trong giờ ra chơi: Hiển thị "Giờ ra chơi"
 * - Ngoài giờ hoặc không có tiết: Hiển thị "Nghỉ"
 * - Hỗ trợ chế độ xem trước (Simulation) để kiểm tra giao diện bất cứ lúc nào
 */
export const useRealtimeCurrentLesson = (classId?: string): UseRealtimeCurrentLessonResult => {
  const targetClassId = classId || CLASS_6A6_ID;

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [overrides, setOverrides] = useState<Record<string, TimetableWeeklyOverride>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentRealTime, setCurrentRealTime] = useState<Date>(() => new Date());
  const [simulationPeriod, setSimulationPeriod] = useState<number | null>(null);

  // 1. Tải danh sách tiết học theo TKB
  const loadTimetable = useCallback(async () => {
    try {
      const data = await timetableService.getTimetableEntries(targetClassId);
      setEntries(data);
    } catch (err) {
      console.warn('Lỗi nạp TKB cho bảng lớp học:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetClassId]);

  // 2. Tải các thay đổi / ghi chú riêng của tuần
  const loadOverrides = useCallback(() => {
    const weekInfo = getAcademicWeekInfo(new Date());
    const data = timetableOverrideService.getWeekOverrides(targetClassId, weekInfo.weekNumber);
    setOverrides(data);
  }, [targetClassId]);

  useEffect(() => {
    loadTimetable();
    loadOverrides();

    // Đồng hồ nhảy mỗi 1 giây để đếm ngược tiết học / ra chơi chính xác
    const clockTimer = setInterval(() => {
      setCurrentRealTime(new Date());
    }, 1000);

    // Lắng nghe sự kiện khi TKB được cập nhật hoặc chỉnh sửa tiết
    const handleTimetableChange = () => {
      loadTimetable();
    };
    const handleOverrideChange = () => {
      loadOverrides();
    };

    window.addEventListener('timetable-updated', handleTimetableChange);
    window.addEventListener('timetable-overrides-updated', handleOverrideChange);
    window.addEventListener('storage', handleTimetableChange);

    return () => {
      clearInterval(clockTimer);
      window.removeEventListener('timetable-updated', handleTimetableChange);
      window.removeEventListener('timetable-overrides-updated', handleOverrideChange);
      window.removeEventListener('storage', handleTimetableChange);
    };
  }, [loadTimetable, loadOverrides]);

  // 3. Tính toán trạng thái tiết học hiện tại
  const lessonStatus = useMemo(() => {
    // Nếu đang ở chế độ xem trước (mô phỏng tiết học khi kiểm thử ban đêm)
    if (simulationPeriod !== null) {
      if (simulationPeriod === 999) {
        // Mô phỏng Giờ ra chơi
        return {
          state: 'recess' as const,
          title: 'Giờ ra chơi',
          timeSlot: '08:35 - 09:05',
          nextLessonText: 'Tiết tiếp theo: Tiết 3: KHTN (09:05)',
          countdown: {
            remainingMinutes: 8,
            remainingSeconds: 0,
            totalSeconds: 480,
            formattedText: 'Còn 8 phút vào lớp',
          },
          isRecess: true,
          isOff: false,
          isActiveLesson: false,
        };
      }

      if (simulationPeriod === 0) {
        // Mô phỏng Nghỉ
        return {
          state: 'off' as const,
          title: 'Nghỉ',
          nextLessonText: 'Hiện tại không có tiết học',
          isRecess: false,
          isOff: true,
          isActiveLesson: false,
        };
      }

      // Mô phỏng tiết học 1..8
      const jsDay = currentRealTime.getDay();
      const currentDay = jsDay === 0 ? 2 : jsDay === 6 ? 6 : jsDay + 1; // Nếu cuối tuần thì lấy T2 để mô phỏng
      const entry = entries.find((e) => e.dayOfWeek === currentDay && e.period === simulationPeriod);
      const override = entry ? overrides[entry.id] : undefined;
      const subjectName = override?.overrideSubject || entry?.subjectName || 'Toán';
      const teacherName = override?.overrideTeacher || entry?.teacherName || 'Thầy Phan Văn Bộ';
      const roomName = override?.overrideRoom || entry?.roomName || 'Phòng học 6A6';
      const timeSlot = entry?.timeSlot || timetableService.getDefaultTimeSlot(simulationPeriod);

      return {
        state: 'active_period' as const,
        title: `Tiết ${simulationPeriod}: Môn ${subjectName}`,
        subjectName,
        period: simulationPeriod,
        periodDisplay: simulationPeriod > 5 ? simulationPeriod - 5 : simulationPeriod,
        timeSlot,
        teacherName,
        roomName,
        nextLessonText: `Tiết tiếp theo: Tiết ${simulationPeriod + 1}`,
        countdown: {
          remainingMinutes: 15,
          remainingSeconds: 0,
          totalSeconds: 900,
          formattedText: 'Còn 15 phút là hết tiết',
        },
        isRecess: false,
        isOff: false,
        isActiveLesson: true,
      };
    }

    // Thời gian thực (Live)
    return timetableService.computeCurrentLesson(entries, overrides, currentRealTime);
  }, [entries, overrides, currentRealTime, simulationPeriod]);

  const resetToLive = useCallback(() => {
    setSimulationPeriod(null);
  }, []);

  return {
    lessonStatus,
    entries,
    isLoading,
    isSimulated: simulationPeriod !== null,
    simulationPeriod,
    setSimulationPeriod,
    resetToLive,
    refresh: loadTimetable,
  };
};
