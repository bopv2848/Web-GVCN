/**
 * Tiện ích tính toán tự động bù trừ kích thước chữ theo mức Thu Phóng (Zoom Compensation).
 *
 * Yêu cầu nghiệp vụ:
 * - Khi thu nhỏ mức zoom sâu (dưới 60%), hệ thống tự động nhân thêm hệ số bù
 *   kích cỡ font chữ để tên học sinh không bao giờ bị bé hơn 18px trên màn hình vật lý.
 * - Công thức quy đổi:
 *   physicalFontSize = internalFontSize * (zoomLevel / 100)
 *   => internalFontSize = targetPhysicalFontSize / (zoomLevel / 100)
 */

export interface CompensatedNameSizes {
  firstLinePx: number;
  secondLinePx: number;
  singleLinePx: number;
  isDeepZoom: boolean;
}

export function computeCompensatedNameSizes(
  zoomLevel: number | undefined,
  isLargeText: boolean,
  isLongName: boolean,
  isVeryLongName: boolean
): CompensatedNameSizes {
  const effectiveZoom = zoomLevel && zoomLevel > 0 ? zoomLevel : 100;
  const zoomScale = effectiveZoom / 100;
  const isDeepZoom = effectiveZoom < 60;

  if (isDeepZoom) {
    // Thu nhỏ mức zoom sâu (< 60%): Kích hoạt Zoom Compensation
    // Đảm bảo tên học sinh luôn hiển thị >= 18px vật lý trên màn hình máy chiếu/TV
    let targetPhysicalSecondPx = 18;
    let targetPhysicalFirstPx = 11;

    if (isLargeText) {
      // Chế độ Chữ Siêu To khi zoom sâu: Tăng độ nổi bật vượt trội
      if (isVeryLongName) {
        targetPhysicalSecondPx = 18.5;
        targetPhysicalFirstPx = 11.5;
      } else if (isLongName) {
        targetPhysicalSecondPx = 20;
        targetPhysicalFirstPx = 12.5;
      } else {
        targetPhysicalSecondPx = 22;
        targetPhysicalFirstPx = 13.5;
      }
    } else {
      // Chế độ Chuẩn khi zoom sâu: Tối thiểu 18px vật lý cho tên học sinh
      if (isVeryLongName) {
        targetPhysicalSecondPx = 17.5;
        targetPhysicalFirstPx = 10.5;
      } else if (isLongName) {
        targetPhysicalSecondPx = 18;
        targetPhysicalFirstPx = 11;
      } else {
        targetPhysicalSecondPx = 18.5;
        targetPhysicalFirstPx = 11.5;
      }
    }

    return {
      firstLinePx: Math.round(targetPhysicalFirstPx / zoomScale),
      secondLinePx: Math.round(targetPhysicalSecondPx / zoomScale),
      singleLinePx: Math.round(targetPhysicalSecondPx / zoomScale),
      isDeepZoom: true,
    };
  }

  // Khi mức zoom bình thường (>= 60%):
  if (isLargeText) {
    // Chế độ Chữ Siêu To: Bù nhẹ khi zoom trong khoảng 60% - 85%
    const scaleFactor = Math.min(1, zoomScale);
    if (isVeryLongName) {
      return {
        firstLinePx: Math.round(12 / scaleFactor),
        secondLinePx: Math.round(19 / scaleFactor),
        singleLinePx: Math.round(20 / scaleFactor),
        isDeepZoom: false,
      };
    } else if (isLongName) {
      return {
        firstLinePx: Math.round(13 / scaleFactor),
        secondLinePx: Math.round(22 / scaleFactor),
        singleLinePx: Math.round(23 / scaleFactor),
        isDeepZoom: false,
      };
    } else {
      return {
        firstLinePx: Math.round(14 / scaleFactor),
        secondLinePx: Math.round(26 / scaleFactor),
        singleLinePx: Math.round(25 / scaleFactor),
        isDeepZoom: false,
      };
    }
  }

  // Chế độ Chuẩn (xem bình thường cự ly gần)
  if (isVeryLongName) {
    return { firstLinePx: 10, secondLinePx: 13, singleLinePx: 13, isDeepZoom: false };
  } else if (isLongName) {
    return { firstLinePx: 11, secondLinePx: 14, singleLinePx: 14, isDeepZoom: false };
  } else {
    return { firstLinePx: 11.5, secondLinePx: 15, singleLinePx: 15, isDeepZoom: false };
  }
}
