import { describe, it, expect } from 'vitest';
import { getShortRole, getGroupColorDot, getPrintRoleBadge } from './seatingRoleUtils';

describe('seatingRoleUtils', () => {
  describe('getShortRole', () => {
    it('rút gọn chính xác các chức vụ ban cán sự lớp', () => {
      expect(getShortRole('Lớp trưởng')).toBe('LT');
      expect(getShortRole('LT')).toBe('LT');
      expect(getShortRole('Lớp phó học tập')).toBe('PHT');
      expect(getShortRole('Lớp phó lao động')).toBe('PLĐ');
      expect(getShortRole('Lớp phó')).toBe('LP');
      expect(getShortRole('Cờ đỏ')).toBe('CĐ');
      expect(getShortRole('Tổ trưởng tổ 1')).toBe('TTt1');
      expect(getShortRole('Tổ trưởng tổ 2')).toBe('TTt2');
      expect(getShortRole('Tổ phó tổ 1')).toBe('TPt1');
      expect(getShortRole('Tổ phó tổ 4')).toBe('TPt4');
      expect(getShortRole('Thủ quỹ')).toBe('TQ');
      expect(getShortRole('Bí thư')).toBe('BT');
    });

    it('trả về rỗng cho học sinh thành viên bình thường', () => {
      expect(getShortRole('Học sinh')).toBe('');
      expect(getShortRole('Thành viên')).toBe('');
      expect(getShortRole('')).toBe('');
      expect(getShortRole(undefined)).toBe('');
    });
  });

  describe('getGroupColorDot', () => {
    it('trả về đúng màu sắc phân biệt cho từng Tổ', () => {
      const dot1 = getGroupColorDot('Tổ 1');
      expect(dot1.bgClass).toBe('bg-blue-500');
      expect(dot1.shortLabel).toBe('T1');

      const dot2 = getGroupColorDot('Tổ 2');
      expect(dot2.bgClass).toBe('bg-emerald-500');
      expect(dot2.shortLabel).toBe('T2');

      const dot3 = getGroupColorDot('Tổ 3');
      expect(dot3.bgClass).toBe('bg-amber-500');
      expect(dot3.shortLabel).toBe('T3');

      const dot4 = getGroupColorDot('Tổ 4');
      expect(dot4.bgClass).toBe('bg-purple-500');
      expect(dot4.shortLabel).toBe('T4');
    });
  });

  describe('getPrintRoleBadge', () => {
    it('trả về huy hiệu màu sắc rực rỡ khi ở chế độ màu', () => {
      const ltBadge = getPrintRoleBadge('Lớp trưởng', false);
      expect(ltBadge).not.toBeNull();
      expect(ltBadge?.label).toBe('LT');
      expect(ltBadge?.icon).toBe('👑');
      expect(ltBadge?.className).toContain('bg-amber-100');

      const ttBadge = getPrintRoleBadge('Tổ trưởng tổ 1', false);
      expect(ttBadge).not.toBeNull();
      expect(ttBadge?.icon).toBe('🚩');
      expect(ttBadge?.className).toContain('bg-rose-100');
    });

    it('trả về huy hiệu đen trắng tương phản cao khi ở chế độ monochrome', () => {
      const ltBadge = getPrintRoleBadge('Lớp trưởng', true);
      expect(ltBadge).not.toBeNull();
      expect(ltBadge?.label).toBe('LT');
      expect(ltBadge?.className).toContain('bg-black text-white');

      const phtBadge = getPrintRoleBadge('Lớp phó học tập', true);
      expect(phtBadge).not.toBeNull();
      expect(phtBadge?.label).toBe('PHT');
      expect(phtBadge?.className).toContain('bg-black text-white');
    });
  });
});
