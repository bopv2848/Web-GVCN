import { supabase } from '../../../services/supabaseClient';
import type { PointCategory, PointTransaction } from '../../../types/points';
import { sandboxService } from '../../sandbox/services/sandboxService';
import { MOCK_POINT_CATEGORIES } from '../../sandbox/constants/mockClassData';

export interface GroupPointsSummary {
  id: string;
  name: string;
  colorClass: string;
  totalPoints: number;
  totalStars: number;
  rank: number;
}

export interface CreateTransactionParams {
  classId: string;
  studentId?: string;
  studentIds?: string[];
  groupId?: string;
  targetType: 'student' | 'students' | 'group' | 'class';
  categoryId?: string;
  points: number;
  stars: number;
  reason: string;
  note?: string;
}

export interface CreateCategoryParams {
  classId: string;
  type: 'add' | 'subtract';
  categoryGroup: 'Học tập' | 'Nề nếp' | 'Phong trào' | 'Đột xuất';
  title: string;
  defaultPoints: number;
  defaultStars?: number;
}

export interface UpdateCategoryParams {
  title?: string;
  categoryGroup?: 'Học tập' | 'Nề nếp' | 'Phong trào' | 'Đột xuất';
  defaultPoints?: number;
  defaultStars?: number;
}

const getLocalTransactions = (classId: string): PointTransaction[] => {
  try {
    const raw = localStorage.getItem(`gvcn_points_tx_${classId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalTransaction = (classId: string, tx: PointTransaction) => {
  try {
    const current = getLocalTransactions(classId);
    const next = [tx, ...current];
    localStorage.setItem(`gvcn_points_tx_${classId}`, JSON.stringify(next));
  } catch (e) {
    console.warn('Lỗi ghi cache sổ cái cục bộ:', e);
  }
};

export const pointsService = {
  /**
   * Lấy danh sách tiêu chí điểm thi đua chuẩn (kèm khử trùng lặp)
   */
  async getCategories(classId: string): Promise<PointCategory[]> {
    if (sandboxService.isSandboxActive()) {
      return sandboxService.getCategories();
    }
    const { data, error } = await supabase
      .from('point_categories')
      .select('*')
      .eq('class_id', classId)
      .order('category_group', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Lỗi tải tiêu chí thi đua hoặc CSDL trống, sử dụng danh mục mẫu chuẩn:', error);
      return MOCK_POINT_CATEGORIES;
    }

    const seen = new Set<string>();
    const uniqueList: PointCategory[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((c: any) => {
      const key = `${c.type}-${c.title?.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push({
          id: c.id,
          type: c.type as 'add' | 'subtract',
          categoryGroup: c.category_group,
          title: c.title,
          defaultPoints: c.default_points,
          defaultStars: c.default_stars,
        });
      }
    });

    return uniqueList;
  },

  /**
   * Bổ sung thêm tiêu chí nề nếp thi đua mới vào CSDL
   */
  async createCategory(params: CreateCategoryParams): Promise<PointCategory> {
    const defaultStars = params.defaultStars ?? (params.type === 'add' ? params.defaultPoints : 0);
    const { data, error } = await supabase
      .from('point_categories')
      .insert({
        class_id: params.classId,
        type: params.type,
        category_group: params.categoryGroup,
        title: params.title.trim(),
        default_points: params.defaultPoints,
        default_stars: defaultStars,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('Lỗi lưu tiêu chí vào CSDL Supabase, sử dụng bộ nhớ cục bộ:', error);
      return {
        id: crypto.randomUUID(),
        type: params.type,
        categoryGroup: params.categoryGroup,
        title: params.title.trim(),
        defaultPoints: params.defaultPoints,
        defaultStars,
      };
    }

    return {
      id: data.id,
      type: data.type as 'add' | 'subtract',
      categoryGroup: data.category_group,
      title: data.title,
      defaultPoints: data.default_points,
      defaultStars: data.default_stars,
    };
  },

  /**
   * Cập nhật thông tin, điểm số và số sao của tiêu chí thi đua
   */
  async updateCategory(
    categoryId: string,
    params: UpdateCategoryParams
  ): Promise<PointCategory | null> {
    const updatePayload: Record<string, unknown> = {};
    if (params.title !== undefined) updatePayload.title = params.title.trim();
    if (params.categoryGroup !== undefined) updatePayload.category_group = params.categoryGroup;
    if (params.defaultPoints !== undefined) updatePayload.default_points = params.defaultPoints;
    if (params.defaultStars !== undefined) updatePayload.default_stars = params.defaultStars;

    const { data, error } = await supabase
      .from('point_categories')
      .update(updatePayload)
      .eq('id', categoryId)
      .select()
      .single();

    if (error || !data) {
      console.warn('Lỗi cập nhật tiêu chí trong CSDL Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      type: data.type as 'add' | 'subtract',
      categoryGroup: data.category_group,
      title: data.title,
      defaultPoints: data.default_points,
      defaultStars: data.default_stars,
    };
  },

  /**
   * Xóa tiêu chí thi đua khỏi CSDL
   */
  async deleteCategory(categoryId: string): Promise<boolean> {
    const { error } = await supabase
      .from('point_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.warn('Lỗi xóa tiêu chí khỏi CSDL:', error);
      return false;
    }
    return true;
  },

  /**
   * Lấy lịch sử các giao dịch cộng/trừ điểm thi đua gần nhất
   */
  async getRecentTransactions(classId: string, limit = 50): Promise<PointTransaction[]> {
    if (sandboxService.isSandboxActive()) {
      return sandboxService.getTransactions().slice(0, limit);
    }
    const localTxs = getLocalTransactions(classId);
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select(`
          id,
          student_id,
          points,
          stars,
          reason,
          note,
          occurred_at,
          created_by,
          reversal_of_id,
          student:student_id (
            full_name,
            group:group_id (
              name
            )
          )
        `)
        .eq('class_id', classId)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        const creatorMap: Record<string, string> = {
          '601dce7f-13e4-4680-b2f9-f86ed1a17079': 'Thầy Phan Văn Bộ (GVCN)',
          'dd877932-f537-412d-baf5-018ba482a1e3': 'Lê Ngọc Anh (Ban cán sự)',
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const remoteTxs: PointTransaction[] = data.map((tx: any) => ({
          id: tx.id,
          studentId: tx.student_id,
          studentName: tx.student?.full_name || 'Học sinh',
          groupName: tx.student?.group?.name || undefined,
          points: tx.points,
          stars: tx.stars,
          reason: tx.reason,
          note: tx.note,
          occurredAt: tx.occurred_at,
          createdBy: creatorMap[tx.created_by] || tx.created_by || 'Thầy Phan Văn Bộ (GVCN)',
          reversalOfId: tx.reversal_of_id,
        }));

        const remoteIds = new Set(remoteTxs.map((t) => t.id));
        const merged = [...localTxs.filter((t) => !remoteIds.has(t.id)), ...remoteTxs];
        merged.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
        return merged.slice(0, limit);
      }
    } catch {
      // Supabase offline
    }

    return localTxs.slice(0, limit);
  },

  /**
   * Tính tổng điểm và xếp hạng thi đua cho 4 Tổ trong lớp
   */
  async getGroupPointsSummary(classId: string): Promise<GroupPointsSummary[]> {
    if (sandboxService.isSandboxActive()) {
      const groups = sandboxService.getGroups();
      const students = sandboxService.getStudents();
      const txs = sandboxService.getTransactions();

      const studentToGroupMap = new Map<string, string>();
      students.forEach((s) => {
        if (s.groupId) studentToGroupMap.set(s.id, s.groupId);
      });

      const summaries: GroupPointsSummary[] = groups.map((g) => ({
        id: g.id,
        name: g.name,
        colorClass: g.colorClass,
        totalPoints: 0,
        totalStars: 0,
        rank: 1,
      }));

      const groupSummaryMap = new Map<string, GroupPointsSummary>();
      summaries.forEach((s) => groupSummaryMap.set(s.id, s));

      txs.forEach((tx) => {
        const gId = studentToGroupMap.get(tx.studentId);
        if (gId && groupSummaryMap.has(gId)) {
          const item = groupSummaryMap.get(gId)!;
          item.totalPoints += tx.points;
          item.totalStars += tx.stars || 0;
        }
      });

      summaries.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        return b.totalStars - a.totalStars;
      });

      summaries.forEach((item, index) => {
        item.rank = index + 1;
      });

      return summaries;
    }

    // 1. Lấy danh sách tổ
    const { data: groups, error: groupErr } = await supabase
      .from('groups')
      .select('id, name, color_class, order_index')
      .eq('class_id', classId)
      .order('order_index', { ascending: true });

    if (groupErr || !groups) {
      console.warn('Lỗi lấy danh sách tổ:', groupErr);
      return [];
    }

    // 2. Lấy học sinh để ánh xạ group_id
    const { data: students } = await supabase
      .from('students')
      .select('id, group_id')
      .eq('class_id', classId)
      .is('deleted_at', null);

    const studentToGroupMap = new Map<string, string>();
    students?.forEach((s) => {
      if (s.group_id) studentToGroupMap.set(s.id, s.group_id);
    });

    // 3. Lấy tất cả giao dịch điểm (kết hợp cả local transactions)
    const { data: txs } = await supabase
      .from('point_transactions')
      .select('student_id, points, stars')
      .eq('class_id', classId);

    const localTxs = getLocalTransactions(classId);

    // 4. Khởi tạo bảng tổng hợp 4 tổ
    const summaries: GroupPointsSummary[] = groups.map((g) => ({
      id: g.id,
      name: g.name,
      colorClass: g.color_class,
      totalPoints: 0,
      totalStars: 0,
      rank: 1,
    }));

    const groupSummaryMap = new Map<string, GroupPointsSummary>();
    summaries.forEach((s) => groupSummaryMap.set(s.id, s));

    // 5. Cộng dồn điểm và sao
    const allTxs = [...(txs || []), ...localTxs.map((t) => ({ student_id: t.studentId, points: t.points, stars: t.stars }))];
    allTxs.forEach((tx) => {
      const gId = studentToGroupMap.get(tx.student_id);
      if (gId && groupSummaryMap.has(gId)) {
        const item = groupSummaryMap.get(gId)!;
        item.totalPoints += tx.points;
        item.totalStars += tx.stars;
      }
    });

    // 6. Xếp hạng các tổ
    summaries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.totalStars - a.totalStars;
    });

    summaries.forEach((item, index) => {
      item.rank = index + 1;
    });

    return summaries;
  },

  /**
   * Ghi nhận giao dịch điểm mới (Append-only) cho Cá nhân, Tổ hoặc Cả lớp
   */
  async createTransaction(params: CreateTransactionParams) {
    if (sandboxService.isSandboxActive()) {
      const mockStudents = sandboxService.getStudents();
      let targetStudentIds: string[] = [];

      if (params.targetType === 'student' || params.targetType === 'students') {
        if (params.studentIds && params.studentIds.length > 0) {
          targetStudentIds = params.studentIds;
        } else if (params.studentId) {
          targetStudentIds = [params.studentId];
        }
      } else if (params.targetType === 'group') {
        targetStudentIds = mockStudents.filter((s) => s.groupId === params.groupId).map((s) => s.id);
      } else if (params.targetType === 'class') {
        targetStudentIds = mockStudents.map((s) => s.id);
      }

      const results = targetStudentIds.map((sid) => {
        const student = mockStudents.find((s) => s.id === sid);
        const tx: PointTransaction = {
          id: `tx-mock-${Date.now()}-${sid}`,
          studentId: sid,
          studentName: student?.fullName || 'Học sinh',
          groupName: student?.groupName,
          points: params.points,
          stars: params.stars || 0,
          reason: params.reason,
          note: params.note,
          occurredAt: new Date().toISOString(),
          createdBy: 'Thầy Phan Văn Bộ (GVCN)',
        };
        sandboxService.addTransaction(tx);
        return tx;
      });

      return results;
    }

    let userId: string | undefined = undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) userId = user.id;
    } catch {
      // Môi trường dev hoặc offline
    }

    let targetStudentIds: string[] = [];

    if (params.targetType === 'student' || params.targetType === 'students') {
      if (params.studentIds && params.studentIds.length > 0) {
        targetStudentIds = params.studentIds;
      } else if (params.studentId) {
        targetStudentIds = [params.studentId];
      } else {
        throw new Error('Chưa chọn học sinh nào');
      }
    } else if (params.targetType === 'group') {
      if (!params.groupId) throw new Error('Chưa chọn tổ');
      try {
        const { data: stds } = await supabase
          .from('students')
          .select('id')
          .eq('group_id', params.groupId)
          .is('deleted_at', null);
        targetStudentIds = stds?.map((s) => s.id) || [];
      } catch {
        targetStudentIds = [];
      }
    } else if (params.targetType === 'class') {
      try {
        const { data: stds } = await supabase
          .from('students')
          .select('id')
          .eq('class_id', params.classId)
          .is('deleted_at', null);
        targetStudentIds = stds?.map((s) => s.id) || [];
      } catch {
        targetStudentIds = [];
      }
    }

    if (targetStudentIds.length === 0) {
      throw new Error('Không tìm thấy học sinh nào để áp dụng điểm');
    }

    const rowsToInsert = targetStudentIds.map((sid) => ({
      class_id: params.classId,
      student_id: sid,
      category_id: params.categoryId || null,
      points: params.points,
      stars: params.stars,
      reason: params.reason,
      note: params.note || null,
      ...(userId ? { created_by: userId } : {}),
    }));

    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .insert(rowsToInsert)
        .select();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Lỗi ghi nhận điểm lên Supabase, chuyển sang lưu cục bộ:', err);
    }

    // Dự phòng lưu cục bộ khi chưa đăng nhập hoặc offline
    const fallbackResults = rowsToInsert.map((r, idx) => {
      const tx: PointTransaction = {
        id: `local-tx-${Date.now()}-${idx}`,
        studentId: r.student_id,
        points: r.points,
        stars: r.stars,
        reason: r.reason,
        note: r.note || undefined,
        occurredAt: new Date().toISOString(),
        createdBy: userId || 'Thầy Phan Văn Bộ (GVCN)',
      };
      saveLocalTransaction(params.classId, tx);
      return tx;
    });

    return fallbackResults;
  },

  /**
   * Hoàn tác giao dịch điểm thi đua (Tạo bản ghi đảo ngược Reversal)
   */
  async reverseTransaction(transactionId: string, reason: string) {
    if (sandboxService.isSandboxActive()) {
      sandboxService.deleteTransaction(transactionId);
      return { id: `rev-${transactionId}`, success: true };
    }
    let userId: string | undefined = undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) userId = user.id;
    } catch {
      // Offline / dev
    }

    // 1. Cố gắng hoàn tác trên Supabase
    try {
      const { data: orig, error: fetchErr } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (!fetchErr && orig) {
        const { data, error } = await supabase
          .from('point_transactions')
          .insert({
            class_id: orig.class_id,
            student_id: orig.student_id,
            category_id: orig.category_id,
            points: -orig.points,
            stars: -orig.stars,
            reason: `[HOÀN TÁC] ${reason} (Giao dịch gốc: ${orig.reason})`,
            note: reason,
            ...(userId ? { created_by: userId } : {}),
            reversal_of_id: orig.id,
          })
          .select()
          .single();

        if (!error && data) return data;
      }
    } catch (err) {
      console.warn('Lỗi hoàn tác trên Supabase:', err);
    }

    // 2. Dự phòng hoàn tác trong bộ nhớ cục bộ
    return null;
  },

  /**
   * Lấy danh mục tên người dùng (GVCN, Ban cán sự) để hiển thị tên thay vì mã UUID
   */
  async getProfilesMap(): Promise<Record<string, string>> {
    const defaultMap: Record<string, string> = {
      '601dce7f-13e4-4680-b2f9-f86ed1a17079': 'Thầy Phan Văn Bộ (GVCN)',
      'dd877932-f537-412d-baf5-018ba482a1e3': 'Lê Ngọc Anh (Lớp trưởng)',
    };
    try {
      const { data, error } = await supabase.from('profiles').select('id, full_name, system_role');
      if (!error && data) {
        data.forEach((p) => {
          defaultMap[p.id] = p.full_name;
        });
      }
    } catch {
      // Offline fallback
    }
    return defaultMap;
  },

  /**
   * Lắng nghe biến động điểm thi đua Realtime WebSockets 2 chiều (INSERT, UPDATE, DELETE)
   */
  subscribeToPoints(
    classId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onTransactionChange: (payload: any) => void,
    onStatusChange?: (status: string) => void
  ) {
    const channelName = `realtime-points-${classId}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'point_transactions',
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          onTransactionChange(payload);
        }
      )
      .subscribe((status) => {
        onStatusChange?.(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
