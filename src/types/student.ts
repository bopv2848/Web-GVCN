export interface GroupInfo {
  id: string;
  name: string;
  colorClass: string;
  avatarUrl?: string;
  orderIndex: number;
}

export interface StudentProfile {
  id: string;
  classId: string;
  groupId?: string;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  birthDate?: string;
  classRole: string; // 'Thành viên', 'Lớp trưởng', 'Tổ trưởng'...
  avatarUrl?: string;
  goals?: string;
  talents?: string;
  boardingType?: string;
  code?: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'late' | 'excused_absence' | 'unexcused_absence';
  note?: string;
}
