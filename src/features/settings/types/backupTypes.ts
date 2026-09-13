export interface ClassBackupPayload {
  meta: {
    app: string;
    version: string;
    exportedAt: string;
    classId?: string;
    className?: string;
    schoolName?: string;
    totalStudents?: number;
    totalGroups?: number;
    totalAttendanceSessions?: number;
    totalPointTransactions?: number;
  };
  data: {
    classConfig?: Record<string, unknown>;
    students?: Array<Record<string, unknown>>;
    groups?: Array<Record<string, unknown>>;
    seating?: {
      layout?: unknown;
      assignments?: Array<Record<string, unknown>>;
      rotationConfig?: {
        rotationEnabled?: boolean;
        schoolYearStartDate?: string;
      };
    };
    attendance?: {
      sessions?: Array<Record<string, unknown>>;
    };
    points?: {
      categories?: Array<Record<string, unknown>>;
      transactions?: Array<Record<string, unknown>>;
    };
  };
}

export interface BackupResult {
  success: boolean;
  fileName: string;
  studentCount: number;
  sessionCount: number;
  transactionCount: number;
  fileSizeBytes: number;
}

export interface ValidateBackupResult {
  valid: boolean;
  payload?: ClassBackupPayload;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  restoredStudentsCount: number;
  restoredSeatingCount: number;
  restoredConfigName: string;
}

export interface SelectiveRestoreOptions {
  restoreConfig: boolean;
  restoreStudents: boolean;
  restoreSeating: boolean;
  restoreAttendance: boolean;
  restorePoints: boolean;
}

export interface PreRestoreSnapshot {
  classId: string;
  timestamp: string;
  className: string;
  schoolName: string;
  payload: ClassBackupPayload;
}
