import type { Student } from '../../../types/student';
import type { PointTransaction } from '../../../types/points';
import type { AttendanceSession, AttendanceRecord } from '../../../types/attendance';
import type { SeatLayout, SeatAssignment } from '../../../types/seating';
import {
  SANDBOX_CLASS_ID,
  MOCK_GROUPS,
  MOCK_STUDENTS_BASE,
  MOCK_POINT_CATEGORIES,
} from '../constants/mockClassData';
import type { MockDataPayload } from '../types/sandboxTypes';

export const mockGeneratorService = {
  /**
   * Tạo danh sách 40 học sinh ban đầu với đầy đủ thuộc tính
   */
  generateStudents(): Student[] {
    return MOCK_STUDENTS_BASE.map((item, index) => {
      const group = MOCK_GROUPS.find((g) => g.id === item.groupId);
      return {
        id: item.id,
        classId: SANDBOX_CLASS_ID,
        groupId: item.groupId,
        fullName: item.fullName,
        gender: item.gender,
        birthDate: item.birthDate,
        classRole: item.classRole,
        avatarUrl: undefined,
        goals: item.goals,
        talents: item.talents,
        boardingType: index % 3 === 0 ? 'Bán trú' : 'Tự túc',
        code: `HS6A6${String(index + 1).padStart(2, '0')}`,
        points: 0,
        stars: 0,
        groupName: item.groupName,
        groupColorClass: group?.colorClass || 'text-slate-500',
        guardianToken: `TOKEN-6A6-${String(index + 1).padStart(3, '0')}`,
        guardianStatus: 'active',
        createdAt: '2026-09-01T07:00:00.000Z',
      };
    });
  },

  /**
   * Tạo 50+ giao dịch điểm thi đua đa dạng và cập nhật điểm lũy kế cho học sinh
   */
  generateTransactions(students: Student[]): { transactions: PointTransaction[]; updatedStudents: Student[] } {
    const studentMap = new Map<string, Student>(students.map((s) => [s.id, { ...s }]));
    const transactions: PointTransaction[] = [];

    // Danh sách lý do cộng điểm
    const addScenarios = [
      { reason: 'Đạt điểm 10 kiểm tra 15 phút Toán', points: 10, stars: 2 },
      { reason: 'Hăng hái phát biểu xây dựng bài', points: 2, stars: 1 },
      { reason: 'Vở sạch chữ đẹp, chuẩn bị bài tốt', points: 5, stars: 1 },
      { reason: 'Trực nhật lớp sạch sẽ, nghiêm túc', points: 5, stars: 1 },
      { reason: 'Tham gia đội văn nghệ chào mừng 20/11', points: 10, stars: 3 },
      { reason: 'Nhặt được của rơi trả lại bạn mất', points: 15, stars: 5 },
      { reason: 'Giúp đỡ bạn yếu tiến bộ trong giờ tự học', points: 10, stars: 3 },
      { reason: 'Đạt điểm 9 kiểm tra môn Ngữ Văn', points: 5, stars: 1 },
      { reason: 'Đóng góp phong trào Kế hoạch nhỏ xuất sắc', points: 5, stars: 2 },
    ];

    // Danh sách lý do trừ điểm
    const subScenarios = [
      { reason: 'Đi học trễ 10 phút', points: -5, stars: 0 },
      { reason: 'Không thuộc bài cũ môn Tiếng Anh', points: -5, stars: 0 },
      { reason: 'Không làm bài tập về nhà môn Toán', points: -5, stars: 0 },
      { reason: 'Mất trật tự trong giờ học', points: -3, stars: 0 },
      { reason: 'Không đeo khăn quàng đỏ', points: -2, stars: 0 },
    ];

    const baseDate = new Date('2026-09-14T08:00:00.000Z');

    // 1. Tạo 40 giao dịch cộng điểm cho các bạn
    for (let i = 0; i < 42; i++) {
      const stuIndex = i % students.length;
      const student = studentMap.get(students[stuIndex].id)!;
      const scenario = addScenarios[i % addScenarios.length];
      const daysAgo = (i % 12) + 1;
      const occurred = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000 + i * 1800000);

      transactions.push({
        id: `tx-mock-add-${i + 1}`,
        studentId: student.id,
        studentName: student.fullName,
        groupName: student.groupName,
        points: scenario.points,
        stars: scenario.stars,
        reason: scenario.reason,
        occurredAt: occurred.toISOString(),
        createdBy: 'Thầy Phan Văn Bộ (GVCN)',
      });

      student.points += scenario.points;
      student.stars += scenario.stars;
    }

    // 2. Tạo 12 giao dịch trừ điểm vi phạm
    const violationStudents = [7, 13, 20, 22, 25, 33, 3, 16]; // index của một vài em
    for (let j = 0; j < 12; j++) {
      const stuIndex = violationStudents[j % violationStudents.length];
      const student = studentMap.get(students[stuIndex].id)!;
      const scenario = subScenarios[j % subScenarios.length];
      const daysAgo = (j % 10) + 1;
      const occurred = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000 + (j + 5) * 3600000);

      transactions.push({
        id: `tx-mock-sub-${j + 1}`,
        studentId: student.id,
        studentName: student.fullName,
        groupName: student.groupName,
        points: scenario.points,
        stars: scenario.stars,
        reason: scenario.reason,
        occurredAt: occurred.toISOString(),
        createdBy: 'Thầy Phan Văn Bộ (GVCN)',
      });

      student.points += scenario.points;
    }

    // Sắp xếp giao dịch mới nhất lên đầu
    transactions.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return {
      transactions,
      updatedStudents: Array.from(studentMap.values()),
    };
  },

  /**
   * Tạo 10 buổi điểm danh (2 tuần học) và hồ sơ chi tiết cho 40 học sinh
   */
  generateAttendance(students: Student[]): {
    sessions: AttendanceSession[];
    recordsMap: Record<string, AttendanceRecord[]>;
  } {
    const sessions: AttendanceSession[] = [];
    const recordsMap: Record<string, AttendanceRecord[]> = {};

    // 10 ngày học gần nhất (bỏ thứ 7, CN)
    const dates = [
      '2026-09-14', '2026-09-11', '2026-09-10', '2026-09-09', '2026-09-08',
      '2026-09-07', '2026-09-04', '2026-09-03', '2026-09-02', '2026-09-01',
    ];

    dates.forEach((dateStr, sessionIdx) => {
      const sessionId = `att-mock-session-${sessionIdx + 1}`;
      const session: AttendanceSession = {
        id: sessionId,
        classId: SANDBOX_CLASS_ID,
        sessionDate: dateStr,
        sessionType: 'morning',
        isLocked: sessionIdx > 0, // Buổi hôm nay mở, các buổi trước khóa
        createdBy: 'Thầy Phan Văn Bộ (GVCN)',
        createdAt: `${dateStr}T07:15:00.000Z`,
      };
      sessions.push(session);

      const records: AttendanceRecord[] = students.map((stu, stuIdx) => {
        let status: AttendanceRecord['status'] = 'present';
        let note: string | null = null;

        // Giả lập thỉnh thoảng có bạn đi trễ hoặc vắng
        if ((stuIdx === 7 && sessionIdx === 1) || (stuIdx === 33 && sessionIdx === 3)) {
          status = 'late';
          note = 'Trễ 15 phút do hỏng xe';
        } else if ((stuIdx === 15 && sessionIdx === 4) || (stuIdx === 27 && sessionIdx === 2)) {
          status = 'excused_absence';
          note = 'Phụ huynh có xin phép qua Zalo vì bị sốt';
        } else if (stuIdx === 25 && sessionIdx === 5) {
          status = 'unexcused_absence';
          note = 'Chưa liên lạc được phụ huynh';
        }

        return {
          id: `rec-${sessionId}-${stu.id}`,
          sessionId,
          studentId: stu.id,
          studentName: stu.fullName,
          gender: stu.gender,
          groupName: stu.groupName || 'Tổ 1',
          classRole: stu.classRole || 'Thành viên',
          status,
          note,
          updatedAt: `${dateStr}T07:30:00.000Z`,
        };
      });

      recordsMap[sessionId] = records;
    });

    return { sessions, recordsMap };
  },

  /**
   * Tạo sơ đồ lớp 40 chỗ ngồi (5 hàng x 8 cột)
   */
  generateSeating(students: Student[]): { layout: SeatLayout; assignments: SeatAssignment[] } {
    const layoutId = 'layout-sandbox-default';
    const layout: SeatLayout = {
      id: layoutId,
      classId: SANDBOX_CLASS_ID,
      layoutName: 'Sơ đồ Lớp 6A6 Chuẩn (40 Chỗ)',
      rows: 5,
      cols: 8,
      isCurrent: true,
      createdAt: '2026-09-01T08:00:00.000Z',
    };

    const assignments: SeatAssignment[] = [];
    let studentIdx = 0;

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        if (studentIdx < students.length) {
          assignments.push({
            id: `seat-mock-${layoutId}-${r}-${c}`,
            layoutId,
            studentId: students[studentIdx].id,
            rowIndex: r,
            colIndex: c,
            isHidden: false,
            createdAt: '2026-09-01T08:00:00.000Z',
          });
          studentIdx++;
        }
      }
    }

    return { layout, assignments };
  },

  /**
   * Tổng hợp toàn bộ dữ liệu mẫu thành một payload hoàn chỉnh
   */
  generateCompletePayload(): MockDataPayload {
    const baseStudents = this.generateStudents();
    const { transactions, updatedStudents } = this.generateTransactions(baseStudents);
    const { sessions, recordsMap } = this.generateAttendance(updatedStudents);
    const { layout, assignments } = this.generateSeating(updatedStudents);

    return {
      students: updatedStudents,
      groups: MOCK_GROUPS,
      categories: MOCK_POINT_CATEGORIES,
      transactions,
      attendanceSessions: sessions,
      attendanceRecords: recordsMap,
      seatingLayout: layout,
      seatingAssignments: assignments,
      generatedAt: new Date().toISOString(),
    };
  },
};
