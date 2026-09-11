import React from 'react';
import type { GroupReportStat } from '../types';

interface GroupRankReportTableProps {
  groupStats: GroupReportStat[];
}

export const GroupRankReportTable: React.FC<GroupRankReportTableProps> = ({ groupStats }) => {
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🎖️';
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 2:
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 3:
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base md:text-lg font-black text-slate-850 tracking-tight flex items-center gap-2">
            <span>🏆</span> Bảng Xếp Hạng Thi Đua 4 Tổ
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Điểm số tổng hợp từ sổ cái nề nếp thi đua và tỷ lệ chuyên cần các thành viên
          </p>
        </div>
      </div>

      {/* Grid 4 Tổ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groupStats.map((group) => (
          <div
            key={group.groupId}
            className={`relative p-5 rounded-2xl border transition-all hover:shadow-md ${
              group.rank === 1
                ? 'bg-gradient-to-b from-amber-50/70 to-white border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${getRankBadgeClass(
                  group.rank
                )}`}
              >
                <span>{getMedalEmoji(group.rank)}</span> Hạng {group.rank}
              </span>
              <span className="text-xs font-bold text-slate-400">{group.memberCount} học sinh</span>
            </div>

            <h4 className="text-lg font-black text-slate-850">{group.groupName}</h4>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">{group.badge}</p>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Tổng điểm</span>
                <span
                  className={`text-lg font-black ${
                    group.totalPoints >= 0 ? 'text-primary' : 'text-rose-600'
                  }`}
                >
                  {group.totalPoints > 0 ? `+${group.totalPoints}` : group.totalPoints}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Chuyên cần</span>
                <span className="text-lg font-black text-emerald-700">{group.attendanceRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
