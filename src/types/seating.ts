import type { Student } from './student';

export interface SeatLayout {
  id: string;
  classId: string;
  layoutName: string;
  rows: number;
  cols: number;
  isCurrent: boolean;
  createdAt?: string;
}

export interface SeatAssignment {
  id: string;
  layoutId: string;
  studentId: string;
  rowIndex: number;
  colIndex: number;
  isHidden: boolean;
  createdAt?: string;
}

export interface SeatAssignmentWithStudent extends SeatAssignment {
  student?: Student;
}

export interface InfectionCluster {
  clusterId: string;
  groupName: string;
  rowIndex: number;
  deskLabel: string;
  sickStudentIds: string[];
  sickStudentNames: string[];
  neighborAtRiskIds: string[];
  neighborAtRiskNames: string[];
  riskLevel: 'high' | 'medium';
}

export interface SeatingMedicalAnalysis {
  sickStudentIds: Set<string>;
  atRiskNeighborStudentIds: Set<string>;
  clusters: InfectionCluster[];
  totalSickInSeats: number;
}
