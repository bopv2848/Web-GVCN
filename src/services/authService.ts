import { supabase } from './supabaseClient';
import type { UserProfile, UserRole, ClassInfo } from '../types/auth';

export interface ClassMembershipData {
  classId: string;
  role: UserRole;
  permissions: Record<string, boolean>;
  classInfo: ClassInfo;
}

export interface VerifyTokenResult {
  isValid: boolean;
  studentId?: string;
  studentName?: string;
  className?: string;
  relationship?: string;
  isExpired?: boolean;
  error?: string;
}

export const authService = {
  /**
   * Đăng nhập người dùng bằng Email và Mật khẩu qua Supabase Auth
   */
  async signIn(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Đăng xuất khỏi hệ thống và xóa session token
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Yêu cầu gửi email khôi phục mật khẩu
   */
  async resetPasswordForEmail(email: string) {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Cập nhật mật khẩu mới cho người dùng sau khi xác thực qua link reset
   */
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Lấy hồ sơ người dùng từ bảng `profiles` trong cơ sở dữ liệu
   */
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url, system_role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      role: data.system_role as UserRole,
    };
  },

  /**
   * Lấy phân công lớp và vai trò thực tế của người dùng từ bảng `class_memberships`
   */
  async fetchClassMembership(userId: string): Promise<ClassMembershipData | null> {
    const { data, error } = await supabase
      .from('class_memberships')
      .select(`
        class_id,
        role,
        permissions,
        classes:class_id (
          id,
          name,
          grade_level,
          theme_config,
          school:school_id (
            name
          ),
          academic_year:academic_year_id (
            name
          )
        )
      `)
      .eq('profile_id', userId)
      .limit(1)
      .single();

    if (error || !data || !data.classes) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = data.classes as any;
    const theme = c.theme_config || {};

    return {
      classId: data.class_id,
      role: data.role as UserRole,
      permissions: (data.permissions as Record<string, boolean>) || {},
      classInfo: {
        id: c.id,
        name: c.name || 'LỚP',
        gradeLevel: c.grade_level || 12,
        schoolName: c.school?.name || 'TRƯỜNG HỌC',
        academicYear: c.academic_year?.name || '2026 - 2027',
        themeTitle: theme.title || 'CHUYẾN TÀU THANH XUÂN',
        themeMonth: theme.month || 'CHỦ ĐIỂM THÁNG',
      },
    };
  },

  /**
   * Kiểm tra tính hợp lệ của mã Token mời phụ huynh
   */
  async verifyInviteToken(token: string): Promise<VerifyTokenResult> {
    if (!token || token.trim().length < 8) {
      return { isValid: false, error: 'Mã liên kết không đúng định dạng.' };
    }

    const { data, error } = await supabase
      .from('student_guardians')
      .select(`
        id,
        relationship,
        status,
        token_expires_at,
        student:student_id (
          id,
          full_name,
          class:class_id (
            name
          )
        )
      `)
      .eq('invite_token', token.trim())
      .single();

    if (error || !data) {
      return { isValid: false, error: 'Mã mời không tồn tại hoặc đã được sử dụng.' };
    }

    if (data.status === 'revoked') {
      return { isValid: false, error: 'Mã mời này đã bị thu hồi bởi Giáo viên.' };
    }

    const isExpired = new Date(data.token_expires_at).getTime() < Date.now();
    if (isExpired) {
      return { isValid: false, isExpired: true, error: 'Mã mời này đã hết hạn hiệu lực (quá 7 ngày).' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const st = data.student as any;

    return {
      isValid: true,
      studentId: st?.id,
      studentName: st?.full_name,
      className: st?.class?.name,
      relationship: data.relationship,
    };
  },

  /**
   * Kích hoạt liên kết Phụ huynh - Học sinh sau khi đăng nhập
   */
  async claimInviteToken(token: string, guardianProfileId: string) {
    const { data, error } = await supabase
      .from('student_guardians')
      .update({
        guardian_profile_id: guardianProfileId,
        status: 'active',
      })
      .eq('invite_token', token.trim())
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
