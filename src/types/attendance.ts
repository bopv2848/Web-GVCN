export type AttendanceStatus = 'present' | 'late' | 'excused_absence' | 'unexcused_absence';

export type SessionType = 'morning' | 'afternoon' | 'full_day';

export interface AttendanceSession {
  id: string;
  classId: string;
  sessionDate: string;
  sessionType: SessionType;
  isLocked: boolean;
  createdBy: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  gender: 'Nam' | 'Nữ' | string;
  groupName: string;
  classRole: string;
  status: AttendanceStatus;
  note?: string | null;
  updatedAt: string;
}

export interface AttendanceStats {
  total: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  unexcusedCount: number;
  attendanceRate: number;
}

export interface MonthlyGroupAttendance {
  groupId: string;
  groupName: string;
  colorClass: string;
  memberCount: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  unexcusedCount: number;
  attendanceRate: number;
  rank: number;
}

export interface DailyAttendanceTrend {
  date: string;
  sessionType: SessionType;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface AbsenceDetail {
  date: string;
  sessionType: SessionType;
  status: AttendanceStatus;
  reason: string;
  note?: string | null;
}

export interface StudentMonthlyAttendance {
  studentId: string;
  fullName: string;
  gender: string;
  groupName: string;
  classRole: string;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  unexcusedCount: number;
  totalSessions: number;
  attendanceRate: number;
  absenceDetails: AbsenceDetail[];
}

export interface TopAbsenceReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface MonthlyAttendanceReport {
  classId: string;
  year: number;
  month: number;
  totalSessions: number;
  totalStudents: number;
  overallRate: number;
  totalPresent: number;
  totalLate: number;
  totalExcused: number;
  totalUnexcused: number;
  groupStats: MonthlyGroupAttendance[];
  dailyTrends: DailyAttendanceTrend[];
  studentSummaries: StudentMonthlyAttendance[];
  atRiskStudents: StudentMonthlyAttendance[];
  topAbsenceReasons: TopAbsenceReason[];
}

export interface EpidemicSickStudent {
  studentId: string;
  studentName: string;
  groupName: string;
  dates: string[];
  reasons: string[];
}

export interface EpidemicAlert {
  level: 'none' | 'warning' | 'critical';
  sickStudentCount: number;
  threshold: { warning: number; critical: number };
  windowDays: number;
  startDate: string;
  endDate: string;
  sickStudents: EpidemicSickStudent[];
  dominantSymptoms: Array<{ symptom: string; count: number }>;
}
