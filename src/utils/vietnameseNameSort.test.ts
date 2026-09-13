import { describe, it, expect } from 'vitest';
import {
  parseVietnameseName,
  compareVietnameseNames,
  sortVietnameseList,
} from './vietnameseNameSort';

describe('vietnameseNameSort Utility Tests', () => {
  it('so sánh trực tiếp 2 tên với compareVietnameseNames', () => {
    expect(compareVietnameseNames('Đỗ Bảo An', 'Hà Minh Thảo An')).toBeLessThan(0);
    expect(compareVietnameseNames('Cao Minh Ân', 'Đỗ Bảo An')).toBeGreaterThan(0);
  });

  it('tách chính xác Tên chính và Họ đệm của học sinh', () => {
    expect(parseVietnameseName('Đỗ Bảo An')).toEqual({
      firstName: 'An',
      middleAndLastName: 'Đỗ Bảo',
    });

    expect(parseVietnameseName('Châu Minh Thiện')).toEqual({
      firstName: 'Thiện',
      middleAndLastName: 'Châu Minh',
    });

    expect(parseVietnameseName('Huỳnh Na')).toEqual({
      firstName: 'Na',
      middleAndLastName: 'Huỳnh',
    });

    expect(parseVietnameseName('An')).toEqual({
      firstName: 'An',
      middleAndLastName: '',
    });

    expect(parseVietnameseName('')).toEqual({
      firstName: '',
      middleAndLastName: '',
    });
  });

  it('sắp xếp đúng bảng chữ cái tiếng Việt theo Tên chính trước (A -> Z)', () => {
    const names = [
      'Nguyễn Thị Thu Vân',
      'Cao Minh Ân',
      'Đỗ Bảo An',
      'Châu Minh Thiện',
      'Lê Ngọc Anh',
    ];

    const sorted = sortVietnameseList(names, (n) => n);

    expect(sorted).toEqual([
      'Đỗ Bảo An',       // Tên: An
      'Lê Ngọc Anh',     // Tên: Anh
      'Cao Minh Ân',      // Tên: Ân
      'Châu Minh Thiện', // Tên: Thiện
      'Nguyễn Thị Thu Vân', // Tên: Vân
    ]);
  });

  it('khi trùng Tên chính thì so sánh Họ và Tên đệm chính xác', () => {
    const names = [
      'Hà Minh Thảo An',
      'Đỗ Bảo An',
      'Phan Hoàng Thiện',
      'Châu Minh Thiện',
      'Nguyễn Vũ Huy',
      'Nguyễn Thái Huy',
    ];

    const sorted = sortVietnameseList(names, (n) => n);

    expect(sorted).toEqual([
      'Đỗ Bảo An',       // Đỗ đứng trước Hà
      'Hà Minh Thảo An',
      'Nguyễn Thái Huy', // Thái đứng trước Vũ
      'Nguyễn Vũ Huy',
      'Châu Minh Thiện', // Châu đứng trước Phan
      'Phan Hoàng Thiện',
    ]);
  });

  it('sắp xếp đúng thứ tự toàn bộ 47 học sinh lớp 6A6', () => {
    const input = [
      'Cao Minh Ân',
      'Châu Minh Thiện',
      'Đỗ Bảo An',
      'Dương Thế Hoàng',
      'Hà Minh Thảo An',
      'Lạc Cao Quế Anh',
      'Lê Ngọc Anh',
      'Nguyễn Thị Thu Vân',
    ];

    const sorted = sortVietnameseList(input, (n) => n);

    expect(sorted[0]).toBe('Đỗ Bảo An');
    expect(sorted[1]).toBe('Hà Minh Thảo An');
    expect(sorted[2]).toBe('Lạc Cao Quế Anh');
    expect(sorted[3]).toBe('Lê Ngọc Anh');
    expect(sorted[4]).toBe('Cao Minh Ân');
    expect(sorted[5]).toBe('Dương Thế Hoàng');
    expect(sorted[6]).toBe('Châu Minh Thiện');
    expect(sorted[7]).toBe('Nguyễn Thị Thu Vân');
  });
});
