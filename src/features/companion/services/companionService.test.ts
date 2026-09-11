import { describe, it, expect } from 'vitest';
import { companionService } from './companionService';
import type { CompanionCase } from '../types';

describe('companionService Unit Tests', () => {
  it('tính toán chính xác các chỉ số KPI ca đồng hành', () => {
    const mockCases: CompanionCase[] = [
      {
        id: '1',
        classId: 'c1',
        studentId: 's1',
        studentName: 'Nguyễn Văn A',
        studentCode: 'HS001',
        groupName: 'Tổ 1',
        startDate: '2026-09-01',
        status: 'active',
        severityLevel: 'critical',
        primaryConcern: 'Sa sút học tập nghiêm trọng',
        actionPlan: 'Kèm cặp riêng',
        createdBy: 'u1',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
        updatesCount: 2,
      },
      {
        id: '2',
        classId: 'c1',
        studentId: 's2',
        studentName: 'Trần Thị B',
        studentCode: 'HS002',
        groupName: 'Tổ 2',
        startDate: '2026-09-02',
        status: 'monitoring',
        severityLevel: 'medium',
        primaryConcern: 'Hay đi học muộn',
        actionPlan: 'Gọi điện phụ huynh',
        createdBy: 'u1',
        createdAt: '2026-09-02T00:00:00Z',
        updatedAt: '2026-09-02T00:00:00Z',
        updatesCount: 1,
      },
      {
        id: '3',
        classId: 'c1',
        studentId: 's3',
        studentName: 'Lê Văn C',
        studentCode: 'HS003',
        groupName: 'Tổ 3',
        startDate: '2026-09-03',
        status: 'completed',
        severityLevel: 'critical',
        primaryConcern: 'Tâm lý trầm cảm đầu năm',
        actionPlan: 'Đã hòa nhập vui vẻ',
        createdBy: 'u1',
        createdAt: '2026-09-03T00:00:00Z',
        updatedAt: '2026-09-03T00:00:00Z',
        updatesCount: 5,
      },
    ];

    const kpi = companionService.calculateKpi(mockCases);

    expect(kpi.totalCases).toBe(3);
    expect(kpi.activeCount).toBe(1);
    expect(kpi.monitoringCount).toBe(1);
    expect(kpi.completedCount).toBe(1);
    // criticalCount loại trừ những ca đã completed
    expect(kpi.criticalCount).toBe(1);
  });

  it('xử lý chính xác danh sách rỗng', () => {
    const kpi = companionService.calculateKpi([]);
    expect(kpi.totalCases).toBe(0);
    expect(kpi.activeCount).toBe(0);
    expect(kpi.monitoringCount).toBe(0);
    expect(kpi.completedCount).toBe(0);
    expect(kpi.criticalCount).toBe(0);
  });
});
