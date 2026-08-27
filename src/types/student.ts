export interface Group {
  id: string;
  classId: string;
  name: string;
  colorClass: string;
  avatarUrl?: string;
  orderIndex: number;
}

export type GroupInfo = Group;

export interface Student {
  id: string;
  classId: string;
  groupId?: string | null;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  birthDate?: string;
  classRole: string;
  avatarUrl?: string | null;
  goals?: string;
  talents?: string;
  boardingType?: string;
  code?: string;
  points: number;
  stars: number;
  groupName: string;
  groupColorClass: string;
  guardianToken?: string;
  guardianStatus?: 'pending' | 'active' | 'revoked';
  createdAt?: string;
}

export type StudentProfile = Student;

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'late' | 'excused_absence' | 'unexcused_absence';
  note?: string;
}
