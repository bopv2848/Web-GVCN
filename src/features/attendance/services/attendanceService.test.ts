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

  it('cho phép hoàn tác (Undo) phục hồi chính xác trạng thái và ghi chú trước đó của học sinh', async () => {
    const session = await attendanceService.getOrCreateSession(CLASS_6A6_ID, '2026-09-13', 'morning');
    const records = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    
    // Giả sử Tổ 2 có 1 bạn bị ốm trước đó
    const to2Records = records.filter((r) => r.groupName === 'Tổ 2');
    expect(to2Records.length).toBeGreaterThan(1);
    
    await attendanceService.updateRecordStatus(to2Records[0].id, 'excused_absence', 'Sốt xuất huyết');
    
    // Lưu lại snapshot ban đầu của Tổ 2
    const currentSessionRecords = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    const snapshotTo2 = currentSessionRecords
      .filter((r) => r.groupName === 'Tổ 2')
      .map((r) => ({ id: r.id, status: r.status, note: r.note }));

    // Lỡ tay bấm "Có mặt tất cả" cho Tổ 2
    await attendanceService.markGroupStatus(session.id, 'Tổ 2', 'present');
    const afterMistake = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    const mistakeTo2 = afterMistake.filter((r) => r.groupName === 'Tổ 2');
    expect(mistakeTo2.every((r) => r.status === 'present')).toBe(true);

    // Bấm Hoàn tác (restoreGroupRecords)
    await attendanceService.restoreGroupRecords(session.id, snapshotTo2);
    const afterUndo = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
    const undoneStudent = afterUndo.find((r) => r.id === to2Records[0].id);

    // Bạn bị sốt đã được phục hồi đúng trạng thái và ghi chú cũ
    expect(undoneStudent?.status).toBe('excused_absence');
    expect(undoneStudent?.note).toBe('Sốt xuất huyết');
  }, 15000);

  it('tạo báo cáo chuyên cần tháng tổng hợp đầy đủ 47 học sinh', async () => {
    const report = await attendanceService.getMonthlyAttendanceReport(CLASS_6A6_ID, 2026, 9);
    expect(report.totalStudents).toBe(47);
    expect(report.studentSummaries.length).toBe(47);
    expect(report.groupStats.length).toBe(4);
  });

  describe('Đồng bộ điểm danh theo từng tiết học và buổi học riêng biệt', () => {
    it('phân biệt chính xác sĩ số có mặt/vắng giữa buổi sáng (Tiết 1..5) và buổi chiều (Tiết 6..8)', async () => {
      // 1. Khởi tạo phiên sáng: tất cả có mặt
      const morningSession = await attendanceService.getOrCreateSession(CLASS_6A6_ID, '2026-09-15', 'morning');
      await attendanceService.markAllPresent(morningSession.id);

      // 2. Khởi tạo phiên chiều: có 2 học sinh xin nghỉ chiều
      const afternoonSession = await attendanceService.getOrCreateSession(CLASS_6A6_ID, '2026-09-15', 'afternoon');
      const afternoonRecs = await attendanceService.getSessionRecords(afternoonSession.id, CLASS_6A6_ID);
      await attendanceService.updateRecordStatus(afternoonRecs[0].id, 'excused_absence', 'Xin về sớm buổi chiều');
      await attendanceService.updateRecordStatus(afternoonRecs[1].id, 'excused_absence', 'Sốt đi khám chiều');

      // Khi truy vấn Tiết 2 (buổi sáng): Vắng = 0, HD = 47, Buổi Sáng
      const morningStats = await attendanceService.getTodayClassAttendanceStats(CLASS_6A6_ID, '2026-09-15', 2);
      expect(morningStats.sessionName).toBe('Sáng');
      expect(morningStats.total).toBe(47);
      expect(morningStats.absent).toBe(0);
      expect(morningStats.present).toBe(47);

      // Khi sang Tiết 6 (buổi chiều): Tự động đồng bộ số liệu riêng của chiều: Vắng = 2, HD = 45, Buổi Chiều
      const afternoonStats = await attendanceService.getTodayClassAttendanceStats(CLASS_6A6_ID, '2026-09-15', 6);
      expect(afternoonStats.sessionName).toBe('Chiều');
      expect(afternoonStats.total).toBe(47);
      expect(afternoonStats.absent).toBe(2);
      expect(afternoonStats.present).toBe(45);
      expect(afternoonStats.absentStudents.length).toBe(2);
      expect(afternoonStats.absentStudents[0].name).toBe(afternoonRecs[0].studentName);
    });

    it('tự động phát hiện học sinh xin về sớm từ tiết cụ thể (ví dụ: về sớm từ tiết 4)', async () => {
      const session = await attendanceService.getOrCreateSession(CLASS_6A6_ID, '2026-09-16', 'morning');
      const recs = await attendanceService.getSessionRecords(session.id, CLASS_6A6_ID);
      
      // Học sinh thứ 3 có ghi chú "Xin về sớm từ tiết 4"
      await attendanceService.updateRecordStatus(recs[2].id, 'present', 'Xin về sớm từ tiết 4');

      // Ở Tiết 1, 2, 3: Học sinh vẫn đang có mặt (Vắng = 0)
      const period3Stats = await attendanceService.getTodayClassAttendanceStats(CLASS_6A6_ID, '2026-09-16', 3);
      expect(period3Stats.absent).toBe(0);
      expect(period3Stats.present).toBe(47);

      // Khi đến Tiết 4 trở đi: Số liệu tự động cập nhật khớp theo đúng sĩ số riêng của tiết đó (Vắng = 1, HD = 46)
      const period4Stats = await attendanceService.getTodayClassAttendanceStats(CLASS_6A6_ID, '2026-09-16', 4);
      expect(period4Stats.absent).toBe(1);
      expect(period4Stats.present).toBe(46);
      expect(period4Stats.absentStudents.some((s) => s.name === recs[2].studentName)).toBe(true);

      // Khi sang Tiết 5: Học sinh vẫn vắng
      const period5Stats = await attendanceService.getTodayClassAttendanceStats(CLASS_6A6_ID, '2026-09-16', 5);
      expect(period5Stats.absent).toBe(1);
      expect(period5Stats.present).toBe(46);
    });
  });
});
