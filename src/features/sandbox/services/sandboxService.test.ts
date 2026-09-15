import { describe, it, expect, beforeEach } from 'vitest';
import { sandboxService } from './sandboxService';

describe('sandboxService (Chế độ Thử nghiệm Cục bộ)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Mặc định Sandbox chưa kích hoạt', () => {
    expect(sandboxService.isSandboxActive()).toBe(false);
  });

  it('2. Kích hoạt Sandbox sẽ nạp đầy đủ 40 học sinh và 4 tổ mẫu', () => {
    sandboxService.enableSandbox(true);
    expect(sandboxService.isSandboxActive()).toBe(true);

    const students = sandboxService.getStudents();
    expect(students.length).toBe(40);

    const groups = sandboxService.getGroups();
    expect(groups.length).toBe(4);

    const stats = sandboxService.getStats();
    expect(stats.totalStudents).toBe(40);
    expect(stats.totalGroups).toBe(4);
    expect(stats.totalPointTransactions).toBeGreaterThanOrEqual(50);
    expect(stats.totalAttendanceSessions).toBe(10);
    expect(stats.hasSeatingLayout).toBe(true);
  });

  it('3. Thao tác thêm, sửa, xóa học sinh chỉ ảnh hưởng trên bộ nhớ Sandbox', () => {
    sandboxService.enableSandbox(true);

    // Thêm
    const newStu = sandboxService.addStudent({
      fullName: 'Nguyễn Văn Test',
      gender: 'Nam',
      classRole: 'Thành viên',
    });
    expect(newStu.id).toBeDefined();
    expect(sandboxService.getStudents().length).toBe(41);

    // Sửa
    const updated = sandboxService.updateStudent(newStu.id, {
      fullName: 'Nguyễn Văn Test VIP',
    });
    expect(updated?.fullName).toBe('Nguyễn Văn Test VIP');

    // Xóa
    const deleted = sandboxService.deleteStudent(newStu.id);
    expect(deleted).toBe(true);
    expect(sandboxService.getStudents().length).toBe(40);
  });

  it('4. Ghi nhận giao dịch điểm sẽ tự động cập nhật điểm tích lũy học sinh', () => {
    sandboxService.enableSandbox(true);
    const students = sandboxService.getStudents();
    const firstStu = students[0];
    const initialPoints = firstStu.points;

    sandboxService.addTransaction({
      id: 'tx-unit-test-1',
      studentId: firstStu.id,
      points: 10,
      stars: 2,
      reason: 'Phát biểu bài xuất sắc (Unit test)',
      occurredAt: new Date().toISOString(),
      createdBy: 'GVCN',
    });

    const updatedStudents = sandboxService.getStudents();
    const updatedFirstStu = updatedStudents.find((s) => s.id === firstStu.id)!;
    expect(updatedFirstStu.points).toBe(initialPoints + 10);
  });

  it('5. Reset dữ liệu mẫu sẽ khôi phục lại 40 học sinh ban đầu', () => {
    sandboxService.enableSandbox(true);
    // Xóa 1 em
    const students = sandboxService.getStudents();
    sandboxService.deleteStudent(students[0].id);
    expect(sandboxService.getStudents().length).toBe(39);

    // Reset
    sandboxService.resetSandbox();
    expect(sandboxService.getStudents().length).toBe(40);
    expect(sandboxService.isSandboxActive()).toBe(true);
  });

  it('6. Dọn sạch Sandbox sẽ giải phóng toàn bộ LocalStorage', () => {
    sandboxService.enableSandbox(true);
    expect(sandboxService.isSandboxActive()).toBe(true);

    sandboxService.clearSandbox();
    expect(sandboxService.isSandboxActive()).toBe(false);
    expect(sandboxService.getStudents().length).toBe(0);
  });
});
