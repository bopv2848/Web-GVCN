import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSeatingPrintConfig } from './useSeatingPrintConfig';
import type { ClassInfo } from '../../../types/auth';

describe('useSeatingPrintConfig Hook', () => {
  const mockClass: ClassInfo = {
    id: 'class-6a6',
    name: 'Lớp 6A6',
    gradeLevel: 6,
    schoolName: 'TRƯỜNG THCS TÂN HẢI',
    academicYear: '2026 - 2027',
    themeTitle: 'Đoàn kết',
    themeMonth: 'Tháng 9',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('khởi tạo giá trị mặc định chính xác từ thông tin lớp học', () => {
    const { result } = renderHook(() =>
      useSeatingPrintConfig({
        currentClass: mockClass,
        userFullName: 'Phan Văn Bộ',
        isRotationEnabled: false,
        activeWeekMode: 'odd',
        schoolWeekNumber: 2,
      })
    );

    expect(result.current.headerConfig.schoolName).toBe('TRƯỜNG THCS TÂN HẢI');
    expect(result.current.headerConfig.className).toBe('LỚP 6A6');
    expect(result.current.headerConfig.teacherName).toBe('Thầy/Cô Phan Văn Bộ');
    expect(result.current.headerConfig.academicYear).toBe('2026 - 2027');
    expect(result.current.headerConfig.title).toBe('SƠ ĐỒ CHỖ NGỒI HỌC SINH');
    expect(result.current.headerConfig.modeNote).toBe('Chế độ: Chỗ ngồi cố định');
    expect(result.current.headerConfig.colorMode).toBe('color');
    expect(result.current.headerConfig.fontSize).toBe(14);
    expect(result.current.headerConfig.nameCase).toBe('default');
    expect(result.current.headerConfig.autoFitLongNames).toBe(true);
    expect(result.current.headerConfig.showClassSize).toBe(true);
    expect(result.current.headerConfig.showDoorArrow).toBe(true);
  });

  it('cập nhật và lưu nhớ cấu hình tùy biến vào localStorage', () => {
    const { result } = renderHook(() =>
      useSeatingPrintConfig({
        currentClass: mockClass,
        userFullName: 'Thầy Phan Văn Bộ',
        isRotationEnabled: false,
        activeWeekMode: 'odd',
        schoolWeekNumber: 2,
      })
    );

    act(() => {
      result.current.updateHeaderConfig({
        schoolName: 'TRƯỜNG THCS TÂN HẢI - NĂM HỌC 2025-2026',
        teacherName: 'Thầy Phan Văn Bộ (CN)',
        appliedDate: '15/09/2026',
        colorMode: 'monochrome',
        fontSize: 12,
        nameCase: 'uppercase',
        autoFitLongNames: false,
        showDoorArrow: false,
      });
    });

    expect(result.current.headerConfig.schoolName).toBe('TRƯỜNG THCS TÂN HẢI - NĂM HỌC 2025-2026');
    expect(result.current.headerConfig.teacherName).toBe('Thầy Phan Văn Bộ (CN)');
    expect(result.current.headerConfig.appliedDate).toBe('15/09/2026');
    expect(result.current.headerConfig.showDoorArrow).toBe(false);
    expect(result.current.headerConfig.colorMode).toBe('monochrome');
    expect(result.current.headerConfig.fontSize).toBe(12);
    expect(result.current.headerConfig.nameCase).toBe('uppercase');
    expect(result.current.headerConfig.autoFitLongNames).toBe(false);

    // Kiểm tra đã lưu trong localStorage
    const saved = localStorage.getItem('gvcn_seating_print_config_class-6a6');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.schoolName).toBe('TRƯỜNG THCS TÂN HẢI - NĂM HỌC 2025-2026');
    expect(parsed.colorMode).toBe('monochrome');
    expect(parsed.fontSize).toBe(12);
    expect(parsed.nameCase).toBe('uppercase');
    expect(parsed.autoFitLongNames).toBe(false);
  });

  it('khôi phục lại thông tin mặc định khi gọi resetHeaderConfig', () => {
    const { result } = renderHook(() =>
      useSeatingPrintConfig({
        currentClass: mockClass,
        userFullName: 'Thầy Phan Văn Bộ',
        isRotationEnabled: false,
        activeWeekMode: 'odd',
        schoolWeekNumber: 2,
      })
    );

    act(() => {
      result.current.updateHeaderConfig({
        schoolName: 'TRƯỜNG THCS TÂN HẢI - SỬA ĐỔI',
      });
    });

    expect(result.current.headerConfig.schoolName).toBe('TRƯỜNG THCS TÂN HẢI - SỬA ĐỔI');

    act(() => {
      result.current.resetHeaderConfig();
    });

    expect(result.current.headerConfig.schoolName).toBe('TRƯỜNG THCS TÂN HẢI');
  });
});
