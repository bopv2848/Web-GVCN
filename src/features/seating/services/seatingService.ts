import { supabase } from '../../../services/supabaseClient';
import { studentService } from '../../students/services/studentService';
import type { Student } from '../../../types/student';
import type {
  SeatLayout,
  SeatAssignmentWithStudent,
  InfectionCluster,
  SeatingMedicalAnalysis,
  ClassroomElementsConfig,
  TeacherDeskPosition,
  DoorPosition,
} from '../../../types/seating';
import { sandboxService } from '../../sandbox/services/sandboxService';

export const seatingService = {
  /**
   * Lấy hoặc tạo mới Sơ đồ Chỗ ngồi chính cho lớp (6 Hàng x 8 Cột = 48 chỗ cho 47 học sinh)
   */
  async getOrCreateClassLayout(classId: string): Promise<SeatLayout> {
    if (sandboxService.isSandboxActive()) {
      const { layout } = sandboxService.getSeating();
      if (layout) return layout;
    }
    try {
      const { data: existing, error } = await supabase
        .from('seat_layouts')
        .select('*')
        .eq('class_id', classId)
        .eq('is_current', true)
        .maybeSingle();

      if (existing && !error) {
        localStorage.setItem(
          `seating_layout_dimensions_${classId}`,
          JSON.stringify({ rows: existing.rows, cols: existing.cols })
        );
        return {
          id: existing.id,
          classId: existing.class_id,
          layoutName: existing.layout_name,
          rows: existing.rows,
          cols: existing.cols,
          isCurrent: existing.is_current,
          createdAt: existing.created_at,
        };
      }

      // Kiểm tra xem có cấu hình kích thước đã lưu trước đó không
      const localDim = localStorage.getItem(`seating_layout_dimensions_${classId}`);
      let initRows = 6;
      let initCols = 8;
      if (localDim) {
        try {
          const parsed = JSON.parse(localDim);
          if (parsed.rows) initRows = parsed.rows;
          if (parsed.cols) initCols = parsed.cols;
        } catch {
          // ignore
        }
      }

      // Tạo sơ đồ chuẩn cho lớp: mặc định 6 hàng x 8 cột (hoặc theo cấu hình đã lưu)
      const { data: created, error: createError } = await supabase
        .from('seat_layouts')
        .insert({
          class_id: classId,
          layout_name: initCols === 6 ? `Sơ đồ Bàn học 3 Dãy (${initRows} bàn)` : `Sơ đồ Bàn học 4 Dãy (${initRows} bàn)`,
          rows: initRows,
          cols: initCols,
          is_current: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        id: created.id,
        classId: created.class_id,
        layoutName: created.layout_name,
        rows: created.rows,
        cols: created.cols,
        isCurrent: created.is_current,
        createdAt: created.created_at,
      };
    } catch (err) {
      console.warn('Không thể nạp/tạo layout từ Supabase, dùng layout dự phòng:', err);
      const localDim = localStorage.getItem(`seating_layout_dimensions_${classId}`);
      let fallbackRows = 6;
      let fallbackCols = 8;
      if (localDim) {
        try {
          const parsed = JSON.parse(localDim);
          if (parsed.rows) fallbackRows = parsed.rows;
          if (parsed.cols) fallbackCols = parsed.cols;
        } catch {
          // ignore
        }
      }
      return {
        id: '6a600000-0000-0000-0003-000000000001',
        classId: classId,
        layoutName: fallbackCols === 6 ? `Sơ đồ Bàn học 3 Dãy (${fallbackRows} bàn)` : `Sơ đồ Bàn học 4 Dãy (${fallbackRows} bàn)`,
        rows: fallbackRows,
        cols: fallbackCols,
        isCurrent: true,
        createdAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Cập nhật kích thước phòng học (Số hàng/bàn và Số cột/dãy)
   */
  async updateClassLayout(
    layoutId: string,
    classId: string,
    rows: number,
    cols: number
  ): Promise<SeatLayout> {
    const layoutName =
      cols === 6
        ? `Sơ đồ Bàn học 3 Dãy (${rows} bàn)`
        : `Sơ đồ Bàn học 4 Dãy (${rows} bàn)`;

    localStorage.setItem(
      `seating_layout_dimensions_${classId}`,
      JSON.stringify({ rows, cols })
    );

    if (sandboxService.isSandboxActive()) {
      const { layout } = sandboxService.getSeating();
      if (layout) {
        layout.rows = rows;
        layout.cols = cols;
        layout.layoutName = layoutName;
        return layout;
      }
    }

    try {
      const { data, error } = await supabase
        .from('seat_layouts')
        .update({
          rows,
          cols,
          layout_name: layoutName,
        })
        .eq('id', layoutId)
        .select()
        .single();

      if (error) {
        console.warn('Lỗi cập nhật seat_layouts trên Supabase:', error.message);
      }

      await this.syncToClassSettings(classId, { rows, cols });

      if (data) {
        return {
          id: data.id,
          classId: data.class_id,
          layoutName: data.layout_name,
          rows: data.rows,
          cols: data.cols,
          isCurrent: data.is_current,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('Không thể cập nhật seat_layouts trên Supabase:', err);
    }

    return {
      id: layoutId,
      classId,
      layoutName,
      rows,
      cols,
      isCurrent: true,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Lấy danh sách phân công chỗ ngồi kèm hồ sơ học sinh
   */
  async getSeatAssignmentsWithStudents(
    layoutId: string,
    classId: string
  ): Promise<SeatAssignmentWithStudent[]> {
    if (sandboxService.isSandboxActive()) {
      const { assignments } = sandboxService.getSeating();
      const students = sandboxService.getStudents();
      if (students.length === 0) {
        return [];
      }
      const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));

      return (assignments || [])
        .filter((a) => studentMap.has(a.studentId))
        .map((a) => ({
          id: a.id,
          layoutId: a.layoutId,
          studentId: a.studentId,
          rowIndex: a.rowIndex,
          colIndex: a.colIndex,
          isHidden: a.isHidden,
          createdAt: a.createdAt,
          student: studentMap.get(a.studentId),
        }));
    }
    try {
      // 1. Lấy danh sách học sinh
      const students = await studentService.getStudents(classId);
      // Nếu danh sách học sinh rỗng (đã bị xóa sạch), trả về mảng rỗng để sơ đồ chỗ ngồi hoàn toàn trống
      if (students.length === 0) {
        return [];
      }
      const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));

      // 2. Lấy assignments từ Supabase
      const { data: assignments, error: assignError } = await supabase
        .from('seat_assignments')
        .select('*')
        .eq('layout_id', layoutId);

      if (assignError) {
        console.warn('Lỗi truy vấn seat_assignments từ Supabase:', assignError.message);
      }

      // Chỉ giữ lại phân công của học sinh đang thực sự tồn tại trong danh sách lớp
      const validAssignments = (assignments || []).filter((a) => studentMap.has(a.student_id));

      return validAssignments.map((a) => ({
        id: a.id,
        layoutId: a.layout_id,
        studentId: a.student_id,
        rowIndex: a.row_index,
        colIndex: a.col_index,
        isHidden: a.is_hidden,
        createdAt: a.created_at,
        student: studentMap.get(a.student_id),
      }));
    } catch (err) {
      console.warn('Lỗi trong getSeatAssignmentsWithStudents:', err);
      return [];
    }
  },

  /**
   * Tự động khởi tạo xếp chỗ ngồi cho 47 học sinh theo 4 Tổ (nếu chưa có)
   * Phân bổ:
   * - Tổ 4: Cột 0, 1 (Dãy 1)
   * - Tổ 3: Cột 2, 3 (Dãy 2)
   * - Tổ 2: Cột 4, 5 (Dãy 3)
   * - Tổ 1: Cột 6, 7 (Dãy 4)
   */
  async seedDefaultAssignments(
    layoutId: string,
    students: Student[]
  ): Promise<SeatAssignmentWithStudent[]> {
    const groupColMap: Record<string, [number, number]> = {
      'Tổ 4': [0, 1],
      'Tổ 3': [2, 3],
      'Tổ 2': [4, 5],
      'Tổ 1': [6, 7],
    };

    const groupRowsCounter: Record<string, number> = {
      'Tổ 4': 0,
      'Tổ 3': 0,
      'Tổ 2': 0,
      'Tổ 1': 0,
    };

    const newRows: Array<{
      layout_id: string;
      student_id: string;
      row_index: number;
      col_index: number;
      is_hidden: boolean;
    }> = [];

    // Phân bổ từng em
    students.forEach((s) => {
      const gName = s.groupName || 'Tổ 1';
      const cols = groupColMap[gName] || [6, 7];
      const count = groupRowsCounter[gName] || 0;

      const rowIndex = Math.floor(count / 2);
      const colIndex = count % 2 === 0 ? cols[0] : cols[1];

      groupRowsCounter[gName] = count + 1;

      newRows.push({
        layout_id: layoutId,
        student_id: s.id,
        row_index: Math.min(rowIndex, 5),
        col_index: colIndex,
        is_hidden: false,
      });
    });

    try {
      const { data: inserted, error } = await supabase
        .from('seat_assignments')
        .upsert(newRows, { onConflict: 'layout_id,row_index,col_index' })
        .select();

      if (error) {
        console.warn('Lưu phân công chỗ ngồi mặc định:', error);
      }

      const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));
      const sourceList = inserted && inserted.length > 0 ? inserted : newRows;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return sourceList.map((a: any, idx: number) => ({
        id: a.id || `temp-${idx}`,
        layoutId: a.layout_id,
        studentId: a.student_id,
        rowIndex: a.row_index,
        colIndex: a.col_index,
        isHidden: a.is_hidden || false,
        student: studentMap.get(a.student_id),
      }));
    } catch (err) {
      console.warn('Lỗi upsert seat_assignments, dùng danh sách tính toán:', err);
      const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));
      return newRows.map((a, idx) => ({
        id: `temp-${idx}`,
        layoutId: a.layout_id,
        studentId: a.student_id,
        rowIndex: a.row_index,
        colIndex: a.col_index,
        isHidden: a.is_hidden,
        student: studentMap.get(a.student_id),
      }));
    }
  },

  /**
   * Hoán đổi vị trí giữa 2 học sinh hoặc di chuyển học sinh vào ghế trống
   * Sử dụng kỹ thuật 3 bước (Temporary Pivot) để không vi phạm ràng buộc Unique
   */
  async swapOrMoveSeats(
    _layoutId: string,
    sourceAssignment: SeatAssignmentWithStudent,
    targetRow: number,
    targetCol: number,
    targetAssignment?: SeatAssignmentWithStudent
  ): Promise<void> {
    if (sandboxService.isSandboxActive()) {
      const { assignments } = sandboxService.getSeating();
      const next = assignments.map((a) => {
        if (a.id === sourceAssignment.id) {
          return { ...a, rowIndex: targetRow, colIndex: targetCol };
        }
        if (targetAssignment && a.id === targetAssignment.id) {
          return { ...a, rowIndex: sourceAssignment.rowIndex, colIndex: sourceAssignment.colIndex };
        }
        return a;
      });
      sandboxService.saveSeatingAssignments(next);
      return;
    }

    if (targetAssignment && targetAssignment.studentId) {
      // Trường hợp 1: Hoán đổi chỗ ngồi giữa 2 học sinh (Swap)
      // Bước 1: Đưa source về vị trí đệm an toàn (-1, -1)
      const { error: err1 } = await supabase
        .from('seat_assignments')
        .update({ row_index: -1, col_index: -1 })
        .eq('id', sourceAssignment.id);

      if (err1) throw err1;

      // Bước 2: Chuyển target về vị trí cũ của source
      const { error: err2 } = await supabase
        .from('seat_assignments')
        .update({
          row_index: sourceAssignment.rowIndex,
          col_index: sourceAssignment.colIndex,
        })
        .eq('id', targetAssignment.id);

      if (err2) {
        // Rollback source nếu lỗi
        await supabase
          .from('seat_assignments')
          .update({
            row_index: sourceAssignment.rowIndex,
            col_index: sourceAssignment.colIndex,
          })
          .eq('id', sourceAssignment.id);
        throw err2;
      }

      // Bước 3: Chuyển source về vị trí của target
      const { error: err3 } = await supabase
        .from('seat_assignments')
        .update({
          row_index: targetRow,
          col_index: targetCol,
        })
        .eq('id', sourceAssignment.id);

      if (err3) throw err3;
    } else {
      // Trường hợp 2: Di chuyển học sinh vào ghế trống (Move)
      const { error } = await supabase
        .from('seat_assignments')
        .update({
          row_index: targetRow,
          col_index: targetCol,
        })
        .eq('id', sourceAssignment.id);

      if (error) throw error;
    }
  },

  /**
   * Tính tuần học hiện tại và chế độ Tuần Chẵn / Tuần Lẻ dựa trên ngày bắt đầu năm học tùy chỉnh
   * @param customStartDate Ngày tựu trường/khai giảng thực tế (định dạng YYYY-MM-DD), mặc định '2026-09-01'
   */
  getCurrentSchoolWeek(customStartDate?: string): {
    weekNumber: number;
    mode: 'odd' | 'even';
    startDate: string;
  } {
    const defaultStart = '2026-09-01';
    const startStr =
      customStartDate && !isNaN(Date.parse(customStartDate))
        ? customStartDate
        : defaultStart;

    const now = new Date();
    const startOfSchoolYear = new Date(startStr);

    // Chuẩn hóa về 00:00:00 đầu ngày để tính khoảng cách ngày chính xác
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startMidnight = new Date(
      startOfSchoolYear.getFullYear(),
      startOfSchoolYear.getMonth(),
      startOfSchoolYear.getDate()
    );

    const diffTime = Math.max(0, nowMidnight.getTime() - startMidnight.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.max(1, Math.floor(diffDays / 7) + 1);
    const mode = weekNumber % 2 === 1 ? 'odd' : 'even';
    return { weekNumber, mode, startDate: startStr };
  },

  /**
   * Hoán đổi cột dãy bàn theo quy ước Tuần Chẵn / Tuần Lẻ trong file SO-DO-LOP.xlsx:
   * - Tuần Lẻ:  Dãy 1 (Tổ 4: 0,1) | Dãy 2 (Tổ 3: 2,3) | Dãy 3 (Tổ 2: 4,5) | Dãy 4 (Tổ 1: 6,7)
   * - Tuần Chẵn: Dãy 1 (Tổ 3: 0,1) | Dãy 2 (Tổ 4: 2,3) | Dãy 3 (Tổ 1: 4,5) | Dãy 4 (Tổ 2: 6,7)
   */
  rotateColIndex(colIndex: number, totalCols: number = 8): number {
    if (totalCols === 6) {
      // Xoay vòng 3 Dãy: Dãy 1 -> Dãy 2 -> Dãy 3 -> Dãy 1
      if (colIndex === 0 || colIndex === 1) return colIndex + 2;
      if (colIndex === 2 || colIndex === 3) return colIndex + 2;
      if (colIndex === 4 || colIndex === 5) return colIndex - 4;
      return colIndex;
    }
    if (colIndex === 0 || colIndex === 1) return colIndex + 2;
    if (colIndex === 2 || colIndex === 3) return colIndex - 2;
    if (colIndex === 4 || colIndex === 5) return colIndex + 2;
    if (colIndex === 6 || colIndex === 7) return colIndex - 2;
    return colIndex;
  },

  /**
   * Đảo vị trí toàn bộ phân công chỗ ngồi giữa Tuần Chẵn và Tuần Lẻ
   */
  rotateAssignments(
    assignments: SeatAssignmentWithStudent[],
    totalCols: number = 8
  ): SeatAssignmentWithStudent[] {
    return assignments.map((a) => ({
      ...a,
      colIndex: this.rotateColIndex(a.colIndex, totalCols),
    }));
  },

  /**
   * Lưu toàn bộ danh sách chỗ ngồi mới lên Supabase
   */
  async saveAllAssignments(
    layoutId: string,
    assignments: SeatAssignmentWithStudent[]
  ): Promise<void> {
    if (sandboxService.isSandboxActive()) {
      sandboxService.saveSeatingAssignments(
        assignments.map((a) => ({
          id: a.id,
          layoutId: a.layoutId,
          studentId: a.studentId,
          rowIndex: a.rowIndex,
          colIndex: a.colIndex,
          isHidden: a.isHidden || false,
          createdAt: a.createdAt,
        }))
      );
      return;
    }

    const { error: delError } = await supabase
      .from('seat_assignments')
      .delete()
      .eq('layout_id', layoutId);

    if (delError) throw delError;

    if (assignments.length === 0) {
      return;
    }

    const rowsToInsert = assignments.map((a) => ({
      layout_id: layoutId,
      student_id: a.studentId,
      row_index: a.rowIndex,
      col_index: a.colIndex,
      is_hidden: a.isHidden || false,
    }));

    const { error: insError } = await supabase
      .from('seat_assignments')
      .insert(rowsToInsert);

    if (insError) throw insError;
  },

  /**
   * Xóa sạch toàn bộ phân công chỗ ngồi của lớp để làm mới sơ đồ bàn học
   * (Tự động kích hoạt khi danh sách học sinh bị xóa sạch hoặc GVCN muốn đặt lại sơ đồ trống)
   */
  async clearClassAssignments(classId: string, layoutId?: string): Promise<void> {
    const seatingCacheKey = `seating_assignments_${classId}`;
    try {
      localStorage.removeItem(seatingCacheKey);
    } catch {
      // ignore
    }

    if (sandboxService.isSandboxActive()) {
      sandboxService.saveSeatingAssignments([]);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gvcn:seating-reset', { detail: { classId } }));
      }
      return;
    }

    try {
      if (layoutId) {
        const { error } = await supabase
          .from('seat_assignments')
          .delete()
          .eq('layout_id', layoutId);
        if (error) console.warn('Lỗi xóa seat_assignments theo layoutId:', error.message);
      } else {
        const { data: layouts, error: layoutError } = await supabase
          .from('seat_layouts')
          .select('id')
          .eq('class_id', classId);

        if (!layoutError && layouts && layouts.length > 0) {
          const layoutIds = layouts.map((l) => l.id);
          const { error } = await supabase
            .from('seat_assignments')
            .delete()
            .in('layout_id', layoutIds);
          if (error) console.warn('Lỗi xóa seat_assignments theo classId:', error.message);
        }
      }
    } catch (err) {
      console.warn('Lỗi trong clearClassAssignments:', err);
    } finally {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gvcn:seating-reset', { detail: { classId } }));
      }
    }
  },

  /**
   * Lấy cấu hình lớp đầy đủ từ Supabase Cloud (Gồm chế độ xoay tuần và ngày bắt đầu năm học)
   * Hỗ trợ chiến lược dự phòng kép (class_configs -> classes.settings -> localStorage)
   */
  async getClassSeatingConfig(classId: string): Promise<{
    rotationEnabled: boolean;
    schoolYearStartDate: string;
  }> {
    const defaultStartDate = '2026-09-01';
    let rotationEnabled = false;
    let schoolYearStartDate = defaultStartDate;

    try {
      // 1. Thử lấy từ bảng class_configs trên Supabase
      const { data: cfgData, error: cfgErr } = await supabase
        .from('class_configs')
        .select('seating_rotation_enabled, school_year_start_date')
        .eq('class_id', classId)
        .maybeSingle();

      if (!cfgErr && cfgData) {
        if (typeof cfgData.seating_rotation_enabled === 'boolean') {
          rotationEnabled = cfgData.seating_rotation_enabled;
        }
        if (cfgData.school_year_start_date) {
          schoolYearStartDate = cfgData.school_year_start_date;
        }
        localStorage.setItem(`seating_rotation_enabled_${classId}`, String(rotationEnabled));
        localStorage.setItem(`school_year_start_date_${classId}`, schoolYearStartDate);
        return { rotationEnabled, schoolYearStartDate };
      }

      // 2. Thử lấy từ bảng classes.settings
      const { data: classData, error: classErr } = await supabase
        .from('classes')
        .select('settings')
        .eq('id', classId)
        .maybeSingle();

      if (!classErr && classData?.settings) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings = classData.settings as any;
        if (typeof settings.seating_rotation_enabled === 'boolean') {
          rotationEnabled = settings.seating_rotation_enabled;
        }
        if (typeof settings.school_year_start_date === 'string' && settings.school_year_start_date) {
          schoolYearStartDate = settings.school_year_start_date;
        }
        localStorage.setItem(`seating_rotation_enabled_${classId}`, String(rotationEnabled));
        localStorage.setItem(`school_year_start_date_${classId}`, schoolYearStartDate);
        return { rotationEnabled, schoolYearStartDate };
      }
    } catch (err) {
      console.warn('Lỗi đọc cấu hình lớp từ Cloud:', err);
    }

    // 3. Fallback lấy từ localStorage
    const savedRot = localStorage.getItem(`seating_rotation_enabled_${classId}`);
    if (savedRot !== null) rotationEnabled = savedRot === 'true';
    const savedDate = localStorage.getItem(`school_year_start_date_${classId}`);
    if (savedDate) schoolYearStartDate = savedDate;

    return { rotationEnabled, schoolYearStartDate };
  },

  /**
   * Cập nhật cấu hình lớp lên Supabase Cloud (Chế độ xoay và/hoặc Ngày bắt đầu năm học)
   */
  async updateClassSeatingConfig(
    classId: string,
    updates: { rotationEnabled?: boolean; schoolYearStartDate?: string }
  ): Promise<void> {
    // 1. Lưu ngay vào localStorage (Optimistic UI)
    if (updates.rotationEnabled !== undefined) {
      localStorage.setItem(`seating_rotation_enabled_${classId}`, String(updates.rotationEnabled));
    }
    if (updates.schoolYearStartDate !== undefined) {
      localStorage.setItem(`school_year_start_date_${classId}`, updates.schoolYearStartDate);
    }

    // 2. Cố gắng ghi vào bảng class_configs
    try {
      const payload: Record<string, unknown> = {
        class_id: classId,
        updated_at: new Date().toISOString(),
      };
      if (updates.rotationEnabled !== undefined) {
        payload.seating_rotation_enabled = updates.rotationEnabled;
      }
      if (updates.schoolYearStartDate !== undefined) {
        payload.school_year_start_date = updates.schoolYearStartDate;
      }

      const { error: cfgErr } = await supabase
        .from('class_configs')
        .upsert(payload, { onConflict: 'class_id' });

      if (!cfgErr) {
        await this.syncToClassSettings(classId, updates);
        return;
      }
    } catch {
      // Tiếp tục xuống bước 3 nếu bảng class_configs chưa sẵn sàng
    }

    // 3. Ghi vào bảng classes.settings nếu bảng class_configs chưa có
    await this.syncToClassSettings(classId, updates);
  },

  /**
   * Đồng bộ cấu hình vào trường settings của bảng classes
   */
  async syncToClassSettings(
    classId: string,
    updates: {
      rotationEnabled?: boolean;
      schoolYearStartDate?: string;
      rows?: number;
      cols?: number;
    }
  ): Promise<void> {
    try {
      const { data } = await supabase
        .from('classes')
        .select('settings')
        .eq('id', classId)
        .maybeSingle();

      const currentSettings = (data?.settings as Record<string, unknown>) || {};
      const nextSettings = { ...currentSettings };
      if (updates.rotationEnabled !== undefined) {
        nextSettings.seating_rotation_enabled = updates.rotationEnabled;
      }
      if (updates.schoolYearStartDate !== undefined) {
        nextSettings.school_year_start_date = updates.schoolYearStartDate;
      }
      if (updates.rows !== undefined) {
        nextSettings.seating_rows = updates.rows;
      }
      if (updates.cols !== undefined) {
        nextSettings.seating_cols = updates.cols;
      }

      await supabase
        .from('classes')
        .update({ settings: nextSettings })
        .eq('id', classId);
    } catch (err) {
      console.warn('Không thể đồng bộ settings vào classes:', err);
    }
  },

  /**
   * Tương thích ngược: Lấy cấu hình bật/tắt xoay chỗ ngồi
   */
  async getSeatingRotationConfig(classId: string): Promise<boolean> {
    const config = await this.getClassSeatingConfig(classId);
    return config.rotationEnabled;
  },

  /**
   * Tương thích ngược: Cập nhật bật/tắt xoay chỗ ngồi
   */
  async updateSeatingRotationConfig(classId: string, enabled: boolean): Promise<void> {
    await this.updateClassSeatingConfig(classId, { rotationEnabled: enabled });
  },

  /**
   * Thuật toán Phân tích Cụm Lây Nhiễm & Học Sinh Nguy Cơ Liền Kề
   */
  analyzeInfectionClusters(
    assignments: SeatAssignmentWithStudent[],
    sickStudentIds: Set<string>
  ): SeatingMedicalAnalysis {
    const gridMap = new Map<string, SeatAssignmentWithStudent>();
    const studentToPosMap = new Map<string, { r: number; c: number }>();

    assignments.forEach((a) => {
      gridMap.set(`${a.rowIndex}_${a.colIndex}`, a);
      studentToPosMap.set(a.studentId, { r: a.rowIndex, c: a.colIndex });
    });

    const clusters: InfectionCluster[] = [];
    const atRiskNeighborStudentIds = new Set<string>();
    const visitedDeskClusters = new Set<string>();

    const groupAisleNames: Record<number, string> = {
      0: 'Tổ 4',
      1: 'Tổ 3',
      2: 'Tổ 2',
      3: 'Tổ 1',
    };

    assignments.forEach((a) => {
      const isSick = sickStudentIds.has(a.studentId);
      if (!isSick) return;

      const r = a.rowIndex;
      const c = a.colIndex;
      const deskColPair = Math.floor(c / 2);
      const deskKey = `${r}_${deskColPair}`;

      // 1. Kiểm tra bạn cùng bàn
      const partnerCol = c % 2 === 0 ? c + 1 : c - 1;
      const partner = gridMap.get(`${r}_${partnerCol}`);

      if (partner) {
        if (sickStudentIds.has(partner.studentId)) {
          // Cả 2 cùng ốm => Cụm lây nhiễm bàn học!
          if (!visitedDeskClusters.has(deskKey)) {
            visitedDeskClusters.add(deskKey);
            const aisleName = groupAisleNames[deskColPair] || `Dãy ${deskColPair + 1}`;
            const sickNames = [
              a.student?.fullName || 'Học sinh',
              partner.student?.fullName || 'Học sinh',
            ];

            // Tìm bạn ngồi ngay trước và sau bàn này
            const neighbors: string[] = [];
            const neighborNames: string[] = [];

            [r - 1, r + 1].forEach((nr) => {
              [c, partnerCol].forEach((nc) => {
                const nb = gridMap.get(`${nr}_${nc}`);
                if (nb && !sickStudentIds.has(nb.studentId)) {
                  neighbors.push(nb.studentId);
                  if (nb.student?.fullName) neighborNames.push(nb.student.fullName);
                  atRiskNeighborStudentIds.add(nb.studentId);
                }
              });
            });

            clusters.push({
              clusterId: `cluster-desk-${deskKey}`,
              groupName: aisleName,
              rowIndex: r,
              deskLabel: `${aisleName} - Bàn ${r + 1}`,
              sickStudentIds: [a.studentId, partner.studentId],
              sickStudentNames: sickNames,
              neighborAtRiskIds: neighbors,
              neighborAtRiskNames: neighborNames,
              riskLevel: 'high',
            });
          }
        } else {
          // Bạn cùng bàn chưa ốm => Đối tượng F0 lân cận cần bảo vệ / giãn cách!
          atRiskNeighborStudentIds.add(partner.studentId);
        }
      }

      // 2. Kiểm tra bạn ngồi ngay trước và ngay sau trong cùng cột
      [r - 1, r + 1].forEach((nr) => {
        const vert = gridMap.get(`${nr}_${c}`);
        if (vert) {
          if (sickStudentIds.has(vert.studentId)) {
            // Lây theo hàng dọc trước/sau
            const vertClusterKey = `vert_${Math.min(r, nr)}_${Math.max(r, nr)}_${c}`;
            if (!visitedDeskClusters.has(vertClusterKey)) {
              visitedDeskClusters.add(vertClusterKey);
              const aisleName = groupAisleNames[deskColPair] || `Dãy ${deskColPair + 1}`;
              clusters.push({
                clusterId: `cluster-${vertClusterKey}`,
                groupName: aisleName,
                rowIndex: Math.min(r, nr),
                deskLabel: `${aisleName} - Cột ${c % 2 === 0 ? 'trái' : 'phải'} (Bàn ${r + 1} & ${nr + 1})`,
                sickStudentIds: [a.studentId, vert.studentId],
                sickStudentNames: [
                  a.student?.fullName || 'Học sinh',
                  vert.student?.fullName || 'Học sinh',
                ],
                neighborAtRiskIds: [],
                neighborAtRiskNames: [],
                riskLevel: 'medium',
              });
            }
          } else {
            atRiskNeighborStudentIds.add(vert.studentId);
          }
        }
      });
    });

    const totalSickInSeats = assignments.filter((a) => sickStudentIds.has(a.studentId)).length;

    return {
      sickStudentIds,
      atRiskNeighborStudentIds,
      clusters,
      totalSickInSeats,
    };
  },

  /**
   * Lấy cấu hình vị trí Bàn Giáo Viên & Cửa Ra Vào từ cột elements_config bảng classes
   */
  async getClassroomElementsConfig(classId: string): Promise<ClassroomElementsConfig | null> {
    if (sandboxService.isSandboxActive()) {
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('elements_config')
        .eq('id', classId)
        .maybeSingle();

      if (error || !data || !data.elements_config) {
        return null;
      }

      const ec = data.elements_config as Partial<ClassroomElementsConfig>;
      return {
        teacherDeskPosition: ['left', 'center', 'right'].includes(ec.teacherDeskPosition as string)
          ? (ec.teacherDeskPosition as TeacherDeskPosition)
          : 'right',
        doorPosition: ['left', 'right'].includes(ec.doorPosition as string)
          ? (ec.doorPosition as DoorPosition)
          : 'right',
        doorAngle:
          typeof ec.doorAngle === 'number'
            ? ((ec.doorAngle % 360) + 360) % 360
            : 180,
        teacherDeskLabel:
          typeof ec.teacherDeskLabel === 'string' && ec.teacherDeskLabel.trim()
            ? ec.teacherDeskLabel.trim()
            : undefined,
        teacherDeskWidth:
          typeof ec.teacherDeskWidth === 'number' && ec.teacherDeskWidth >= 200 && ec.teacherDeskWidth <= 600
            ? Math.round(ec.teacherDeskWidth)
            : 384,
        teacherDeskScale:
          typeof ec.teacherDeskScale === 'number' && ec.teacherDeskScale >= 70 && ec.teacherDeskScale <= 150
            ? Math.round(ec.teacherDeskScale)
            : 100,
        doorWidth:
          typeof ec.doorWidth === 'number' && ec.doorWidth >= 100 && ec.doorWidth <= 400
            ? Math.round(ec.doorWidth)
            : 180,
        doorScale:
          typeof ec.doorScale === 'number' && ec.doorScale >= 70 && ec.doorScale <= 150
            ? Math.round(ec.doorScale)
            : 100,
        studentDeskScale:
          typeof ec.studentDeskScale === 'number' && ec.studentDeskScale >= 70 && ec.studentDeskScale <= 140
            ? Math.round(ec.studentDeskScale)
            : 100,
        isDimensionsLocked:
          typeof ec.isDimensionsLocked === 'boolean'
            ? ec.isDimensionsLocked
            : false,
      };
    } catch (err) {
      console.warn('Lỗi tải cấu hình elements_config từ Supabase:', err);
      return null;
    }
  },

  /**
   * Lưu cấu hình vị trí Bàn Giáo Viên & Cửa Ra Vào vào cột elements_config bảng classes
   */
  async saveClassroomElementsConfig(
    classId: string,
    config: ClassroomElementsConfig
  ): Promise<boolean> {
    if (sandboxService.isSandboxActive()) {
      return true;
    }
    try {
      const { error } = await supabase
        .from('classes')
        .update({
          elements_config: config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', classId);

      if (error) {
        console.warn('Lỗi lưu elements_config lên Supabase classes:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Ngoại lệ khi lưu elements_config lên Supabase:', err);
      return false;
    }
  },

  /**
   * Đăng ký lắng nghe thay đổi vị trí Bàn Giáo Viên & Cửa Ra Vào theo thời gian thực (Realtime WebSockets)
   */
  subscribeToClassroomElements(
    classId: string,
    onElementsChange: (config: ClassroomElementsConfig) => void,
    onStatusChange?: (status: 'connected' | 'connecting' | 'disconnected') => void
  ) {
    if (sandboxService.isSandboxActive() || !classId) {
      if (onStatusChange) onStatusChange('connected');
      return () => {};
    }

    if (onStatusChange) onStatusChange('connecting');

    const channelName = `realtime-classroom-elements-${classId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'classes',
          filter: `id=eq.${classId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const newRow = payload?.new;
          if (newRow && newRow.elements_config) {
            const ec = newRow.elements_config as Partial<ClassroomElementsConfig>;
            const parsedConfig: ClassroomElementsConfig = {
              teacherDeskPosition: ['left', 'center', 'right'].includes(ec.teacherDeskPosition as string)
                ? (ec.teacherDeskPosition as TeacherDeskPosition)
                : 'right',
              doorPosition: ['left', 'right'].includes(ec.doorPosition as string)
                ? (ec.doorPosition as DoorPosition)
                : 'right',
              doorAngle:
                typeof ec.doorAngle === 'number'
                  ? ((ec.doorAngle % 360) + 360) % 360
                  : 180,
              teacherDeskLabel:
                typeof ec.teacherDeskLabel === 'string' && ec.teacherDeskLabel.trim()
                  ? ec.teacherDeskLabel.trim()
                  : undefined,
              teacherDeskWidth:
                typeof ec.teacherDeskWidth === 'number' && ec.teacherDeskWidth >= 200 && ec.teacherDeskWidth <= 600
                  ? Math.round(ec.teacherDeskWidth)
                  : 384,
              teacherDeskScale:
                typeof ec.teacherDeskScale === 'number' && ec.teacherDeskScale >= 70 && ec.teacherDeskScale <= 150
                  ? Math.round(ec.teacherDeskScale)
                  : 100,
              doorWidth:
                typeof ec.doorWidth === 'number' && ec.doorWidth >= 100 && ec.doorWidth <= 400
                  ? Math.round(ec.doorWidth)
                  : 180,
              doorScale:
                typeof ec.doorScale === 'number' && ec.doorScale >= 70 && ec.doorScale <= 150
                  ? Math.round(ec.doorScale)
                  : 100,
              studentDeskScale:
                typeof ec.studentDeskScale === 'number' && ec.studentDeskScale >= 70 && ec.studentDeskScale <= 140
                  ? Math.round(ec.studentDeskScale)
                  : 100,
              isDimensionsLocked:
                typeof ec.isDimensionsLocked === 'boolean'
                  ? ec.isDimensionsLocked
                  : false,
            };
            onElementsChange(parsedConfig);
          }
        }
      )
      .subscribe((status) => {
        if (onStatusChange) {
          if (status === 'SUBSCRIBED') {
            onStatusChange('connected');
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            onStatusChange('disconnected');
          }
        }
      });

    return () => {
      if (onStatusChange) onStatusChange('disconnected');
      supabase.removeChannel(channel);
    };
  },
};

