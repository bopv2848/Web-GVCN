export interface DashboardStats {
  totalStudents: number;
  maleCount: number;
  femaleCount: number;
  boardingCount: number;
  guardianLinkedCount: number;

  attendanceToday: {
    morningRate: number | null; // % (0 - 100)
    morningPresent: number;
    morningAbsent: number;
    morningLate: number;

    afternoonRate: number | null;
    afternoonPresent: number;
    afternoonAbsent: number;
    afternoonLate: number;

    overallRate: number | null;
    hasSessionToday: boolean;
  };

  pointsOverview: {
    totalClassPoints: number;
    totalClassStars: number;
    leadingGroup: {
      id: string;
      name: string;
      totalPoints: number;
      rank: number;
      colorClass: string;
    } | null;
    groupRankings: Array<{
      id: string;
      name: string;
      totalPoints: number;
      rank: number;
      colorClass: string;
    }>;
  };

  weeklyTrend: Array<{
    dayLabel: string; // 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'
    dateStr: string;  // 'YYYY-MM-DD'
    pointsGained: number;
    pointsLost: number;
    netPoints: number;
    attendanceRate: number | null; // % (0 - 100)
  }>;

  recentActivities: Array<{
    id: string;
    type: 'point' | 'attendance';
    title: string;
    description: string;
    timeAgo: string;
    badgeColor: string;
  }>;
}
