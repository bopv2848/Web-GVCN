import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attendanceService } from './attendanceService';
import { CLASS_6A6_ID } from '../../students/constants/defaultClass6A6Students';

describe('attendanceService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('tự động khởi tạo phiên điểm danh và nạp đầy đủ 47 học sinh thật của lớp 6A6', async () => {
    const session = await attendanceService.getOrCreateSession(CLASS_6A6_ID, '2026-09-13', 'morning');
    expect(session).toBeDefined();
    expect(session.classId).toBe(CLASS_6A6_ID);
    expect(session.sessionDate).toBe('2026-09-13');
    expect(session.sessionType).toBe('morning');

    const records = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    expect(records.length).toBe(47);

    // Học sinh là Lê Ngọc Anh (Lớp trưởng) thuộc Tổ 1
    const lopTruong = records.find((r) => r.classRole?.includes('Lớp trưởng'));
    expect(lopTruong).toBeDefined();
    expect(lopTruong?.studentName).toBe('Lê Ngọc Anh');
    expect(lopTruong?.groupName).toBe('Tổ 1');
    expect(lopTruong?.status).toBe('present');

    // 4 tổ trưởng
    const toTruongs = records.filter((r) => r.classRole?.includes('Tổ trưởng'));
    expect(toTruongs.length).toBe(4);

    // Kiểm tra danh sách được sắp xếp chuẩn bảng chữ cái tiếng Việt (A - Z)
    expect(records[0].studentName).toBe('Đỗ Bảo An');
    expect(records[1].studentName).toBe('Hà Minh Thảo An');
    expect(records[2].studentName).toBe('Lạc Cao Quế Anh');
    expect(records[3].studentName).toBe('Lê Ngọc Anh');
    expect(records[4].studentName).toBe('Cao Minh Ân');
    expect(records[records.length - 1].studentName).toBe('Nguyễn Thị Thu Vân');
  });

  it('cho phép cập nhật trạng thái điểm danh và lưu trữ bền vững', async () => {
    const session = await attendanceService.getOrCreateSession(CLASS_6A6_ID, '2026-09-13', 'morning');
    const records = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    const targetRecord = records[0];

    await attendanceService.updateRecordStatus(targetRecord.id, 'excused_absence', 'Sốt nhẹ có giấy phép');

    const updatedRecords = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    const updated = updatedRecords.find((r) => r.id === targetRecord.id);

    expect(updated?.status).toBe('excused_absence');
    expect(updated?.note).toBe('Sốt nhẹ có giấy phép');
  });

  it('cho phép điểm danh nhanh tất cả có mặt trong 1 chạm', async () => {
    const session = await attendanceService.getOrCreateSession(CLASS_6A6_ID, '2026-09-13', 'morning');
    const records = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);

    // Đánh dấu 1 em nghỉ
    await attendanceService.updateRecordStatus(records[0].id, 'late');
    // Bấm Có mặt tất cả
    await attendanceService.markAllPresent(session.id);

    const freshRecords = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    expect(freshRecords.every((r) => r.status === 'present')).toBe(true);
  });

  it('cho phép điểm danh nhanh toàn bộ học sinh theo Tổ (Có mặt / Vắng có phép)', async () => {
    const session = await attendanceService.getOrCreateSession(CLASS_6A6_ID, '2026-09-13', 'morning');
    
    // Đánh dấu cả Tổ 1 vắng có phép với lý do "Đi trực tuần"
    await attendanceService.markGroupStatus(session.id, 'Tổ 1', 'excused_absence', 'Đi trực tuần');

    const updatedRecords = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    const to1Records = updatedRecords.filter((r) => r.groupName === 'Tổ 1');
    const otherRecords = updatedRecords.filter((r) => r.groupName !== 'Tổ 1');

    expect(to1Records.length).toBeGreaterThan(0);
    expect(to1Records.every((r) => r.status === 'excused_absence')).toBe(true);
    expect(to1Records.every((r) => r.note === 'Đi trực tuần')).toBe(true);

    // Các tổ khác vẫn giữ nguyên trạng thái
    expect(otherRecords.every((r) => r.status === 'present')).toBe(true);

    // Sau đó bấm Có mặt lại cho cả Tổ 1
    await attendanceService.markGroupStatus(session.id, 'Tổ 1', 'present');
    const restoredRecords = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    const restoredTo1 = restoredRecords.filter((r) => r.groupName === 'Tổ 1');
    expect(restoredTo1.every((r) => r.status === 'present')).toBe(true);
  });

  it('tạo báo cáo chuyên cần tháng tổng hợp đầy đủ 47 học sinh', async () => {
    const report = await attendanceService.getMonthlyAttendanceReport(CLASS_6A6_ID, 2026, 9);
    expect(report.totalStudents).toBe(47);
    expect(report.studentSummaries.length).toBe(47);
    expect(report.groupStats.length).toBe(4);
  });
});
