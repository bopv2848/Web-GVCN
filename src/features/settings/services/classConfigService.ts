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
          school:school_id (
            name,
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
          name: 'LỚP 12A1',
          schoolName: 'THPT THANH XUÂN',
          academicYear: '2026 - 2027',
          gradeLevel: 12,
          themeMonth: 'CHỦ ĐIỂM THÁNG 9: MÁI TRƯỜNG MẾN YÊU',
          themeTitle: 'CHUYẾN TÀU THANH XUÂN 12A1',
          bannerColorClass: 'from-[#1e1b4b] to-[#312e81]',
          bannerUrl: null,
          logoUrl: null,
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = data as any;
      const theme = c.theme_config || {};

      return {
        name: c.name || 'LỚP 12A1',
        schoolName: c.school?.name || 'THPT THANH XUÂN',
        academicYear: c.academic_year?.name || '2026 - 2027',
        gradeLevel: c.grade_level || 12,
        themeMonth: theme.month || 'CHỦ ĐIỂM THÁNG 9',
        themeTitle: theme.title || 'CHUYẾN TÀU THANH XUÂN',
        bannerColorClass: theme.bannerColorClass || 'from-[#1e1b4b] to-[#312e81]',
        bannerUrl: c.banner_url || null,
        logoUrl: c.school?.logo_url || null,
      };
    } catch (err) {
      console.warn('Lỗi lấy cấu hình lớp:', err);
      return {
        name: 'LỚP 12A1',
        schoolName: 'THPT THANH XUÂN',
        academicYear: '2026 - 2027',
        gradeLevel: 12,
        themeMonth: 'CHỦ ĐIỂM THÁNG 9: MÁI TRƯỜNG MẾN YÊU',
        themeTitle: 'CHUYẾN TÀU THANH XUÂN 12A1',
        bannerColorClass: 'from-[#1e1b4b] to-[#312e81]',
        bannerUrl: null,
        logoUrl: null,
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

    // 2. Cập nhật vào Database
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
