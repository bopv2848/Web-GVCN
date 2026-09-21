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

export interface PresetAssignmentItem {
  studentId: string;
  rowIndex: number;
  colIndex: number;
  isHidden?: boolean;
}

export interface SeatingPreset {
  id: string;
  classId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  assignments: PresetAssignmentItem[];
  elementsConfig?: Partial<ClassroomElementsConfig>; // Cấu hình kích thước bàn, cửa riêng biệt cho từng bản mẫu
}

export type TeacherDeskPosition = 'left' | 'center' | 'right';
export type DoorPosition = 'left' | 'right';

export interface ClassroomElementsConfig {
  teacherDeskPosition: TeacherDeskPosition;
  doorPosition: DoorPosition;
  doorAngle: number; // 0 - 360 độ
  teacherDeskLabel?: string; // Nhãn tùy chỉnh của Bàn Giáo Viên (mặc định: "Bàn Giáo Viên")
  teacherDeskWidth?: number; // Chiều dài/rộng Bàn Giáo Viên (px, min 240, max 560, mặc định 384)
  teacherDeskScale?: number; // Tỷ lệ To/Nhỏ Bàn Giáo Viên (%, min 75, max 135, mặc định 100)
  doorWidth?: number; // Chiều dài/rộng Cửa Ra Vào (px, min 120, max 320, mặc định 180)
  doorScale?: number; // Tỷ lệ To/Nhỏ Cửa Ra Vào (%, min 75, max 135, mặc định 100)
  studentDeskScale?: number; // Tỷ lệ To/Nhỏ Bàn Học Sinh (%, min 80, max 125, mặc định 100)
  isDimensionsLocked?: boolean; // Khóa kích thước bàn và cửa để tránh chạm nhầm trên điện thoại
  frontPlacement?: 'top' | 'bottom'; // Vị trí Bục giảng & Bảng ở Phía Trên (Đầu lớp) hoặc Phía Dưới (Cuối lớp)
}


