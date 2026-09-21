import { describe, it, expect } from 'vitest';
import { formatStudentPrintName, getStudentPrintFontSize, splitStudentName } from './seatingPrintNameUtils';

describe('seatingPrintNameUtils', () => {
  describe('formatStudentPrintName', () => {
    it('trả về chuỗi rỗng nếu fullName rỗng', () => {
      expect(formatStudentPrintName('')).toBe('');
    });

    it('giữ nguyên định dạng gốc khi nameCase là default', () => {
      expect(formatStudentPrintName('Nguyễn Hoàng Anh Tuấn', 'default')).toBe('Nguyễn Hoàng Anh Tuấn');
    });

    it('chuyển toàn bộ họ tên thành chữ in hoa chuẩn Tiếng Việt khi nameCase là uppercase', () => {
      expect(formatStudentPrintName('Nguyễn Hoàng Anh Tuấn', 'uppercase')).toBe('NGUYỄN HOÀNG ANH TUẤN');
      expect(formatStudentPrintName('Đỗ Đức Đạt', 'uppercase')).toBe('ĐỖ ĐỨC ĐẠT');
    });
  });

  describe('getStudentPrintFontSize', () => {
    it('giữ nguyên cỡ chữ cơ sở cho tên học sinh 2 từ ngắn và tên thông thường 3-4 từ', () => {
      // 2 từ ngắn
      expect(getStudentPrintFontSize('Huỳnh Na', 14, true)).toBe(14);
      expect(getStudentPrintFontSize('Lê An', 14, true)).toBe(14);
      // 3 từ
      expect(getStudentPrintFontSize('Nguyễn Văn An', 14, true)).toBe(14);
      // 4 từ
      expect(getStudentPrintFontSize('Nguyễn Hoàng Anh Tuấn', 14, true)).toBe(14);
      expect(getStudentPrintFontSize('Trương Khải Hoàn', 13, true)).toBe(13);
      expect(getStudentPrintFontSize('Lê Bảo An', 12, true)).toBe(12);
    });

    it('tự động co nhỏ cỡ chữ an toàn cho ngoại lệ tên 2 từ dài đặc biệt nếu vượt quá 100px', () => {
      // Nguyễn Phương (13 ký tự, ~92.8px): cỡ chữ 14pt vẫn vừa vặn trong ngưỡng an toàn 100px
      expect(getStudentPrintFontSize('Nguyễn Phương', 14, true)).toBe(14);
      expect(getStudentPrintFontSize('Trương Hoàng', 14, true)).toBe(14);

      // Tên 2 từ dài 15 ký tự (107.1px ở 14pt > 100px): tự động co 1 cỡ xuống 13pt (~99.5px <= 100px)
      expect(getStudentPrintFontSize('Nguyễn PhươngAn', 14, true)).toBe(13);

      // Tên 2 từ dài 16 ký tự (> 100px ở cả 14pt và 13pt): tự động co xuống 12pt (~97.9px <= 100px)
      expect(getStudentPrintFontSize('Nguyễn PhươngAnh', 14, true)).toBe(12);

      // Tên 3 từ (xuống 2 dòng) thì dòng dài nhất chỉ 11-12 ký tự, không bị co
      expect(getStudentPrintFontSize('Nguyễn Phương Uyên', 14, true)).toBe(14);
    });

    it('tự động co nhỏ 1 cỡ chữ cho tên học sinh dài quá 4 từ (từ 5 từ trở lên)', () => {
      // 5 từ
      expect(getStudentPrintFontSize('Nguyễn Thị Ngọc Ánh Tuyết', 14, true)).toBe(13);
      // 6 từ
      expect(getStudentPrintFontSize('Công Tằng Tôn Nữ Bích Ngọc', 14, true)).toBe(13);
      // Khi cỡ cơ sở là 13pt
      expect(getStudentPrintFontSize('Nguyễn Thị Ngọc Ánh Tuyết', 13, true)).toBe(12);
      // Khi cỡ cơ sở là 12pt
      expect(getStudentPrintFontSize('Nguyễn Thị Ngọc Ánh Tuyết', 12, true)).toBe(11);
    });

    it('không co chữ nếu tùy chọn autoFit là false', () => {
      expect(getStudentPrintFontSize('Công Tằng Tôn Nữ Bích Ngọc', 14, false)).toBe(14);
      expect(getStudentPrintFontSize('Nguyễn Phương', 14, false)).toBe(14);
    });
  });

  describe('splitStudentName', () => {
    it('trả về rỗng nếu fullName rỗng', () => {
      const res = splitStudentName('');
      expect(res.firstLine).toBe('');
      expect(res.secondLine).toBe('');
      expect(res.hasSplit).toBe(false);
    });

    it('xử lý chính xác tên 3 từ: Chữ lót liền kề + Tên học sinh xuống hàng 2', () => {
      // Nguyễn Thái Huy -> Line 1: Nguyễn, Line 2: Thái Huy
      const huy = splitStudentName('Nguyễn Thái Huy');
      expect(huy.firstLine).toBe('Nguyễn');
      expect(huy.secondLine).toBe('Thái Huy');
      expect(huy.hasSplit).toBe(true);

      // Dương Thế Hoàng -> Line 1: Dương, Line 2: Thế Hoàng
      const hoang = splitStudentName('Dương Thế Hoàng');
      expect(hoang.firstLine).toBe('Dương');
      expect(hoang.secondLine).toBe('Thế Hoàng');

      // Thạch Minh Luân -> Line 1: Thạch, Line 2: Minh Luân
      const luan = splitStudentName('Thạch Minh Luân');
      expect(luan.firstLine).toBe('Thạch');
      expect(luan.secondLine).toBe('Minh Luân');

      // Trương Khả Hân -> Line 1: Trương, Line 2: Khả Hân
      const han = splitStudentName('Trương Khả Hân');
      expect(han.firstLine).toBe('Trương');
      expect(han.secondLine).toBe('Khả Hân');

      // Lâm Hoàng Khang -> Line 1: Lâm, Line 2: Hoàng Khang
      const khang = splitStudentName('Lâm Hoàng Khang');
      expect(khang.firstLine).toBe('Lâm');
      expect(khang.secondLine).toBe('Hoàng Khang');
    });

    it('xử lý chính xác tên 4 từ: Chữ lót liền kề + Tên học sinh xuống hàng 2', () => {
      // Lục Cao Quế Anh -> Line 1: Lục Cao, Line 2: Quế Anh
      const queAnh = splitStudentName('Lục Cao Quế Anh');
      expect(queAnh.firstLine).toBe('Lục Cao');
      expect(queAnh.secondLine).toBe('Quế Anh');

      // Hà Minh Thảo An -> Line 1: Hà Minh, Line 2: Thảo An
      const thaoAn = splitStudentName('Hà Minh Thảo An');
      expect(thaoAn.firstLine).toBe('Hà Minh');
      expect(thaoAn.secondLine).toBe('Thảo An');

      // Nguyễn Trần Ngọc Đức -> Line 1: Nguyễn Trần, Line 2: Ngọc Đức
      const ngocDuc = splitStudentName('Nguyễn Trần Ngọc Đức');
      expect(ngocDuc.firstLine).toBe('Nguyễn Trần');
      expect(ngocDuc.secondLine).toBe('Ngọc Đức');
    });

    it('trường hợp ngoại lệ: họ và tên học sinh chỉ có 2 chữ không cần xuống hàng', () => {
      // Huỳnh Na -> Giữ trọn vẹn trên 1 dòng duy nhất
      const na = splitStudentName('Huỳnh Na');
      expect(na.firstLine).toBe('Huỳnh Na');
      expect(na.secondLine).toBe('');
      expect(na.hasSplit).toBe(false);
      expect(na.fullFormatted).toBe('Huỳnh Na');

      // Tên 2 từ viết hoa toàn bộ (uppercase)
      const naUpper = splitStudentName('Huỳnh Na', 'uppercase');
      expect(naUpper.firstLine).toBe('HUỲNH NA');
      expect(naUpper.secondLine).toBe('');
      expect(naUpper.hasSplit).toBe(false);

      // Tên 1 từ
      const one = splitStudentName('Tom');
      expect(one.firstLine).toBe('Tom');
      expect(one.secondLine).toBe('');
      expect(one.hasSplit).toBe(false);
    });

    it('hỗ trợ viết hoa toàn bộ khi nameCase là uppercase', () => {
      const res = splitStudentName('Nguyễn Thái Huy', 'uppercase');
      expect(res.firstLine).toBe('NGUYỄN');
      expect(res.secondLine).toBe('THÁI HUY');
    });
  });
});
