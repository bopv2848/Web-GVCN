import { useState, useEffect, useCallback } from 'react';
import type { ClassInfo } from '../../../types/auth';

export interface SeatingPrintCustomHeader {
  schoolName: string;
  className: string;
  teacherName: string;
  academicYear: string;
  title: string;
  appliedDate: string;
  modeNote: string;
  colorMode: 'color' | 'monochrome';
  fontSize?: 12 | 13 | 14;
  nameCase?: 'default' | 'uppercase';
  autoFitLongNames?: boolean;
  showClassSize?: boolean;
  classSizeText?: string;
  showDoorArrow?: boolean;
}

interface UseSeatingPrintConfigProps {
  currentClass: ClassInfo | null;
  userFullName?: string;
  isRotationEnabled: boolean;
  activeWeekMode: 'odd' | 'even';
  schoolWeekNumber: number;
}

export const useSeatingPrintConfig = ({
  currentClass,
  userFullName,
  isRotationEnabled,
  activeWeekMode,
  schoolWeekNumber,
}: UseSeatingPrintConfigProps) => {
  const classId = currentClass?.id || 'default_class';
  const storageKey = `gvcn_seating_print_config_${classId}`;

  const getDefaultConfig = useCallback((): SeatingPrintCustomHeader => {
    const rawName = currentClass?.name || '6A6';
    const cleanClass = rawName.replace(/^lớp\s+/i, '').trim();

    let defaultTeacher = 'Thầy Phan Văn Bộ';
    if (userFullName) {
      if (userFullName.startsWith('Thầy ') || userFullName.startsWith('Cô ')) {
        defaultTeacher = userFullName;
      } else {
        defaultTeacher = `Thầy/Cô ${userFullName}`;
      }
    }

    const defaultModeNote = isRotationEnabled
      ? `Chế độ: Áp dụng ${
          activeWeekMode === 'even' ? 'Tuần Chẵn (Tổ 3-4-1-2)' : 'Tuần Lẻ (Tổ 4-3-2-1)'
        } • Tuần ${schoolWeekNumber}`
      : 'Chế độ: Chỗ ngồi cố định';

    return {
      schoolName: currentClass?.schoolName || 'TRƯỜNG THCS TÂN HẢI',
      className: `LỚP ${cleanClass}`,
      teacherName: defaultTeacher,
      academicYear: currentClass?.academicYear || '2026 - 2027',
      title: 'SƠ ĐỒ CHỖ NGỒI HỌC SINH',
      appliedDate: new Date().toLocaleDateString('vi-VN'),
      modeNote: defaultModeNote,
      colorMode: 'color',
      fontSize: 14,
      nameCase: 'default',
      autoFitLongNames: true,
      showClassSize: true,
      classSizeText: '',
      showDoorArrow: true,
    };
  }, [currentClass, userFullName, isRotationEnabled, activeWeekMode, schoolWeekNumber]);

  const [headerConfig, setHeaderConfig] = useState<SeatingPrintCustomHeader>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...getDefaultConfig(),
          ...parsed,
          fontSize: parsed.fontSize || 14,
          nameCase: parsed.nameCase || 'default',
          autoFitLongNames: parsed.autoFitLongNames !== false,
          showClassSize: parsed.showClassSize !== false,
          classSizeText: parsed.classSizeText || '',
          showDoorArrow: parsed.showDoorArrow !== false,
        };
      }
    } catch {
      // ignore
    }
    return getDefaultConfig();
  });

  // Cập nhật chế độ tuần khi có sự thay đổi tuần học nếu người dùng chưa sửa thủ công
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setHeaderConfig(getDefaultConfig());
      }
    } catch {
      // ignore
    }
  }, [getDefaultConfig, storageKey]);

  const updateHeaderConfig = (partial: Partial<SeatingPrintCustomHeader>) => {
    setHeaderConfig((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const resetHeaderConfig = () => {
    const defaults = getDefaultConfig();
    setHeaderConfig(defaults);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  return {
    headerConfig,
    updateHeaderConfig,
    resetHeaderConfig,
  };
};
