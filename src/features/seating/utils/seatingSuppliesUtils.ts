export interface DeskSupplySet {
  items: string[];
  label: string;
}

export const DESK_SUPPLIES_SETS: DeskSupplySet[] = [
  {
    items: ['📚', '✏️', '📐', '🥛'],
    label: 'Sách giáo khoa, Bút chì, Thước êke, Bình nước',
  },
  {
    items: ['📖', '🖊️', '📏', '🧴'],
    label: 'Vở ghi bài, Bút mực, Thước kẻ, Hộp bút',
  },
  {
    items: ['📚', '📝', '✏️', '📐'],
    label: 'Sách bài tập, Phiếu học tập, Bút chì, Thước kẻ',
  },
  {
    items: ['📖', '✏️', '🧮', '🥤'],
    label: 'Vở bài học, Bút viết, Máy tính học sinh, Bình nước',
  },
  {
    items: ['📚', '🖊️', '📐', '🧴'],
    label: 'Sách tham khảo, Bút bi, Thước đo độ, Hộp bút',
  },
  {
    items: ['📖', '📝', '✏️', '🥛'],
    label: 'Vở ghi chép, Giấy nháp, Bút chì, Bình nước',
  },
];

/**
 * Trả về bộ đồ dùng học tập sinh động trên mặt bàn học sinh
 * Phân bổ linh hoạt theo vị trí hàng (rowIndex) và cột (colLeft)
 */
export function getDeskSupplies(rowIndex: number, colLeft: number = 0): DeskSupplySet {
  const index = Math.abs((rowIndex * 3 + colLeft) % DESK_SUPPLIES_SETS.length);
  return DESK_SUPPLIES_SETS[index];
}
