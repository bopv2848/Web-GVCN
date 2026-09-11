import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import type { DashboardStats } from '../../../types/dashboard';

interface QuickRankingsAndActivitiesProps {
  stats: DashboardStats;
}

export const QuickRankingsAndActivities: React.FC<QuickRankingsAndActivitiesProps> = ({ stats }) => {
  const navigate = useNavigate();
  const { pointsOverview, recentActivities } = stats;

  const maxPoints = Math.max(...pointsOverview.groupRankings.map((g) => g.totalPoints), 1);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇 Hạng 1';
      case 2:
        return '🥈 Hạng 2';
      case 3:
        return '🥉 Hạng 3';
      default:
        return `Hạng ${rank}`;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 2:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 3:
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Bảng xếp hạng 4 Tổ thi đua */}
      <Card className="lg:col-span-2 border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base md:text-lg font-black text-slate-850 tracking-tight">
                Xếp Hạng 4 Tổ Thi Đua
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tính trực tiếp từ tổng điểm giao dịch thật trong tuần
              </p>
            </div>
            <Button
              onClick={() => navigate('/points')}
              variant="outline"
              size="sm"
              className="text-xs font-bold"
            >
              Xem Sổ Cái →
            </Button>
          </div>

          <div className="space-y-3.5">
            {pointsOverview.groupRankings.map((group) => {
              const progressPct = Math.round((Math.max(group.totalPoints, 0) / maxPoints) * 100);

              return (
                <div
                  key={group.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-150/80 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${getRankBadgeColor(
                          group.rank
                        )}`}
                      >
                        {getRankBadge(group.rank)}
                      </span>
                      <span className="font-extrabold text-sm md:text-base text-slate-850">
                        {group.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base md:text-lg font-black text-slate-850">
                        {group.totalPoints >= 0 ? `+${group.totalPoints}` : group.totalPoints}
                      </span>
                      <span className="text-xs font-bold text-amber-500">sao ⭐</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${
                        group.rank === 1
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : group.rank === 2
                            ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                            : group.rank === 3
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                              : 'bg-gradient-to-r from-purple-400 to-purple-500'
                      }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions row */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            onClick={() => navigate('/attendance')}
            variant="outline"
            size="sm"
            className="text-xs font-bold w-full bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            📋 Điểm danh ngay
          </Button>
          <Button
            onClick={() => navigate('/points')}
            variant="outline"
            size="sm"
            className="text-xs font-bold w-full bg-amber-50/50 hover:bg-amber-50 text-amber-700 border-amber-200"
          >
            ⭐ Chấm điểm thi đua
          </Button>
          <Button
            onClick={() => navigate('/seating')}
            variant="outline"
            size="sm"
            className="text-xs font-bold w-full bg-blue-50/50 hover:bg-blue-50 text-blue-700 border-blue-200"
          >
            🪑 Sơ đồ lớp học
          </Button>
          <Button
            onClick={() => navigate('/students')}
            variant="outline"
            size="sm"
            className="text-xs font-bold w-full bg-purple-50/50 hover:bg-purple-50 text-purple-700 border-purple-200"
          >
            👥 47 Học sinh
          </Button>
        </div>
      </Card>

      {/* 2. Dòng thời gian Hoạt động gần nhất */}
      <Card className="border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base md:text-lg font-black text-slate-850 tracking-tight">
                Hoạt Động Mới Nhất
              </h3>
              <p className="text-xs text-slate-500 font-medium">Giao dịch thi đua thời gian thực</p>
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-white border border-slate-150 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${act.badgeColor}`}
                    >
                      {act.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{act.timeAgo}</span>
                  </div>
                  <p className="text-xs text-slate-650 font-medium line-clamp-1">{act.description}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Chưa có hoạt động nào trong tuần
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <Button
            onClick={() => navigate('/points')}
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 w-full"
          >
            Xem toàn bộ nhật ký thi đua →
          </Button>
        </div>
      </Card>
    </div>
  );
};
