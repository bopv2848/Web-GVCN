import type { UserRole } from '../types/auth';

/**
 * Kiểu dữ liệu tối giản để kiểm tra quyền hạn của người dùng trong hệ thống và lớp học
 */
export interface UserRoleContext {
  role?: UserRole;
}

export interface MembershipRoleContext {
  role?: UserRole;
}

/**
 * Kiểm tra xem người dùng có phải là Chủ nhiệm chính thức của lớp học (Class Owner) hoặc Quản trị viên (Admin) hay không.
 *
 * Nguyên tắc phân quyền:
 * 1. Nếu là Admin (`user.role === 'admin'`): Toàn quyền quản trị hệ thống -> true.
 * 2. Nếu có bản ghi phân công lớp học (`membership`):
 *    - Chỉ khi `membership.role === 'gvcn'` mới là GVCN chính thức của lớp này -> true.
 *    - Nếu `membership.role` là 'teacher' (Giáo viên bộ môn), 'bancansu' (Cán sự lớp), 'bgh_viewer', 'student', 'parent' -> false.
 * 3. Nếu chưa có bản ghi `membership` (ví dụ: chế độ Offline/Sandbox/khởi tạo ban đầu):
 *    - Chỉ tài khoản có `user.role === 'gvcn'` mới có quyền -> true.
 *    - Tài khoản 'teacher', 'bancansu', 'student', 'parent'... -> false.
 */
export const isClassOwner = (
  user?: UserRoleContext | null,
  membership?: MembershipRoleContext | null
): boolean => {
  if (!user || !user.role) return false;

  // 1. Quản trị viên tối cao luôn có quyền
  if (user.role === 'admin') return true;

  // 2. Nếu có bản ghi phân công trong lớp cụ thể (Class Membership)
  if (membership && membership.role) {
    return membership.role === 'gvcn';
  }

  // 3. Dự phòng khi chưa có membership (Sandbox / tài khoản cá nhân độc lập)
  return user.role === 'gvcn';
};

/**
 * Quyền xóa sạch toàn bộ học sinh của lớp học (Hành động rủi ro cao).
 * CHỈ duy nhất GVCN chính thức của lớp hoặc Quản trị viên mới được phép thực hiện.
 * Giáo viên bộ môn (teacher), cán sự lớp (bancansu), người xem (viewer) tuyệt đối không có quyền này.
 */
export const canDeleteAllStudents = (
  user?: UserRoleContext | null,
  membership?: MembershipRoleContext | null
): boolean => {
  return isClassOwner(user, membership);
};

/**
 * Quyền quản lý học sinh thông thường (thêm, sửa thông tin, phân tổ).
 * Cho phép GVCN, Admin và Giáo viên bộ môn (nếu được trao quyền).
 */
export const canManageStudents = (
  user?: UserRoleContext | null,
  membership?: MembershipRoleContext | null
): boolean => {
  if (!user || !user.role) return false;
  if (user.role === 'admin') return true;
  if (membership && membership.role) {
    return membership.role === 'gvcn' || membership.role === 'teacher';
  }
  return user.role === 'gvcn' || user.role === 'teacher';
};
