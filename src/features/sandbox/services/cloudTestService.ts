import { supabase } from '../../../services/supabaseClient';
import { sandboxService } from './sandboxService';
import {
  CLOUD_TEST_CLASS_ID,
  CLOUD_TEST_ACTIVE_KEY,
  CLOUD_TEST_CLASS_INFO,
} from '../constants/cloudTestConstants';
import type { CloudTestStats, CloudTestEventDetail } from '../types/sandboxTypes';

export const cloudTestService = {
  isCloudTestActive(): boolean {
    try {
      return localStorage.getItem(CLOUD_TEST_ACTIVE_KEY) === 'true';
    } catch {
      return false;
    }
  },

  notifyChange(action: 'enabled' | 'disabled' | 'reset' | 'cleared'): void {
    if (typeof window === 'undefined') return;
    const detail: CloudTestEventDetail = {
      active: this.isCloudTestActive(),
      timestamp: new Date().toISOString(),
      action,
    };
    window.dispatchEvent(new CustomEvent('gvcn:cloud_test_change', { detail }));
  },

  async enableCloudTest(): Promise<void> {
    try {
      // Khi bật chế độ Cloud Test, tự động tắt Offline Sandbox để tránh xung đột dữ liệu
      sandboxService.disableSandbox();
      localStorage.setItem(CLOUD_TEST_ACTIVE_KEY, 'true');
      this.notifyChange('enabled');

      // Đảm bảo lớp demo đã tồn tại trên Supabase
      await this.ensureDemoClassExists();
    } catch (e) {
      console.error('Lỗi khi kích hoạt chế độ Cloud Test:', e);
    }
  },

  disableCloudTest(): void {
    try {
      localStorage.setItem(CLOUD_TEST_ACTIVE_KEY, 'false');
      this.notifyChange('disabled');
    } catch (e) {
      console.error('Lỗi khi tắt chế độ Cloud Test:', e);
    }
  },

  /**
   * Đảm bảo lớp demo tồn tại trong bảng classes trên Supabase
   */
  async ensureDemoClassExists(): Promise<void> {
    try {
      const { data } = await supabase
        .from('classes')
        .select('id, is_demo')
        .eq('id', CLOUD_TEST_CLASS_ID)
        .maybeSingle();

      if (!data) {
        // Lấy school_id và academic_year_id thực tế từ database
        let schoolId = '11111111-1111-1111-1111-111111111111';
        let yearId = '22222222-2222-2222-2222-222222222222';

        const { data: refClass } = await supabase
          .from('classes')
          .select('school_id, academic_year_id')
          .neq('id', CLOUD_TEST_CLASS_ID)
          .limit(1)
          .maybeSingle();

        if (refClass) {
          schoolId = refClass.school_id;
          yearId = refClass.academic_year_id;
        }

        // Tạo lớp demo nếu chưa có
        await supabase.from('classes').insert({
          id: CLOUD_TEST_CLASS_ID,
          school_id: schoolId,
          academic_year_id: yearId,
          name: '[THỬ NGHIỆM] LỚP 6A6',
          grade_level: 6,
          is_demo: true,
          theme_config: {
            month: 'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG',
            title: 'CHUYẾN TÀU THANH XUÂN 6A6 • [DỮ LIỆU THỬ NGHIỆM SUPABASE]',
            bannerColorClass: 'from-amber-700 to-amber-950',
          },
          settings: {
            sidebarPosition: 'left',
            deductStarsOnRedeem: true,
          },
        });
      }
    } catch (err) {
      console.warn('Lỗi kiểm tra/khởi tạo lớp demo trên Supabase:', err);
    }
  },

  /**
   * Lấy số liệu thống kê thực tế của Lớp Thử Nghiệm từ Supabase
   */
  async getCloudTestStats(): Promise<CloudTestStats> {
    try {
      const [studentsRes, groupsRes, pointsRes, attRes] = await Promise.all([
        supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', CLOUD_TEST_CLASS_ID)
          .is('deleted_at', null),
        supabase
          .from('groups')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', CLOUD_TEST_CLASS_ID),
        supabase
          .from('point_transactions')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', CLOUD_TEST_CLASS_ID),
        supabase
          .from('attendance_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', CLOUD_TEST_CLASS_ID),
      ]);

      return {
        totalStudents: studentsRes.count || 0,
        totalGroups: groupsRes.count || 0,
        totalPointTransactions: pointsRes.count || 0,
        totalAttendanceSessions: attRes.count || 0,
        isLoading: false,
        error: null,
        lastCheckedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể kết nối Supabase';
      return {
        totalStudents: 0,
        totalGroups: 0,
        totalPointTransactions: 0,
        totalAttendanceSessions: 0,
        isLoading: false,
        error: errorMessage,
        lastCheckedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Tái tạo dữ liệu mẫu cho Lớp Thử Nghiệm trên Supabase
   * Gọi Database Stored Procedure (RPC) reset_demo_class
   */
  async resetCloudTestData(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Thử gọi RPC database function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('reset_demo_class', {
        p_demo_class_id: CLOUD_TEST_CLASS_ID,
      });

      if (!error && data) {
        this.notifyChange('reset');
        return {
          success: true,
          message: data.message || 'Đã tái tạo dữ liệu mẫu thành công qua Database RPC!',
        };
      }

      // 2. Cơ chế Fallback dự phòng: Nếu hàm RPC chưa được tạo trong Supabase SQL Editor
      console.warn('RPC reset_demo_class không phản hồi, chạy quy trình khởi tạo trực tiếp...');
      await this.fallbackResetCloudData();
      this.notifyChange('reset');
      return {
        success: true,
        message: 'Đã tái tạo dữ liệu mẫu Lớp thử nghiệm thành công (Client Fallback)!',
      };
    } catch (err: unknown) {
      console.error('Lỗi khi reset Cloud Test Data:', err);
      const message = err instanceof Error ? err.message : 'Lỗi không xác định khi reset dữ liệu';
      return { success: false, message };
    }
  },

  /**
   * Xóa sạch toàn bộ dữ liệu của Lớp Thử Nghiệm trên Supabase
   */
  async clearCloudTestData(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Thử gọi RPC database function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('clear_demo_class', {
        p_demo_class_id: CLOUD_TEST_CLASS_ID,
      });

      if (!error && data) {
        this.notifyChange('cleared');
        return {
          success: true,
          message: data.message || 'Đã dọn sạch dữ liệu lớp thử nghiệm thành công!',
        };
      }

      // 2. Fallback dự phòng
      await this.fallbackClearCloudData();
      this.notifyChange('cleared');
      return {
        success: true,
        message: 'Đã dọn sạch dữ liệu lớp thử nghiệm trên Supabase (Client Fallback)!',
      };
    } catch (err: unknown) {
      console.error('Lỗi khi xóa sạch Cloud Test Data:', err);
      const message = err instanceof Error ? err.message : 'Lỗi không xác định khi dọn dẹp';
      return { success: false, message };
    }
  },

  /**
   * Fallback dọn sạch dữ liệu trực tiếp qua Client
   */
  async fallbackClearCloudData(): Promise<void> {
    await supabase.from('point_transactions').delete().eq('class_id', CLOUD_TEST_CLASS_ID);
    await supabase.from('attendance_sessions').delete().eq('class_id', CLOUD_TEST_CLASS_ID);
    await supabase.from('students').delete().eq('class_id', CLOUD_TEST_CLASS_ID);
    await supabase.from('point_categories').delete().eq('class_id', CLOUD_TEST_CLASS_ID);
    await supabase.from('groups').delete().eq('class_id', CLOUD_TEST_CLASS_ID);
    await supabase.from('seating_presets').delete().eq('class_id', CLOUD_TEST_CLASS_ID);
  },

  /**
   * Fallback nạp lại dữ liệu mẫu trực tiếp qua Client
   */
  async fallbackResetCloudData(): Promise<void> {
    await this.fallbackClearCloudData();
    await this.ensureDemoClassExists();

    // 1. Tạo 4 tổ mẫu
    const groups = [
      { class_id: CLOUD_TEST_CLASS_ID, name: 'Tổ 1 (Thử nghiệm)', color_class: 'text-red-500', order_index: 1 },
      { class_id: CLOUD_TEST_CLASS_ID, name: 'Tổ 2 (Thử nghiệm)', color_class: 'text-green-500', order_index: 2 },
      { class_id: CLOUD_TEST_CLASS_ID, name: 'Tổ 3 (Thử nghiệm)', color_class: 'text-yellow-500', order_index: 3 },
      { class_id: CLOUD_TEST_CLASS_ID, name: 'Tổ 4 (Thử nghiệm)', color_class: 'text-blue-500', order_index: 4 },
    ];
    const { data: createdGroups } = await supabase.from('groups').insert(groups).select();

    const g1Id = createdGroups?.[0]?.id || null;
    const g2Id = createdGroups?.[1]?.id || null;

    // 2. Tạo tiêu chí điểm
    const categories = [
      { class_id: CLOUD_TEST_CLASS_ID, type: 'add', category_group: 'Học tập', title: 'Đạt điểm 10 kiểm tra', default_points: 10, default_stars: 2 },
      { class_id: CLOUD_TEST_CLASS_ID, type: 'add', category_group: 'Học tập', title: 'Hăng hái phát biểu xây dựng bài', default_points: 2, default_stars: 1 },
      { class_id: CLOUD_TEST_CLASS_ID, type: 'subtract', category_group: 'Nề nếp', title: 'Không thuộc bài cũ / thiếu bài tập', default_points: -5, default_stars: 0 },
      { class_id: CLOUD_TEST_CLASS_ID, type: 'add', category_group: 'Phong trào', title: 'Trực nhật lớp sạch sẽ', default_points: 5, default_stars: 1 },
    ];
    await supabase.from('point_categories').insert(categories);

    // 3. Tạo 4 học sinh mẫu
    const students = [
      { class_id: CLOUD_TEST_CLASS_ID, group_id: g1Id, full_name: 'Nguyễn An Bình (Mẫu Test)', gender: 'Nam', birth_date: '2015-02-14', class_role: 'Lớp trưởng', code: 'TEST01', boarding_type: 'Bán trú' },
      { class_id: CLOUD_TEST_CLASS_ID, group_id: g1Id, full_name: 'Trần Bảo Châu (Mẫu Test)', gender: 'Nữ', birth_date: '2015-05-18', class_role: 'Tổ trưởng', code: 'TEST02', boarding_type: 'Bán trú' },
      { class_id: CLOUD_TEST_CLASS_ID, group_id: g2Id, full_name: 'Lê Đăng Cường (Mẫu Test)', gender: 'Nam', birth_date: '2015-08-22', class_role: 'Thành viên', code: 'TEST03', boarding_type: 'Tự túc' },
      { class_id: CLOUD_TEST_CLASS_ID, group_id: g2Id, full_name: 'Phạm Diệu Duyên (Mẫu Test)', gender: 'Nữ', birth_date: '2015-11-09', class_role: 'Thành viên', code: 'TEST04', boarding_type: 'Bán trú' },
    ];
    await supabase.from('students').insert(students);
  },

  CLOUD_TEST_CLASS_ID,
  CLOUD_TEST_CLASS_INFO,
};
