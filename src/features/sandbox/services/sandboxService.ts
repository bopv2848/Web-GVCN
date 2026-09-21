import type { Student, Group } from '../../../types/student';
import type { PointTransaction, PointCategory } from '../../../types/points';
import type { AttendanceSession, AttendanceRecord } from '../../../types/attendance';
import type { SeatAssignment, SeatLayout } from '../../../types/seating';
import { mockGeneratorService } from './mockGeneratorService';
import { SANDBOX_CLASS_ID, MOCK_GROUPS, MOCK_POINT_CATEGORIES } from '../constants/mockClassData';
import type { SandboxStats, SandboxEventDetail } from '../types/sandboxTypes';

export const SANDBOX_ACTIVE_KEY = 'gvcn_sandbox_mode_active';
const SANDBOX_STUDENTS_KEY = 'gvcn_sandbox_students';
const SANDBOX_TX_KEY = 'gvcn_sandbox_points_tx';
const SANDBOX_ATT_SESSIONS_KEY = 'gvcn_sandbox_att_sessions';
const SANDBOX_ATT_RECORDS_KEY = 'gvcn_sandbox_att_records';
const SANDBOX_SEATING_LAYOUT_KEY = 'gvcn_sandbox_seating_layout';
const SANDBOX_SEATING_ASSIGNMENTS_KEY = 'gvcn_sandbox_seating_assignments';
const SANDBOX_META_KEY = 'gvcn_sandbox_meta';

