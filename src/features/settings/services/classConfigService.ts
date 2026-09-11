import { supabase } from '../../../services/supabaseClient';
import type { ClassConfigFormData } from '../schemas/classConfigSchema';

export const classConfigService = {
  /**
   * Lấy cấu hình nhận diện lớp học
   */
  async getClassConfig(classId: string): Promise<ClassConfigFormData> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          name,
          grade_level,
          banner_url,
          theme_config,
          school_id,
          school:school_id (
            id,
            name,
            address,
            logo_url
          ),
          academic_year:academic_year_id (
            name
          )
        `)
        .eq('id', classId)
        .single();

      if (error || !data) {
        return {
          name: 'LỚP 6A6',
          schoolName: 'TRƯỜNG THCS TÂN HẢI',
          schoolAddress: 'Xã Tân Hải, Tỉnh Lâm Đồng',
          academicYear: '2026 - 2027',
          gradeLevel: 6,
          themeMonth: 'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG',
          themeTitle: 'CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ',
          bannerColorClass: 'from-[#1e1b4b] to-[#312e81]',
          bannerUrl: null,
          logoUrl: '/logo-truong-thcs-Tan-Hai.jpg',
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = data as any;
      const theme = c.theme_config || {};

      return {
        name: c.name || 'LỚP 6A6',
        schoolName: c.school?.name || 'TRƯỜNG THCS TÂN HẢI',
        schoolAddress: c.school?.address || 'Xã Tân Hải, Tỉnh Lâm Đồng',
        academicYear: c.academic_year?.name || '2026 - 2027',
        gradeLevel: c.grade_level || 6,
        themeMonth: theme.month || 'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG',
        themeTitle: theme.title || 'CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ',
        bannerColorClass: theme.bannerColorClass || 'from-[#1e1b4b] to-[#312e81]',
        bannerUrl: c.banner_url || null,
        logoUrl: c.school?.logo_url || '/logo-truong-thcs-Tan-Hai.jpg',
      };
    } catch (err) {
      console.warn('Lỗi lấy cấu hình lớp:', err);
      return {
        name: 'LỚP 6A6',
        schoolName: 'TRƯỜNG THCS TÂN HẢI',
        schoolAddress: 'Xã Tân Hải, Tỉnh Lâm Đồng',
        academicYear: '2026 - 2027',
        gradeLevel: 6,
        themeMonth: 'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG',
        themeTitle: 'CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ',
        bannerColorClass: 'from-[#1e1b4b] to-[#312e81]',
        bannerUrl: null,
        logoUrl: '/logo-truong-thcs-Tan-Hai.jpg',
      };
    }
  },

  /**
   * Cập nhật cấu hình nhận diện lớp và lưu bản sao lưu trước đó
   */
  async updateClassConfig(classId: string, formData: ClassConfigFormData) {
    // 1. Lưu bản sao lưu trước đó vào localStorage
    const current = await this.getClassConfig(classId);
    localStorage.setItem(`class_config_backup_${classId}`, JSON.stringify(current));

    // 2. Cập nhật vào Database bảng classes
    const { data, error } = await supabase
      .from('classes')
      .update({
        name: formData.name.trim(),
        grade_level: formData.gradeLevel,
        banner_url: formData.bannerUrl || null,
        theme_config: {
          month: formData.themeMonth.trim(),
          title: formData.themeTitle.trim(),
          bannerColorClass: formData.bannerColorClass,
        },
      })
      .eq('id', classId)
      .select()
      .single();

    if (error) throw error;

    // 3. Cập nhật bảng schools (Tên trường, Logo trường, Địa chỉ)
    try {
      const { data: cls } = await supabase
        .from('classes')
        .select('school_id')
        .eq('id', classId)
        .single();

      if (cls?.school_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schoolUpdates: Record<string, any> = {
          name: formData.schoolName.trim(),
        };
        if (formData.logoUrl !== undefined) {
          schoolUpdates.logo_url = formData.logoUrl || null;
        }
        if (formData.schoolAddress !== undefined) {
          schoolUpdates.address = formData.schoolAddress?.trim() || null;
        }

        await supabase
          .from('schools')
          .update(schoolUpdates)
          .eq('id', cls.school_id);
      }
    } catch (schoolErr) {
      console.warn('Lỗi cập nhật bảng schools:', schoolErr);
    }

    return data;
  },

  /**
   * Lấy cấu hình trước đó để khôi phục (Restore)
   */
  getPreviousConfigBackup(classId: string): ClassConfigFormData | null {
    const raw = localStorage.getItem(`class_config_backup_${classId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ClassConfigFormData;
    } catch {
      return null;
    }
  },
};
