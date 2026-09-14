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
  groupId?: string;
  targetType: 'student' | 'group' | 'class';
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
  async getRecentTransactions(classId: string, limit = 20): Promise<PointTransaction[]> {
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

    if (error || !data) {
      console.warn('Lỗi lấy sổ cái thi đua:', error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((tx: any) => ({
      id: tx.id,
      studentId: tx.student_id,
      studentName: tx.student?.full_name || 'Học sinh',
      points: tx.points,
      stars: tx.stars,
      reason: tx.reason,
      note: tx.note,
      occurredAt: tx.occurred_at,
      createdBy: tx.created_by,
      reversalOfId: tx.reversal_of_id,
    }));
  },

  /**
   * Tính tổng điểm và xếp hạng thi đua cho 4 Tổ trong lớp
   */
  async getGroupPointsSummary(classId: string): Promise<GroupPointsSummary[]> {
    // 1. Lấy danh sách tổ
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, color_class, order_index')
      .eq('class_id', classId)
      .order('order_index', { ascending: true });

    if (!groups || groups.length === 0) return [];

    // 2. Lấy toàn bộ giao dịch điểm
    const { data: txList } = await supabase
      .from('point_transactions')
      .select(`
        points,
        stars,
        student:student_id (
          group_id
        )
      `)
      .eq('class_id', classId);

    // Tính toán tổng điểm theo groupId
    const groupTotals: Record<string, { points: number; stars: number }> = {};
    groups.forEach((g) => {
      groupTotals[g.id] = { points: 0, stars: 0 };
    });

    if (txList) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      txList.forEach((tx: any) => {
        const gid = tx.student?.group_id;
        if (gid && groupTotals[gid]) {
          groupTotals[gid].points += tx.points || 0;
          groupTotals[gid].stars += tx.stars || 0;
        }
      });
    }

    // Xếp hạng theo điểm từ cao xuống thấp
    const summaries: GroupPointsSummary[] = groups.map((g) => ({
      id: g.id,
      name: g.name,
      colorClass: g.color_class,
      totalPoints: groupTotals[g.id]?.points || 0,
      totalStars: groupTotals[g.id]?.stars || 0,
      rank: 1,
    }));

    summaries.sort((a, b) => b.totalPoints - a.totalPoints);
    summaries.forEach((item, index) => {
      item.rank = index + 1;
    });

    return summaries;
  },

  /**
   * Ghi nhận giao dịch điểm mới (Append-only) cho Cá nhân, Tổ hoặc Cả lớp
   */
  async createTransaction(params: CreateTransactionParams) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Chưa đăng nhập');

    let targetStudentIds: string[] = [];

    if (params.targetType === 'student') {
      if (!params.studentId) throw new Error('Chưa chọn học sinh');
      targetStudentIds = [params.studentId];
    } else if (params.targetType === 'group') {
      if (!params.groupId) throw new Error('Chưa chọn tổ');
      const { data: stds } = await supabase
        .from('students')
        .select('id')
        .eq('group_id', params.groupId)
        .is('deleted_at', null);
      targetStudentIds = stds?.map((s) => s.id) || [];
    } else if (params.targetType === 'class') {
      const { data: stds } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', params.classId)
        .is('deleted_at', null);
      targetStudentIds = stds?.map((s) => s.id) || [];
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
      created_by: user.id,
    }));

    const { data, error } = await supabase
      .from('point_transactions')
      .insert(rowsToInsert)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Hoàn tác giao dịch điểm thi đua (Tạo bản ghi đảo ngược Reversal)
   */
  async reverseTransaction(transactionId: string, reason: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Chưa đăng nhập');

    // 1. Lấy giao dịch gốc
    const { data: orig, error: fetchErr } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchErr || !orig) throw new Error('Không tìm thấy giao dịch gốc');

    // 2. Tạo giao dịch bù trừ đảo ngược
    const { data, error } = await supabase
      .from('point_transactions')
      .insert({
        class_id: orig.class_id,
        student_id: orig.student_id,
        category_id: orig.category_id,
        points: -orig.points,
        stars: -orig.stars,
        reason: `[HOÀN TÁC] ${reason} (Cho GD: ${orig.reason})`,
        created_by: user.id,
        reversal_of_id: orig.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
