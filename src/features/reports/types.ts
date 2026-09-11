export type PeriodFilterType = 'week' | 'month' | 'semester' | 'custom';

export interface ReportFilterState {
  periodType: PeriodFilterType;
  weekNumber: number; // 1 - 35
  month: number;      // 1 - 12
  year: number;       // e.g. 2026
  semester: 'I' | 'II' | 'full_year';
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
}

export interface ReportSummaryKPI {
  totalPoints: number;
  positivePoints: number;
  negativePoints: number;
  totalTransactions: number;
  overallAttendanceRate: number;
  totalSessions: number;
  totalLate: number;
  totalExcused: number;
  totalUnexcused: number;
  totalStudents: number;
}

export interface GroupReportStat {
  groupId: string;
  groupName: string;
  colorClass: string;
  memberCount: number;
  totalPoints: number;
  positivePoints: number;
  negativePoints: number;
  attendanceRate: number;
  rank: number;
  badge: string;
}

export interface StudentReportStat {
  studentId: string;
  fullName: string;
  code: string;
  groupId: string;
  groupName: string;
  classRole: string;
  totalPoints: number;
  positiveCount: number;
  negativeCount: number;
  stars: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  unexcusedCount: number;
  attendanceRate: number;
  rank: number;
  conductAssessment: 'Tốt' | 'Khá' | 'Cần rèn luyện';
  notes?: string;
}

export interface ComprehensiveClassReport {
  classId: string;
  className: string;
  schoolName: string;
  teacherName: string;
  academicYear: string;
  filter: ReportFilterState;
  periodTitle: string;
  dateRangeText: string;
  kpi: ReportSummaryKPI;
  groupStats: GroupReportStat[];
  topStudents: StudentReportStat[];
  progressingStudents: StudentReportStat[];
  studentsNeedingCare: StudentReportStat[];
  allStudents: StudentReportStat[];
  generatedAt: string;
}
