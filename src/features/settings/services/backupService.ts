import { supabase } from '../../../services/supabaseClient';
import { studentService } from '../../students/services/studentService';
import { seatingService } from '../../seating/services/seatingService';
import { classConfigService } from './classConfigService';
import { classBackupSchema } from '../schemas/backupSchema';
import type { ClassConfigFormData } from '../schemas/classConfigSchema';
import type {
  ClassBackupPayload,
  BackupResult,
  ValidateBackupResult,
  RestoreResult,
  SelectiveRestoreOptions,
} from '../types/backupTypes';

export * from '../types/backupTypes';

export const backupService = {
  /**
   * Gom toàn bộ dữ liệu lớp học thành một cấu trúc ClassBackupPayload duy nhất
   */
  async collectClassBackupPayload(
    classId: string,
    fallbackClassName = 'LỚP 6A6',
    fallbackSchoolName = 'TRƯỜNG THCS TÂN HẢI'
  ): Promise<ClassBackupPayload> {
    const classConfig = await classConfigService.getClassConfig(classId);
    const className = classConfig.name || fallbackClassName;
    const schoolName = classConfig.schoolName || fallbackSchoolName;

    let students: unknown[] = [];
    let groups: unknown[] = [];
    try {
      const [fetchedStudents, fetchedGroups] = await Promise.all([
        studentService.getStudents(classId),
        studentService.getGroups(classId),
      ]);
      students = fetchedStudents;
      groups = fetchedGroups;
    } catch (err) {
      console.warn('Lỗi tải danh sách học sinh:', err);
    }

    let layout: unknown = null;
    let assignments: unknown[] = [];
    let rotationConfig = { rotationEnabled: false, schoolYearStartDate: '2026-09-01' };

    try {
      const currentLayout = await seatingService.getOrCreateClassLayout(classId);
      layout = currentLayout;
      assignments = await seatingService.getSeatAssignmentsWithStudents(currentLayout.id, classId);
      rotationConfig = await seatingService.getClassSeatingConfig(classId);
    } catch (err) {
      console.warn('Lỗi tải sơ đồ lớp, thử lấy từ cache:', err);
      const localSeating = localStorage.getItem(`seating_assignments_${classId}`);
      if (localSeating) {
        try {
          assignments = JSON.parse(localSeating);
        } catch {
          // Bỏ qua lỗi cú pháp
        }
      }
    }

    let attendanceSessions: unknown[] = [];
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select(`
          id, class_id, session_date, session_type, is_locked, created_by, created_at,
          attendance_records (id, student_id, status, note, updated_at)
        `)
        .eq('class_id', classId)
        .order('session_date', { ascending: false });

      if (!error && data) attendanceSessions = data;
    } catch (err) {
      console.warn('Lỗi tải dữ liệu điểm danh:', err);
    }

    let pointCategories: unknown[] = [];
    let pointTransactions: unknown[] = [];
    try {
      const [catRes, txRes] = await Promise.all([
        supabase.from('point_categories').select('*').eq('class_id', classId),
        supabase.from('point_transactions').select('*').eq('class_id', classId).order('created_at', { ascending: false }),
      ]);

      if (!catRes.error && catRes.data) pointCategories = catRes.data;
      if (!txRes.error && txRes.data) pointTransactions = txRes.data;
    } catch (err) {
      console.warn('Lỗi tải dữ liệu điểm thi đua:', err);
    }

    const now = new Date();
    return {
      meta: {
        app: 'Web-GVCN',
        version: '2.0.0',
        exportedAt: now.toISOString(),
        classId,
        className,
        schoolName,
        totalStudents: students.length,
        totalGroups: groups.length,
        totalAttendanceSessions: attendanceSessions.length,
        totalPointTransactions: pointTransactions.length,
      },
      data: {
        classConfig,
        students: students as Array<Record<string, unknown>>,
        groups: groups as Array<Record<string, unknown>>,
        seating: {
          layout,
          assignments: assignments as Array<Record<string, unknown>>,
          rotationConfig,
        },
        attendance: {
          sessions: attendanceSessions as Array<Record<string, unknown>>,
        },
        points: {
          categories: pointCategories as Array<Record<string, unknown>>,
          transactions: pointTransactions as Array<Record<string, unknown>>,
        },
      },
    };
  },

  /**
   * Xuất toàn bộ dữ liệu lớp học ra file JSON để lưu trữ an toàn
   */
  async exportFullClassBackup(
    classId: string,
    fallbackClassName = 'LỚP 6A6',
    fallbackSchoolName = 'TRƯỜNG THCS TÂN HẢI'
  ): Promise<BackupResult> {
    const payload = await this.collectClassBackupPayload(classId, fallbackClassName, fallbackSchoolName);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timestampStr = now.toISOString().replace(/[:.]/g, '-');

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const cleanClassName = (payload.meta.className || 'LOP').replace(/\s+/g, '-').toUpperCase();
    const fileName = `Sao-Luu-Web-GVCN-${cleanClassName}-${dateStr}-${timestampStr.slice(11, 19)}.json`;

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    return {
      success: true,
      fileName,
      studentCount: payload.meta.totalStudents || 0,
      sessionCount: payload.meta.totalAttendanceSessions || 0,
      transactionCount: payload.meta.totalPointTransactions || 0,
      fileSizeBytes: blob.size,
    };
  },

  /**
   * Đọc và xác thực an toàn file sao lưu JSON bằng Zod Schema
   */
  async validateBackupFile(file: File): Promise<ValidateBackupResult> {
    try {
      const text = await file.text();
      let rawJson: unknown;

      try {
        rawJson = JSON.parse(text);
      } catch {
        return {
          valid: false,
          error: 'Tệp tải lên không phải là định dạng JSON hợp lệ hoặc bị lỗi cú pháp.',
        };
      }

      const validation = classBackupSchema.safeParse(rawJson);
      if (!validation.success) {
        const errorMsg =
          validation.error.issues[0]?.message ||
          'Tệp sao lưu không đúng định dạng chuẩn của Web-GVCN.';
        return { valid: false, error: errorMsg };
      }

      return {
        valid: true,
        payload: validation.data as ClassBackupPayload,
      };
    } catch (err: unknown) {
      const error = err as { message?: string };
      return {
        valid: false,
        error: error.message || 'Không thể đọc tệp sao lưu.',
      };
    }
  },

  /**
   * Khôi phục có chọn lọc (Selective Restore) dữ liệu lớp học từ file sao lưu
   */
  async restoreFullClassBackup(
    classId: string,
    backup: ClassBackupPayload,
    options?: SelectiveRestoreOptions
  ): Promise<RestoreResult> {
    const opts: SelectiveRestoreOptions = options ?? {
      restoreConfig: true,
      restoreStudents: true,
      restoreSeating: true,
      restoreAttendance: true,
      restorePoints: true,
    };

    let restoredStudentsCount = 0;
    let restoredSeatingCount = 0;
    let restoredConfigName = '';

    // 1. Khôi phục Cấu hình nhận diện lớp
    if (opts.restoreConfig && backup.data.classConfig && Object.keys(backup.data.classConfig).length > 0) {
      try {
        const cfg = backup.data.classConfig as unknown as ClassConfigFormData;
        await classConfigService.updateClassConfig(classId, cfg);
        restoredConfigName = cfg.name || '';
      } catch (err) {
        console.warn('Lỗi khôi phục cấu hình lớp học:', err);
      }
    }

    // 2. Khôi phục Sơ đồ lớp học
    if (opts.restoreSeating && backup.data.seating?.assignments && backup.data.seating.assignments.length > 0) {
      const assigns = backup.data.seating.assignments;
      restoredSeatingCount = assigns.length;

      localStorage.setItem(`seating_assignments_${classId}`, JSON.stringify(assigns));

      try {
        const currentLayout = await seatingService.getOrCreateClassLayout(classId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await seatingService.saveAllAssignments(currentLayout.id, assigns as any);
      } catch (err) {
        console.warn('Lỗi đồng bộ sơ đồ chỗ ngồi lên Supabase, đã lưu an toàn vào máy:', err);
      }

      if (backup.data.seating.rotationConfig) {
        try {
          await seatingService.updateClassSeatingConfig(classId, {
            rotationEnabled: backup.data.seating.rotationConfig.rotationEnabled,
            schoolYearStartDate: backup.data.seating.rotationConfig.schoolYearStartDate,
          });
        } catch (err) {
          console.warn('Lỗi lưu cấu hình xoay chỗ ngồi:', err);
        }
      }
    }

    // 3. Khôi phục Danh sách học sinh
    if (opts.restoreStudents && backup.data.students && backup.data.students.length > 0) {
      restoredStudentsCount = backup.data.students.length;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const studentsToUpsert = backup.data.students.map((s: any) => ({
          id: s.id,
          class_id: classId,
          group_id: s.groupId || s.group_id || null,
          full_name: s.fullName || s.full_name,
          gender: s.gender || 'Nam',
          birth_date: s.birthDate || s.birth_date || null,
          class_role: s.classRole || s.class_role || 'Học sinh',
          avatar_url: s.avatarUrl || s.avatar_url || null,
          goals: s.goals || null,
          talents: s.talents || null,
          boarding_type: s.boardingType || s.boarding_type || 'Bán trú',
          code: s.code || null,
        }));

        await supabase.from('students').upsert(studentsToUpsert);
      } catch (err) {
        console.warn('Lỗi đồng bộ danh sách học sinh lên Supabase:', err);
      }
    }

    // 4. Khôi phục Điểm danh
    if (opts.restoreAttendance && backup.data.attendance?.sessions && backup.data.attendance.sessions.length > 0) {
      try {
        for (const session of backup.data.attendance.sessions) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sess = session as any;
          await supabase.from('attendance_sessions').upsert({
            id: sess.id,
            class_id: classId,
            session_date: sess.session_date,
            session_type: sess.session_type,
            is_locked: sess.is_locked,
            created_by: sess.created_by,
            created_at: sess.created_at,
          });

          if (Array.isArray(sess.attendance_records) && sess.attendance_records.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const records = sess.attendance_records.map((r: any) => ({
              id: r.id,
              session_id: sess.id,
              student_id: r.student_id,
              status: r.status,
              note: r.note,
              updated_at: r.updated_at,
            }));
            await supabase.from('attendance_records').upsert(records);
          }
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ dữ liệu điểm danh lên Supabase:', err);
      }
    }

    // 5. Khôi phục Điểm thi đua
    if (opts.restorePoints) {
      try {
        if (backup.data.points?.categories && backup.data.points.categories.length > 0) {
          await supabase.from('point_categories').upsert(backup.data.points.categories);
        }
        if (backup.data.points?.transactions && backup.data.points.transactions.length > 0) {
          await supabase.from('point_transactions').upsert(backup.data.points.transactions);
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ sổ điểm thi đua lên Supabase:', err);
      }
    }

    return {
      success: true,
      restoredStudentsCount,
      restoredSeatingCount,
      restoredConfigName,
      message: `Khôi phục thành công các mục đã chọn (${restoredStudentsCount} học sinh, ${restoredSeatingCount} chỗ ngồi)!`,
    };
  },
};
