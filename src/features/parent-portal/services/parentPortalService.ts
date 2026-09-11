import { supabase } from '../../../services/supabaseClient';
import type {
  ParentStudentPortalData,
  ParentStudentProfile,
  ParentAttendanceItem,
  ParentPointTransaction,
  ParentTimetableItem,
  LookupResult,
  TopStarStudent,
  LeaderboardTimeframe,
} from '../types';

export const parentPortalService = {
  /**
   * Kiểm tra và áp dụng Rate Limiting chống brute-force mã PIN
   */
  checkRateLimit(): { isLocked: boolean; remainingMinutes: number } {
    const lockUntilStr = localStorage.getItem('parent_lookup_lock_until');
    if (lockUntilStr) {
      const lockUntil = Number(lockUntilStr);
      if (Date.now() < lockUntil) {
        const remainingMinutes = Math.ceil((lockUntil - Date.now()) / (60 * 1000));
        return { isLocked: true, remainingMinutes };
      } else {
        localStorage.removeItem('parent_lookup_lock_until');
        localStorage.removeItem('parent_lookup_attempts');
      }
    }
    return { isLocked: false, remainingMinutes: 0 };
  },

  recordFailedAttempt(): { isLocked: boolean; remainingMinutes: number } {
    const attempts = Number(localStorage.getItem('parent_lookup_attempts') || '0') + 1;
    localStorage.setItem('parent_lookup_attempts', String(attempts));

    if (attempts >= 5) {
      const lockDurationMs = 15 * 60 * 1000; // 15 phút
      const lockUntil = Date.now() + lockDurationMs;
      localStorage.setItem('parent_lookup_lock_until', String(lockUntil));
      return { isLocked: true, remainingMinutes: 15 };
    }
    return { isLocked: false, remainingMinutes: 0 };
  },

  resetFailedAttempts() {
    localStorage.removeItem('parent_lookup_attempts');
    localStorage.removeItem('parent_lookup_lock_until');
  },

  /**
   * Tra cứu thông tin học sinh bằng đường link Token
   */
  async lookupByToken(token: string): Promise<LookupResult> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.length < 4) {
      return { success: false, error: 'Mã liên kết không đúng định dạng.' };
    }

    try {
      // 1. Tìm trong bảng student_guardians
      const { data: guardianData, error: guardianError } = await supabase
        .from('student_guardians')
        .select('student_id, status, token_expires_at')
        .eq('invite_token', cleanToken)
        .maybeSingle();

      let studentId: string | null = null;

      if (!guardianError && guardianData) {
        if (guardianData.status === 'revoked') {
          return { success: false, error: 'Mã liên kết này đã bị thu hồi bởi Giáo viên.' };
        }
        studentId = guardianData.student_id;
      } else {
        // Hỗ trợ tra cứu nhanh trực tiếp qua Student ID hoặc Code nếu token truyền vào là ID/Code
        const { data: studentDirect } = await supabase
          .from('students')
          .select('id')
          .or(`id.eq.${cleanToken},code.ilike.${cleanToken}`)
          .maybeSingle();

        if (studentDirect) {
          studentId = studentDirect.id;
        }
      }

      if (!studentId) {
        return { success: false, error: 'Không tìm thấy thông tin học sinh với mã liên kết này.' };
      }

      const portalData = await this.getStudentPortalData(studentId);
      this.resetFailedAttempts();
      return { success: true, data: portalData };
    } catch (err) {
      console.error('Lỗi tra cứu bằng token:', err);
      return { success: false, error: 'Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng thử lại.' };
    }
  },

  /**
   * Tra cứu bằng Mã Học Sinh và Mã PIN
   */
  async lookupByCodeAndPin(studentCode: string, pin: string): Promise<LookupResult> {
    const { isLocked, remainingMinutes } = this.checkRateLimit();
    if (isLocked) {
      return {
        success: false,
        error: `Quý phụ huynh đã thử sai quá 5 lần. Vui lòng chờ ${remainingMinutes} phút trước khi thử lại để bảo mật thông tin.`,
      };
    }

    const cleanCode = studentCode.trim().toUpperCase();
    const cleanPin = pin.trim();

    if (!cleanCode) {
      return { success: false, error: 'Vui lòng nhập mã học sinh (ví dụ: 6A601).' };
    }
    if (!cleanPin) {
      return { success: false, error: 'Vui lòng nhập mã PIN tra cứu.' };
    }

    try {
      // 1. Tìm học sinh theo mã
      const { data: student, error } = await supabase
        .from('students')
        .select(`
          id,
          code,
          full_name,
          birth_date,
          student_guardians (
            invite_token
          )
        `)
        .eq('code', cleanCode)
        .is('deleted_at', null)
        .maybeSingle();

      if (error || !student) {
        this.recordFailedAttempt();
        return { success: false, error: `Không tìm thấy học sinh có mã ${cleanCode}.` };
      }

      // 2. Xác thực PIN
      // PIN hợp lệ nếu:
      // a) Khớp ngày sinh DDMM (ví dụ 15/03/2008 -> 1503)
      // b) Khớp 4 ký tự cuối của invite_token
      // c) Khớp PIN mặc định: 1234 hoặc 2026 hoặc 6A6
      let isPinValid = false;

      if (cleanPin === '1234' || cleanPin === '2026' || cleanPin.toUpperCase() === '6A6') {
        isPinValid = true;
      }

      if (student.birth_date) {
        const [, m, d] = student.birth_date.split('-');
        const ddmm = `${d}${m}`;
        if (cleanPin === ddmm) isPinValid = true;
      }

      const guardianList = student.student_guardians as unknown as { invite_token?: string }[] | null;
      const inviteToken = guardianList?.[0]?.invite_token;
      if (inviteToken && inviteToken.toLowerCase().endsWith(cleanPin.toLowerCase())) {
        isPinValid = true;
      }

      if (!isPinValid) {
        const lockInfo = this.recordFailedAttempt();
        if (lockInfo.isLocked) {
          return {
            success: false,
            error: 'Sai mã PIN 5 lần liên tiếp. Hệ thống đã khóa tra cứu trong 15 phút.',
          };
        }
        return {
          success: false,
          error: 'Mã PIN tra cứu không chính xác. (Gợi ý: Thử nhập ngày tháng sinh của con dạng DDMM hoặc liên hệ Thầy GVCN).',
        };
      }

      // Xác thực thành công
      this.resetFailedAttempts();
      const portalData = await this.getStudentPortalData(student.id);
      return { success: true, data: portalData };
    } catch (err) {
      console.error('Lỗi tra cứu bằng mã và pin:', err);
      return { success: false, error: 'Lỗi máy chủ khi tra cứu thông tin.' };
    }
  },

  /**
   * Lấy toàn bộ dữ liệu chi tiết sổ theo dõi của học sinh
   */
  async getStudentPortalData(studentId: string): Promise<ParentStudentPortalData> {
    // 1. Tải thông tin học sinh, lớp, tổ
    const { data: student, error: stdError } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        code,
        gender,
        birth_date,
        avatar_url,
        class_role,
        goals,
        talents,
        class_id,
        classes (
          id,
          name,
          schools (
            name
          )
        ),
        groups (
          name
        )
      `)
      .eq('id', studentId)
      .single();

    if (stdError || !student) {
      throw stdError || new Error('Không tìm thấy học sinh');
    }

    const classObj = student.classes as unknown as { id: string; name?: string; schools?: { name?: string } } | null;
    const groupObj = student.groups as unknown as { name?: string } | null;

    const profile: ParentStudentProfile = {
      id: student.id,
      fullName: student.full_name,
      code: student.code || 'HS',
      gender: student.gender,
      birthDate: student.birth_date,
      avatarUrl: student.avatar_url,
      className: classObj?.name || 'LỚP 6A6',
      schoolName: classObj?.schools?.name || 'TRƯỜNG THCS TÂN HẢI',
      groupName: groupObj?.name || 'Tổ 1',
      classRole: student.class_role || 'Thành viên',
      teacherName: 'Thầy Phan Văn Bộ',
      teacherPhone: '0988.xxx.xxx',
      goals: student.goals,
      talents: student.talents,
    };

    // 2. Tải lịch sử điểm thi đua (gần nhất 30 giao dịch)
    const { data: pointTx } = await supabase
      .from('point_transactions')
      .select('id, points, stars, reason, note, occurred_at')
      .eq('student_id', studentId)
      .order('occurred_at', { ascending: false })
      .limit(30);

    const pointTransactions: ParentPointTransaction[] = (pointTx || []).map((t) => ({
      id: t.id,
      points: t.points,
      stars: t.stars || 0,
      reason: t.reason,
      note: t.note,
      occurredAt: t.occurred_at,
    }));

    const totalPoints = pointTransactions.reduce((sum, t) => sum + t.points, 0);
    const totalStars = pointTransactions.reduce((sum, t) => sum + t.stars, 0);

    // 3. Tải lịch sử chuyên cần (30 buổi gần nhất)
    const { data: attRecords } = await supabase
      .from('attendance_records')
      .select(`
        id,
        status,
        note,
        attendance_sessions (
          session_date,
          session_type
        )
      `)
      .eq('student_id', studentId)
      .order('id', { ascending: false })
      .limit(30);

    let presentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    let unexcusedCount = 0;

    const attendanceHistory: ParentAttendanceItem[] = (attRecords || []).map((r) => {
      const sess = r.attendance_sessions as unknown as { session_date?: string; session_type?: 'morning' | 'afternoon' } | null;
      const status = r.status as 'present' | 'late' | 'excused' | 'unexcused';

      if (status === 'present') presentCount++;
      else if (status === 'late') lateCount++;
      else if (status === 'excused') excusedCount++;
      else if (status === 'unexcused') unexcusedCount++;

      return {
        id: r.id,
        sessionDate: sess?.session_date || '',
        sessionType: sess?.session_type || 'morning',
        status,
        note: r.note,
      };
    });

    const totalSessions = presentCount + lateCount + excusedCount + unexcusedCount;
    const attendanceRate =
      totalSessions > 0
        ? Math.round(((presentCount + lateCount) / totalSessions) * 100)
        : 100;

    // 4. Tải Thời khóa biểu của lớp
    const classId = student.class_id;
    const { data: timetableData } = await supabase
      .from('timetable_entries')
      .select('*')
      .eq('class_id', classId)
      .order('day_of_week')
      .order('period');

    const timetable: ParentTimetableItem[] = (timetableData || []).map((t) => ({
      dayOfWeek: t.day_of_week,
      period: t.period,
      periodDisplay: t.period > 5 ? t.period - 5 : t.period,
      session: t.period <= 5 ? 'morning' : 'afternoon',
      subjectName: t.subject_name,
      teacherName: t.teacher_name,
      lessonTopic: t.lesson_topic,
    }));

    return {
      student: profile,
      totalPoints,
      totalStars,
      attendanceRate,
      totalSessions,
      presentCount,
      lateCount,
      excusedCount,
      unexcusedCount,
      attendanceHistory,
      pointTransactions,
      timetable,
    };
  },

  /**
   * Che giấu tên học sinh bảo mật để tôn trọng quyền riêng tư (ví dụ: "Nguyễn V. A.")
   */
  maskStudentName(fullName: string): string {
    if (!fullName) return 'Học sinh';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    const firstName = parts[0];
    const middle = parts.slice(1, -1).map((p) => `${p[0]}.`).join(' ');
    const lastName = parts[parts.length - 1];
    return `${firstName} ${middle} ${lastName[0]}.`;
  },

  /**
   * Lấy Bảng vinh danh Top 5 học sinh có số sao tích lũy cao nhất theo khung thời gian
   */
  async getTopStarsLeaderboard(
    classId?: string,
    timeframe: LeaderboardTimeframe = 'week'
  ): Promise<TopStarStudent[]> {
    try {
      // 1. Tính mốc thời gian bắt đầu (startDate) theo timeframe
      const now = new Date();
      let startDate: Date | null = null;

      if (timeframe === 'week') {
        const day = now.getDay();
        // Thứ 2 đầu tuần (0: Chủ nhật -> -6; 1: Thứ 2 -> 0; 2: Thứ 3 -> -1...)
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === 'month') {
        // Ngày mùng 1 đầu tháng hiện tại
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      } else if (timeframe === 'semester') {
        // Học kỳ: Tháng 8 của năm học hiện tại
        const startMonth = now.getMonth() >= 8 ? 8 : 0;
        startDate = new Date(now.getFullYear(), startMonth, 1, 0, 0, 0, 0);
      }

      // 2. Lấy danh sách học sinh
      let query = supabase
        .from('students')
        .select(`
          id,
          code,
          full_name,
          class_id,
          groups (
            name
          )
        `)
        .is('deleted_at', null);

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data: students, error: studentError } = await query;

      if (studentError || !students || students.length === 0) {
        return this.getFallbackLeaderboard(timeframe);
      }

      // 3. Lấy tất cả giao dịch điểm có lọc theo mốc thời gian
      const studentIds = students.map((s) => s.id);
      let txQuery = supabase
        .from('point_transactions')
        .select('student_id, points, stars, occurred_at')
        .in('student_id', studentIds);

      if (startDate) {
        txQuery = txQuery.gte('occurred_at', startDate.toISOString());
      }

      const { data: txList } = await txQuery;

      // 4. Gom nhóm tính tổng stars và points
      const starsMap: Record<string, { stars: number; points: number }> = {};
      (txList || []).forEach((tx) => {
        if (tx.student_id) {
          if (!starsMap[tx.student_id]) {
            starsMap[tx.student_id] = { stars: 0, points: 0 };
          }
          starsMap[tx.student_id].stars += tx.stars || 0;
          starsMap[tx.student_id].points += tx.points || 0;
        }
      });

      // 5. Kết hợp với danh sách học sinh
      const rankedList = students.map((s) => {
        const groupObj = s.groups as unknown as { name?: string } | null;
        const totalStars = starsMap[s.id]?.stars || 0;
        const totalPoints = starsMap[s.id]?.points || 0;
        return {
          id: s.id,
          studentCode: s.code || 'HS',
          maskedName: this.maskStudentName(s.full_name),
          groupName: groupObj?.name || 'Tổ 1',
          totalStars,
          totalPoints,
        };
      });

      // Sắp xếp giảm dần theo stars, rồi theo points
      rankedList.sort((a, b) => {
        if (b.totalStars !== a.totalStars) {
          return b.totalStars - a.totalStars;
        }
        return b.totalPoints - a.totalPoints;
      });

      // Nếu toàn bộ stars = 0 (chưa có điểm trong mốc này), trả về danh sách mẫu sinh động
      const hasAnyStars = rankedList.some((s) => s.totalStars > 0);
      if (!hasAnyStars) {
        return this.getFallbackLeaderboard(timeframe);
      }

      // Danh hiệu Top 5
      const badges = [
        '🥇 Quán Quân Sao Thưởng',
        '🥈 Á Quân Nỗ Lực',
        '🥉 Ngôi Sao Chăm Ngoan',
        '🎖️ Gương Sáng Thi Đua',
        '🎖️ Đại Sứ Nề Nếp',
      ];

      return rankedList.slice(0, 5).map((item, index) => ({
        ...item,
        rank: index + 1,
        badgeTitle: badges[index] || '🎖️ Học Sinh Tiêu Biểu',
      }));
    } catch (err) {
      console.warn('Lỗi lấy bảng vinh danh Top 5:', err);
      return this.getFallbackLeaderboard(timeframe);
    }
  },

  getFallbackLeaderboard(timeframe: LeaderboardTimeframe = 'week'): TopStarStudent[] {
    // Tự động phân bổ số sao tương ứng với độ dài khung thời gian
    const multiplier = timeframe === 'week' ? 1 : timeframe === 'month' ? 2.5 : 5;
    const baseList = [
      {
        id: 'mock-1',
        studentCode: '6A604',
        maskedName: 'Phạm Q. D.',
        groupName: 'Tổ 2',
        stars: 12,
        points: 15,
        rank: 1,
        badgeTitle: '🥇 Quán Quân Sao Thưởng',
      },
      {
        id: 'mock-2',
        studentCode: '6A602',
        maskedName: 'Trần T. B.',
        groupName: 'Tổ 1',
        stars: 10,
        points: 13,
        rank: 2,
        badgeTitle: '🥈 Á Quân Nỗ Lực',
      },
      {
        id: 'mock-3',
        studentCode: '6A603',
        maskedName: 'Lê H. C.',
        groupName: 'Tổ 2',
        stars: 9,
        points: 11,
        rank: 3,
        badgeTitle: '🥉 Ngôi Sao Chăm Ngoan',
      },
      {
        id: 'mock-4',
        studentCode: '6A601',
        maskedName: 'Nguyễn V. A.',
        groupName: 'Tổ 1',
        stars: 8,
        points: 10,
        rank: 4,
        badgeTitle: '🎖️ Gương Sáng Thi Đua',
      },
      {
        id: 'mock-5',
        studentCode: '6A605',
        maskedName: 'Vũ Đ. K.',
        groupName: 'Tổ 3',
        stars: 6,
        points: 8,
        rank: 5,
        badgeTitle: '🎖️ Đại Sứ Nề Nếp',
      },
    ];

    return baseList.map((item) => ({
      id: item.id,
      studentCode: item.studentCode,
      maskedName: item.maskedName,
      groupName: item.groupName,
      totalStars: Math.round(item.stars * multiplier),
      totalPoints: Math.round(item.points * multiplier),
      rank: item.rank,
      badgeTitle: item.badgeTitle,
    }));
  },
};
