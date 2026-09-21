/**
 * Tiện ích định dạng họ tên và tính toán cỡ chữ cho bản in sơ đồ lớp học A4
 * Chuẩn hóa theo thể thức văn bản hành chính sư phạm
 */

/**
 * Định dạng họ tên học sinh: Giữ nguyên hoa đầu từ (default) hoặc Viết hoa toàn bộ (uppercase)
 */
export const formatStudentPrintName = (
  fullName: string,
  nameCase: 'default' | 'uppercase' = 'default'
): string => {
  if (!fullName) return '';
  if (nameCase === 'uppercase') {
    return fullName.toLocaleUpperCase('vi-VN');
  }
  return fullName;
};

/**
 * Đo hoặc ước lượng độ rộng pixel của chuỗi họ tên trên bản in A4:
 * Font chuẩn: Times New Roman Bold
 */
export const estimateStudentNameWidth = (
  text: string,
  fontSize: number
): number => {
  if (!text) return 0;
  // Kiểm tra chỉ thực hiện đo Canvas trên môi trường Trình duyệt thực tế (tránh lỗi Not Implemented trong JSDOM test)
  if (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function' &&
    typeof navigator !== 'undefined' &&
    !navigator.userAgent.includes('jsdom')
  ) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `bold ${fontSize}px "Times New Roman", Times, Georgia, serif`;
        const metrics = ctx.measureText(text);
        if (metrics && metrics.width > 0) {
          return metrics.width;
        }
      }
    } catch {
      // Fallback sang công thức ước lượng
    }
  }
  // Heuristic chuẩn cho Times New Roman Bold tiếng Việt: độ rộng trung bình ~ 0.51 font size / ký tự
  return text.length * fontSize * 0.51;
};

/**
 * Tự động tính toán cỡ chữ in cho học sinh:
 * - Học sinh có tên thông thường (3-4 từ): Giữ nguyên cỡ chữ cơ sở (12, 13 hoặc 14pt)
 * - Ngoại lệ tên 1-2 từ (hiển thị trọn vẹn trên 1 dòng):
 *   + Cỡ chữ 14pt vẫn vừa vặn với các tên 2 từ thông dụng (kể cả dài như "Nguyễn Phương" ~ 93px).
 *   + Tự động co giãn chữ an toàn (14pt -> 13pt -> 12pt -> min 11pt) nếu độ rộng chuỗi vượt quá ngưỡng an toàn 100px của ô bàn học.
 * - Học sinh có tên dài (> 4 từ, từ 5 từ trở lên hoặc >= 22 ký tự): Tự động co nhỏ 1 cỡ chữ (ví dụ 14pt -> 13pt)
 *   giúp tên không bị tràn xuống quá 2 dòng, giữ ô bàn học luôn cân đối.
 */
export const getStudentPrintFontSize = (
  fullName: string,
  baseSize: 12 | 13 | 14 = 14,
  autoFit = true
): number => {
  if (!fullName) return baseSize;
  if (!autoFit) return baseSize;

  const trimmed = fullName.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  // Ngoại lệ tên 1-2 từ: Hiển thị trọn vẹn trên 1 dòng duy nhất
  if (words.length <= 2) {
    let size = baseSize;
    let estimatedWidth = estimateStudentNameWidth(trimmed, size);

    // Tự động co giãn chữ an toàn nếu độ rộng vượt quá ngưỡng 100px của ô bàn
    while (estimatedWidth > 100 && size > 11) {
      size -= 1;
      estimatedWidth = estimateStudentNameWidth(trimmed, size);
    }

    return size;
  }

  // Tên dài quá 4 từ hoặc có từ 22 ký tự trở lên
  if (words.length > 4 || trimmed.length >= 22) {
    return Math.max(11, baseSize - 1);
  }
  return baseSize;
};

export interface SplitStudentName {
  firstLine: string;
  secondLine: string;
  hasSplit: boolean;
  fullFormatted: string;
}

/**
 * Phân tách họ tên học sinh thành 2 dòng chuẩn hóa theo thể thức sư phạm Việt Nam:
 * - Hàng dưới (secondLine): Luôn chứa [Chữ lót liền kề] + [Tên học sinh] (2 từ cuối cùng: VD "Thái Huy", "Quế Anh", "Khả Hân", "Thảo An").
 * - Hàng trên (firstLine): Chứa [Họ] + [các chữ lót đầu nếu có] (các từ còn lại: VD "Nguyễn", "Lục Cao", "Trương", "Hà Minh").
 * - Trường hợp ngoại lệ: Họ và tên học sinh chỉ có 2 chữ (hoặc 1 chữ) thì KHÔNG CẦN xuống hàng, giữ nguyên hiển thị trên 1 dòng duy nhất (VD: "Huỳnh Na").
 */
export const splitStudentName = (
  fullName: string,
  nameCase: 'default' | 'uppercase' = 'default'
): SplitStudentName => {
  if (!fullName) {
    return { firstLine: '', secondLine: '', hasSplit: false, fullFormatted: '' };
  }

  const formattedName = formatStudentPrintName(fullName, nameCase);
  const words = formattedName.trim().split(/\s+/).filter(Boolean);

  // Trường hợp ngoại lệ: Tên chỉ có 2 chữ (hoặc 1 chữ) không cần xuống hàng
  if (words.length <= 2) {
    return {
      firstLine: formattedName,
      secondLine: '',
      hasSplit: false,
      fullFormatted: formattedName,
    };
  }

  // Tên từ 3 từ trở lên:
  // Hàng dưới (secondLine) luôn chứa 2 từ cuối cùng: [Chữ lót liền kề] + [Tên học sinh]
  // Hàng trên (firstLine) chứa tất cả các từ còn lại: [Họ] + [các chữ lót trước nếu có]
  const secondLine = words.slice(-2).join(' ');
  const firstLine = words.slice(0, -2).join(' ');

  return {
    firstLine,
    secondLine,
    hasSplit: true,
    fullFormatted: formattedName,
  };
};
