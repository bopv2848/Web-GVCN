import { supabase } from '../../../services/supabaseClient';
import { studentService } from '../../students/services/studentService';
import type { Student } from '../../../types/student';
import type {
  SeatLayout,
  SeatAssignmentWithStudent,
  InfectionCluster,
  SeatingMedicalAnalysis,
} from '../../../types/seating';

export const seatingService = {
  /**
   * Lấy hoặc tạo mới Sơ đồ Chỗ ngồi chính cho lớp (6 Hàng x 8 Cột = 48 chỗ cho 47 học sinh)
   */
  async getOrCreateClassLayout(classId: string): Promise<SeatLayout> {
    const { data: existing, error } = await supabase
      .from('seat_layouts')
      .select('*')
      .eq('class_id', classId)
      .eq('is_current', true)
      .maybeSingle();

    if (existing && !error) {
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

    // Tạo sơ đồ chuẩn cho lớp 6A6: 6 hàng x 8 cột (4 Tổ thi đua)
    const { data: created, error: createError } = await supabase
      .from('seat_layouts')
      .insert({
        class_id: classId,
        layout_name: 'Sơ đồ Bàn học 4 Tổ 6A6',
        rows: 6,
        cols: 8,
        isCurrent: true,
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
  },

  /**
   * Lấy danh sách phân công chỗ ngồi kèm hồ sơ học sinh
   */
  async getSeatAssignmentsWithStudents(
    layoutId: string,
    classId: string
  ): Promise<SeatAssignmentWithStudent[]> {
    // 1. Lấy assignments
    const { data: assignments, error: assignError } = await supabase
      .from('seat_assignments')
      .select('*')
      .eq('layout_id', layoutId);

    if (assignError) throw assignError;

    // 2. Lấy học sinh đầy đủ thông tin (Tổ, chức vụ, avatar...)
    const students = await studentService.getStudents(classId);
    const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));

    return (assignments || []).map((a) => ({
      id: a.id,
      layoutId: a.layout_id,
      studentId: a.student_id,
      rowIndex: a.row_index,
      colIndex: a.col_index,
      isHidden: a.is_hidden,
      createdAt: a.created_at,
      student: studentMap.get(a.student_id),
    }));
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

    const { data: inserted, error } = await supabase
      .from('seat_assignments')
      .upsert(newRows, { onConflict: 'layout_id,row_index,col_index' })
      .select();

    if (error) {
      console.warn('Lưu phân công chỗ ngồi mặc định:', error);
    }

    const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));

    return (inserted || newRows).map((a, idx) => ({
      id: a.id || `temp-${idx}`,
      layoutId: a.layout_id,
      studentId: a.student_id,
      rowIndex: a.row_index,
      colIndex: a.col_index,
      isHidden: a.is_hidden,
      student: studentMap.get(a.student_id),
    }));
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
  rotateColIndex(colIndex: number): number {
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
    assignments: SeatAssignmentWithStudent[]
  ): SeatAssignmentWithStudent[] {
    return assignments.map((a) => ({
      ...a,
      colIndex: this.rotateColIndex(a.colIndex),
    }));
  },

  /**
   * Lưu toàn bộ danh sách chỗ ngồi mới lên Supabase
   */
  async saveAllAssignments(
    layoutId: string,
    assignments: SeatAssignmentWithStudent[]
  ): Promise<void> {
    const { error: delError } = await supabase
      .from('seat_assignments')
      .delete()
      .eq('layout_id', layoutId);

    if (delError) throw delError;

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
    updates: { rotationEnabled?: boolean; schoolYearStartDate?: string }
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
};
