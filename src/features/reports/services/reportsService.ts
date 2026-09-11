import { supabase } from '../../../services/supabaseClient';
import * as XLSX from 'xlsx';
import type {
  ReportFilterState,
  ComprehensiveClassReport,
  ReportSummaryKPI,
  GroupReportStat,
  StudentReportStat,
} from '../types';

export const reportsService = {
  /**
   * Tính toán khoảng ngày bắt đầu - kết thúc dựa trên bộ lọc
   */
  calculateDateRange(filter: ReportFilterState): { startDate: string; endDate: string; title: string } {
    const { periodType, weekNumber, month, year, semester, startDate, endDate } = filter;

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatLocalDate = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (periodType === 'week') {
      // Tính tuần dựa trên ngày khai giảng 01/09 (Tháng 9 = index 8)
      const baseDate = new Date(year, 8, 1);
      const startDayOffset = (weekNumber - 1) * 7;
      const weekStart = new Date(baseDate);
      weekStart.setDate(baseDate.getDate() + startDayOffset);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const sStr = formatLocalDate(weekStart);
      const eStr = formatLocalDate(weekEnd);
      return {
        startDate: sStr,
        endDate: eStr,
        title: `TUẦN ${weekNumber} • NĂM HỌC ${year} - ${year + 1}`,
      };
    }

    if (periodType === 'month') {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0); // ngày cuối tháng

      const sStr = formatLocalDate(monthStart);
      const eStr = formatLocalDate(monthEnd);
      return {
        startDate: sStr,
        endDate: eStr,
        title: `THÁNG ${month} NĂM ${year} • NĂM HỌC ${year} - ${year + 1}`,
      };
    }

    if (periodType === 'semester') {
      if (semester === 'I') {
        return {
          startDate: `${year}-09-01`,
          endDate: `${year + 1}-01-15`,
          title: `HỌC KỲ I • NĂM HỌC ${year} - ${year + 1}`,
        };
      }
      if (semester === 'II') {
        return {
          startDate: `${year + 1}-01-16`,
          endDate: `${year + 1}-05-31`,
          title: `HỌC KỲ II • NĂM HỌC ${year} - ${year + 1}`,
        };
      }
      return {
        startDate: `${year}-09-01`,
        endDate: `${year + 1}-05-31`,
        title: `TOÀN NIÊN KHÓA • NĂM HỌC ${year} - ${year + 1}`,
      };
    }

    return {
      startDate: startDate || `${year}-09-01`,
      endDate: endDate || `${year}-09-30`,
      title: `GIAI ĐOẠN TÙY CHỈNH (${startDate} ĐẾN ${endDate})`,
    };
  },

  /**
   * Lấy toàn bộ dữ liệu thật và tổng hợp báo cáo lớp học
   */
  async getComprehensiveReport(
    classId: string,
    filter: ReportFilterState
  ): Promise<ComprehensiveClassReport> {
    const { startDate, endDate, title } = this.calculateDateRange(filter);
    const startIso = `${startDate}T00:00:00.000Z`;
    const endIso = `${endDate}T23:59:59.999Z`;

    // 1. Tải thông tin Lớp, Trường, Học sinh, Tổ
    const [classRes, studentsRes, groupsRes, pointTxRes, sessionsRes] = await Promise.all([
      supabase.from('classes').select('name, school_id, schools(name)').eq('id', classId).single(),
      supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .is('deleted_at', null)
        .order('full_name'),
      supabase.from('groups').select('*').eq('class_id', classId).order('order_index'),
      supabase
        .from('point_transactions')
        .select('*')
        .eq('class_id', classId)
        .gte('occurred_at', startIso)
        .lte('occurred_at', endIso),
      supabase
        .from('attendance_sessions')
        .select('id, session_date, session_type')
        .eq('class_id', classId)
        .gte('session_date', startDate)
        .lte('session_date', endDate),
    ]);

    const className = classRes.data?.name || 'LỚP 6A6';
    const schoolData = classRes.data?.schools as unknown as { name?: string } | null;
    const schoolName = schoolData?.name || 'TRƯỜNG THCS TÂN HẢI';
    const studentsData = studentsRes.data || [];
    const groupsData = groupsRes.data || [];
    const transactions = pointTxRes.data || [];
    const sessions = sessionsRes.data || [];
    const sessionIds = sessions.map((s) => s.id);

    // 2. Tải chi tiết các bản ghi điểm danh
    let attendanceRecords: { student_id: string; status: string; note?: string }[] = [];
    if (sessionIds.length > 0) {
      const recRes = await supabase
        .from('attendance_records')
        .select('student_id, status, note')
        .in('session_id', sessionIds);
      attendanceRecords = recRes.data || [];
    }

    // 3. Xử lý & tổng hợp số liệu cho từng học sinh
    const groupNameMap = new Map(groupsData.map((g) => [g.id, g.name]));
    const totalSessionsCount = sessions.length;

    const studentStatsList: StudentReportStat[] = studentsData.map((s) => {
      const sTx = transactions.filter((t) => t.student_id === s.id);
      const sRecs = attendanceRecords.filter((r) => r.student_id === s.id);

      let positivePoints = 0;
      let negativePoints = 0;
      let positiveCount = 0;
      let negativeCount = 0;
      let totalStars = 0;

      for (const t of sTx) {
        if (t.points > 0) {
          positivePoints += t.points;
          positiveCount++;
        } else if (t.points < 0) {
          negativePoints += Math.abs(t.points);
          negativeCount++;
        }
        totalStars += t.stars || 0;
      }

      const totalPoints = positivePoints - negativePoints;

      let presentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;
      let unexcusedCount = 0;

      for (const r of sRecs) {
        if (r.status === 'present') presentCount++;
        else if (r.status === 'late') lateCount++;
        else if (r.status === 'excused') excusedCount++;
        else if (r.status === 'unexcused') unexcusedCount++;
      }

      // Tỷ lệ chuyên cần
      const recordedSessions = presentCount + lateCount + excusedCount + unexcusedCount;
      const validAttendance = presentCount + lateCount;
      const attendanceRate =
        recordedSessions > 0
          ? Math.round((validAttendance / recordedSessions) * 100)
          : 100;

      // Đánh giá nề nếp
      let conductAssessment: 'Tốt' | 'Khá' | 'Cần rèn luyện' = 'Tốt';
      if (totalPoints < 0 || unexcusedCount >= 2 || lateCount >= 4) {
        conductAssessment = 'Cần rèn luyện';
      } else if (totalPoints < 10 || unexcusedCount === 1 || lateCount >= 2) {
        conductAssessment = 'Khá';
      }

      return {
        studentId: s.id,
        fullName: s.full_name,
        code: s.code || `HS${s.id.slice(0, 4)}`,
        groupId: s.group_id,
        groupName: groupNameMap.get(s.group_id) || 'Chưa phân tổ',
        classRole: s.class_role || 'Thành viên',
        totalPoints,
        positiveCount,
        negativeCount,
        stars: totalStars,
        presentCount,
        lateCount,
        excusedCount,
        unexcusedCount,
        attendanceRate,
        rank: 0, // sẽ gán sau khi sắp xếp
        conductAssessment,
      };
    });

    // Sắp xếp học sinh theo điểm thi đua giảm dần
    studentStatsList.sort((a, b) => b.totalPoints - a.totalPoints);
    studentStatsList.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    // 4. Tổng hợp theo 4 Tổ thi đua
    const groupStatsList: GroupReportStat[] = groupsData.map((g) => {
      const members = studentStatsList.filter((s) => s.groupId === g.id);
      const totalPoints = members.reduce((sum, m) => sum + m.totalPoints, 0);
      const positivePoints = members.reduce((sum, m) => sum + m.positiveCount * 5, 0); // hoặc tính từ sTx
      const negativePoints = members.reduce((sum, m) => sum + m.negativeCount * 5, 0);

      const avgRate =
        members.length > 0
          ? Math.round(members.reduce((acc, m) => acc + m.attendanceRate, 0) / members.length)
          : 100;

      return {
        groupId: g.id,
        groupName: g.name,
        colorClass: g.color_class || 'bg-blue-500',
        memberCount: members.length,
        totalPoints,
        positivePoints,
        negativePoints,
        attendanceRate: avgRate,
        rank: 0,
        badge: '',
      };
    });

    // Sắp xếp Tổ theo điểm giảm dần
    groupStatsList.sort((a, b) => b.totalPoints - a.totalPoints);
    const badges = [
      'Hạng 1 🏆 Xuất sắc',
      'Hạng 2 🥈 Tốt',
      'Hạng 3 🥉 Cố gắng',
      'Hạng 4 🌟 Cần rèn nề nếp',
    ];
    groupStatsList.forEach((g, idx) => {
      g.rank = idx + 1;
      g.badge = badges[idx] || `Hạng ${idx + 1}`;
    });

    // 5. Danh sách Top Vinh danh & Cần quan tâm
    const topStudents = studentStatsList.filter((s) => s.totalPoints > 0).slice(0, 5);
    const progressingStudents = studentStatsList
      .filter((s) => s.positiveCount > 0 && s.rank > 5 && s.conductAssessment !== 'Cần rèn luyện')
      .slice(0, 5);
    const studentsNeedingCare = studentStatsList.filter(
      (s) => s.totalPoints < 0 || s.unexcusedCount > 0 || s.lateCount >= 2 || s.conductAssessment === 'Cần rèn luyện'
    );

    // 6. Tính toán KPI chung
    const allPositivePoints = studentStatsList.reduce((acc, s) => acc + Math.max(0, s.totalPoints), 0);
    const allNegativePoints = studentStatsList.reduce((acc, s) => acc + (s.totalPoints < 0 ? Math.abs(s.totalPoints) : 0), 0);
    const totalLateAll = studentStatsList.reduce((acc, s) => acc + s.lateCount, 0);
    const totalExcusedAll = studentStatsList.reduce((acc, s) => acc + s.excusedCount, 0);
    const totalUnexcusedAll = studentStatsList.reduce((acc, s) => acc + s.unexcusedCount, 0);
    const overallRate =
      studentStatsList.length > 0
        ? Math.round(
            studentStatsList.reduce((acc, s) => acc + s.attendanceRate, 0) / studentStatsList.length
          )
        : 100;

    const kpi: ReportSummaryKPI = {
      totalPoints: studentStatsList.reduce((acc, s) => acc + s.totalPoints, 0),
      positivePoints: allPositivePoints,
      negativePoints: allNegativePoints,
      totalTransactions: transactions.length,
      overallAttendanceRate: overallRate,
      totalSessions: totalSessionsCount,
      totalLate: totalLateAll,
      totalExcused: totalExcusedAll,
      totalUnexcused: totalUnexcusedAll,
      totalStudents: studentStatsList.length,
    };

    const formatDateText = (dStr: string) => {
      const [y, m, d] = dStr.split('-');
      return `${d}/${m}/${y}`;
    };

    return {
      classId,
      className,
      schoolName,
      teacherName: 'Thầy Phan Văn Bộ',
      academicYear: `${filter.year} - ${filter.year + 1}`,
      filter,
      periodTitle: title,
      dateRangeText: `Từ ngày ${formatDateText(startDate)} đến ngày ${formatDateText(endDate)}`,
      kpi,
      groupStats: groupStatsList,
      topStudents,
      progressingStudents,
      studentsNeedingCare,
      allStudents: studentStatsList,
      generatedAt: new Date().toLocaleString('vi-VN'),
    };
  },

  /**
   * Xuất báo cáo tổng kết ra file Excel .xlsx
   */
  exportReportToExcel(report: ComprehensiveClassReport): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Xếp hạng 4 Tổ
    const groupsData = report.groupStats.map((g) => ({
      'Xếp hạng': `Hạng ${g.rank}`,
      'Tổ thi đua': g.groupName,
      'Sĩ số (học sinh)': g.memberCount,
      'Tổng điểm thi đua': g.totalPoints,
      'Tỷ lệ chuyên cần (%)': `${g.attendanceRate}%`,
      'Danh hiệu': g.badge,
    }));
    const wsGroups = XLSX.utils.json_to_sheet(groupsData);
    XLSX.utils.book_append_sheet(wb, wsGroups, 'Xếp_Hạng_4_Tổ');

    // Sheet 2: Danh sách toàn bộ học sinh
    const studentsData = report.allStudents.map((s) => ({
      'Xếp hạng': s.rank,
      'Mã HS': s.code,
      'Họ và tên': s.fullName,
      'Tổ': s.groupName,
      'Chức vụ': s.classRole,
      'Tổng điểm': s.totalPoints,
      'Số sao tích lũy': s.stars,
      'Lượt khen': s.positiveCount,
      'Lượt trừ': s.negativeCount,
      'Đi muộn (lượt)': s.lateCount,
      'Nghỉ có phép': s.excusedCount,
      'Nghỉ không phép': s.unexcusedCount,
      'Chuyên cần (%)': `${s.attendanceRate}%`,
      'Đánh giá nề nếp': s.conductAssessment,
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'So_Cai_47_Hoc_Sinh');

    // Sheet 3: Top Vinh danh & Nhắc nhở
    const topData = report.topStudents.map((s, idx) => ({
      'Vinh danh': `Top ${idx + 1} Xuất sắc`,
      'Họ và tên': s.fullName,
      'Tổ': s.groupName,
      'Tổng điểm': s.totalPoints,
      'Sao thưởng': s.stars,
    }));
    const wsTop = XLSX.utils.json_to_sheet(topData);
    XLSX.utils.book_append_sheet(wb, wsTop, 'Hoc_Sinh_Tieu_Bieu');

    const fileName = `Bao_Cao_${report.className.replace(/\s+/g, '_')}_${report.filter.periodType}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },
};
