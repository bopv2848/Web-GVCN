import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ClassroomElementsConfig,
  TeacherDeskPosition,
  DoorPosition,
} from '../../../types/seating';
import { seatingService } from '../services/seatingService';

export const DEFAULT_CLASSROOM_ELEMENTS: ClassroomElementsConfig = {
  teacherDeskPosition: 'right',
  doorPosition: 'right',
  doorAngle: 180, // Mũi tên hướng thẳng vào lớp (từ trên nhìn xuống)
  teacherDeskLabel: 'Bàn Giáo Viên',
  teacherDeskWidth: 384, // Chiều dài Bàn Giáo Viên (px): 240 - 560
  teacherDeskScale: 100, // Tỷ lệ To/Nhỏ Bàn Giáo Viên (%): 75 - 135
  doorWidth: 180, // Chiều dài Cửa Ra Vào (px): 120 - 320
  doorScale: 100, // Tỷ lệ To/Nhỏ Cửa Ra Vào (%): 75 - 135
  studentDeskScale: 100, // Tỷ lệ To/Nhỏ Bàn Học Sinh (%): 80 - 125
  isDimensionsLocked: false, // Khóa kích thước để chống chạm nhầm
  frontPlacement: 'bottom', // Vị trí Bục giảng & Bảng ở Phía Dưới (mặc định) hoặc Phía Trên
};

export const parseElementsConfig = (parsed: any): ClassroomElementsConfig => {
  if (!parsed || typeof parsed !== 'object') {
    return DEFAULT_CLASSROOM_ELEMENTS;
  }
  return {
    teacherDeskPosition: ['left', 'center', 'right'].includes(parsed.teacherDeskPosition)
      ? parsed.teacherDeskPosition
      : DEFAULT_CLASSROOM_ELEMENTS.teacherDeskPosition,
    doorPosition: ['left', 'right'].includes(parsed.doorPosition)
      ? parsed.doorPosition
      : DEFAULT_CLASSROOM_ELEMENTS.doorPosition,
    doorAngle:
      typeof parsed.doorAngle === 'number'
        ? ((parsed.doorAngle % 360) + 360) % 360
        : DEFAULT_CLASSROOM_ELEMENTS.doorAngle,
    teacherDeskLabel:
      typeof parsed.teacherDeskLabel === 'string' && parsed.teacherDeskLabel.trim()
        ? parsed.teacherDeskLabel.trim()
        : DEFAULT_CLASSROOM_ELEMENTS.teacherDeskLabel,
    teacherDeskWidth:
      typeof parsed.teacherDeskWidth === 'number' && parsed.teacherDeskWidth >= 200 && parsed.teacherDeskWidth <= 600
        ? Math.round(parsed.teacherDeskWidth)
        : DEFAULT_CLASSROOM_ELEMENTS.teacherDeskWidth,
    teacherDeskScale:
      typeof parsed.teacherDeskScale === 'number' && parsed.teacherDeskScale >= 70 && parsed.teacherDeskScale <= 150
        ? Math.round(parsed.teacherDeskScale)
        : DEFAULT_CLASSROOM_ELEMENTS.teacherDeskScale,
    doorWidth:
      typeof parsed.doorWidth === 'number' && parsed.doorWidth >= 100 && parsed.doorWidth <= 400
        ? Math.round(parsed.doorWidth)
        : DEFAULT_CLASSROOM_ELEMENTS.doorWidth,
    doorScale:
      typeof parsed.doorScale === 'number' && parsed.doorScale >= 70 && parsed.doorScale <= 150
        ? Math.round(parsed.doorScale)
        : DEFAULT_CLASSROOM_ELEMENTS.doorScale,
    studentDeskScale:
      typeof parsed.studentDeskScale === 'number' && parsed.studentDeskScale >= 70 && parsed.studentDeskScale <= 140
        ? Math.round(parsed.studentDeskScale)
        : DEFAULT_CLASSROOM_ELEMENTS.studentDeskScale,
    isDimensionsLocked:
      typeof parsed.isDimensionsLocked === 'boolean'
        ? parsed.isDimensionsLocked
        : DEFAULT_CLASSROOM_ELEMENTS.isDimensionsLocked,
    frontPlacement: ['top', 'bottom'].includes(parsed.frontPlacement)
      ? parsed.frontPlacement
      : DEFAULT_CLASSROOM_ELEMENTS.frontPlacement,
  };
};

