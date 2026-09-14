export interface PointCategory {
  id: string;
  type: 'add' | 'subtract';
  categoryGroup: 'Học tập' | 'Nề nếp' | 'Phong trào' | 'Đột xuất';
  title: string;
  defaultPoints: number;
  defaultStars: number;
}

export interface PointTransaction {
  id: string;
  studentId: string;
  studentName?: string;
  groupName?: string;
  points: number;
  stars: number;
  reason: string;
  note?: string;
  occurredAt: string;
  createdBy: string;
  reversalOfId?: string;
}

export interface RewardItem {
  id: string;
  name: string;
  starCost: number;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
}
