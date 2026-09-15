import type { DashboardStats } from '../../../types/dashboard';
import { sandboxService } from '../services/sandboxService';

export function buildSandboxDashboardStats(): DashboardStats {
  const students = sandboxService.getStudents();
  const groups = sandboxService.getGroups();
  const txs = sandboxService.getTransactions();
  const sessions = sandboxService.getAttendanceSessions();

  const totalStudents = students.length;
  const maleCount = students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ').length;
  const boardingCount = students.filter((s) => s.boardingType === 'Bán trú').length;
  const guardianLinkedCount = students.filter((s) => s.guardianStatus === 'active').length;

  // Điểm danh hôm nay (lấy phiên mới nhất)
  const latestSession = sessions[0];
  let morningRate = 95;
  let morningPresent = 38;
  let morningAbsent = 1;
  let morningLate = 1;

  if (latestSession) {
    const recs = sandboxService.getAttendanceRecords(latestSession.id);
    if (recs.length > 0) {
      morningPresent = recs.filter((r) => r.status === 'present').length;
      morningLate = recs.filter((r) => r.status === 'late').length;
      morningAbsent = recs.filter((r) => r.status === 'excused_absence' || r.status === 'unexcused_absence').length;
      morningRate = Math.round(((morningPresent + morningLate) / recs.length) * 100);
    }
  }

  // Xếp hạng 4 tổ
  const studentToGroupMap = new Map<string, string>();
  students.forEach((s) => {
    if (s.groupId) studentToGroupMap.set(s.id, s.groupId);
  });

  const groupRankings = groups.map((g) => ({
    id: g.id,
    name: g.name,
    colorClass: g.colorClass,
    totalPoints: 0,
    totalStars: 0,
    rank: 1,
  }));

  const groupMap = new Map(groupRankings.map((g) => [g.id, g]));
  let totalClassPoints = 0;
  let totalClassStars = 0;

  txs.forEach((tx) => {
    totalClassPoints += tx.points;
    totalClassStars += tx.stars || 0;
    const gId = studentToGroupMap.get(tx.studentId);
    if (gId && groupMap.has(gId)) {
      const g = groupMap.get(gId)!;
      g.totalPoints += tx.points;
      g.totalStars += tx.stars || 0;
    }
  });

  groupRankings.sort((a, b) => b.totalPoints - a.totalPoints || b.totalStars - a.totalStars);
  groupRankings.forEach((g, idx) => {
    g.rank = idx + 1;
  });

  const leadingGroup = groupRankings[0] || null;

  // Xu hướng tuần (Thứ 2 đến Thứ 6)
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6'];
  const weeklyTrend = weekDays.map((dayLabel, idx) => ({
    dayLabel,
    dateStr: `2026-09-${String(8 + idx).padStart(2, '0')}`,
    pointsGained: 25 + idx * 4,
    pointsLost: 5 + (idx % 3) * 2,
    netPoints: 20 + idx * 3,
    attendanceRate: 95 + (idx % 3) * 2,
  }));

  // Hoạt động gần nhất
  const recentActivities = txs.slice(0, 6).map((tx) => {
    const pointsText = tx.points >= 0 ? `+${tx.points} điểm` : `${tx.points} điểm`;
    const badgeColor = tx.points >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';

    return {
      id: tx.id,
      type: 'point' as const,
      title: `${tx.studentName || 'Học sinh'}: ${pointsText}`,
      description: tx.reason,
      timeAgo: 'Gần đây',
      badgeColor,
    };
  });

  return {
    totalStudents,
    maleCount,
    femaleCount,
    boardingCount,
    guardianLinkedCount,
    attendanceToday: {
      morningRate,
      morningPresent,
      morningAbsent,
      morningLate,
      afternoonRate: null,
      afternoonPresent: 0,
      afternoonAbsent: 0,
      afternoonLate: 0,
      overallRate: morningRate,
      hasSessionToday: true,
    },
    pointsOverview: {
      totalClassPoints,
      totalClassStars,
      leadingGroup,
      groupRankings,
    },
    weeklyTrend,
    recentActivities,
  };
}
