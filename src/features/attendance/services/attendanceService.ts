import { supabase } from '../../../services/supabaseClient';
import { studentService } from '../../students/services/studentService';
import { CLASS_6A6_ID, DEFAULT_CLASS_6A6_STUDENTS, DEFAULT_GROUPS_6A6 } from '../../students/constants/defaultClass6A6Students';
import { sortVietnameseList } from '../../../utils/vietnameseNameSort';
import { sandboxService } from '../../sandbox/services/sandboxService';
import type {
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  SessionType,
  MonthlyAttendanceReport,
  StudentMonthlyAttendance,
  MonthlyGroupAttendance,
  DailyAttendanceTrend,
  AbsenceDetail,
  TopAbsenceReason,
  EpidemicAlert,
  EpidemicSickStudent,
} from '../../../types/attendance';

const isUuid = (str?: string | null): boolean =>
  !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Bộ nhớ đệm giữ Promise đang chạy để chống race condition khi React 18 mount đồng thời
const inFlightSessionPromises = new Map<string, Promise<AttendanceSession>>();

export const attendanceService = {
  /**
   * Lấy hoặc tự động khởi tạo phiên điểm danh theo ngày và buổi
   */
  async getOrCreateSession(
    classId: string,
    date: string,
    type: SessionType = 'morning'
  ): Promise<AttendanceSession> {
    const targetClassId = classId || CLASS_6A6_ID;

    const cacheKey = `${targetClassId}_${date}_${type}`;
    const existingPromise = inFlightSessionPromises.get(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }

    const sessionTask = (async (): Promise<AttendanceSession> => {
      if (sandboxService.isSandboxActive()) {
        const sessions = sandboxService.getAttendanceSessions();
        const existing = sessions.find((s) => s.sessionDate === date && s.sessionType === type);
        if (existing) {
          return existing;
        }
        const newSession: AttendanceSession = {
          id: `att-mock-session-${date}-${type}`,
          classId: targetClassId,
          sessionDate: date,
          sessionType: type,
          isLocked: false,
          createdBy: 'Thầy Phan Văn Bộ (GVCN)',
          createdAt: new Date().toISOString(),
        };
        return newSession;
      }

      // 1. Kiểm tra phiên đã có trên Supabase chưa
      try {
        const { data: existingSession, error: checkError } = await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('class_id', targetClassId)
          .eq('session_date', date)
          .eq('session_type', type)
          .maybeSingle();

        if (!checkError && existingSession) {
          await this.ensureAllStudentsHaveRecords(existingSession.id, targetClassId);
          return {
            id: existingSession.id,
            classId: existingSession.class_id,
            sessionDate: existingSession.session_date,
            sessionType: existingSession.session_type as SessionType,
            isLocked: existingSession.is_locked,
            createdBy: existingSession.created_by,
            createdAt: existingSession.created_at,
          };
        }
      } catch {
        // Supabase offline/error
      }

      // 2. Xác định userId hợp lệ (chỉ truyền UUID để tránh lỗi Postgres 22P02)
      let userId: string | undefined = undefined;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id && isUuid(user.id)) userId = user.id;
      } catch {
        // Không có Supabase session
      }

      // 3. Cố gắng tạo phiên mới trên Supabase
      try {
        const insertPayload: Record<string, unknown> = {
          class_id: targetClassId,
          session_date: date,
          session_type: type,
          is_locked: false,
        };
        if (userId) {
          insertPayload.created_by = userId;
        }

        const { data: newSession, error: createError } = await supabase
          .from('attendance_sessions')
          .insert(insertPayload)
          .select()
          .single();

        if (!createError && newSession) {
          await this.ensureAllStudentsHaveRecords(newSession.id, targetClassId);
          return {
            id: newSession.id,
            classId: newSession.class_id,
            sessionDate: newSession.session_date,
            sessionType: newSession.session_type as SessionType,
            isLocked: newSession.is_locked,
            createdBy: newSession.created_by,
            createdAt: newSession.created_at,
          };
        }

        // Nếu insert gặp lỗi (ví dụ: 409 Conflict hoặc race condition tạo phiên trùng), query lại ngay
        if (createError) {
          const { data: retrySession } = await supabase
            .from('attendance_sessions')
            .select('*')
            .eq('class_id', targetClassId)
            .eq('session_date', date)
            .eq('session_type', type)
            .maybeSingle();

          if (retrySession) {
            await this.ensureAllStudentsHaveRecords(retrySession.id, targetClassId);
            return {
              id: retrySession.id,
              classId: retrySession.class_id,
              sessionDate: retrySession.session_date,
              sessionType: retrySession.session_type as SessionType,
              isLocked: retrySession.is_locked,
              createdBy: retrySession.created_by,
              createdAt: retrySession.created_at,
            };
          }
        }
      } catch {
        // Cố gắng query lại phiên vừa tạo trước khi rơi vào local fallback
        try {
          const { data: retrySession } = await supabase
            .from('attendance_sessions')
            .select('*')
            .eq('class_id', targetClassId)
            .eq('session_date', date)
            .eq('session_type', type)
            .maybeSingle();

          if (retrySession) {
            await this.ensureAllStudentsHaveRecords(retrySession.id, targetClassId);
            return {
              id: retrySession.id,
              classId: retrySession.class_id,
              sessionDate: retrySession.session_date,
              sessionType: retrySession.session_type as SessionType,
              isLocked: retrySession.is_locked,
              createdBy: retrySession.created_by,
              createdAt: retrySession.created_at,
            };
          }
        } catch {
          // Supabase hoàn toàn offline
        }
      }

      // 4. Dự phòng phiên cục bộ (Local fallback) khi mất mạng
      const localSessionId = `session-${targetClassId}-${date}-${type}`;
      const localSession: AttendanceSession = {
        id: localSessionId,
        classId: targetClassId,
        sessionDate: date,
        sessionType: type,
        isLocked: false,
        createdBy: userId || '601dce7f-13e4-4680-b2f9-f86ed1a17079',
        createdAt: new Date().toISOString(),
      };
      await this.ensureAllStudentsHaveRecords(localSessionId, targetClassId);
      return localSession;
    })();

    inFlightSessionPromises.set(cacheKey, sessionTask);
    try {
      return await sessionTask;
    } finally {
      setTimeout(() => {
        inFlightSessionPromises.delete(cacheKey);
      }, 500);
    }
  },

  /**
   * Đảm bảo mọi học sinh trong lớp đều có bản ghi điểm danh trong phiên
   */
  async ensureAllStudentsHaveRecords(sessionId: string, classId: string) {
    const targetClassId = classId || CLASS_6A6_ID;
    const students = await studentService.getStudents(targetClassId);
    if (!students || students.length === 0) return;

    // 1. Thử lưu vào Supabase CHỈ KHI sessionId là UUID hợp lệ
    if (isUuid(sessionId)) {
      try {
        const { data: existingRecords } = await supabase
          .from('attendance_records')
          .select('student_id')
          .eq('session_id', sessionId);

        if (existingRecords) {
          const existingStudentIds = new Set(existingRecords.map((r) => r.student_id));
          const missingStudents = students.filter(
            (s) => !existingStudentIds.has(s.id) && isUuid(s.id)
          );

          if (missingStudents.length > 0) {
            const recordsToInsert = missingStudents.map((s) => ({
              session_id: sessionId,
              student_id: s.id,
              status: 'present',
            }));
            await supabase.from('attendance_records').insert(recordsToInsert);
          }
        }
      } catch {
        // Supabase offline
      }
    }

    // 2. Đảm bảo lưu đầy đủ vào localStorage
    const cacheKey = `gvcn_attendance_records_${sessionId}`;
    const cachedStr = localStorage.getItem(cacheKey);
    if (!cachedStr) {
      const defaultRecords: AttendanceRecord[] = students.map((s) => ({
        id: `rec-${sessionId}-${s.id}`,
        sessionId,
        studentId: s.id,
        studentName: s.fullName,
        gender: s.gender,
        classRole: s.classRole || 'Thành viên',
        groupName: s.groupName || 'Tổ 1',
        status: 'present',
        note: null,
        updatedAt: new Date().toISOString(),
      }));
      localStorage.setItem(cacheKey, JSON.stringify(defaultRecords));
    }
  },

  /**
   * Lấy danh sách điểm danh chi tiết của phiên (kèm họ tên học sinh, tổ)
   */
  async getSessionRecords(sessionId: string, classId?: string): Promise<AttendanceRecord[]> {
    const targetClassId = classId || CLASS_6A6_ID;
    if (sandboxService.isSandboxActive()) {
      const records = sandboxService.getAttendanceRecords(sessionId);
      if (records.length > 0) {
        return sortVietnameseList(records, (r) => r.studentName);
      }
    }
    let dbRecords: AttendanceRecord[] = [];

    // Chỉ truy vấn Supabase nếu sessionId là UUID hợp lệ
    if (isUuid(sessionId)) {
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .select(`
            id,
            session_id,
            student_id,
            status,
            note,
            updated_at,
            student:student_id (
              id,
              full_name,
              gender,
              class_role,
              group:group_id (
                name
              )
            )
          `)
          .eq('session_id', sessionId);

        if (!error && data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dbRecords = data.map((item: any) => ({
            id: item.id,
            sessionId: item.session_id,
            studentId: item.student_id,
            studentName: item.student?.full_name || 'Học sinh',
            gender: item.student?.gender || 'Nam',
            classRole: item.student?.class_role || 'Thành viên',
            groupName: item.student?.group?.name || 'Chưa chia tổ',
            status: item.status as AttendanceStatus,
            note: item.note,
            updatedAt: item.updated_at,
          }));
        }
      } catch {
        // Supabase offline
      }
    }

    if (dbRecords.length > 0) {
      return sortVietnameseList(dbRecords, (r) => r.studentName);
    }

    // 2. Kiểm tra bộ nhớ tạm localStorage
    const cacheKey = `gvcn_attendance_records_${sessionId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sortVietnameseList(parsed, (r) => r.studentName);
        }
      }
    } catch {
      // Bỏ qua lỗi parse
    }

    // 3. Luôn luôn khởi tạo đủ 47 học sinh thật của lớp 6A6
    const students = await studentService.getStudents(targetClassId);
    const initialRecords: AttendanceRecord[] = students.map((s) => ({
      id: `rec-${sessionId}-${s.id}`,
      sessionId,
      studentId: s.id,
      studentName: s.fullName,
      gender: s.gender,
      classRole: s.classRole || 'Thành viên',
      groupName: s.groupName || 'Tổ 1',
      status: 'present',
      note: null,
      updatedAt: new Date().toISOString(),
    }));

    const sortedInitial = sortVietnameseList(initialRecords, (r) => r.studentName);

    try {
      localStorage.setItem(cacheKey, JSON.stringify(sortedInitial));
    } catch {
      // Bỏ qua lỗi lưu
    }

    return sortedInitial;
  },

  /**
   * Cập nhật trạng thái điểm danh cho 1 học sinh
   */
  async updateRecordStatus(recordId: string, status: AttendanceStatus, note?: string) {
    if (sandboxService.isSandboxActive()) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('gvcn_attendance_records_') || key === 'gvcn_sandbox_att_records')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const next = parsed.map((item: AttendanceRecord) =>
                  item.id === recordId ? { ...item, status, note: note !== undefined ? note : item.note, updatedAt: new Date().toISOString() } : item
                );
                localStorage.setItem(key, JSON.stringify(next));
              } else if (typeof parsed === 'object') {
                Object.keys(parsed).forEach((sId) => {
                  if (Array.isArray(parsed[sId])) {
                    parsed[sId] = parsed[sId].map((item: AttendanceRecord) =>
                      item.id === recordId ? { ...item, status, note: note !== undefined ? note : item.note, updatedAt: new Date().toISOString() } : item
                    );
                  }
                });
                localStorage.setItem(key, JSON.stringify(parsed));
              }
            }
          }
        }
      } catch (e) {
        console.warn('Lỗi cập nhật điểm danh sandbox:', e);
      }
      return;
    }

    if (isUuid(recordId)) {
      try {
        let userUuid: string | null = null;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id && isUuid(user.id)) userUuid = user.id;
        } catch {
          // Ignored
        }

        await supabase
          .from('attendance_records')
          .update({
            status,
            note: note !== undefined ? note : null,
            updated_by: userUuid,
            updated_at: new Date().toISOString(),
          })
          .eq('id', recordId);
      } catch {
        // Supabase offline
      }
    }

    // Đồng bộ localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('gvcn_attendance_records_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              let changed = false;
              const nextList = list.map((item: AttendanceRecord) => {
                if (item.id === recordId) {
                  changed = true;
                  return {
                    ...item,
                    status,
                    note: note !== undefined ? note : item.note,
                    updatedAt: new Date().toISOString(),
                  };
                }
                return item;
              });
              if (changed) {
                localStorage.setItem(key, JSON.stringify(nextList));
                break;
              }
            }
          }
        }
      }
    } catch {
      // Bỏ qua lỗi lưu
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gvcn:attendance-changed', {
        detail: { recordId, status, note }
      }));
    }
  },

  /**
   * Điểm danh nhanh 1 chạm: Đánh dấu tất cả học sinh trong phiên là "Có mặt"
   */
  async markAllPresent(sessionId: string) {
    if (isUuid(sessionId)) {
      try {
        let userUuid: string | null = null;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id && isUuid(user.id)) userUuid = user.id;
        } catch {
          // Ignored
        }

        await supabase
          .from('attendance_records')
          .update({
            status: 'present',
            updated_by: userUuid,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId);
      } catch {
        // Supabase offline
      }
    }

    // Đồng bộ localStorage
    try {
      const cacheKey = `gvcn_attendance_records_${sessionId}`;
      let raw = localStorage.getItem(cacheKey);
      if (!raw) {
        await this.getSessionRecords(sessionId, CLASS_6A6_ID);
        raw = localStorage.getItem(cacheKey);
      }
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const updated = list.map((item: AttendanceRecord) => ({
            ...item,
            status: 'present' as AttendanceStatus,
            updatedAt: new Date().toISOString(),
          }));
          localStorage.setItem(cacheKey, JSON.stringify(updated));
        }
      }
    } catch {
      // Bỏ qua lỗi lưu
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gvcn:attendance-changed', {
        detail: { sessionId, action: 'markAllPresent' }
      }));
    }
  },

  /**
   * Điểm danh nhanh theo Tổ: Đánh dấu tất cả học sinh trong Tổ sang trạng thái chỉ định
   * (Ví dụ: Cả Tổ 1 có mặt, hoặc Cả Tổ 2 vắng có phép đi trực tuần/văn nghệ...)
   */
  async markGroupStatus(
    sessionId: string,
    groupName: string,
    status: AttendanceStatus,
    note?: string | null
  ) {
    if (isUuid(sessionId)) {
      try {
        let userUuid: string | null = null;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id && isUuid(user.id)) userUuid = user.id;
        } catch {
          // Ignored
        }

        const payload: Record<string, unknown> = {
          status,
          updated_by: userUuid,
          updated_at: new Date().toISOString(),
        };
        if (note !== undefined) {
          payload.note = note;
        }

        // Lấy danh sách ID học sinh trong tổ để cập nhật chính xác theo student_id
        const students = await studentService.getStudents(CLASS_6A6_ID);
        const groupStudentIds = students
          .filter((s) => s.groupName === groupName && isUuid(s.id))
          .map((s) => s.id);

        if (groupStudentIds.length > 0) {
          await supabase
            .from('attendance_records')
            .update(payload)
            .eq('session_id', sessionId)
            .in('student_id', groupStudentIds);
        }
      } catch {
        // Supabase offline
      }
    }

    // Đồng bộ localStorage
    try {
      const cacheKey = `gvcn_attendance_records_${sessionId}`;
      let raw = localStorage.getItem(cacheKey);
      if (!raw) {
        await this.getSessionRecords(sessionId, CLASS_6A6_ID);
        raw = localStorage.getItem(cacheKey);
      }
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const updated = list.map((item: AttendanceRecord) => {
            if (item.groupName === groupName) {
              return {
                ...item,
                status,
                note: note !== undefined ? note : (status === 'present' ? null : item.note),
                updatedAt: new Date().toISOString(),
              };
            }
            return item;
          });
          localStorage.setItem(cacheKey, JSON.stringify(updated));
        }
      }
    } catch {
      // Bỏ qua lỗi lưu
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gvcn:attendance-changed', {
        detail: { sessionId, groupName, status }
      }));
    }
  },

  /**
   * Hoàn tác (Undo) trạng thái cũ của danh sách học sinh (dùng khi bấm nhầm điểm danh theo tổ)
   */
  async restoreGroupRecords(
    sessionId: string,
    recordsToRestore: Array<{ id: string; status: AttendanceStatus; note?: string | null }>
  ) {
    // 1. Cập nhật Supabase đồng thời song song nếu là UUID hợp lệ
    const validUuidRecords = recordsToRestore.filter((r) => isUuid(r.id));
    if (validUuidRecords.length > 0 && isUuid(sessionId)) {
      try {
        let userUuid: string | null = null;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id && isUuid(user.id)) userUuid = user.id;
        } catch {
          // Ignored
        }

        await Promise.all(
          validUuidRecords.map((r) =>
            supabase
              .from('attendance_records')
              .update({
                status: r.status,
                note: r.note !== undefined ? r.note : null,
                updated_by: userUuid,
                updated_at: new Date().toISOString(),
              })
              .eq('id', r.id)
          )
        );
      } catch {
        // Supabase offline
      }
    }

    // 2. Cập nhật localStorage
    try {
      const cacheKey = `gvcn_attendance_records_${sessionId}`;
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const map = new Map(recordsToRestore.map((r) => [r.id, r]));
          const updated = list.map((item: AttendanceRecord) => {
            const prevRec = map.get(item.id);
            if (prevRec) {
              return {
                ...item,
                status: prevRec.status,
                note: prevRec.note !== undefined ? prevRec.note : item.note,
                updatedAt: new Date().toISOString(),
              };
            }
            return item;
          });
          localStorage.setItem(cacheKey, JSON.stringify(updated));
        }
      }
    } catch {
      // Bỏ qua lỗi lưu
    }
  },

  /**
   * Khóa hoặc mở khóa phiên điểm danh
   */
  async toggleLockSession(sessionId: string, isLocked: boolean) {
    try {
      await supabase
        .from('attendance_sessions')
        .update({ is_locked: isLocked })
        .eq('id', sessionId);
    } catch {
      // Supabase offline
    }
    return { id: sessionId, isLocked };
  },

  /**
   * Đăng ký lắng nghe sự kiện Realtime WebSockets cho phiên điểm danh
   */
  subscribeToAttendance(
    sessionId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRecordChange: (payload: any) => void
  ) {
    const channelName = `realtime-attendance-${sessionId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          onRecordChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Tổng hợp báo cáo và thống kê chuyên cần theo tháng cho 4 Tổ và 47 học sinh
   */
  async getMonthlyAttendanceReport(
    classId: string,
    year: number,
    month: number
  ): Promise<MonthlyAttendanceReport> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // 1. Lấy toàn bộ học sinh và tổ trong lớp
    const targetClassId = classId || CLASS_6A6_ID;
    let students = await studentService.getStudents(targetClassId);
    let groups = await studentService.getGroups(targetClassId);

    if (!students || students.length === 0) {
      students = DEFAULT_CLASS_6A6_STUDENTS;
    }
    if (!groups || groups.length === 0) {
      groups = DEFAULT_GROUPS_6A6;
    }

    const groupMap = new Map<string, { id: string; name: string; colorClass: string }>();
    groups.forEach((g) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const color = (g as any).colorClass || (g as any).color_class || 'text-slate-500';
      groupMap.set(g.id, { id: g.id, name: g.name, colorClass: color });
    });

    // 2. Lấy các phiên điểm danh trong tháng
    const { data: sessions } = await supabase
      .from('attendance_sessions')
      .select('id, session_date, session_type')
      .eq('class_id', classId)
      .gte('session_date', startDate)
      .lte('session_date', endDate)
      .order('session_date', { ascending: true });

    const validSessions = sessions || [];
    const totalSessions = validSessions.length;
    const sessionIds = validSessions.map((s) => s.id);

    // 3. Lấy tất cả bản ghi điểm danh thuộc các phiên trong tháng
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let records: any[] = [];
    if (sessionIds.length > 0) {
      const { data: recs } = await supabase
        .from('attendance_records')
        .select('session_id, student_id, status, note')
        .in('session_id', sessionIds);
      records = recs || [];
    }

    // 4. Gom nhóm theo từng học sinh
    const studentRecordsMap = new Map<
      string,
      {
        present: number;
        late: number;
        excused: number;
        unexcused: number;
        absenceDetails: AbsenceDetail[];
      }
    >();
    students.forEach((s) => {
      studentRecordsMap.set(s.id, {
        present: 0,
        late: 0,
        excused: 0,
        unexcused: 0,
        absenceDetails: [],
      });
    });

    // Gom nhóm theo từng phiên để vẽ biểu đồ xu hướng ngày
    const sessionMap = new Map<string, { date: string; sessionType: SessionType; present: number; late: number; absent: number }>();
    validSessions.forEach((ses) => {
      sessionMap.set(ses.id, {
        date: ses.session_date,
        sessionType: ses.session_type as SessionType,
        present: 0,
        late: 0,
        absent: 0,
      });
    });

    // Duyệt qua tất cả bản ghi để tính số liệu
    records.forEach((r) => {
      const st = studentRecordsMap.get(r.student_id);
      const ses = sessionMap.get(r.session_id);

      if (st) {
        if (r.status === 'present') {
          st.present++;
        } else {
          if (r.status === 'late') st.late++;
          else if (r.status === 'excused_absence') st.excused++;
          else if (r.status === 'unexcused_absence') st.unexcused++;

          if (ses) {
            st.absenceDetails.push({
              date: ses.date,
              sessionType: ses.sessionType,
              status: r.status,
              reason: r.note || (r.status === 'excused_absence' ? 'Có phép' : r.status === 'late' ? 'Đi muộn' : 'Không phép'),
              note: r.note,
            });
          }
        }
      }

      if (ses) {
        if (r.status === 'present') ses.present++;
        else if (r.status === 'late') ses.late++;
        else ses.absent++;
      }
    });

    // 5. Tính toán chi tiết cho từng học sinh
    const studentSummaries: StudentMonthlyAttendance[] = students.map((s) => {
      const st = studentRecordsMap.get(s.id) || {
        present: 0,
        late: 0,
        excused: 0,
        unexcused: 0,
        absenceDetails: [],
      };
      const grp = s.groupId ? groupMap.get(s.groupId) : null;
      const rate = totalSessions === 0 ? 100 : Math.round(((st.present + st.late) / totalSessions) * 100);

      return {
        studentId: s.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fullName: (s as any).fullName || (s as any).full_name || 'Học sinh',
        gender: s.gender,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        groupName: (s as any).groupName || grp?.name || 'Chưa chia tổ',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        classRole: (s as any).classRole || (s as any).class_role || 'Thành viên',
        presentCount: st.present,
        lateCount: st.late,
        excusedCount: st.excused,
        unexcusedCount: st.unexcused,
        totalSessions,
        attendanceRate: rate,
        absenceDetails: st.absenceDetails,
      };
    });

    // 6. Tính toán thống kê theo 4 Tổ
    const groupStats: MonthlyGroupAttendance[] = groups.map((g) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groupStudents = students.filter((s: any) => s.groupId === g.id || s.group_id === g.id || s.groupName === g.name);
      const memberCount = groupStudents.length;

      let presentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;
      let unexcusedCount = 0;

      groupStudents.forEach((s) => {
        const st = studentRecordsMap.get(s.id);
        if (st) {
          presentCount += st.present;
          lateCount += st.late;
          excusedCount += st.excused;
          unexcusedCount += st.unexcused;
        }
      });

      const totalSlots = memberCount * totalSessions;
      const attendanceRate = totalSlots === 0 ? 100 : Math.round(((presentCount + lateCount) / totalSlots) * 100);

      return {
        groupId: g.id,
        groupName: g.name,
        colorClass: g.colorClass,
        memberCount,
        presentCount,
        lateCount,
        excusedCount,
        unexcusedCount,
        attendanceRate,
        rank: 1,
      };
    });

    // Xếp hạng các tổ theo tỷ lệ chuyên cần
    groupStats.sort((a, b) => b.attendanceRate - a.attendanceRate);
    groupStats.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    // 7. Biểu đồ xu hướng ngày
    const dailyTrends: DailyAttendanceTrend[] = Array.from(sessionMap.values()).map((ses) => {
      const totalInDay = ses.present + ses.late + ses.absent;
      const rate = totalInDay === 0 ? 100 : Math.round(((ses.present + ses.late) / totalInDay) * 100);
      return {
        date: ses.date,
        sessionType: ses.sessionType,
        presentCount: ses.present,
        lateCount: ses.late,
        absentCount: ses.absent,
        attendanceRate: rate,
      };
    });

    // 8. Lọc học sinh cần lưu ý (Nghỉ không phép >= 1 hoặc tổng nghỉ/muộn >= 2)
    const atRiskStudents = sortVietnameseList(
      studentSummaries.filter((s) => s.unexcusedCount >= 1 || s.excusedCount + s.lateCount >= 2),
      (s) => s.fullName
    );

    // 9. Tổng hợp cơ cấu lý do vắng mặt
    const reasonCounts: Record<string, number> = {};
    let totalAbsencesWithReason = 0;

    studentSummaries.forEach((s) => {
      s.absenceDetails.forEach((d) => {
        totalAbsencesWithReason++;
        const rKey = d.reason.replace(/^[^\w\s\u00C0-\u1EF9]+/u, '').trim() || d.reason;
        reasonCounts[rKey] = (reasonCounts[rKey] || 0) + 1;
      });
    });

    const topAbsenceReasons: TopAbsenceReason[] = Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalAbsencesWithReason === 0 ? 0 : Math.round((count / totalAbsencesWithReason) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 10. Tổng hợp toàn lớp
    let totalPresent = 0;
    let totalLate = 0;
    let totalExcused = 0;
    let totalUnexcused = 0;

    studentSummaries.forEach((s) => {
      totalPresent += s.presentCount;
      totalLate += s.lateCount;
      totalExcused += s.excusedCount;
      totalUnexcused += s.unexcusedCount;
    });

    const totalPossibleSlots = students.length * totalSessions;
    const overallRate = totalPossibleSlots === 0 ? 100 : Math.round(((totalPresent + totalLate) / totalPossibleSlots) * 100);

    return {
      classId,
      year,
      month,
      totalSessions,
      totalStudents: students.length,
      overallRate,
      totalPresent,
      totalLate,
      totalExcused,
      totalUnexcused,
      groupStats,
      dailyTrends,
      studentSummaries: sortVietnameseList(studentSummaries, (s) => s.fullName),
      atRiskStudents,
      topAbsenceReasons,
    };
  },

  /**
   * Cập nhật nhanh ghi chú chuyên cần cho 1 học sinh
   */
  async updateRecordNote(recordId: string, note: string | null) {
    if (!isUuid(recordId)) {
      return null;
    }

    let userUuid: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id && isUuid(user.id)) userUuid = user.id;
    } catch {
      // Ignored
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        note: note !== undefined ? note : null,
        updated_by: userUuid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Quét và phát hiện cảnh báo dịch bệnh theo mùa trong khung 7 ngày gần nhất
   */
  async checkEpidemicAlert(
    classId: string,
    referenceDate: string
  ): Promise<EpidemicAlert> {
    const ref = new Date(referenceDate);
    const start = new Date(ref);
    start.setDate(start.getDate() - 6);
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = referenceDate;

    const defaultAlert: EpidemicAlert = {
      level: 'none',
      sickStudentCount: 0,
      threshold: { warning: 3, critical: 4 },
      windowDays: 7,
      startDate: startDateStr,
      endDate: endDateStr,
      sickStudents: [],
      dominantSymptoms: [],
    };

    try {
      // 1. Lấy tất cả phiên điểm danh trong 7 ngày
      const { data: sessions, error: sesError } = await supabase
        .from('attendance_sessions')
        .select('id, session_date, session_type')
        .eq('class_id', classId)
        .gte('session_date', startDateStr)
        .lte('session_date', endDateStr);

      if (sesError || !sessions || sessions.length === 0) {
        return defaultAlert;
      }

      const sessionIds = sessions.map((s) => s.id);
      const sessionDateMap = new Map(sessions.map((s) => [s.id, s.session_date]));

      // 2. Lấy các bản ghi điểm danh vắng/muộn
      const { data: records, error: recError } = await supabase
        .from('attendance_records')
        .select('id, session_id, student_id, status, note')
        .in('session_id', sessionIds)
        .in('status', ['excused_absence', 'unexcused_absence', 'late']);

      if (recError || !records || records.length === 0) {
        return defaultAlert;
      }

      // 3. Lấy thông tin học sinh
      const targetClassId = classId || CLASS_6A6_ID;
      const students = await studentService.getStudents(targetClassId);
      const studentMap = new Map(
        students.map((s) => [s.id, { id: s.id, full_name: s.fullName, group_name: s.groupName }])
      );

      // 4. Lọc các bản ghi liên quan đến ốm/sốt/bệnh dịch
      const sickKeywords = [
        'ốm', 'sốt', 'cảm', 'cúm', 'khám', 'viện',
        'đau mắt', 'thủy đậu', 'ho', 'mệt', 'tiêu chảy',
        'nôn', 'bệnh', 'nhiễm', 'dịch', 'fever', 'flu'
      ];

      // Gom nhóm theo học sinh (Deduplication - mỗi em chỉ tính 1 ca)
      const studentSickMap = new Map<
        string,
        {
          studentName: string;
          groupName: string;
          dates: Set<string>;
          reasons: Set<string>;
        }
      >();

      const symptomCounter: Record<string, number> = {};

      records.forEach((r) => {
        if (!r.note) return;
        const noteLower = r.note.toLowerCase();
        const isSick =
          sickKeywords.some((kw) => noteLower.includes(kw)) ||
          r.note.includes('🤒') ||
          r.note.includes('🏥');

        if (isSick) {
          const student = studentMap.get(r.student_id);
          const studentName = student?.full_name || 'Học sinh';
          const groupName = student?.group_name || 'Tổ —';
          const dateStr = sessionDateMap.get(r.session_id) || startDateStr;

          if (!studentSickMap.has(r.student_id)) {
            studentSickMap.set(r.student_id, {
              studentName,
              groupName,
              dates: new Set(),
              reasons: new Set(),
            });
          }

          const entry = studentSickMap.get(r.student_id)!;
          entry.dates.add(dateStr);
          entry.reasons.add(r.note);

          // Phân loại triệu chứng
          let categorized = 'Ốm sốt / Cảm cúm';
          if (noteLower.includes('khám') || noteLower.includes('viện') || r.note.includes('🏥')) {
            categorized = 'Khám bệnh / Nằm viện';
          } else if (noteLower.includes('đau mắt')) {
            categorized = 'Đau mắt đỏ';
          } else if (noteLower.includes('thủy đậu')) {
            categorized = 'Thủy đậu';
          } else if (noteLower.includes('tiêu chảy') || noteLower.includes('nôn')) {
            categorized = 'Rối loạn tiêu hóa';
          }

          symptomCounter[categorized] = (symptomCounter[categorized] || 0) + 1;
        }
      });

      const sickStudents: EpidemicSickStudent[] = Array.from(studentSickMap.entries()).map(
        ([studentId, info]) => ({
          studentId,
          studentName: info.studentName,
          groupName: info.groupName,
          dates: Array.from(info.dates).sort(),
          reasons: Array.from(info.reasons),
        })
      );

      const sickStudentCount = sickStudents.length;

      const level: 'none' | 'warning' | 'critical' =
        sickStudentCount >= 4 ? 'critical' : sickStudentCount >= 3 ? 'warning' : 'none';

      const dominantSymptoms = Object.entries(symptomCounter)
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((a, b) => b.count - a.count);

      return {
        level,
        sickStudentCount,
        threshold: { warning: 3, critical: 4 },
        windowDays: 7,
        startDate: startDateStr,
        endDate: endDateStr,
        sickStudents,
        dominantSymptoms,
      };
    } catch (err) {
      console.error('Lỗi kiểm tra cảnh báo dịch bệnh:', err);
      return defaultAlert;
    }
  },

  /**
   * Lấy số liệu điểm danh theo thời gian thực đồng bộ theo từng tiết học / buổi học riêng biệt
   * Hỗ trợ trường hợp học sinh có mặt buổi sáng nhưng xin về sớm buổi chiều (hoặc nghỉ từ tiết cụ thể)
   */
  async getTodayClassAttendanceStats(
    classId: string,
    dateStr?: string,
    period?: number | null,
    forcedSessionType?: SessionType
  ): Promise<{
    total: number;
    present: number;
    absent: number;
    excused: number;
    unexcused: number;
    sessionType: SessionType;
    sessionName: string;
    absentStudents: Array<{ id: string; name: string; reason?: string }>;
  }> {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const targetClassId = classId || CLASS_6A6_ID;

    // Xác định buổi học (Sáng vs Chiều):
    // Tiết 1..5: Sáng; Tiết 6..8: Chiều
    let sessionType: SessionType = forcedSessionType || 'morning';
    if (!forcedSessionType) {
      if (period !== undefined && period !== null) {
        sessionType = period > 5 ? 'afternoon' : 'morning';
      } else {
        const currentHour = new Date().getHours();
        sessionType = currentHour >= 12 ? 'afternoon' : 'morning';
      }
    }

    const sessionName = sessionType === 'morning' ? 'Sáng' : 'Chiều';

    try {
      const session = await this.getOrCreateSession(targetClassId, today, sessionType);
      const records = await this.getSessionRecords(session.id, targetClassId);

      if (records && records.length > 0) {
        const total = records.length;

        // Lọc các học sinh vắng trong phiên này
        const absentRecs = records.filter(
          (r) => r.status === 'excused_absence' || r.status === 'unexcused_absence'
        );

        // Kiểm tra xem trong buổi học hiện tại, có em nào có ghi chú xin về sớm từ tiết này không
        // Ví dụ: trong phiên sáng nhưng có ghi chú "về sớm từ tiết 4", và hiện tại period >= 4
        const additionalEarlyLeaveRecs = period
          ? records.filter((r) => {
              if (r.status === 'present' && r.note) {
                const noteLower = r.note.toLowerCase();
                const match = noteLower.match(/(?:về sớm|nghỉ|vắng)\s+từ\s+tiết\s+(\d+)/i);
                if (match && match[1]) {
                  const leavePeriod = parseInt(match[1], 10);
                  return period >= leavePeriod;
                }
              }
              return false;
            })
          : [];

        const allAbsentIds = new Set([
          ...absentRecs.map((r) => r.id),
          ...additionalEarlyLeaveRecs.map((r) => r.id),
        ]);

        const excused =
          records.filter((r) => allAbsentIds.has(r.id) && r.status === 'excused_absence').length +
          additionalEarlyLeaveRecs.length;
        const unexcused = records.filter(
          (r) => allAbsentIds.has(r.id) && r.status === 'unexcused_absence'
        ).length;
        const absent = allAbsentIds.size;
        const present = Math.max(0, total - absent);

        const absentStudentsMap = new Map<string, { id: string; name: string; reason?: string }>();
        absentRecs.forEach((r) => {
          absentStudentsMap.set(r.studentId, {
            id: r.studentId,
            name: r.studentName,
            reason: r.note || (r.status === 'excused_absence' ? 'Có phép' : 'Không phép'),
          });
        });
        additionalEarlyLeaveRecs.forEach((r) => {
          if (!absentStudentsMap.has(r.studentId)) {
            absentStudentsMap.set(r.studentId, {
              id: r.studentId,
              name: r.studentName,
              reason: r.note || 'Xin về sớm',
            });
          }
        });
        const absentStudents = Array.from(absentStudentsMap.values());

        return {
          total,
          present,
          absent,
          excused,
          unexcused,
          sessionType,
          sessionName,
          absentStudents,
        };
      }
    } catch (err) {
      console.warn('Lỗi lấy thống kê điểm danh hôm nay:', err);
    }

    // Dự phòng (Fallback): Lấy tổng số học sinh của lớp thực tế
    try {
      const students = await studentService.getStudents(targetClassId);
      const total = students.length > 0 ? students.length : 47;
      return {
        total,
        present: total,
        absent: 0,
        excused: 0,
        unexcused: 0,
        sessionType,
        sessionName,
        absentStudents: [],
      };
    } catch {
      return {
        total: 47,
        present: 47,
        absent: 0,
        excused: 0,
        unexcused: 0,
        sessionType,
        sessionName,
        absentStudents: [],
      };
    }
  },

  /**
   * Ghi nhận vắng nhanh / về sớm từ 1 tiết cụ thể trực tiếp từ Bảng lớp học
   */
  async quickRecordAbsence(options: {
    classId: string;
    studentId: string;
    startPeriod: number;
    reason: string;
    sessionType?: SessionType;
    dateStr?: string;
  }): Promise<boolean> {
    const { classId, studentId, startPeriod, reason, sessionType, dateStr } = options;
    const targetClassId = classId || CLASS_6A6_ID;
    const today = dateStr || new Date().toISOString().split('T')[0];
    const sessType = sessionType || (startPeriod > 5 ? 'afternoon' : 'morning');

    try {
      const session = await this.getOrCreateSession(targetClassId, today, sessType);
      const records = await this.getSessionRecords(session.id, targetClassId);
      const targetRecord = records.find((r) => r.studentId === studentId);

      if (!targetRecord) {
        console.warn('Không tìm thấy bản ghi điểm danh cho học sinh:', studentId);
        return false;
      }

      // Nếu vắng từ tiết đầu tiên của buổi: Đánh dấu vắng có phép ngay
      // Nếu vắng từ các tiết sau: Vẫn giữ 'present' cho các tiết trước, ghi chú "Xin về sớm từ tiết X: [Lý do]"
      const isFirstPeriodOfSession = sessType === 'morning' ? startPeriod <= 1 : startPeriod <= 6;
      const status: AttendanceStatus = isFirstPeriodOfSession ? 'excused_absence' : 'present';
      const note = isFirstPeriodOfSession
        ? reason
        : `Xin về sớm từ tiết ${startPeriod}: ${reason}`;

      await this.updateRecordStatus(targetRecord.id, status, note);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gvcn:attendance-changed'));
      }
      return true;
    } catch (err) {
      console.error('Lỗi ghi nhận vắng nhanh:', err);
      return false;
    }
  },

  /**
   * Hủy ghi nhận vắng / Cho học sinh quay trở lại lớp học
   */
  async cancelQuickAbsence(options: {
    classId: string;
    studentId: string;
    sessionType?: SessionType;
    dateStr?: string;
  }): Promise<boolean> {
    const { classId, studentId, sessionType, dateStr } = options;
    const targetClassId = classId || CLASS_6A6_ID;
    const today = dateStr || new Date().toISOString().split('T')[0];
    const sessType = sessionType || 'morning';

    try {
      const session = await this.getOrCreateSession(targetClassId, today, sessType);
      const records = await this.getSessionRecords(session.id, targetClassId);
      const targetRecord = records.find((r) => r.studentId === studentId);

      if (!targetRecord) {
        console.warn('Không tìm thấy bản ghi điểm danh để phục hồi:', studentId);
        return false;
      }

      await this.updateRecordStatus(targetRecord.id, 'present', '');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gvcn:attendance-changed'));
      }
      return true;
    } catch (err) {
      console.error('Lỗi hủy vắng:', err);
      return false;
    }
  },
};
