import { describe, it, expect, beforeEach } from 'vitest';
import { studentService } from './studentService';
import { sandboxService } from '../../sandbox/services/sandboxService';

describe('studentService - Xóa toàn bộ học sinh và nhập lại', () => {
  const testClassId = 'test-class-id-123';

  beforeEach(() => {
    localStorage.clear();
    sandboxService.resetSandbox();
  });

  it('xóa sạch toàn bộ học sinh trong sandbox và getStudents trả về mảng rỗng []', async () => {
    // Ban đầu có học sinh mock
    const initialStudents = await studentService.getStudents(testClassId);
    expect(initialStudents.length).toBeGreaterThan(0);

    // Thực hiện xóa sạch toàn bộ
    const deleteRes = await studentService.deleteAllStudents(testClassId);
    expect(deleteRes.count).toBe(initialStudents.length);

    // Kiểm tra cờ cleared đã được ghi
    expect(localStorage.getItem(`gvcn_class_cleared_${testClassId}`)).toBe('true');

    // Sau khi xóa, getStudents phải trả về [] chứ không được fallback về 47 học sinh mẫu
    const afterDelete = await studentService.getStudents(testClassId);
    expect(afterDelete).toEqual([]);
    expect(afterDelete.length).toBe(0);

    // Tự động làm mới và xóa sạch sơ đồ chỗ ngồi để không lưu vết học sinh cũ
    expect(localStorage.getItem(`seating_assignments_${testClassId}`)).toBeNull();
    const sandboxSeating = sandboxService.getSeating();
    expect(sandboxSeating.assignments).toEqual([]);
  });

  it('tự động gỡ cờ cleared khi thêm một học sinh mới thủ công', async () => {
    await studentService.deleteAllStudents(testClassId);
    expect(localStorage.getItem(`gvcn_class_cleared_${testClassId}`)).toBe('true');

    // Thêm 1 học sinh mới
    await studentService.createStudent(testClassId, {
      fullName: 'Nguyễn Văn Mới',
      gender: 'Nam',
    });

    // Cờ cleared phải bị xóa
    expect(localStorage.getItem(`gvcn_class_cleared_${testClassId}`)).toBeNull();

    // getStudents trả về học sinh mới
    const students = await studentService.getStudents(testClassId);
    expect(students.length).toBe(1);
    expect(students[0].fullName).toBe('Nguyễn Văn Mới');
  });

  it('hỗ trợ tùy chọn clearExistingBeforeImport trong batchImportStudents để xóa sạch danh sách cũ trước khi nạp', async () => {
    // Ban đầu có học sinh cũ
    const initial = await studentService.getStudents(testClassId);
    expect(initial.length).toBeGreaterThan(0);

    // Nạp tệp mới với tùy chọn clearExistingBeforeImport = true
    const newBatch = [
      { fullName: 'Trần Thị Học Sinh Mới 1', gender: 'Nữ' as const },
      { fullName: 'Lê Văn Học Sinh Mới 2', gender: 'Nam' as const },
    ];

    const importRes = await studentService.batchImportStudents(
      testClassId,
      newBatch,
      'skip',
      true // clearExistingBeforeImport
    );

    expect(importRes.inserted).toBe(2);

    const afterImport = await studentService.getStudents(testClassId);
    expect(afterImport.length).toBe(2);
    expect(afterImport.map((s) => s.fullName)).toContain('Trần Thị Học Sinh Mới 1');
    expect(afterImport.map((s) => s.fullName)).toContain('Lê Văn Học Sinh Mới 2');
  });

  describe('Phân quyền bảo mật RBAC cho deleteAllStudents', () => {
    it('cho phép GVCN và Admin gọi deleteAllStudents thành công', async () => {
      // GVCN
      const resGvcn = await studentService.deleteAllStudents(testClassId, 'gvcn');
      expect(resGvcn.count).toBeGreaterThanOrEqual(0);

      // Admin
      const resAdmin = await studentService.deleteAllStudents(testClassId, { role: 'admin' });
      expect(resAdmin.count).toBe(0);
    });

    it('TỪ CHỐI Giáo viên bộ môn (teacher) gọi deleteAllStudents', async () => {
      await expect(
        studentService.deleteAllStudents(testClassId, 'teacher')
      ).rejects.toThrow(/Từ chối quyền: Chỉ Giáo viên chủ nhiệm chính thức/i);

      await expect(
        studentService.deleteAllStudents(testClassId, { role: 'teacher', membershipRole: 'teacher' })
      ).rejects.toThrow(/Từ chối quyền: Chỉ Giáo viên chủ nhiệm chính thức/i);
    });

    it('TỪ CHỐI Ban cán sự lớp (bancansu) gọi deleteAllStudents', async () => {
      await expect(
        studentService.deleteAllStudents(testClassId, 'bancansu')
      ).rejects.toThrow(/Từ chối quyền: Chỉ Giáo viên chủ nhiệm chính thức/i);
    });

    it('TỪ CHỐI khi batchImportStudents cố tình bật clearExistingBeforeImport với role teacher', async () => {
      const newBatch = [{ fullName: 'Test Student', gender: 'Nam' as const }];
      await expect(
        studentService.batchImportStudents(
          testClassId,
          newBatch,
          'skip',
          true,
          'teacher'
        )
      ).rejects.toThrow(/Từ chối quyền: Chỉ Giáo viên chủ nhiệm chính thức/i);
    });
  });
});
