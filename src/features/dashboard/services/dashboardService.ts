import { supabase } from '../../../services/supabaseClient';
import type { DashboardStats } from '../../../types/dashboard';
import { DEFAULT_CLASS_6A6_STUDENTS, DEFAULT_GROUPS_6A6 } from '../../students/constants/defaultClass6A6Students';
import { sandboxService } from '../../sandbox/services/sandboxService';
import { buildSandboxDashboardStats } from '../../sandbox/utils/sandboxDashboardHelper';

interface RawTransaction {
  id: string;
  points: number;
  stars: number;
  reason: string;
  note?: string;
  occurred_at: string;
  student?: {
    id: string;
    full_name: string;
    group_id?: string;
  } | null;
}

interface RawAttendanceRecord {
  session_id: string;
  status: string;
}

export const dashboardService = {
  /**
   * Lấy toàn bộ dữ liệu thực tế cho màn hình Dashboard Tổng quan
   */
  async getDashboardData(classId: string): Promise<DashboardStats> {
    if (sandboxService.isSandboxActive()) {
      return buildSandboxDashboardStats();
    }
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 1. Tải danh sách học sinh và 4 Tổ (kèm quan hệ người giám hộ)
    const [studentsRes, groupsRes] = await Promise.all([
      supabase
        .from('students')
        .select(`
          id,
          full_name,
          gender,
          boarding_type,
          group_id,
          student_guardians (
            id,
            status
          )
        `)
        .eq('class_id', classId)
        .is('deleted_at', null),
      supabase
        .from('groups')
        .select('id, name, color_class, order_index')
        .eq('class_id', classId)
        .order('order_index', { ascending: true }),
    ]);

    let students: Array<{
      id: string;
      fullName: string;
      gender: string;
      boardingType: string;
      groupId?: string | null;
      guardianActive: boolean;
    }> = [];

    if (studentsRes.data && studentsRes.data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      students = studentsRes.data.map((s: any) => ({
        id: s.id,
        fullName: s.full_name,
        gender: s.gender,
        boardingType: s.boarding_type,
        groupId: s.group_id,
        guardianActive: Array.isArray(s.student_guardians)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? s.student_guardians.some((g: any) => g.status === 'active')
          : false,
      }));
    } else {
      students = DEFAULT_CLASS_6A6_STUDENTS.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        gender: s.gender,
        boardingType: s.boardingType || 'Bán trú',
        groupId: s.groupId,
        guardianActive: s.guardianStatus === 'active',
      }));
    }

    const groups =
      groupsRes.data && groupsRes.data.length > 0
        ? groupsRes.data
        : DEFAULT_GROUPS_6A6.map((g) => ({
            id: g.id,
            name: g.name,
            color_class: g.colorClass,
            order_index: g.orderIndex,
          }));

    const totalStudents = students.length;
    const maleCount = students.filter((s) => s.gender === 'Nam').length;
    const femaleCount = students.filter((s) => s.gender === 'Nữ').length;
    const boardingCount = students.filter((s) => s.boardingType === 'Bán trú').length;
    const guardianLinkedCount = students.filter((s) => s.guardianActive).length;

    // 2. Tải phiên điểm danh hôm nay
    const { data: todaySessions } = await supabase
      .from('attendance_sessions')
      .select('id, session_type')
      .eq('class_id', classId)
      .eq('session_date', todayStr);

    let morningPresent = 0;
    let morningAbsent = 0;
    let morningLate = 0;
    let morningRate: number | null = null;

    let afternoonPresent = 0;
    let afternoonAbsent = 0;
    let afternoonLate = 0;
    let afternoonRate: number | null = null;

    if (todaySessions && todaySessions.length > 0) {
      const morningSession = todaySessions.find((s) => s.session_type === 'morning');
      const afternoonSession = todaySessions.find((s) => s.session_type === 'afternoon');

      if (morningSession) {
        const { data: mRecords } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('session_id', morningSession.id);

        if (mRecords && mRecords.length > 0) {
          morningPresent = mRecords.filter((r) => r.status === 'present').length;
          morningAbsent = mRecords.filter((r) => r.status === 'excused' || r.status === 'unexcused').length;
          morningLate = mRecords.filter((r) => r.status === 'late').length;
          morningRate = Math.round(((morningPresent + morningLate) / mRecords.length) * 100);
        }
      }

      if (afternoonSession) {
        const { data: aRecords } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('session_id', afternoonSession.id);

        if (aRecords && aRecords.length > 0) {
          afternoonPresent = aRecords.filter((r) => r.status === 'present').length;
          afternoonAbsent = aRecords.filter((r) => r.status === 'excused' || r.status === 'unexcused').length;
          afternoonLate = aRecords.filter((r) => r.status === 'late').length;
          afternoonRate = Math.round(((afternoonPresent + afternoonLate) / aRecords.length) * 100);
        }
      }
    }

    let overallRate: number | null = null;
    if (morningRate !== null && afternoonRate !== null) {
      overallRate = Math.round((morningRate + afternoonRate) / 2);
    } else if (morningRate !== null) {
      overallRate = morningRate;
    } else if (afternoonRate !== null) {
      overallRate = afternoonRate;
    }

    // 3. Tải Sổ cái Thi đua và Tổng hợp xếp hạng 4 Tổ
    const { data: allTransactions } = await supabase
      .from('point_transactions')
      .select(`
        id,
        points,
        stars,
        reason,
        note,
        occurred_at,
        student:student_id (
          id,
          full_name,
          group_id
        )
      `)
      .eq('class_id', classId)
      .order('occurred_at', { ascending: false });

    const txList = (allTransactions as unknown as RawTransaction[]) || [];
    let totalClassPoints = 0;
    let totalClassStars = 0;

    const groupTotals: Record<string, { points: number; stars: number }> = {};
    groups.forEach((g) => {
      groupTotals[g.id] = { points: 0, stars: 0 };
    });

    txList.forEach((tx) => {
      const pts = tx.points || 0;
      const strs = tx.stars || 0;
      totalClassPoints += pts;
      totalClassStars += strs;

      const gid = tx.student?.group_id;
      if (gid && groupTotals[gid]) {
        groupTotals[gid].points += pts;
        groupTotals[gid].stars += strs;
      }
    });

    const groupRankings = groups.map((g) => ({
      id: g.id,
      name: g.name,
      totalPoints: groupTotals[g.id]?.points || 0,
      totalStars: groupTotals[g.id]?.stars || 0,
      rank: 1,
      colorClass: g.color_class || 'text-indigo-600',
    }));

    groupRankings.sort((a, b) => b.totalPoints - a.totalPoints);
    groupRankings.forEach((item, index) => {
      item.rank = index + 1;
    });

    const leadingGroup = groupRankings.length > 0 ? groupRankings[0] : null;

    // 4. Biểu đồ tiến độ tuần thực tế 100% (Từ Thứ 2 đến Chủ nhật)
    // Xác định Thứ 2 đầu tuần của ngày hiện tại
    const currentDayOfWeek = today.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const weekDates: { label: string; dateStr: string }[] = [];
    const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push({
        label: dayLabels[i],
        dateStr: d.toISOString().split('T')[0],
      });
    }

    // Lấy các phiên điểm danh trong tuần này
    const mondayStr = weekDates[0].dateStr;
    const sundayStr = weekDates[6].dateStr;

    const { data: weekSessions } = await supabase
      .from('attendance_sessions')
      .select('id, session_date')
      .eq('class_id', classId)
      .gte('session_date', mondayStr)
      .lte('session_date', sundayStr);

    const sessionIds = weekSessions?.map((s) => s.id) || [];
    let weekRecords: RawAttendanceRecord[] = [];
    if (sessionIds.length > 0) {
      const { data: recs } = await supabase
        .from('attendance_records')
        .select('session_id, status')
        .in('session_id', sessionIds);
      weekRecords = (recs as RawAttendanceRecord[]) || [];
    }

    const sessionIdToDate = new Map<string, string>();
    weekSessions?.forEach((s) => sessionIdToDate.set(s.id, s.session_date));

    // Tính toán số liệu theo từng ngày của tuần (100% dữ liệu thật từ Supabase)
    const weeklyTrend = weekDates.map((day) => {
      // Giao dịch thi đua trong ngày
      const dayTxs = txList.filter((tx) => {
        const txDate = tx.occurred_at ? tx.occurred_at.split('T')[0] : '';
        return txDate === day.dateStr;
      });

      let pointsGained = 0;
      let pointsLost = 0;
      dayTxs.forEach((tx) => {
        if (tx.points > 0) pointsGained += tx.points;
        else pointsLost += Math.abs(tx.points);
      });
      const netPoints = pointsGained - pointsLost;

      // Chuyên cần trong ngày
      const dayRecords = weekRecords.filter((r) => sessionIdToDate.get(r.session_id) === day.dateStr);
      let attendanceRate: number | null = null;
      if (dayRecords.length > 0) {
        const presentCount = dayRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
        attendanceRate = Math.round((presentCount / dayRecords.length) * 100);
      }

      return {
        dayLabel: day.label,
        dateStr: day.dateStr,
        pointsGained,
        pointsLost,
        netPoints,
        attendanceRate,
      };
    });

    // 5. Hoạt động gần nhất
    const recentActivities = txList.slice(0, 6).map((tx) => {
      const studentName = tx.student?.full_name || 'Học sinh';
      const pointsText = tx.points >= 0 ? `+${tx.points} điểm` : `${tx.points} điểm`;
      const badgeColor = tx.points >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';

      const txDate = new Date(tx.occurred_at);
      let timeAgo = 'Hôm nay';
      const diffHours = Math.floor((today.getTime() - txDate.getTime()) / (1000 * 60 * 60));
      if (diffHours < 24 && txDate.getDate() === today.getDate()) {
        timeAgo = `${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')}`;
      } else if (diffHours < 48) {
        timeAgo = 'Hôm qua';
      } else {
        timeAgo = `${txDate.getDate()}/${txDate.getMonth() + 1}`;
      }

      return {
        id: tx.id,
        type: 'point' as const,
        title: `${studentName}: ${pointsText}`,
        description: tx.reason,
        timeAgo,
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
        afternoonRate,
        afternoonPresent,
        afternoonAbsent,
        afternoonLate,
        overallRate,
        hasSessionToday: Boolean(todaySessions && todaySessions.length > 0),
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
  },
};
