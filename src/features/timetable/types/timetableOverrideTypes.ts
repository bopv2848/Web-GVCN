export type OverrideType =
  | 'room_change' // Đổi phòng học (Phòng Tin, Ngoại ngữ, Lab...)
  | 'teacher_change' // Giáo viên dạy thay / thỉnh giảng
  | 'subject_change' // Đổi tiết môn học
  | 'conflict_alert' // Cảnh báo xung đột phòng/giờ
  | 'general_note'; // Ghi chú dặn dò chung

export interface TimetableWeeklyOverride {
  id: string;
  classId: string;
  weekNumber: number; // Ví dụ: tuần 2
  entryId: string; // ID của tiết học trong timetable_entries
  overrideType: OverrideType;
  overrideRoom?: string; // Ví dụ: "Phòng Tin học 1"
  overrideTeacher?: string; // Ví dụ: "Cô Lan (Dạy thay)"
  overrideSubject?: string; // Ví dụ: "Ngữ Văn (Đổi từ Thứ 5)"
  note?: string; // Ghi chú nhanh: "Tiết 3 học phòng Tin", "Đổi tiết môn Văn"
  isConflict?: boolean;
  conflictReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableConflictWarning {
  entryId: string;
  dayOfWeek: number;
  period: number;
  subjectName: string;
  conflictType: 'room_duplicate' | 'teacher_duplicate' | 'manual_alert';
  message: string;
}
