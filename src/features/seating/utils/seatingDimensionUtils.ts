/**
 * Tiện ích quy đổi kích thước đồ dùng phòng học từ Pixel sang kích thước Mét / Centimét thực tế
 * Tỷ lệ chuẩn dựa trên phòng học chuẩn Bộ GD&ĐT Việt Nam:
 * - Bàn Giáo Viên: 384px tương ứng 1.60m (160cm) chiều dài mặt bàn.
 * - Cửa Ra Vào: 180px tương ứng 0.90m (90cm) độ rộng cánh cửa đơn tiêu chuẩn.
 * - Bàn Học Sinh đôi: 100% tỷ lệ tương ứng 1.20m (120cm) chiều dài bàn 2 chỗ.
 */

export const seatingDimensionUtils = {
  /**
   * Lấy thông tin chi tiết quy đổi Bàn Giáo Viên
   */
  getTeacherDeskInfo(widthPx: number, scalePercent: number = 100): { meters: string; cm: number; text: string } {
    const safePx = Math.max(200, Math.min(600, widthPx || 384));
    const effectivePx = safePx * ((scalePercent || 100) / 100);
    // 384px = 1.6m -> 1px = 1.6 / 384 = 0.0041667m
    const metersVal = effectivePx * (1.6 / 384);
    const meters = metersVal.toFixed(2);
    const cm = Math.round(metersVal * 100);
    return {
      meters: `${meters}m`,
      cm,
      text: `≈ ${meters}m bàn thật (${cm}cm)`,
    };
  },

  /**
   * Chuỗi định dạng Bàn Giáo Viên thân thiện hiển thị trực tiếp lên UI
   */
  formatTeacherDesk(widthPx: number, scalePercent: number = 100): string {
    return this.getTeacherDeskInfo(widthPx, scalePercent).text;
  },

  /**
   * Lấy thông tin chi tiết quy đổi Cửa Ra Vào
   */
  getDoorInfo(widthPx: number, scalePercent: number = 100): { meters: string; cm: number; text: string } {
    const safePx = Math.max(100, Math.min(400, widthPx || 180));
    const effectivePx = safePx * ((scalePercent || 100) / 100);
    // 180px = 0.9m -> 1px = 0.9 / 180 = 0.005m
    const metersVal = effectivePx * (0.9 / 180);
    const meters = metersVal.toFixed(2);
    const cm = Math.round(metersVal * 100);
    return {
      meters: `${meters}m`,
      cm,
      text: `≈ ${meters}m cửa thật (${cm}cm)`,
    };
  },

  /**
   * Chuỗi định dạng Cửa Ra Vào thân thiện hiển thị trực tiếp lên UI
   */
  formatDoor(widthPx: number, scalePercent: number = 100): string {
    return this.getDoorInfo(widthPx, scalePercent).text;
  },

  /**
   * Lấy thông tin chi tiết quy đổi Bàn Học Sinh đôi
   */
  getStudentDeskInfo(scalePercent: number = 100): { meters: string; cm: number; text: string } {
    const safeScale = Math.max(70, Math.min(140, scalePercent || 100));
    // 100% = 1.2m
    const metersVal = 1.2 * (safeScale / 100);
    const meters = metersVal.toFixed(2);
    const cm = Math.round(metersVal * 100);
    return {
      meters: `${meters}m`,
      cm,
      text: `≈ ${meters}m bàn đôi chuẩn (${cm}cm)`,
    };
  },

  /**
   * Chuỗi định dạng Bàn Học Sinh đôi thân thiện hiển thị trực tiếp lên UI
   */
  formatStudentDesk(scalePercent: number = 100): string {
    return this.getStudentDeskInfo(scalePercent).text;
  },
};
