import { describe, it, expect, beforeEach } from 'vitest';
import { parentPortalService } from './parentPortalService';

describe('parentPortalService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Rate Limiting (Chống Brute-force mã PIN)', () => {
    it('khởi đầu chưa bị khóa khi chưa có lần thử sai nào', () => {
      const status = parentPortalService.checkRateLimit();
      expect(status.isLocked).toBe(false);
      expect(status.remainingMinutes).toBe(0);
    });

    it('cho phép thử sai dưới 5 lần mà không khóa hệ thống', () => {
      for (let i = 1; i <= 4; i++) {
        const res = parentPortalService.recordFailedAttempt();
        expect(res.isLocked).toBe(false);
      }
      const status = parentPortalService.checkRateLimit();
      expect(status.isLocked).toBe(false);
    });

    it('tự động khóa 15 phút khi thử sai đủ 5 lần liên tiếp', () => {
      let lastRes = { isLocked: false, remainingMinutes: 0 };
      for (let i = 1; i <= 5; i++) {
        lastRes = parentPortalService.recordFailedAttempt();
      }

      expect(lastRes.isLocked).toBe(true);
      expect(lastRes.remainingMinutes).toBe(15);

      const check = parentPortalService.checkRateLimit();
      expect(check.isLocked).toBe(true);
      expect(check.remainingMinutes).toBeGreaterThanOrEqual(14);
    });

    it('xóa sạch trạng thái khóa và số lần thử sai khi gọi resetFailedAttempts', () => {
      for (let i = 1; i <= 5; i++) {
        parentPortalService.recordFailedAttempt();
      }
      expect(parentPortalService.checkRateLimit().isLocked).toBe(true);

      parentPortalService.resetFailedAttempts();
      expect(parentPortalService.checkRateLimit().isLocked).toBe(false);
      expect(localStorage.getItem('parent_lookup_attempts')).toBeNull();
      expect(localStorage.getItem('parent_lookup_lock_until')).toBeNull();
    });
  });

  describe('Validation logic tra cứu', () => {
    it('báo lỗi khi chuỗi token rỗng hoặc ngắn hơn 4 ký tự', async () => {
      const resEmpty = await parentPortalService.lookupByToken('');
      expect(resEmpty.success).toBe(false);
      expect(resEmpty.error).toContain('không đúng định dạng');

      const resShort = await parentPortalService.lookupByToken('abc');
      expect(resShort.success).toBe(false);
      expect(resShort.error).toContain('không đúng định dạng');
    });

    it('báo lỗi yêu cầu nhập mã học sinh và mã PIN khi để trống', async () => {
      const resNoCode = await parentPortalService.lookupByCodeAndPin('', '1234');
      expect(resNoCode.success).toBe(false);
      expect(resNoCode.error).toContain('mã học sinh');

      const resNoPin = await parentPortalService.lookupByCodeAndPin('6A601', '');
      expect(resNoPin.success).toBe(false);
      expect(resNoPin.error).toContain('mã PIN');
    });

    it('từ chối tra cứu ngay lập tức nếu IP/máy đang trong thời gian khóa', async () => {
      // Giả lập khóa
      for (let i = 1; i <= 5; i++) {
        parentPortalService.recordFailedAttempt();
      }

      const res = await parentPortalService.lookupByCodeAndPin('6A601', '1234');
      expect(res.success).toBe(false);
      expect(res.error).toContain('thử sai quá 5 lần');
    });
  });

  describe('Bảo mật tên & Bảng Vinh Danh Top 5', () => {
    it('che giấu họ tên học sinh chuẩn mực để bảo vệ quyền riêng tư', () => {
      expect(parentPortalService.maskStudentName('Nguyễn Văn An')).toBe('Nguyễn V. A.');
      expect(parentPortalService.maskStudentName('Trần Thị Mai Phương')).toBe('Trần T. M. P.');
      expect(parentPortalService.maskStudentName('Lê Cường')).toBe('Lê C.');
      expect(parentPortalService.maskStudentName('Bình')).toBe('Bình');
      expect(parentPortalService.maskStudentName('')).toBe('Học sinh');
    });

    it('trả về danh sách fallback Top 5 tương ứng từng khung thời gian tuần, tháng, học kỳ', () => {
      const fallbackWeek = parentPortalService.getFallbackLeaderboard('week');
      const fallbackMonth = parentPortalService.getFallbackLeaderboard('month');
      const fallbackSemester = parentPortalService.getFallbackLeaderboard('semester');

      expect(fallbackWeek).toHaveLength(5);
      expect(fallbackMonth).toHaveLength(5);
      expect(fallbackSemester).toHaveLength(5);

      // Điểm và sao cả kỳ phải lớn hơn cả tháng, cả tháng lớn hơn tuần
      expect(fallbackSemester[0].totalStars).toBeGreaterThan(fallbackMonth[0].totalStars);
      expect(fallbackMonth[0].totalStars).toBeGreaterThan(fallbackWeek[0].totalStars);

      expect(fallbackWeek[0].badgeTitle).toContain('Quán Quân');
      expect(fallbackWeek.every((item) => item.maskedName.includes('.'))).toBe(true);
    });

    it('tự động gọi và trả về Top 5 danh sách vinh danh theo các mốc thời gian', async () => {
      const leaderboardWeek = await parentPortalService.getTopStarsLeaderboard(undefined, 'week');
      expect(leaderboardWeek.length).toBeGreaterThanOrEqual(1);
      expect(leaderboardWeek.length).toBeLessThanOrEqual(5);
      expect(leaderboardWeek[0].rank).toBe(1);

      const leaderboardMonth = await parentPortalService.getTopStarsLeaderboard(undefined, 'month');
      expect(leaderboardMonth.length).toBeGreaterThanOrEqual(1);

      const leaderboardSemester = await parentPortalService.getTopStarsLeaderboard(undefined, 'semester');
      expect(leaderboardSemester.length).toBeGreaterThanOrEqual(1);
    });
  });
});
