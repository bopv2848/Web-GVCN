export type CaseSeverity = 'low' | 'medium' | 'critical';
export type CaseStatus = 'active' | 'monitoring' | 'completed';

export interface CompanionCase {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentAvatarUrl?: string;
  studentCode: string;
  groupName: string;
  startDate: string;
  status: CaseStatus;
  severityLevel: CaseSeverity;
  primaryConcern: string;
  actionPlan: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatesCount: number;
  lastUpdateDate?: string;
}

export interface CompanionUpdate {
  id: string;
  caseId: string;
  updateDate: string;
  observationNotes: string;
  interactionSummary?: string;
  createdBy: string;
  createdAt: string;
}

export interface CompanionFormData {
  studentId: string;
  startDate: string;
  severityLevel: CaseSeverity;
  status: CaseStatus;
  primaryConcern: string;
  actionPlan: string;
}

export interface CompanionUpdateFormData {
  updateDate: string;
  observationNotes: string;
  interactionSummary?: string;
}

export interface CompanionKpiSummary {
  totalCases: number;
  activeCount: number;
  monitoringCount: number;
  completedCount: number;
  criticalCount: number;
}
