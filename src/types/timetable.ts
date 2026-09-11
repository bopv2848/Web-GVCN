export interface TimetableEntry {
  id: string;
  classId: string;
  dayOfWeek: number; // 2: Thứ 2, 3: Thứ 3, 4: Thứ 4, 5: Thứ 5, 6: Thứ 6, 7: Thứ 7
  period: number; // 1..10 (1..5: Buổi sáng, 6..10: Buổi chiều)
  periodDisplay: number; // 1..5 tương ứng với buổi sáng hoặc buổi chiều
  session: 'morning' | 'afternoon';
  timeSlot: string; // ví dụ: "07:00 - 07:45"
  subjectName: string;
  teacherName?: string;
  roomName?: string;
  lessonTopic?: string; // Dùng cho Lịch báo giảng: Tên bài dạy
  ppct?: number; // Tiết phân phối chương trình
  notes?: string;
}

export interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  morningEntries: TimetableEntry[];
  afternoonEntries: TimetableEntry[];
}

export interface SubjectColor {
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}
