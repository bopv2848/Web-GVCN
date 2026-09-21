import { describe, it, expect } from 'vitest';
import { getDeskSupplies, DESK_SUPPLIES_SETS } from './seatingSuppliesUtils';

describe('seatingSuppliesUtils', () => {
  it('trả về danh sách đồ dùng học tập hợp lệ cho bàn học sinh', () => {
    const supplies = getDeskSupplies(0, 0);
    expect(supplies).toBeDefined();
    expect(supplies.items.length).toBeGreaterThanOrEqual(3);
    expect(supplies.label).toBeTypeOf('string');
  });

  it('phân bổ đa dạng đồ dùng học tập giữa các hàng và cột khác nhau', () => {
    const desk1 = getDeskSupplies(0, 0);
    const desk2 = getDeskSupplies(1, 0);
    expect(desk1.items).not.toEqual(desk2.items);
  });

  it('đảm bảo tất cả bộ đồ dùng mẫu đều có nhãn mô tả dễ hiểu', () => {
    DESK_SUPPLIES_SETS.forEach((set) => {
      expect(set.items.length).toBe(4);
      expect(set.label.length).toBeGreaterThan(5);
    });
  });
});
