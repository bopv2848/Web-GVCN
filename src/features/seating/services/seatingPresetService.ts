import { supabase } from '../../../services/supabaseClient';
import { sandboxService } from '../../sandbox/services/sandboxService';
import type { SeatAssignmentWithStudent, SeatingPreset, ClassroomElementsConfig } from '../../../types/seating';
import type { Student } from '../../../types/student';

const PRESETS_STORAGE_PREFIX = 'gvcn_seating_presets_';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id?: string): boolean {
  return !!id && UUID_REGEX.test(id);
}

export const seatingPresetService = {
  /**
   * Đọc nhanh danh sách bản mẫu từ bộ nhớ đệm LocalStorage (để hiển thị tức thì không độ trễ)
   */
  getPresets(classId: string): SeatingPreset[] {
    try {
      const raw = localStorage.getItem(`${PRESETS_STORAGE_PREFIX}${classId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Lỗi đọc bản mẫu sơ đồ từ LocalStorage:', err);
      return [];
    }
  },

  /**
   * Đồng bộ và tải danh sách bản mẫu từ Cloud Supabase về thiết bị
   */
  async fetchPresets(classId: string): Promise<SeatingPreset[]> {
    if (sandboxService.isSandboxActive() || !isValidUUID(classId)) {
      return this.getPresets(classId);
    }

    try {
      const { data, error } = await supabase
        .from('seating_presets')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Lỗi tải bản mẫu sơ đồ từ Cloud Supabase, sử dụng bộ nhớ đệm:', error.message);
        return this.getPresets(classId);
      }

      const cloudPresets: SeatingPreset[] = (data || []).map((row: any) => ({
        id: row.id,
        classId: row.class_id,
        name: row.name,
        description: row.description || undefined,
        createdAt: row.created_at,
        assignments: Array.isArray(row.assignments) ? row.assignments : [],
        elementsConfig: row.elements_config || undefined,
      }));

      // Tự động đồng bộ các bản mẫu tạo lúc ngoại tuyến (offline) lên Cloud
      const localPresets = this.getPresets(classId);
      const unsyncedLocals = localPresets.filter((lp) => lp.id.startsWith('preset-'));
      if (unsyncedLocals.length > 0) {
        for (const localP of unsyncedLocals) {
          try {
            const insertPayload: any = {
              class_id: classId,
              name: localP.name,
              description: localP.description || null,
              assignments: localP.assignments,
            };
            if (localP.elementsConfig) {
              insertPayload.elements_config = localP.elementsConfig;
            }

            let { data: uploaded, error: upErr } = await supabase
              .from('seating_presets')
              .insert(insertPayload)
              .select()
              .single();

            // Nếu Cloud chưa có cột elements_config, thử lại không gửi cột này
            if (upErr && localP.elementsConfig) {
              const fallback = await supabase
                .from('seating_presets')
                .insert({
                  class_id: classId,
                  name: localP.name,
                  description: localP.description || null,
                  assignments: localP.assignments,
                })
                .select()
                .single();
              uploaded = fallback.data;
              upErr = fallback.error;
            }

            if (!upErr && uploaded) {
              cloudPresets.unshift({
                id: uploaded.id,
                classId: uploaded.class_id,
                name: uploaded.name,
                description: uploaded.description || undefined,
                createdAt: uploaded.created_at,
                assignments: uploaded.assignments || [],
                elementsConfig: uploaded.elements_config || localP.elementsConfig,
              });
            }
          } catch (e) {
            console.warn('Không thể đồng bộ bản mẫu ngoại tuyến lên Cloud:', e);
          }
        }
      }

      // Cập nhật bộ nhớ đệm LocalStorage
      localStorage.setItem(`${PRESETS_STORAGE_PREFIX}${classId}`, JSON.stringify(cloudPresets));
      return cloudPresets;
    } catch (err) {
      console.warn('Lỗi kết nối Supabase Cloud (seating_presets):', err);
      return this.getPresets(classId);
    }
  },

  /**
   * Lưu sơ đồ hiện tại thành một bản mẫu mới lên Supabase Cloud và đồng bộ LocalStorage
   */
  async savePreset(
    classId: string,
    name: string,
    description: string,
    assignments: SeatAssignmentWithStudent[],
    elementsConfig?: Partial<ClassroomElementsConfig>
  ): Promise<SeatingPreset> {
    const trimmedName = name.trim() || `Bản mẫu ${new Date().toLocaleDateString('vi-VN')}`;
    const cleanDescription = description.trim() || undefined;
    const payloadAssignments = assignments.map((a) => ({
      studentId: a.studentId,
      rowIndex: a.rowIndex,
      colIndex: a.colIndex,
      isHidden: a.isHidden || false,
    }));

    let savedPreset: SeatingPreset | null = null;

    // 1. Lưu lên Cloud Supabase nếu có kết nối mạng và ID lớp hợp lệ
    if (!sandboxService.isSandboxActive() && isValidUUID(classId)) {
      try {
        const payload: any = {
          class_id: classId,
          name: trimmedName,
          description: cleanDescription || null,
          assignments: payloadAssignments,
        };
        if (elementsConfig) {
          payload.elements_config = elementsConfig;
        }

        let { data, error } = await supabase
          .from('seating_presets')
          .insert(payload)
          .select()
          .single();

        // Dự phòng nếu DB Supabase chưa chạy migration cột elements_config
        if (error && elementsConfig) {
          console.warn('Cột elements_config chưa tồn tại trên Cloud, lưu với cấu trúc cơ bản:', error.message);
          const fallbackRes = await supabase
            .from('seating_presets')
            .insert({
              class_id: classId,
              name: trimmedName,
              description: cleanDescription || null,
              assignments: payloadAssignments,
            })
            .select()
            .single();
          data = fallbackRes.data;
          error = fallbackRes.error;
        }

        if (!error && data) {
          savedPreset = {
            id: data.id,
            classId: data.class_id,
            name: data.name,
            description: data.description || undefined,
            createdAt: data.created_at,
            assignments: data.assignments || [],
            elementsConfig: data.elements_config || elementsConfig,
          };
        } else if (error) {
          console.warn('Lỗi lưu bản mẫu lên Cloud Supabase:', error.message);
        }
      } catch (cloudErr) {
        console.warn('Không thể kết nối Supabase Cloud để lưu bản mẫu:', cloudErr);
      }
    }

    // 2. Dự phòng: Nếu offline hoặc lỗi mạng, tạo ID cục bộ an toàn
    if (!savedPreset) {
      savedPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        classId,
        name: trimmedName,
        description: cleanDescription,
        createdAt: new Date().toISOString(),
        assignments: payloadAssignments,
        elementsConfig,
      };
    }

    // 3. Cập nhật LocalStorage
    const currentPresets = this.getPresets(classId);
    const updated = [savedPreset, ...currentPresets.filter((p) => p.id !== savedPreset!.id)];
    try {
      localStorage.setItem(`${PRESETS_STORAGE_PREFIX}${classId}`, JSON.stringify(updated));
    } catch (err) {
      console.error('Lỗi lưu bản mẫu sơ đồ vào LocalStorage:', err);
    }

    return savedPreset;
  },

  /**
   * Xóa một bản mẫu sơ đồ khỏi Supabase Cloud và bộ nhớ đệm
   */
  async deletePreset(classId: string, presetId: string): Promise<boolean> {
    // 1. Xóa khỏi Supabase Cloud nếu là UUID hợp lệ
    if (!sandboxService.isSandboxActive() && isValidUUID(presetId)) {
      try {
        const { error } = await supabase.from('seating_presets').delete().eq('id', presetId);
        if (error) {
          console.warn('Lỗi xóa bản mẫu trên Supabase Cloud:', error.message);
        }
      } catch (cloudErr) {
        console.warn('Không thể kết nối Supabase Cloud khi xóa bản mẫu:', cloudErr);
      }
    }

    // 2. Cập nhật LocalStorage
    const current = this.getPresets(classId);
    const filtered = current.filter((p) => p.id !== presetId);
    try {
      localStorage.setItem(`${PRESETS_STORAGE_PREFIX}${classId}`, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Lỗi cập nhật LocalStorage khi xóa bản mẫu:', err);
      return false;
    }
  },

  /**
   * Cập nhật tên và mô tả của bản mẫu sơ đồ trên Supabase Cloud và LocalStorage
   */
  async updatePreset(
    classId: string,
    presetId: string,
    name: string,
    description?: string
  ): Promise<SeatingPreset | null> {
    const trimmedName = name.trim();
    if (!trimmedName) return null;
    const cleanDescription = description?.trim() || undefined;

    // 1. Cập nhật trên Cloud Supabase nếu là UUID hợp lệ
    if (!sandboxService.isSandboxActive() && isValidUUID(presetId)) {
      try {
        const { error } = await supabase
          .from('seating_presets')
          .update({
            name: trimmedName,
            description: cleanDescription || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', presetId);

        if (error) {
          console.warn('Lỗi cập nhật bản mẫu trên Supabase Cloud:', error.message);
        }
      } catch (cloudErr) {
        console.warn('Không thể kết nối Supabase Cloud khi cập nhật bản mẫu:', cloudErr);
      }
    }

    // 2. Cập nhật LocalStorage
    const current = this.getPresets(classId);
    let updatedPreset: SeatingPreset | null = null;

    const next = current.map((p) => {
      if (p.id === presetId) {
        updatedPreset = {
          ...p,
          name: trimmedName,
          description: cleanDescription,
        };
        return updatedPreset;
      }
      return p;
    });

    try {
      localStorage.setItem(`${PRESETS_STORAGE_PREFIX}${classId}`, JSON.stringify(next));
    } catch (err) {
      console.error('Lỗi cập nhật LocalStorage:', err);
    }

    return updatedPreset;
  },

  /**
   * Chuyển đổi dữ liệu bản mẫu sang danh sách phân công chỗ ngồi tương thích với danh sách học sinh hiện tại
   */
  convertPresetToAssignments(
    preset: SeatingPreset,
    allStudents: Student[],
    layoutId: string
  ): SeatAssignmentWithStudent[] {
    const studentMap = new Map<string, Student>(allStudents.map((s) => [s.id, s]));

    return preset.assignments
      .filter((item) => studentMap.has(item.studentId))
      .map((item, idx) => ({
        id: `asg-preset-${idx}-${item.studentId}`,
        layoutId,
        studentId: item.studentId,
        rowIndex: item.rowIndex,
        colIndex: item.colIndex,
        isHidden: item.isHidden || false,
        student: studentMap.get(item.studentId),
        createdAt: new Date().toISOString(),
      }));
  },
};
