import { supabase } from '../../../services/supabaseClient';
import type { Student, Group } from '../../../types/student';
import type { StudentFormData } from '../schemas/studentSchema';
import { DEFAULT_CLASS_6A6_STUDENTS, DEFAULT_GROUPS_6A6 } from '../constants/defaultClass6A6Students';
import { sortVietnameseList } from '../../../utils/vietnameseNameSort';
import { sandboxService } from '../../sandbox/services/sandboxService';
import type { UserRole } from '../../../types/auth';

export interface BatchImportStudentItem {
  fullName: string;
  gender: 'Nam' | 'Nữ';
  birthDate?: string;
  groupName?: string;
  classRole?: string;
  boardingType?: string;
  goals?: string;
  talents?: string;
}

export interface ImportResult {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
}

export const studentService = {
  /**
   * Lấy danh sách học sinh của lớp kèm thông tin tổ và điểm thi đua
   */
  async getStudents(classId: string): Promise<Student[]> {
    if (sandboxService.isSandboxActive()) {
      return sortVietnameseList(sandboxService.getStudents(), (s) => s.fullName);
    }
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          class_id,
          group_id,
          full_name,
          gender,
          birth_date,
          class_role,
          avatar_url,
          goals,
          talents,
          boarding_type,
          code,
          created_at,
          updated_at,
          group:group_id (
            id,
            name,
            color_class
          ),
          student_guardians (
            id,
            invite_token,
            status,
            relationship
          )
        `)
        .eq('class_id', classId)
        .is('deleted_at', null)
        .order('full_name', { ascending: true });

      // Kiểm tra cờ đã chủ động xóa sạch danh sách học sinh
      const clearedFlagKey = `gvcn_class_cleared_${classId}`;
      const isExplicitlyCleared =
        typeof window !== 'undefined' && localStorage.getItem(clearedFlagKey) === 'true';

      if (isExplicitlyCleared) {
        return [];
      }

      if (error || !data || data.length === 0) {
        try {
          const cacheKey = `gvcn_students_${classId}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              if (parsed.length > 0) {
                return sortVietnameseList(parsed, (s) => s.fullName);
              }
              if (isExplicitlyCleared) {
                return [];
              }
            }
          }
        } catch {
          // Bỏ qua lỗi truy cập localStorage
        }
        return sortVietnameseList(DEFAULT_CLASS_6A6_STUDENTS, (s) => s.fullName);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentsMapped: Student[] = data.map((item: any) => {
        const guardian = item.student_guardians?.[0];
        return {
          id: item.id,
          classId: item.class_id,
          groupId: item.group_id,
          fullName: item.full_name,
          gender: item.gender,
          birthDate: item.birth_date,
          classRole: item.class_role,
          avatarUrl: item.avatar_url,
          goals: item.goals,
          talents: item.talents,
          boardingType: item.boarding_type,
          code: item.code,
          points: 0,
          stars: 0,
          groupName: item.group?.name || 'Chưa chia tổ',
          groupColorClass: item.group?.color_class || 'text-slate-500',
          guardianToken: guardian?.invite_token,
          guardianStatus: guardian?.status || 'pending',
          createdAt: item.created_at,
        };
      });

      return sortVietnameseList(studentsMapped, (s) => s.fullName);
    } catch (err) {
      console.warn('Lỗi khi lấy danh sách học sinh:', err);
      return [];
    }
  },

  /**
   * Lấy danh sách các Tổ trong lớp
   */
  async getGroups(classId: string): Promise<Group[]> {
    if (sandboxService.isSandboxActive()) {
      return sandboxService.getGroups();
    }
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('class_id', classId)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return DEFAULT_GROUPS_6A6;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((g: any) => ({
        id: g.id,
        classId: g.class_id,
        name: g.name,
        colorClass: g.color_class,
        avatarUrl: g.avatar_url,
        orderIndex: g.order_index,
      }));
    } catch (err) {
      console.warn('Lỗi khi lấy tổ:', err);
      return [];
    }
  },

  /**
   * Thêm mới một học sinh vào lớp
   */
  async createStudent(
    classId: string,
    formData: Partial<StudentFormData> & { fullName: string; gender: 'Nam' | 'Nữ' }
  ) {
    try {
      localStorage.removeItem(`gvcn_class_cleared_${classId}`);
    } catch {
      // ignore
    }
    if (sandboxService.isSandboxActive()) {
      return sandboxService.addStudent({
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        birthDate: formData.birthDate || undefined,
        groupId: formData.groupId || undefined,
        classRole: formData.classRole || 'Thành viên',
        boardingType: formData.boardingType || 'Bán trú',
        goals: formData.goals || undefined,
        talents: formData.talents || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        code: formData.code || undefined,
      });
    }
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        class_id: classId,
        group_id: formData.groupId || null,
        full_name: formData.fullName.trim(),
        gender: formData.gender,
        birth_date: formData.birthDate || null,
        class_role: formData.classRole || 'Thành viên',
        boarding_type: formData.boardingType || 'Bán trú',
        goals: formData.goals || null,
        talents: formData.talents || null,
        avatar_url: formData.avatarUrl || null,
        code: formData.code || null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Sinh token liên kết phụ huynh 32 ký tự
    if (newStudent) {
      const inviteToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      await supabase.from('student_guardians').insert({
        student_id: newStudent.id,
        relationship: 'Phụ huynh',
        invite_token: inviteToken,
        status: 'pending',
      });
    }

    return newStudent;
  },

  /**
   * Cập nhật thông tin học sinh
   */
  async updateStudent(studentId: string, formData: Partial<StudentFormData>) {
    if (sandboxService.isSandboxActive()) {
      return sandboxService.updateStudent(studentId, {
        fullName: formData.fullName?.trim(),
        gender: formData.gender,
        birthDate: formData.birthDate || undefined,
        groupId: formData.groupId || undefined,
        classRole: formData.classRole,
        boardingType: formData.boardingType,
        goals: formData.goals || undefined,
        talents: formData.talents || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        code: formData.code || undefined,
      });
    }
    const { data, error } = await supabase
      .from('students')
      .update({
        full_name: formData.fullName?.trim(),
        gender: formData.gender,
        birth_date: formData.birthDate || null,
        group_id: formData.groupId || null,
        class_role: formData.classRole,
        boarding_type: formData.boardingType,
        goals: formData.goals,
        talents: formData.talents,
        avatar_url: formData.avatarUrl,
        code: formData.code,
      })
      .eq('id', studentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Cập nhật nhanh chức vụ ban cán sự của học sinh
   */
  async updateStudentRole(classId: string, studentId: string, newRole: string) {
    if (sandboxService.isSandboxActive()) {
      return sandboxService.updateStudent(studentId, { classRole: newRole });
    }
    try {
      // 1. Cập nhật trên Supabase
      const { data, error } = await supabase
        .from('students')
        .update({
          class_role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)
        .select()
        .single();

      // 2. Cập nhật LocalStorage cache để lưu trữ bền vững
      const cacheKey = `gvcn_students_${classId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed: Student[] = JSON.parse(cached);
          const idx = parsed.findIndex((s) => s.id === studentId);
          if (idx !== -1) {
            parsed[idx].classRole = newRole;
            localStorage.setItem(cacheKey, JSON.stringify(parsed));
          }
        } catch {
          // Bỏ qua lỗi parse
        }
      }

      if (error) {
        console.warn('Supabase update warning, fallback local state applied:', error);
      }
      return data;
    } catch (err) {
      console.warn('Lỗi cập nhật chức vụ học sinh:', err);
      // Fallback: Ghi cache offline
      const cacheKey = `gvcn_students_${classId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed: Student[] = JSON.parse(cached);
          const idx = parsed.findIndex((s) => s.id === studentId);
          if (idx !== -1) {
            parsed[idx].classRole = newRole;
            localStorage.setItem(cacheKey, JSON.stringify(parsed));
          }
        } catch {
          // ignore
        }
      }
      return null;
    }
  },

  /**
   * Xóa mềm học sinh (Soft Delete)
   */
  async softDeleteStudent(studentId: string) {
    if (sandboxService.isSandboxActive()) {
      sandboxService.deleteStudent(studentId);
      return { id: studentId };
    }
    const { data, error } = await supabase
      .from('students')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', studentId)
      .select()
      .single();

    if (error) throw error;

    // Tự động giải phóng vị trí chỗ ngồi của học sinh này trên sơ đồ
    try {
      await supabase
        .from('seat_assignments')
        .delete()
        .eq('student_id', studentId);
    } catch (seatErr) {
      console.warn('Lỗi dọn dẹp phân công chỗ ngồi của học sinh:', seatErr);
    }

    return data;
  },

  /**
   * Xóa toàn bộ học sinh của lớp để chuẩn bị nạp danh sách mới
   * Bảo mật phân quyền: Chỉ tài khoản GVCN chính thức hoặc Quản trị viên (admin) mới được thực thi.
   */
  async deleteAllStudents(
    classId: string,
    roleContext?: { role?: UserRole; membershipRole?: UserRole } | UserRole
  ): Promise<{ count: number }> {
    if (roleContext) {
      const userRole = typeof roleContext === 'string'
        ? roleContext
        : (roleContext.membershipRole || roleContext.role);
      if (userRole && !['gvcn', 'admin'].includes(userRole)) {
        throw new Error(
          'Từ chối quyền: Chỉ Giáo viên chủ nhiệm chính thức hoặc Quản trị viên mới có quyền xóa toàn bộ học sinh.'
        );
      }
    }

    const clearedFlagKey = `gvcn_class_cleared_${classId}`;
    const cacheKey = `gvcn_students_${classId}`;
    const seatingCacheKey = `seating_assignments_${classId}`;

    if (sandboxService.isSandboxActive()) {
      const current = sandboxService.getStudents();
      const count = current.length;
      sandboxService.deleteAllStudents();
      try {
        localStorage.setItem(clearedFlagKey, 'true');
        localStorage.setItem(cacheKey, JSON.stringify([]));
        localStorage.removeItem(seatingCacheKey);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gvcn:seating-reset', { detail: { classId } }));
        }
      } catch {
        // ignore
      }
      return { count };
    }

    try {
      // 1. Đếm số lượng học sinh hiện hữu trước khi xóa
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)
        .is('deleted_at', null);

      const count = existing?.length || 0;

      // 2. Soft delete toàn bộ học sinh lớp này trên Supabase
      const { error } = await supabase
        .from('students')
        .update({ deleted_at: new Date().toISOString() })
        .eq('class_id', classId)
        .is('deleted_at', null);

      if (error) throw error;

      // 3. Tự động xóa sạch phân công chỗ ngồi (seat_assignments) để làm mới lưới sơ đồ bàn học
      try {
        const { data: layouts } = await supabase
          .from('seat_layouts')
          .select('id')
          .eq('class_id', classId);

        if (layouts && layouts.length > 0) {
          const layoutIds = layouts.map((l) => l.id);
          await supabase
            .from('seat_assignments')
            .delete()
            .in('layout_id', layoutIds);
        }
      } catch (seatErr) {
        console.warn('Lỗi dọn dẹp phân công chỗ ngồi khi xóa toàn bộ học sinh:', seatErr);
      }

      // 4. Ghi nhận cờ lớp đã xóa sạch & dọn dẹp cache LocalStorage
      try {
        localStorage.setItem(clearedFlagKey, 'true');
        localStorage.setItem(cacheKey, JSON.stringify([]));
        localStorage.removeItem(seatingCacheKey);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gvcn:seating-reset', { detail: { classId } }));
        }
      } catch {
        // ignore
      }

      return { count };
    } catch (err) {
      console.warn('Lỗi khi xóa toàn bộ học sinh:', err);
      try {
        localStorage.setItem(clearedFlagKey, 'true');
        localStorage.setItem(cacheKey, JSON.stringify([]));
        localStorage.removeItem(seatingCacheKey);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gvcn:seating-reset', { detail: { classId } }));
        }
      } catch {
        // ignore
      }
      throw err;
    }
  },

  /**
   * Nhập hàng loạt danh sách học sinh từ Excel / CSV với chiến lược xử lý trùng lặp
   */
  async batchImportStudents(
    classId: string,
    items: BatchImportStudentItem[],
    strategy: 'skip' | 'update' = 'skip',
    clearExistingBeforeImport = false,
    roleContext?: { role?: UserRole; membershipRole?: UserRole } | UserRole
  ): Promise<ImportResult> {
    if (clearExistingBeforeImport) {
      await this.deleteAllStudents(classId, roleContext);
    }

    try {
      localStorage.removeItem(`gvcn_class_cleared_${classId}`);
    } catch {
      // ignore
    }

    const result: ImportResult = {
      total: items.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    // Lấy danh sách tổ hiện có để map tên tổ
    const existingGroups = await this.getGroups(classId);
    const groupMap = new Map<string, string>();
    existingGroups.forEach((g) => groupMap.set(g.name.toLowerCase().trim(), g.id));

    // Lấy danh sách học sinh hiện có để kiểm tra trùng họ tên
    const currentStudents = await this.getStudents(classId);
    const studentMap = new Map<string, Student>();
    currentStudents.forEach((s) => studentMap.set(s.fullName.toLowerCase().trim(), s));

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 1;

      try {
        if (!item.fullName || item.fullName.trim().length < 2) {
          result.errors.push({ row: rowNum, reason: 'Tên học sinh không hợp lệ' });
          continue;
        }

        const normalizedName = item.fullName.toLowerCase().trim();
        const existing = studentMap.get(normalizedName);

        // Tìm groupId
        let targetGroupId: string | null = null;
        if (item.groupName) {
          targetGroupId = groupMap.get(item.groupName.toLowerCase().trim()) || null;
        }

        if (existing) {
          if (strategy === 'skip') {
            result.skipped++;
            continue;
          } else {
            // Update
            await this.updateStudent(existing.id, {
              fullName: item.fullName,
              gender: item.gender,
              birthDate: item.birthDate,
              groupId: targetGroupId,
              classRole: item.classRole || 'Thành viên',
              boardingType: (item.boardingType as 'Bán trú' | 'Ngoại trú' | 'Nội trú') || 'Bán trú',
              goals: item.goals || '',
              talents: item.talents || '',
            });
            result.updated++;
          }
        } else {
          // Insert
          await this.createStudent(classId, {
            fullName: item.fullName,
            gender: item.gender,
            birthDate: item.birthDate,
            groupId: targetGroupId,
            classRole: item.classRole || 'Thành viên',
            boardingType: (item.boardingType as 'Bán trú' | 'Ngoại trú' | 'Nội trú') || 'Bán trú',
            goals: item.goals || '',
            talents: item.talents || '',
          });
          result.inserted++;
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        result.errors.push({ row: rowNum, reason: error.message || 'Lỗi cơ sở dữ liệu' });
      }
    }

    return result;
  },
};
