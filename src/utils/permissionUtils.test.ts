import { describe, it, expect } from 'vitest';
import { isClassOwner, canDeleteAllStudents, canManageStudents } from './permissionUtils';
import type { UserRole } from '../types/auth';

describe('permissionUtils - Kiểm tra phân quyền vai trò', () => {
  describe('isClassOwner & canDeleteAllStudents', () => {
    it('cho phép tài khoản có vai trò Quản trị viên (admin) toàn quyền', () => {
      expect(isClassOwner({ role: 'admin' }, null)).toBe(true);
      expect(canDeleteAllStudents({ role: 'admin' }, null)).toBe(true);
      expect(canDeleteAllStudents({ role: 'admin' }, { role: 'teacher' })).toBe(true);
    });

    it('cho phép GVCN chính thức có membership role = "gvcn"', () => {
      expect(isClassOwner({ role: 'gvcn' }, { role: 'gvcn' })).toBe(true);
      expect(canDeleteAllStudents({ role: 'gvcn' }, { role: 'gvcn' })).toBe(true);
      // Giáo viên có user role là teacher nhưng được phân công làm GVCN lớp này
      expect(canDeleteAllStudents({ role: 'teacher' }, { role: 'gvcn' })).toBe(true);
    });

    it('cho phép tài khoản GVCN độc lập khi chưa có membership (Sandbox / Offline)', () => {
      expect(isClassOwner({ role: 'gvcn' }, null)).toBe(true);
      expect(canDeleteAllStudents({ role: 'gvcn' }, null)).toBe(true);
    });

    it('NGHIÊM NGẶT CHẶN: Giáo viên bộ môn (teacher) không được xóa toàn bộ học sinh', () => {
      // Khi membership là teacher
      expect(isClassOwner({ role: 'teacher' }, { role: 'teacher' })).toBe(false);
      expect(canDeleteAllStudents({ role: 'teacher' }, { role: 'teacher' })).toBe(false);

      // Khi là GVCN ở lớp khác nhưng trong lớp này là teacher
      expect(isClassOwner({ role: 'gvcn' }, { role: 'teacher' })).toBe(false);
      expect(canDeleteAllStudents({ role: 'gvcn' }, { role: 'teacher' })).toBe(false);

      // Khi chưa có membership nhưng role là teacher
      expect(isClassOwner({ role: 'teacher' }, null)).toBe(false);
      expect(canDeleteAllStudents({ role: 'teacher' }, null)).toBe(false);
    });

    it('NGHIÊM NGẶT CHẶN: Ban cán sự lớp (bancansu) không được xóa toàn bộ học sinh', () => {
      expect(isClassOwner({ role: 'bancansu' }, { role: 'bancansu' })).toBe(false);
      expect(canDeleteAllStudents({ role: 'bancansu' }, { role: 'bancansu' })).toBe(false);
      expect(canDeleteAllStudents({ role: 'bancansu' }, null)).toBe(false);
    });

    it('NGHIÊM NGẶT CHẶN: Học sinh (student), Phụ huynh (parent) và Người xem (bgh_viewer)', () => {
      const forbiddenRoles: UserRole[] = ['student', 'parent', 'bgh_viewer'];
      forbiddenRoles.forEach((role) => {
        expect(isClassOwner({ role }, { role })).toBe(false);
        expect(canDeleteAllStudents({ role }, { role })).toBe(false);
        expect(canDeleteAllStudents({ role }, null)).toBe(false);
      });
    });

    it('trả về false khi không có thông tin user', () => {
      expect(isClassOwner(null, null)).toBe(false);
      expect(canDeleteAllStudents(null, null)).toBe(false);
      expect(canDeleteAllStudents(undefined, undefined)).toBe(false);
    });
  });

  describe('canManageStudents', () => {
    it('cho phép GVCN và Admin quản lý học sinh', () => {
      expect(canManageStudents({ role: 'admin' }, null)).toBe(true);
      expect(canManageStudents({ role: 'gvcn' }, { role: 'gvcn' })).toBe(true);
    });

    it('cho phép Giáo viên bộ môn (teacher) quản lý học sinh nếu được cấp quyền', () => {
      expect(canManageStudents({ role: 'teacher' }, { role: 'teacher' })).toBe(true);
    });

    it('từ chối Ban cán sự, học sinh và phụ huynh sửa thông tin', () => {
      expect(canManageStudents({ role: 'bancansu' }, { role: 'bancansu' })).toBe(false);
      expect(canManageStudents({ role: 'student' }, { role: 'student' })).toBe(false);
      expect(canManageStudents({ role: 'parent' }, { role: 'parent' })).toBe(false);
    });
  });
});
