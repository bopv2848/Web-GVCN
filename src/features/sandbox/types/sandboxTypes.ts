import type { Student, Group } from '../../../types/student';
import type { PointTransaction, PointCategory } from '../../../types/points';
import type { AttendanceSession, AttendanceRecord } from '../../../types/attendance';
import type { SeatAssignment, SeatLayout } from '../../../types/seating';

export interface SandboxStats {
  totalStudents: number;
  totalGroups: number;
  totalPointTransactions: number;
  totalAttendanceSessions: number;
  totalAttendanceRecords: number;
  hasSeatingLayout: boolean;
  lastGeneratedAt: string | null;
}

export interface MockDataPayload {
  students: Student[];
  groups: Group[];
  categories: PointCategory[];
  transactions: PointTransaction[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: Record<string, AttendanceRecord[]>; // sessionId -> records
  seatingLayout: SeatLayout;
  seatingAssignments: SeatAssignment[];
  generatedAt: string;
}

export interface SandboxEventDetail {
  active: boolean;
  timestamp: string;
  action?: 'enabled' | 'disabled' | 'reset' | 'cleared';
}

export type AppDataMode = 'production' | 'cloud_test' | 'offline_sandbox';

export interface CloudTestStats {
  totalStudents: number;
  totalGroups: number;
  totalPointTransactions: number;
  totalAttendanceSessions: number;
  isLoading: boolean;
  error?: string | null;
  lastCheckedAt: string | null;
}

export interface CloudTestEventDetail {
  active: boolean;
  timestamp: string;
  action?: 'enabled' | 'disabled' | 'reset' | 'cleared';
}
