import { supabase } from '../../../services/supabaseClient';
import type {
  CompanionCase,
  CompanionUpdate,
  CompanionFormData,
  CompanionUpdateFormData,
  CompanionKpiSummary,
} from '../types';

export const companionService = {
  /**
   * Lấy danh sách hồ sơ đồng hành của lớp (chỉ GVCN và Admin mới được phép đọc theo RLS)
   */
  async getCompanionCases(classId: string): Promise<CompanionCase[]> {
    const { data: casesData, error: casesError } = await supabase
      .from('companion_cases')
      .select(`
        id,
        class_id,
        student_id,
        start_date,
        status,
        severity_level,
        primary_concern,
        action_plan,
        created_by,
        created_at,
        updated_at,
        deleted_at
      `)
      .eq('class_id', classId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (casesError) {
      console.error('Lỗi truy vấn hồ sơ đồng hành:', casesError);
      throw casesError;
    }

    if (!casesData || casesData.length === 0) {
      return [];
    }

    // Lấy thông tin học sinh và tổ tương ứng
    const studentIds = casesData.map((c) => c.student_id);
    const caseIds = casesData.map((c) => c.id);

    const [studentsRes, updatesRes] = await Promise.all([
      supabase
        .from('students')
        .select('id, full_name, code, avatar_url, group_id, groups(name)')
        .in('id', studentIds),
      supabase
        .from('companion_updates')
        .select('id, case_id, update_date')
        .in('case_id', caseIds),
    ]);

    const studentMap = new Map<string, { name: string; code: string; avatarUrl?: string; groupName: string }>();
    if (studentsRes.data) {
      studentsRes.data.forEach((s) => {
        const groupObj = s.groups as unknown as { name?: string } | null;
        studentMap.set(s.id, {
          name: s.full_name,
          code: s.code || `HS${s.id.slice(0, 4)}`,
          avatarUrl: s.avatar_url,
          groupName: groupObj?.name || 'Chưa xếp tổ',
        });
      });
    }

    // Đếm số lượng updates cho từng ca
    const updatesMap = new Map<string, { count: number; lastDate?: string }>();
    if (updatesRes.data) {
      updatesRes.data.forEach((u) => {
        const existing = updatesMap.get(u.case_id) || { count: 0 };
        existing.count++;
        if (!existing.lastDate || u.update_date > existing.lastDate) {
          existing.lastDate = u.update_date;
        }
        updatesMap.set(u.case_id, existing);
      });
    }

    return casesData.map((c) => {
      const student = studentMap.get(c.student_id);
      const updateStat = updatesMap.get(c.id) || { count: 0 };

      return {
        id: c.id,
        classId: c.class_id,
        studentId: c.student_id,
        studentName: student?.name || 'Học sinh',
        studentCode: student?.code || '',
        studentAvatarUrl: student?.avatarUrl,
        groupName: student?.groupName || '',
        startDate: c.start_date,
        status: c.status,
        severityLevel: c.severity_level,
        primaryConcern: c.primary_concern,
        actionPlan: c.action_plan,
        createdBy: c.created_by,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        updatesCount: updateStat.count,
        lastUpdateDate: updateStat.lastDate,
      };
    });
  },

  /**
   * Tạo hồ sơ đồng hành mới
   */
  async createCompanionCase(
    classId: string,
    authorId: string,
    formData: CompanionFormData
  ): Promise<string> {
    const { data, error } = await supabase
      .from('companion_cases')
      .insert({
        class_id: classId,
        student_id: formData.studentId,
        start_date: formData.startDate,
        status: formData.status,
        severity_level: formData.severityLevel,
        primary_concern: formData.primaryConcern,
        action_plan: formData.actionPlan,
        created_by: authorId,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Lỗi tạo hồ sơ đồng hành:', error);
      throw error;
    }

    return data.id;
  },

  /**
   * Cập nhật thông tin hồ sơ đồng hành
   */
  async updateCompanionCase(
    caseId: string,
    formData: Partial<CompanionFormData>
  ): Promise<void> {
    const updatePayload: Record<string, unknown> = {};
    if (formData.status !== undefined) updatePayload.status = formData.status;
    if (formData.severityLevel !== undefined) updatePayload.severity_level = formData.severityLevel;
    if (formData.primaryConcern !== undefined) updatePayload.primary_concern = formData.primaryConcern;
    if (formData.actionPlan !== undefined) updatePayload.action_plan = formData.actionPlan;
    if (formData.startDate !== undefined) updatePayload.start_date = formData.startDate;

    const { error } = await supabase
      .from('companion_cases')
      .update(updatePayload)
      .eq('id', caseId);

    if (error) {
      console.error('Lỗi cập nhật hồ sơ đồng hành:', error);
      throw error;
    }
  },

  /**
   * Xóa mềm hồ sơ đồng hành (bảo toàn lịch sử)
   */
  async softDeleteCase(caseId: string): Promise<void> {
    const { error } = await supabase
      .from('companion_cases')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', caseId);

    if (error) {
      console.error('Lỗi xóa mềm hồ sơ đồng hành:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử tiến trình và nhật ký trao đổi của ca
   */
  async getCaseUpdates(caseId: string): Promise<CompanionUpdate[]> {
    const { data, error } = await supabase
      .from('companion_updates')
      .select('*')
      .eq('case_id', caseId)
      .order('update_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi nạp nhật ký ca đồng hành:', error);
      throw error;
    }

    return (data || []).map((u) => ({
      id: u.id,
      caseId: u.case_id,
      updateDate: u.update_date,
      observationNotes: u.observation_notes,
      interactionSummary: u.interaction_summary,
      createdBy: u.created_by,
      createdAt: u.created_at,
    }));
  },

  /**
   * Ghi nhận thêm 1 mốc nhật ký hoặc biên bản làm việc
   */
  async addCaseUpdate(
    caseId: string,
    authorId: string,
    formData: CompanionUpdateFormData
  ): Promise<CompanionUpdate> {
    const { data, error } = await supabase
      .from('companion_updates')
      .insert({
        case_id: caseId,
        update_date: formData.updateDate,
        observation_notes: formData.observationNotes,
        interaction_summary: formData.interactionSummary || null,
        created_by: authorId,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Lỗi thêm nhật ký ca đồng hành:', error);
      throw error;
    }

    // Cập nhật timestamp của case
    await supabase
      .from('companion_cases')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', caseId);

    return {
      id: data.id,
      caseId: data.case_id,
      updateDate: data.update_date,
      observationNotes: data.observation_notes,
      interactionSummary: data.interaction_summary,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  },

  /**
   * Xóa 1 bản ghi nhật ký
   */
  async deleteCaseUpdate(updateId: string): Promise<void> {
    const { error } = await supabase
      .from('companion_updates')
      .delete()
      .eq('id', updateId);

    if (error) {
      console.error('Lỗi xóa bản ghi nhật ký:', error);
      throw error;
    }
  },

  /**
   * Tính toán KPI tổng quan các ca đồng hành
   */
  calculateKpi(cases: CompanionCase[]): CompanionKpiSummary {
    return {
      totalCases: cases.length,
      activeCount: cases.filter((c) => c.status === 'active').length,
      monitoringCount: cases.filter((c) => c.status === 'monitoring').length,
      completedCount: cases.filter((c) => c.status === 'completed').length,
      criticalCount: cases.filter((c) => c.severityLevel === 'critical' && c.status !== 'completed').length,
    };
  },
};
