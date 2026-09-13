/**
 * Tiện ích chuẩn hóa và sắp xếp họ tên tiếng Việt theo quy chuẩn Bộ Giáo dục & Đào tạo Việt Nam
 * Sắp xếp ưu tiên:
 * 1. Tên chính (Từ cuối cùng trong họ và tên) từ A đến Z theo bảng chữ cái tiếng Việt (A, Ă, Â, B, C, D, Đ...)
 * 2. Nếu trùng Tên chính: So sánh tiếp Họ và Tên đệm từ trái sang phải theo bảng chữ cái tiếng Việt
 */

export interface ParsedVietnameseName {
  firstName: string;
  middleAndLastName: string;
}

/**
 * Tách họ tên tiếng Việt thành Tên chính và Họ đệm
 * Ví dụ:
 * - "Đỗ Bảo An" -> firstName: "An", middleAndLastName: "Đỗ Bảo"
 * - "Lê Ngọc Anh" -> firstName: "Anh", middleAndLastName: "Lê Ngọc"
 * - "Châu Minh Thiện" -> firstName: "Thiện", middleAndLastName: "Châu Minh"
 */
export function parseVietnameseName(fullName: string): ParsedVietnameseName {
  if (!fullName) {
    return { firstName: '', middleAndLastName: '' };
  }

  const clean = fullName.trim().replace(/\s+/g, ' ');
  const parts = clean.split(' ');

  if (parts.length <= 1) {
    return {
      firstName: parts[0] || '',
      middleAndLastName: '',
    };
  }

  const firstName = parts[parts.length - 1];
  const middleAndLastName = parts.slice(0, parts.length - 1).join(' ');

  return {
    firstName,
    middleAndLastName,
  };
}

/**
 * So sánh 2 họ tên tiếng Việt theo đúng thứ tự A-Z
 */
export function compareVietnameseNames(nameA: string, nameB: string): number {
  const parsedA = parseVietnameseName(nameA);
  const parsedB = parseVietnameseName(nameB);

  // 1. So sánh Tên chính trước (có phân biệt dấu thanh chuẩn tiếng Việt)
  const firstNameCmp = parsedA.firstName.localeCompare(parsedB.firstName, 'vi');
  if (firstNameCmp !== 0) {
    return firstNameCmp;
  }

  // 2. Nếu Tên chính trùng nhau, so sánh tiếp Họ và Tên đệm
  return parsedA.middleAndLastName.localeCompare(parsedB.middleAndLastName, 'vi');
}

/**
 * Sắp xếp một mảng bất kỳ theo họ tên tiếng Việt từ A đến Z
 */
export function sortVietnameseList<T>(items: T[], getName: (item: T) => string): T[] {
  if (!items || items.length === 0) return [];
  return [...items].sort((a, b) => compareVietnameseNames(getName(a), getName(b)));
}
