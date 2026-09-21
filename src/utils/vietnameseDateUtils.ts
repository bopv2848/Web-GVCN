/**
 * Tiện ích định dạng thứ, ngày tháng năm chuẩn lớp học Việt Nam theo thời gian thực
 */
export const formatVietnameseClassroomDate = (date: Date = new Date()) => {
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeek = daysOfWeek[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return {
    dayOfWeek,
    day,
    month,
    year,
    // Ví dụ hiển thị gọn: "Thứ Năm, 17/09/2026"
    standardText: `${dayOfWeek}, ${day}/${month}/${year}`,
    // Ví dụ hiển thị bảng lớp học: "Thứ Năm, ngày 17/09/2026"
    chalkboardText: `${dayOfWeek}, ngày ${day}/${month}/${year}`,
    // Ví dụ hiển thị đầy đủ trang trọng: "Thứ Năm, ngày 17 tháng 09 năm 2026"
    formalText: `${dayOfWeek}, ngày ${day} tháng ${month} năm ${year}`,
  };
};
