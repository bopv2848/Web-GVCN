import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from './dashboardService';
import { supabase } from '../../../services/supabaseClient';

vi.mock('../../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('dashboardService.getDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lấy dữ liệu thực tế từ Supabase và tính toán chính xác sĩ số lớp', async () => {
    const mockStudents = [
      {
        id: 's1',
        full_name: 'Đỗ Bảo An',
        gender: 'Nam',
        boarding_type: 'Bán trú',
        group_id: 'g1',
        student_guardians: [{ id: 'guard-1', status: 'active' }],
      },
      {
        id: 's2',
        full_name: 'Hà Minh Thảo An',
        gender: 'Nữ',
        boarding_type: 'Bán trú',
        group_id: 'g1',
        student_guardians: [],
      },
      {
        id: 's3',
        full_name: 'Lê Ngọc Anh',
        gender: 'Nữ',
        boarding_type: 'Bán trú',
        group_id: 'g2',
        student_guardians: [{ id: 'guard-2', status: 'pending' }],
      },
    ];

    const mockGroups = [
      { id: 'g1', name: 'Tổ 1', color_class: 'text-red-500', order_index: 1 },
      { id: 'g2', name: 'Tổ 2', color_class: 'text-green-500', order_index: 2 },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'students') {
        return {
          select: () => ({
            eq: () => ({
              is: () => Promise.resolve({ data: mockStudents, error: null }),
            }),
          }),
        };
      }
      if (table === 'groups') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockGroups, error: null }),
            }),
          }),
        };
      }
      if (table === 'attendance_sessions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: [], error: null }),
              gte: () => ({
                lte: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'point_transactions') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    });

    const result = await dashboardService.getDashboardData('66666666-6666-6666-6666-666666666666');

    expect(result.totalStudents).toBe(3);
    expect(result.maleCount).toBe(1);
    expect(result.femaleCount).toBe(2);
    expect(result.boardingCount).toBe(3);
    expect(result.guardianLinkedCount).toBe(1);
  });

  it('tự động fallback về danh sách mặc định lớp 6A6 khi Supabase trả về rỗng hoặc lỗi', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'students') {
        return {
          select: () => ({
            eq: () => ({
              is: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        };
      }
      if (table === 'groups') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
            order: () => Promise.resolve({ data: [], error: null }),
            gte: () => ({
              lte: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        }),
      };
    });

    const result = await dashboardService.getDashboardData('66666666-6666-6666-6666-666666666666');

    expect(result.totalStudents).toBe(47);
    expect(result.maleCount).toBe(26);
    expect(result.femaleCount).toBe(21);
    expect(result.boardingCount).toBe(47);
  });
});