export const sandboxService = {
  isSandboxActive(): boolean {
    try {
      return localStorage.getItem(SANDBOX_ACTIVE_KEY) === 'true';
    } catch {
      return false;
    }
  },

  notifyChange(action: 'enabled' | 'disabled' | 'reset' | 'cleared'): void {
    if (typeof window === 'undefined') return;
    const detail: SandboxEventDetail = {
      active: this.isSandboxActive(),
      timestamp: new Date().toISOString(),
      action,
    };
    window.dispatchEvent(new CustomEvent('gvcn:sandbox_change', { detail }));
  },

  enableSandbox(forceReset = false): void {
    try {
      const existingStudents = localStorage.getItem(SANDBOX_STUDENTS_KEY);
      if (!existingStudents || forceReset) {
        this.populateFreshMockData();
      }
      localStorage.setItem(SANDBOX_ACTIVE_KEY, 'true');
      this.notifyChange('enabled');
    } catch (e) {
      console.error('Lỗi khi kích hoạt Sandbox:', e);
    }
  },

  disableSandbox(): void {
    try {
      localStorage.setItem(SANDBOX_ACTIVE_KEY, 'false');
      this.notifyChange('disabled');
    } catch (e) {
      console.error('Lỗi khi tắt Sandbox:', e);
    }
  },

  resetSandbox(): void {
    try {
      this.populateFreshMockData();
      localStorage.setItem(SANDBOX_ACTIVE_KEY, 'true');
      this.notifyChange('reset');
    } catch (e) {
      console.error('Lỗi khi reset Sandbox:', e);
    }
  },

  clearSandbox(): void {
    try {
      localStorage.removeItem(SANDBOX_ACTIVE_KEY);
      localStorage.removeItem(SANDBOX_STUDENTS_KEY);
      localStorage.removeItem(SANDBOX_TX_KEY);
      localStorage.removeItem(SANDBOX_ATT_SESSIONS_KEY);
      localStorage.removeItem(SANDBOX_ATT_RECORDS_KEY);
      localStorage.removeItem(SANDBOX_SEATING_LAYOUT_KEY);
      localStorage.removeItem(SANDBOX_SEATING_ASSIGNMENTS_KEY);
      localStorage.removeItem(SANDBOX_META_KEY);
      this.notifyChange('cleared');
    } catch (e) {
      console.error('Lỗi khi dọn dẹp Sandbox:', e);
    }
  },

  populateFreshMockData(): void {
    const payload = mockGeneratorService.generateCompletePayload();
    localStorage.setItem(SANDBOX_STUDENTS_KEY, JSON.stringify(payload.students));
    localStorage.setItem(SANDBOX_TX_KEY, JSON.stringify(payload.transactions));
    localStorage.setItem(SANDBOX_ATT_SESSIONS_KEY, JSON.stringify(payload.attendanceSessions));
    localStorage.setItem(SANDBOX_ATT_RECORDS_KEY, JSON.stringify(payload.attendanceRecords));
    localStorage.setItem(SANDBOX_SEATING_LAYOUT_KEY, JSON.stringify(payload.seatingLayout));
    localStorage.setItem(SANDBOX_SEATING_ASSIGNMENTS_KEY, JSON.stringify(payload.seatingAssignments));
    localStorage.setItem(
      SANDBOX_META_KEY,
      JSON.stringify({ classId: SANDBOX_CLASS_ID, generatedAt: payload.generatedAt })
    );
  },

  getStats(): SandboxStats {
    try {
      const students = this.getStudents();
      const transactions = this.getTransactions();
      const sessions = this.getAttendanceSessions();
      const seating = this.getSeating();
      const meta = JSON.parse(localStorage.getItem(SANDBOX_META_KEY) || '{}');

      let recordsCount = 0;
      const rawRecords = localStorage.getItem(SANDBOX_ATT_RECORDS_KEY);
      if (rawRecords) {
        const recordsMap = JSON.parse(rawRecords);
        Object.values(recordsMap).forEach((list) => {
          if (Array.isArray(list)) recordsCount += list.length;
        });
      }

      return {
        totalStudents: students.length,
        totalGroups: 4,
        totalPointTransactions: transactions.length,
        totalAttendanceSessions: sessions.length,
        totalAttendanceRecords: recordsCount,
        hasSeatingLayout: !!seating.layout,
        lastGeneratedAt: meta.generatedAt || null,
      };
    } catch {
      return {
        totalStudents: 0,
        totalGroups: 4,
        totalPointTransactions: 0,
        totalAttendanceSessions: 0,
        totalAttendanceRecords: 0,
        hasSeatingLayout: false,
        lastGeneratedAt: null,
      };
    }
  },

  // --- HỌC SINH ---
  getStudents(): Student[] {
    try {
      const raw = localStorage.getItem(SANDBOX_STUDENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveStudents(students: Student[]): void {
    try {
      localStorage.setItem(SANDBOX_STUDENTS_KEY, JSON.stringify(students));
      this.notifyChange('reset');
    } catch (e) {
      console.warn('Lỗi lưu học sinh sandbox:', e);
    }
  },

  addStudent(studentData: Partial<Student>): Student {
    const current = this.getStudents();
    const newStudent: Student = {
      id: `stu-mock-user-${Date.now()}`,
      classId: SANDBOX_CLASS_ID,
      groupId: studentData.groupId || 'group-sandbox-1',
      fullName: studentData.fullName || 'Học sinh mới',
      gender: studentData.gender || 'Nam',
      birthDate: studentData.birthDate || '2015-01-01',
      classRole: studentData.classRole || 'Thành viên',
      boardingType: studentData.boardingType || 'Tự túc',
      code: studentData.code || `HS6A6${String(current.length + 1).padStart(2, '0')}`,
      points: 0,
      stars: 0,
      groupName: studentData.groupName || 'Tổ 1',
      groupColorClass: 'text-slate-600',
      createdAt: new Date().toISOString(),
    };
    const next = [...current, newStudent];
    this.saveStudents(next);
    return newStudent;
  },

  updateStudent(studentId: string, data: Partial<Student>): Student | null {
    const current = this.getStudents();
    const idx = current.findIndex((s) => s.id === studentId);
    if (idx === -1) return null;
    current[idx] = { ...current[idx], ...data };
    this.saveStudents(current);
    return current[idx];
  },

  deleteStudent(studentId: string): boolean {
    const current = this.getStudents();
    const next = current.filter((s) => s.id !== studentId);
    if (next.length === current.length) return false;
    this.saveStudents(next);

    // Gỡ học sinh này khỏi sơ đồ chỗ ngồi nếu đang được phân công
    const { assignments } = this.getSeating();
    if (assignments.some((a) => a.studentId === studentId)) {
      this.saveSeatingAssignments(assignments.filter((a) => a.studentId !== studentId));
    }

    return true;
  },

  deleteAllStudents(): void {
    this.saveStudents([]);
    this.saveSeatingAssignments([]);
    try {
      localStorage.setItem(SANDBOX_STUDENTS_KEY, JSON.stringify([]));
      localStorage.setItem(SANDBOX_SEATING_ASSIGNMENTS_KEY, JSON.stringify([]));
      this.notifyChange('reset');
    } catch (e) {
      console.warn('Lỗi xóa tất cả học sinh sandbox:', e);
    }
  },

  getGroups(): Group[] {
    return MOCK_GROUPS;
  },

  // --- ĐIỂM THI ĐUA ---
  getTransactions(): PointTransaction[] {
    try {
      const raw = localStorage.getItem(SANDBOX_TX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addTransaction(tx: PointTransaction): PointTransaction {
    const current = this.getTransactions();
    const next = [tx, ...current];
    try {
      localStorage.setItem(SANDBOX_TX_KEY, JSON.stringify(next));
      // Cập nhật điểm của học sinh tương ứng
      const students = this.getStudents();
      const sIdx = students.findIndex((s) => s.id === tx.studentId);
      if (sIdx !== -1) {
        students[sIdx].points += tx.points;
        students[sIdx].stars += tx.stars || 0;
        this.saveStudents(students);
      }
      this.notifyChange('reset');
    } catch (e) {
      console.warn('Lỗi lưu giao dịch sandbox:', e);
    }
    return tx;
  },

  deleteTransaction(txId: string): boolean {
    const current = this.getTransactions();
    const txToDelete = current.find((t) => t.id === txId);
    const next = current.filter((t) => t.id !== txId);
    if (next.length === current.length) return false;
    try {
      localStorage.setItem(SANDBOX_TX_KEY, JSON.stringify(next));
      if (txToDelete) {
        const students = this.getStudents();
        const sIdx = students.findIndex((s) => s.id === txToDelete.studentId);
        if (sIdx !== -1) {
          students[sIdx].points -= txToDelete.points;
          students[sIdx].stars -= txToDelete.stars || 0;
          this.saveStudents(students);
        }
      }
      this.notifyChange('reset');
      return true;
    } catch {
      return false;
    }
  },

  getCategories(): PointCategory[] {
    return MOCK_POINT_CATEGORIES;
  },

  // --- ĐIỂM DANH ---
  getAttendanceSessions(): AttendanceSession[] {
    try {
      const raw = localStorage.getItem(SANDBOX_ATT_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getAttendanceRecords(sessionId: string): AttendanceRecord[] {
    try {
      const raw = localStorage.getItem(SANDBOX_ATT_RECORDS_KEY);
      if (!raw) return [];
      const map = JSON.parse(raw);
      return map[sessionId] || [];
    } catch {
      return [];
    }
  },

  saveAttendanceRecords(sessionId: string, records: AttendanceRecord[]): void {
    try {
      const raw = localStorage.getItem(SANDBOX_ATT_RECORDS_KEY);
      const map = raw ? JSON.parse(raw) : {};
      map[sessionId] = records;
      localStorage.setItem(SANDBOX_ATT_RECORDS_KEY, JSON.stringify(map));
      this.notifyChange('reset');
    } catch (e) {
      console.warn('Lỗi lưu điểm danh sandbox:', e);
    }
  },

  // --- SƠ ĐỒ LỚP ---
  getSeating(): { layout: SeatLayout | null; assignments: SeatAssignment[] } {
    try {
      const layoutRaw = localStorage.getItem(SANDBOX_SEATING_LAYOUT_KEY);
      const assignRaw = localStorage.getItem(SANDBOX_SEATING_ASSIGNMENTS_KEY);
      return {
        layout: layoutRaw ? JSON.parse(layoutRaw) : null,
        assignments: assignRaw ? JSON.parse(assignRaw) : [],
      };
    } catch {
      return { layout: null, assignments: [] };
    }
  },

  saveSeatingAssignments(assignments: SeatAssignment[]): void {
    try {
      localStorage.setItem(SANDBOX_SEATING_ASSIGNMENTS_KEY, JSON.stringify(assignments));
      this.notifyChange('reset');
    } catch (e) {
      console.warn('Lỗi lưu sơ đồ lớp sandbox:', e);
    }
  },
};
