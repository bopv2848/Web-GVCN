export interface ParentStudentProfile {
  id: string;
  fullName: string;
  code: string;
  gender: 'Nam' | 'Nữ';
  birthDate?: string;
  avatarUrl?: string;
  className: string;
  schoolName: string;
  groupName: string;
  classRole: string;
  teacherName: string;
  teacherPhone?: string;
  goals?: string;
  talents?: string;
}

export interface ParentAttendanceItem {
  id: string;
  sessionDate: string;
  sessionType: 'morning' | 'afternoon';
  status: 'present' | 'late' | 'excused' | 'unexcused';
  note?: string;
}

export interface ParentPointTransaction {
  id: string;
  points: number;
  stars: number;
  reason: string;
  note?: string;
  occurredAt: string;
}

export interface ParentTimetableItem {
  dayOfWeek: number;
  period: number;
  periodDisplay: number;
  session: 'morning' | 'afternoon';
  subjectName: string;
  teacherName?: string;
  lessonTopic?: string;
}

export interface ParentStudentPortalData {
  student: ParentStudentProfile;
  totalPoints: number;
  totalStars: number;
  attendanceRate: number;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  unexcusedCount: number;
  attendanceHistory: ParentAttendanceItem[];
  pointTransactions: ParentPointTransaction[];
  timetable: ParentTimetableItem[];
}

export interface LookupResult {
  success: boolean;
  error?: string;
  data?: ParentStudentPortalData;
}

export interface TopStarStudent {
  id: string;
  studentCode: string;
  maskedName: string;
  groupName: string;
  totalStars: number;
  totalPoints: number;
  rank: number;
  badgeTitle: string;
}

export type LeaderboardTimeframe = 'week' | 'month' | 'semester';

export interface WeeklyBadgeWinner {
  id: string;
  studentCode: string;
  fullName: string;
  maskedName: string;
  groupName: string;
  metricValue: number;
  metricLabel: string;
  isCurrentStudent: boolean;
}

export interface WeeklyBadge {
  id: 'hardworking' | 'discipline' | 'speaking';
  title: string;
  icon: string;
  tagline: string;
  description: string;
  colorTheme: 'amber' | 'emerald' | 'sky';
  winner: WeeklyBadgeWinner;
}
