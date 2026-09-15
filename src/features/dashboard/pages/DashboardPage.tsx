import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../../../types/dashboard';
import { RealtimeClockBar } from '../components/RealtimeClockBar';
import { DashboardKpiCards } from '../components/DashboardKpiCards';
import { WeeklyProgressChart } from '../components/WeeklyProgressChart';
import { QuickRankingsAndActivities } from '../components/QuickRankingsAndActivities';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';

export const DashboardPage: React.FC = () => {
  const { currentClass, user } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadDashboard = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const data = await dashboardService.getDashboardData(classId);
        setStats(data);
      } catch (err) {
        console.error('Lỗi nạp dữ liệu Dashboard:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [classId]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-bold text-slate-500">Đang tổng hợp dữ liệu lớp học từ Supabase Cloud...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      {/* 0. Thanh thời gian thực: Thứ, ngày, tháng, năm */}
      <RealtimeClockBar />

      {/* 1. Banner Chào Mừng & Nhận Diện Lớp */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-indigo-900 to-secondary p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-black uppercase tracking-wider">
                {currentClass?.academicYear || 'Niên khóa 2026 - 2027'}
              </span>
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-bold">
                {currentClass?.themeMonth || 'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-2 text-white">
              {currentClass?.themeTitle || 'CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              Chào mừng {user?.fullName || 'Thầy'} đến với không gian quản trị thông minh Lớp 6A6. Dữ liệu
              chuyên cần và thi đua hôm nay đã sẵn sàng!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              onClick={() => loadDashboard(true)}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold backdrop-blur-xs"
            >
              {isRefreshing ? '🔄 Đang làm mới...' : '🔄 Làm mới'}
            </Button>
          </div>
        </div>

        {/* Trang trí vòng tròn đồ họa chìm */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
      </div>

      {stats && (
        <>
          {/* 2. Bốn thẻ KPI chỉ số lớp học */}
          <DashboardKpiCards stats={stats} />

          {/* 3. Biểu đồ tiến độ tuần thật 100% */}
          <WeeklyProgressChart weeklyTrend={stats.weeklyTrend} />

          {/* 4. Xếp hạng 4 Tổ & Hoạt động gần nhất */}
          <QuickRankingsAndActivities stats={stats} />
        </>
      )}
    </div>
  );
};
