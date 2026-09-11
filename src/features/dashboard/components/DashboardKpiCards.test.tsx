import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardKpiCards } from './DashboardKpiCards';
import type { DashboardStats } from '../../../types/dashboard';

describe('DashboardKpiCards Component', () => {
  const mockStats: DashboardStats = {
    totalStudents: 47,
    maleCount: 24,
    femaleCount: 23,
    boardingCount: 47,
    guardianLinkedCount: 40,
    attendanceToday: {
      morningRate: 100,
      morningPresent: 47,
      morningAbsent: 0,
      morningLate: 0,
      afternoonRate: 98,
      afternoonPresent: 46,
      afternoonAbsent: 1,
      afternoonLate: 0,
      overallRate: 99,
      hasSessionToday: true,
    },
    pointsOverview: {
      totalClassPoints: 85,
      totalClassStars: 70,
      leadingGroup: {
        id: 'g1',
        name: 'Tổ 1',
        totalPoints: 35,
        rank: 1,
        colorClass: 'text-red-500',
      },
      groupRankings: [
        { id: 'g1', name: 'Tổ 1', totalPoints: 35, rank: 1, colorClass: 'text-red-500' },
        { id: 'g2', name: 'Tổ 2', totalPoints: 25, rank: 2, colorClass: 'text-green-500' },
      ],
    },
    weeklyTrend: [],
    recentActivities: [],
  };

  it('hiển thị chính xác sĩ số 47 học sinh', () => {
    render(<DashboardKpiCards stats={mockStats} />);
    expect(screen.getByText('47')).toBeDefined();
    expect(screen.getByText(/24 Nam/)).toBeDefined();
    expect(screen.getByText(/23 Nữ/)).toBeDefined();
    expect(screen.getByText(/47 Bán trú/)).toBeDefined();
  });

  it('hiển thị chính xác tỷ lệ chuyên cần hôm nay và tổ dẫn đầu', () => {
    render(<DashboardKpiCards stats={mockStats} />);
    expect(screen.getByText('99%')).toBeDefined();
    expect(screen.getByText('Tổ 1')).toBeDefined();
    expect(screen.getByText('+85')).toBeDefined();
  });
});