export const useClassroomElementsConfig = (classId?: string) => {
  const storageKey = classId
    ? `gvcn_classroom_elements_${classId}`
    : 'gvcn_classroom_elements_default';

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  const [config, setConfig] = useState<ClassroomElementsConfig>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return parseElementsConfig(JSON.parse(saved));
      }
    } catch (err) {
      console.warn('Lỗi đọc cấu hình phòng học từ LocalStorage:', err);
    }
    return DEFAULT_CLASSROOM_ELEMENTS;
  });

  // Khi đổi classId, nạp từ LocalStorage trước (nhanh), sau đó đồng bộ từ Supabase classes
  useEffect(() => {
    let isCancelled = false;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setConfig(parseElementsConfig(JSON.parse(saved)));
      } else {
        setConfig(DEFAULT_CLASSROOM_ELEMENTS);
      }
    } catch {
      setConfig(DEFAULT_CLASSROOM_ELEMENTS);
    }

    // Tải cấu hình mới nhất từ Database Supabase (nếu có classId)
    if (classId) {
      seatingService.getClassroomElementsConfig(classId).then((remoteConfig) => {
        if (!isCancelled && remoteConfig) {
          setConfig(remoteConfig);
          try {
            localStorage.setItem(storageKey, JSON.stringify(remoteConfig));
          } catch {
            // ignore
          }
        }
      });
    }

    // Đăng ký Realtime WebSockets: Khi có thiết bị khác (điện thoại/máy tính) cập nhật, tự động đồng bộ ngay
    let unsubscribeRealtime: (() => void) | null = null;
    if (classId) {
      unsubscribeRealtime = seatingService.subscribeToClassroomElements(
        classId,
        (remoteConfig) => {
          if (!isCancelled && remoteConfig) {
            setConfig((prev) => {
              if (
                prev.teacherDeskPosition === remoteConfig.teacherDeskPosition &&
                prev.doorPosition === remoteConfig.doorPosition &&
                prev.doorAngle === remoteConfig.doorAngle &&
                prev.teacherDeskLabel === remoteConfig.teacherDeskLabel &&
                prev.teacherDeskWidth === remoteConfig.teacherDeskWidth &&
                prev.teacherDeskScale === remoteConfig.teacherDeskScale &&
                prev.doorWidth === remoteConfig.doorWidth &&
                prev.doorScale === remoteConfig.doorScale &&
                prev.studentDeskScale === remoteConfig.studentDeskScale &&
                prev.isDimensionsLocked === remoteConfig.isDimensionsLocked
              ) {
                return prev;
              }
              try {
                localStorage.setItem(storageKey, JSON.stringify(remoteConfig));
              } catch {
                // ignore
              }
              return remoteConfig;
            });
          }
        },
        (status) => {
          if (!isCancelled) {
            setRealtimeStatus(status);
          }
        }
      );
    }

    return () => {
      isCancelled = true;
      if (unsubscribeRealtime) {
        unsubscribeRealtime();
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [classId, storageKey]);

  // Hàm lưu cấu hình mới (cập nhật UI tức thì + đồng bộ Database)
  const updateConfig = useCallback(
    (updates: Partial<ClassroomElementsConfig>) => {
      setConfig((prev) => {
        const next: ClassroomElementsConfig = {
          ...prev,
          ...updates,
          doorAngle:
            typeof updates.doorAngle === 'number'
              ? ((updates.doorAngle % 360) + 360) % 360
              : prev.doorAngle,
        };

        // 1. Lưu LocalStorage ngay lập tức
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (err) {
          console.error('Lỗi lưu cấu hình phòng học vào LocalStorage:', err);
        }

        // 2. Đồng bộ lên Supabase Database (Debounce nếu chỉ kéo slider kích thước)
        if (classId) {
          const isSliderOnly =
            updates.teacherDeskPosition === undefined &&
            updates.doorPosition === undefined &&
            updates.doorAngle === undefined &&
            updates.teacherDeskLabel === undefined &&
            updates.isDimensionsLocked === undefined;

          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }

          if (isSliderOnly) {
            saveTimeoutRef.current = setTimeout(async () => {
              setIsSyncing(true);
              await seatingService.saveClassroomElementsConfig(classId, next);
              setIsSyncing(false);
            }, 400);
          } else {
            setIsSyncing(true);
            seatingService.saveClassroomElementsConfig(classId, next).finally(() => {
              setIsSyncing(false);
            });
          }
        }

        return next;
      });
    },
    [classId, storageKey]
  );

  const setTeacherDeskPosition = useCallback(
    (pos: TeacherDeskPosition) => {
      updateConfig({ teacherDeskPosition: pos });
    },
    [updateConfig]
  );

  const setDoorPosition = useCallback(
    (pos: DoorPosition) => {
      updateConfig({ doorPosition: pos });
    },
    [updateConfig]
  );

  const setDoorAngle = useCallback(
    (angle: number) => {
      updateConfig({ doorAngle: ((angle % 360) + 360) % 360 });
    },
    [updateConfig]
  );

  const rotateDoor = useCallback(
    (delta: number = 45) => {
      setConfig((prev) => {
        const nextAngle = ((prev.doorAngle + delta) % 360 + 360) % 360;
        const next = { ...prev, doorAngle: nextAngle };
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (err) {
          console.error('Lỗi lưu góc xoay cửa:', err);
        }
        return next;
      });
    },
    [storageKey]
  );

  const resetConfig = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setConfig(DEFAULT_CLASSROOM_ELEMENTS);
  }, [storageKey]);

  return {
    config,
    isSyncing,
    realtimeStatus,
    setTeacherDeskPosition,
    setDoorPosition,
    setDoorAngle,
    rotateDoor,
    updateConfig,
    resetConfig,
  };
};
