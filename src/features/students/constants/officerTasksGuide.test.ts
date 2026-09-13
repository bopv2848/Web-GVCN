import { describe, it, expect } from 'vitest';
import { getOfficerTaskGuide } from './officerTasksGuide';

describe('officerTasksGuide Unit Tests', () => {
  it('trả về đúng thông tin nhiệm vụ cho Lớp trưởng', () => {
    const guide = getOfficerTaskGuide('Lớp trưởng', 'Phan Minh Khang');
    expect(guide.icon).toBe('👑');
    expect(guide.roleTitle).toContain('Phan Minh Khang');
    expect(guide.weeklyFocus).toContain('15 phút đầu giờ');
    expect(guide.coreTasks.length).toBeGreaterThanOrEqual(4);
    expect(guide.handlingTip).toContain('Tuyệt đối không đôi co');
  });

  it('trả về đúng thông tin nhiệm vụ cho Lớp phó học tập', () => {
    const guide = getOfficerTaskGuide('Phó học tập', 'Trần Bảo An');
    expect(guide.icon).toBe('📘');
    expect(guide.weeklyFocus).toContain('Toán và Văn');
    expect(guide.motto).toContain('Bạn giúp bạn');
  });

  it('trả về đúng thông tin nhiệm vụ cho Lớp phó lao động', () => {
    const guide = getOfficerTaskGuide('Lớp phó lao động', 'Lê Hữu Đạt');
    expect(guide.icon).toBe('🧹');
    expect(guide.weeklyFocus).toContain('trực nhật');
    expect(guide.motto).toContain('Sạch – Gọn – Đẹp');
  });

  it('trả về đúng thông tin nhiệm vụ cho Tổ trưởng', () => {
    const guide = getOfficerTaskGuide('Tổ trưởng tổ 1', 'Nguyễn Gia Hân');
    expect(guide.icon).toBe('🚩');
    expect(guide.weeklyFocus).toContain('phát biểu');
  });

  it('trả về đúng thông tin nhiệm vụ cho Tổ phó', () => {
    const guide = getOfficerTaskGuide('Tổ phó tổ 2', 'Vũ Tuấn Kiệt');
    expect(guide.icon).toBe('🌱');
    expect(guide.coreTasks.length).toBeGreaterThanOrEqual(4);
  });

  it('trả về đúng thông tin cho học sinh Thành viên thông thường', () => {
    const guide = getOfficerTaskGuide('Thành viên', 'Bùi Quỳnh Chi');
    expect(guide.icon).toBe('🎒');
    expect(guide.weeklyFocus).toContain('hoa điểm tốt');
  });
});
