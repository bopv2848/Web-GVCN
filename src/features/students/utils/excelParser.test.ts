import { describe, it, expect } from 'vitest';
import { normalizeBirthDate } from './excelParser';

describe('normalizeBirthDate Unit Tests', () => {
  it('chuẩn hóa định dạng chuẩn Việt Nam có dấu gạch chéo DD/MM/YYYY (15/07/2015)', () => {
    expect(normalizeBirthDate('15/07/2015')).toBe('2015-07-15');
  });

  it('chuẩn hóa ngày và tháng một chữ số (5/7/2015)', () => {
    expect(normalizeBirthDate('5/7/2015')).toBe('2015-07-05');
  });

  it('chuẩn hóa định dạng có dấu gạch ngang DD-MM-YYYY (15-07-2015)', () => {
    expect(normalizeBirthDate('15-07-2015')).toBe('2015-07-15');
    expect(normalizeBirthDate('5-7-2015')).toBe('2015-07-05');
  });

  it('chuẩn hóa định dạng có dấu chấm DD.MM.YYYY (15.07.2015)', () => {
    expect(normalizeBirthDate('15.07.2015')).toBe('2015-07-15');
    expect(normalizeBirthDate('5.7.2015')).toBe('2015-07-05');
  });

  it('chuẩn hóa trường hợp giáo viên chỉ nhập năm sinh (2015 hoặc "2015")', () => {
    expect(normalizeBirthDate('2015')).toBe('2015-01-01');
    expect(normalizeBirthDate(2015)).toBe('2015-01-01');
    expect(normalizeBirthDate('2010')).toBe('2010-01-01');
  });

  it('chuẩn hóa trường hợp nhập Tháng/Năm (07/2015 hoặc 7-2015)', () => {
    expect(normalizeBirthDate('07/2015')).toBe('2015-07-01');
    expect(normalizeBirthDate('7-2015')).toBe('2015-07-01');
  });

  it('giữ nguyên và chuẩn hóa định dạng ISO đã có sẵn (2015-07-15)', () => {
    expect(normalizeBirthDate('2015-07-15')).toBe('2015-07-15');
  });

  it('tự động loại bỏ khoảng trắng thừa quanh ngày tháng (" 15 / 07 / 2015 ")', () => {
    expect(normalizeBirthDate('  15 / 07 / 2015  ')).toBe('2015-07-15');
    expect(normalizeBirthDate('  5 - 7 - 2015  ')).toBe('2015-07-05');
  });

  it('hỗ trợ xử lý số serial date của Excel khi có hàm SSF', () => {
    const mockSSF = {
      parse_date_code: (val: number) => {
        if (val === 42184) return { y: 2015, m: 6, d: 29 };
        return { y: 2015, m: 1, d: 1 };
      },
    };
    expect(normalizeBirthDate(42184, mockSSF)).toBe('2015-06-29');
  });

  it('hỗ trợ kiểu dữ liệu JS Date object', () => {
    const dateObj = new Date(2015, 6, 15); // Tháng 7 là index 6
    expect(normalizeBirthDate(dateObj)).toBe('2015-07-15');
  });

  it('trả về chuỗi rỗng an toàn khi dữ liệu rỗng, null hoặc undefined', () => {
    expect(normalizeBirthDate('')).toBe('');
    expect(normalizeBirthDate(null)).toBe('');
    expect(normalizeBirthDate(undefined)).toBe('');
  });
});
