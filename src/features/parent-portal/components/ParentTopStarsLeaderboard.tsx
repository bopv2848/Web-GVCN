import React, { useState, useEffect } from 'react';
import { parentPortalService } from '../services/parentPortalService';
import type { TopStarStudent, LeaderboardTimeframe } from '../types';

interface ParentTopStarsLeaderboardProps {
  currentStudentCode?: string;
  classId?: string;
}

export const ParentTopStarsLeaderboard: React.FC<ParentTopStarsLeaderboardProps> = ({
  currentStudentCode,
  classId,
}) => {
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('week');
  const [leaderboard, setLeaderboard] = useState<TopStarStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    parentPortalService
      .getTopStarsLeaderboard(classId, timeframe)
      .then((data) => {
        if (isMounted) {
          setLeaderboard(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLeaderboard(parentPortalService.getFallbackLeaderboard(timeframe));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [classId, timeframe]);

  const top1 = leaderboard.find((s) => s.rank === 1);
  const top2 = leaderboard.find((s) => s.rank === 2);
  const top3 = leaderboard.find((s) => s.rank === 3);
  const rest = leaderboard.filter((s) => s.rank > 3);

  const isCurrentStudentInTop5 = leaderboard.some(
    (s) => s.studentCode.toUpperCase() === currentStudentCode?.toUpperCase()
  );
  const currentStudentRank = leaderboard.find(
    (s) => s.studentCode.toUpperCase() === currentStudentCode?.toUpperCase()
  );

  const getTimeframeLabel = () => {
    if (timeframe === 'week') return { title: 'Tuần Này', subtitle: 'Tuyên dương các bạn có số sao tích lũy ⭐ xuất sắc nhất tuần trong học tập và nề nếp' };
    if (timeframe === 'month') return { title: 'Tháng Này', subtitle: 'Ghi nhận những bạn chăm ngoan, giữ vững phong độ học tập suốt tháng' };
    return { title: 'Cả Học Kỳ', subtitle: 'Bảng tổng sắp sao tích lũy toàn diện của Lớp 6A6 suốt học kỳ 2026 - 2027' };
  };

  const { title: tfTitle, subtitle: tfSubtitle } = getTimeframeLabel();

  return (
    <div className="bg-gradient-to-b from-amber-500/10 via-white to-white rounded-3xl border border-amber-200/80 shadow-sm p-5 md:p-6 space-y-5">
      {/* Tiêu đề bảng vinh danh */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black uppercase tracking-wider shadow-2xs">
          <span>👑</span> Bảng Vinh Danh Sao Thưởng
        </div>
        <h3 className="text-lg md:text-xl font-black text-slate-850 tracking-tight">
          Top 5 Gương Mặt Tiêu Biểu ({tfTitle})
        </h3>
        <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
          {tfSubtitle}
        </p>
      </div>

      {/* Bộ lọc thời gian (Segmented Control) */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-2xl bg-amber-100/70 p-1 gap-1 border border-amber-200/60 shadow-inner">
          <button
            type="button"
            onClick={() => setTimeframe('week')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              timeframe === 'week'
                ? 'bg-white text-amber-950 shadow-xs scale-102'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <span>📅</span> Tuần Này
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              timeframe === 'month'
                ? 'bg-white text-amber-950 shadow-xs scale-102'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <span>🗓️</span> Tháng Này
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('semester')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              timeframe === 'semester'
                ? 'bg-white text-amber-950 shadow-xs scale-102'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <span>🏆</span> Cả Học Kỳ
          </button>
        </div>
      </div>

      {/* Trạng thái tải dữ liệu */}
      {isLoading ? (
        <div className="py-10 text-center text-xs text-slate-400 animate-pulse space-y-2">
          <span className="text-xl inline-block animate-spin">⭐</span>
          <p>Đang cập nhật bảng vinh danh {tfTitle.toLowerCase()}...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 italic">
          Chưa có ghi nhận thi đua nào trong {tfTitle.toLowerCase()}.
        </div>
      ) : (
        <>
          {/* Thông báo riêng cho gia đình nếu con lọt Top 5 */}
          {isCurrentStudentInTop5 && currentStudentRank && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md flex items-center gap-3 animate-fade-in">
              <span className="text-2xl">🎉</span>
              <div className="text-xs">
                <p className="font-black text-sm">Thật tự hào về con!</p>
                <p className="text-amber-100 font-medium">
                  Bé nhà mình đang vinh dự đứng vị trí thứ <strong className="text-white underline">Hạng {currentStudentRank.rank}</strong> với <strong>{currentStudentRank.totalStars} ⭐ sao thưởng</strong> ({tfTitle.toLowerCase()})!
                </p>
              </div>
            </div>
          )}

          {/* Bục Vinh Danh Top 3 (Podium) */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 items-end pt-4 pb-2 text-center animate-fade-in">
            {/* Hạng 2 (Bạc) */}
            {top2 && (
              <div className="flex flex-col items-center space-y-1.5">
                <div className="w-11 h-11 md:w-13 md:h-13 rounded-2xl bg-slate-200 border-2 border-slate-300 text-slate-700 flex items-center justify-center font-black text-sm md:text-base shadow-sm">
                  🥈
                </div>
                <div className="text-xs font-black text-slate-800 leading-tight">
                  {top2.maskedName}
                  <span className="block text-[10px] text-slate-400 font-mono font-bold">
                    {top2.studentCode}
                  </span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-2.5 space-y-0.5">
                  <span className="text-xs font-black text-amber-600 block">
                    ⭐ {top2.totalStars}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    Hạng 2
                  </span>
                </div>
              </div>
            )}

            {/* Hạng 1 (Vàng - Quán quân ở giữa cao hơn) */}
            {top1 && (
              <div className="flex flex-col items-center space-y-1.5 -translate-y-2">
                <div className="relative">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-base animate-bounce">
                    👑
                  </span>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-300 text-white flex items-center justify-center font-black text-lg md:text-xl shadow-md">
                    🥇
                  </div>
                </div>
                <div className="text-xs md:text-sm font-black text-amber-950 leading-tight">
                  {top1.maskedName}
                  <span className="block text-[10.5px] text-amber-700 font-mono font-bold">
                    {top1.studentCode}
                  </span>
                </div>
                <div className="w-full bg-gradient-to-b from-amber-100 to-amber-200/60 border border-amber-300 rounded-2xl p-3 space-y-0.5 shadow-xs">
                  <span className="text-sm font-black text-amber-700 block">
                    ⭐ {top1.totalStars}
                  </span>
                  <span className="text-[10.5px] font-black text-amber-900 block">
                    Quán Quân
                  </span>
                </div>
              </div>
            )}

            {/* Hạng 3 (Đồng) */}
            {top3 && (
              <div className="flex flex-col items-center space-y-1.5">
                <div className="w-11 h-11 md:w-13 md:h-13 rounded-2xl bg-amber-100 border-2 border-amber-300/80 text-amber-800 flex items-center justify-center font-black text-sm md:text-base shadow-sm">
                  🥉
                </div>
                <div className="text-xs font-black text-slate-800 leading-tight">
                  {top3.maskedName}
                  <span className="block text-[10px] text-slate-400 font-mono font-bold">
                    {top3.studentCode}
                  </span>
                </div>
                <div className="w-full bg-amber-50 border border-amber-200/60 rounded-2xl p-2.5 space-y-0.5">
                  <span className="text-xs font-black text-amber-600 block">
                    ⭐ {top3.totalStars}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 block">
                    Hạng 3
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Danh sách Hạng 4 và Hạng 5 */}
          {rest.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-amber-200/60 animate-fade-in">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 block">
                Đồng vinh danh:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rest.map((item) => {
                  const isChild = item.studentCode.toUpperCase() === currentStudentCode?.toUpperCase();
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                        isChild
                          ? 'bg-amber-100/80 border-amber-300 font-black'
                          : 'bg-white border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-black text-[11px] flex items-center justify-center">
                          #{item.rank}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {item.maskedName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.studentCode} • {item.groupName}
                          </span>
                        </div>
                      </div>

                      <span className="font-black text-amber-600 text-xs">
                        ⭐ {item.totalStars}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Chú thích bảo mật & Khích lệ */}
      <div className="text-center text-[10.5px] text-slate-400 italic">
        🔒 Để tôn trọng quyền riêng tư của các gia đình, hệ thống hiển thị tên dạng viết tắt. Cùng đồng hành và cổ vũ các con thi đua chăm ngoan!
      </div>
    </div>
  );
};
