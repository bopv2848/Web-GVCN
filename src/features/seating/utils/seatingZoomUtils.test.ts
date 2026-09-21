import { describe, it, expect } from 'vitest';
import { computeCompensatedNameSizes } from './seatingZoomUtils';

describe('seatingZoomUtils - computeCompensatedNameSizes', () => {
  it('tự động bù trừ kích cỡ chữ khi zoom sâu < 60% sao cho kích thước vật lý >= 18px', () => {
    // Thử nghiệm tại mức zoom 50% (0.5)
    const res50 = computeCompensatedNameSizes(50, false, false, false);
    expect(res50.isDeepZoom).toBe(true);

    // Kích thước vật lý trên màn hình: secondLinePx * (50 / 100)
    const physicalPx50 = res50.secondLinePx * 0.5;
    expect(physicalPx50).toBeGreaterThanOrEqual(18);

    // Thử nghiệm tại mức zoom 40% (0.4)
    const res40 = computeCompensatedNameSizes(40, false, false, false);
    expect(res40.isDeepZoom).toBe(true);
    const physicalPx40 = res40.secondLinePx * 0.4;
    expect(physicalPx40).toBeGreaterThanOrEqual(18);
  });

  it('tăng cường kích thước vượt trội khi bật Chữ Siêu To ở mức zoom sâu 50%', () => {
    const resLarge50 = computeCompensatedNameSizes(50, true, false, false);
    expect(resLarge50.isDeepZoom).toBe(true);

    const physicalPx = resLarge50.secondLinePx * 0.5;
    // Khi bật Chữ Siêu To, độ lớn vật lý đạt >= 21px
    expect(physicalPx).toBeGreaterThanOrEqual(21);
  });

  it('không kích hoạt isDeepZoom khi mức zoom >= 60%', () => {
    const res70 = computeCompensatedNameSizes(70, false, false, false);
    expect(res70.isDeepZoom).toBe(false);

    const res100 = computeCompensatedNameSizes(100, false, false, false);
    expect(res100.isDeepZoom).toBe(false);
    expect(res100.secondLinePx).toBe(15);
  });
});
