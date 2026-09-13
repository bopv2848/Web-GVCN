/**
 * Lấy ký tự đại diện (Initial) cho Avatar người dùng theo chuẩn tên tiếng Việt:
 * - "Thầy Phan Văn Bộ" -> Lấy "B" (Bộ)
 * - "Phan Văn Bộ" -> Lấy "B" (Bộ)
 * - "Nguyễn Văn An" -> Lấy "A" (An)
 * - Mặc định trả về "B" cho Thầy Phan Văn Bộ
 */
export const getUserInitial = (fullName?: string): string => {
  if (!fullName) return 'B';
  const clean = fullName.trim();
  const parts = clean.split(/\s+/);
  const lastWord = parts[parts.length - 1];
  return lastWord ? lastWord.charAt(0).toUpperCase() : 'B';
};
