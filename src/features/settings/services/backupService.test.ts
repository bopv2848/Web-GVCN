import { describe, it, expect, vi, beforeEach } from 'vitest';
import { backupService } from './backupService';
import { studentService } from '../../students/services/studentService';
import { seatingService } from '../../seating/services/seatingService';
import { classConfigService } from './classConfigService';
import type { Student, Group } from '../../../types/student';
import type { SeatLayout } from '../../../types/seating';
import type { ClassBackupPayload } from '../types/backupTypes';

vi.mock('../../students/services/studentService', () => ({
  studentService: {
    getStudents: vi.fn(),
    getGroups: vi.fn(),
  },
}));

vi.mock('../../seating/services/seatingService', () => ({
  seatingService: {
    getOrCreateClassLayout: vi.fn(),
    getSeatAssignmentsWithStudents: vi.fn(),
    getClassSeatingConfig: vi.fn(),
    saveAllAssignments: vi.fn(),
    updateClassSeatingConfig: vi.fn(),
  },
}));

vi.mock('./classConfigService', () => ({
  classConfigService: {
    getClassConfig: vi.fn(),
    updateClassConfig: vi.fn(),
  },
}));

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('../../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      upsert: mockUpsert,
    })),
  },
}));

describe('backupService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    localStorage.clear();
  });

  it('exports full class backup with correct structure and file metadata', async () => {
    vi.mocked(classConfigService.getClassConfig).mockResolvedValue({
      name: 'LỚP 6A6',
      schoolName: 'TRƯỜNG THCS TÂN HẢI',
      academicYear: '2026 - 2027',
      gradeLevel: 6,
      themeMonth: 'Tháng 9',
      themeTitle: 'Chuyến tàu 6A6',
      bannerColorClass: 'from-blue-900 to-indigo-900',
    });

    vi.mocked(studentService.getStudents).mockResolvedValue([
      { id: 'st-1', fullName: 'Nguyễn Văn A' } as unknown as Student,
      { id: 'st-2', fullName: 'Trần Thị B' } as unknown as Student,
    ]);

    vi.mocked(studentService.getGroups).mockResolvedValue([
      { id: 'g-1', name: 'Tổ 1' } as unknown as Group,
    ]);

    vi.mocked(seatingService.getOrCreateClassLayout).mockResolvedValue({
      id: 'layout-1',
      rows: 6,
      cols: 8,
    } as unknown as SeatLayout);

    vi.mocked(seatingService.getSeatAssignmentsWithStudents).mockResolvedValue([]);
    vi.mocked(seatingService.getClassSeatingConfig).mockResolvedValue({
      rotationEnabled: true,
      schoolYearStartDate: '2026-09-01',
    });

    const result = await backupService.exportFullClassBackup('test-class-id');

    expect(result.success).toBe(true);
    expect(result.studentCount).toBe(2);
    expect(result.fileName).toContain('Sao-Luu-Web-GVCN-LỚP-6A6');
    expect(result.fileName).toContain('.json');
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('thực hiện Selective Restore đúng theo phân hệ được chọn', async () => {
    const mockBackup: ClassBackupPayload = {
      meta: {
        app: 'Web-GVCN',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
      },
      data: {
        classConfig: { name: 'LỚP 6A6 MỚI' },
        students: [{ id: 's1', fullName: 'Học sinh 1' }],
        seating: { assignments: [{ seatNumber: 1, studentId: 's1' }] },
      },
    };

    // Chỉ khôi phục sơ đồ chỗ ngồi, không khôi phục học sinh và cấu hình
    const result = await backupService.restoreFullClassBackup('class-1', mockBackup, {
      restoreConfig: false,
      restoreStudents: false,
      restoreSeating: true,
      restoreAttendance: false,
      restorePoints: false,
    });

    expect(result.success).toBe(true);
    expect(classConfigService.updateClassConfig).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(localStorage.getItem('seating_assignments_class-1')).toContain('seatNumber');
  });
});
