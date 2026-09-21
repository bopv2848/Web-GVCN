import { describe, it, expect, beforeEach, vi } from 'vitest';
import { seatingPresetService } from './seatingPresetService';
import type { SeatAssignmentWithStudent } from '../../../types/seating';
import type { Student } from '../../../types/student';

// Mock Supabase Client
const mockSingle = vi.fn().mockResolvedValue({
  data: {
    id: '88888888-8888-8888-8888-888888888888',
    class_id: '11111111-2222-3333-4444-555555555555',
    name: 'Sơ đồ test Supabase',
    description: 'Mô tả test',
    assignments: [],
    created_at: '2026-09-16T12:00:00Z',
  },
  error: null,
});

const mockQueryBuilder = {
  select: vi.fn(() => mockQueryBuilder),
  insert: vi.fn(() => mockQueryBuilder),
  update: vi.fn(() => mockQueryBuilder),
  delete: vi.fn(() => mockQueryBuilder),
  eq: vi.fn(() => mockQueryBuilder),
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
  single: mockSingle,
};

vi.mock('../../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => mockQueryBuilder),
  },
}));

describe('seatingPresetService', () => {
  const classId = '11111111-2222-3333-4444-555555555555';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const mockStudents: Student[] = [
    {
      id: 'hs-1',
      code: 'HS001',
      fullName: 'Nguyễn Văn An',
      classId,
      gender: 'Nam',
      classRole: 'Thành viên',
      points: 100,
      stars: 5,
      groupName: 'Tổ 1',
      groupColorClass: 'text-red-500',
    },
    {
      id: 'hs-2',
      code: 'HS002',
      fullName: 'Trần Thị Bình',
      classId,
      gender: 'Nữ',
      classRole: 'Tổ trưởng',
      points: 120,
      stars: 6,
      groupName: 'Tổ 2',
      groupColorClass: 'text-green-500',
    },
  ];

  const mockAssignments: SeatAssignmentWithStudent[] = [
    {
      id: 'asg-1',
      layoutId: 'layout-1',
      studentId: 'hs-1',
      rowIndex: 0,
      colIndex: 0,
      isHidden: false,
      student: mockStudents[0],
    },
    {
      id: 'asg-2',
      layoutId: 'layout-1',
      studentId: 'hs-2',
      rowIndex: 0,
      colIndex: 1,
      isHidden: false,
      student: mockStudents[1],
    },
  ];

  it('lưu bản mẫu mới và đọc lại chính xác', async () => {
    const preset = await seatingPresetService.savePreset(
      classId,
      'Sơ đồ ôn thi',
      'Xếp xen kẽ nam nữ',
      mockAssignments
    );

    expect(preset.name).toBe('Sơ đồ test Supabase');
    const presets = seatingPresetService.getPresets(classId);
    expect(presets).toHaveLength(1);
    expect(presets[0].id).toBe(preset.id);
  });

  it('xóa bản mẫu thành công', async () => {
    const preset = await seatingPresetService.savePreset(
      classId,
      'Sơ đồ nhóm',
      '',
      mockAssignments
    );

    expect(seatingPresetService.getPresets(classId)).toHaveLength(1);

    const success = await seatingPresetService.deletePreset(classId, preset.id);
    expect(success).toBe(true);
    expect(seatingPresetService.getPresets(classId)).toHaveLength(0);
  });

  it('convertPresetToAssignments lọc bỏ học sinh không còn trong lớp', async () => {
    const preset = await seatingPresetService.savePreset(
      classId,
      'Sơ đồ cũ',
      '',
      mockAssignments
    );

    // Giả sử hs-2 đã bị xóa khỏi lớp, chỉ còn hs-1
    const currentStudents = [mockStudents[0]];
    const converted = seatingPresetService.convertPresetToAssignments(
      {
        ...preset,
        assignments: [
          { studentId: 'hs-1', rowIndex: 0, colIndex: 0 },
          { studentId: 'hs-2', rowIndex: 0, colIndex: 1 },
        ],
      },
      currentStudents,
      'layout-new'
    );

    expect(converted).toHaveLength(1);
    expect(converted[0].studentId).toBe('hs-1');
    expect(converted[0].student?.fullName).toBe('Nguyễn Văn An');
    expect(converted[0].layoutId).toBe('layout-new');
  });

  it('lưu dự phòng cục bộ khi ID lớp không phải UUID', async () => {
    const localClassId = 'local-custom-class';
    const preset = await seatingPresetService.savePreset(
      localClassId,
      'Sơ đồ nội bộ máy',
      'Không gọi Supabase',
      mockAssignments
    );

    expect(preset.id.startsWith('preset-')).toBe(true);
    expect(preset.name).toBe('Sơ đồ nội bộ máy');
    const presets = seatingPresetService.getPresets(localClassId);
    expect(presets).toHaveLength(1);
  });

  it('cập nhật tên và mô tả của bản mẫu thành công (updatePreset)', async () => {
    const preset = await seatingPresetService.savePreset(
      classId,
      'Sơ đồ ban đầu',
      'Ghi chú cũ',
      mockAssignments
    );

    const updated = await seatingPresetService.updatePreset(
      classId,
      preset.id,
      'Sơ đồ ôn thi tốt nghiệp',
      'Đã đổi chỗ bạn An và Bình'
    );

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Sơ đồ ôn thi tốt nghiệp');
    expect(updated?.description).toBe('Đã đổi chỗ bạn An và Bình');

    const presets = seatingPresetService.getPresets(classId);
    expect(presets[0].name).toBe('Sơ đồ ôn thi tốt nghiệp');
    expect(presets[0].description).toBe('Đã đổi chỗ bạn An và Bình');
  });

  it('lưu và giữ nguyên cấu hình kích thước riêng biệt (elementsConfig) cho bản mẫu', async () => {
    const localClassId = 'local-dims-class';
    const customDims = {
      teacherDeskWidth: 460,
      teacherDeskScale: 115,
      doorWidth: 220,
      doorScale: 105,
      studentDeskScale: 110,
    };

    const preset = await seatingPresetService.savePreset(
      localClassId,
      'Sơ đồ Phòng Thi Riêng',
      'Bàn rộng 460px',
      mockAssignments,
      customDims
    );

    expect(preset.elementsConfig).toEqual(customDims);

    const retrieved = seatingPresetService.getPresets(localClassId);
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].elementsConfig).toEqual(customDims);
  });
});
