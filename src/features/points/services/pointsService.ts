import { supabase } from '../../../services/supabaseClient';
import type { PointCategory, PointTransaction } from '../../../types/points';

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
    const { data, error } = await supabase
      .from('point_categories')
      .select('*')
      .eq('class_id', classId)
      .order('category_group', { ascending: true });

    if (error || !data) {
      console.warn('Lỗi tải tiêu chí thi đua:', error);
      return [];
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
          createdBy: tx.created_by,
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
    let userId = 'dev-gvcn-001';
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
      created_by: userId,
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
        createdBy: userId,
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
    let userId = 'dev-gvcn-001';
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
            reason: `[HOÀN TÁC] ${reason} (Cho GD: ${orig.reason})`,
            created_by: userId,
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
   * Lắng nghe biến động điểm thi đua Realtime WebSockets
   */
  subscribeToPoints(
    classId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onNewTransaction: (payload: any) => void
  ) {
    const channelName = `realtime-points-${classId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'point_transactions',
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          onNewTransaction(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
