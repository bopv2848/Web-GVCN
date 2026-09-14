import React, { useState, useEffect } from 'react';
import { parentPortalService } from '../services/parentPortalService';
import type { WeeklyBadge } from '../types';

interface ParentWeeklyBadgesCardProps {
  currentStudentCode?: string;
  classId?: string;
}

export const ParentWeeklyBadgesCard: React.FC<ParentWeeklyBadgesCardProps> = ({
  currentStudentCode,
  classId,
}) => {
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0);
  const [badges, setBadges] = useState<WeeklyBadge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    parentPortalService
      .getWeeklyBadges(classId, currentStudentCode, weekOffset)
      .then((data) => {
        if (isMounted) {
          setBadges(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Lỗi nạp Weekly Badges:', err);
        if (isMounted) {
          setBadges(parentPortalService.getFallbackWeeklyBadges(currentStudentCode, weekOffset));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [classId, currentStudentCode, weekOffset]);

  // Kiểm tra xem con mình có đạt huy hiệu nào trong tuần này không
  const myChildBadge = badges.find((b) => b.winner.isCurrentStudent);

  const getThemeStyles = (theme: 'amber' | 'emerald' | 'sky', isMine: boolean) => {
    if (theme === 'amber') {
      return {
        cardBg: isMine
          ? 'bg-gradient-to-br from-amber-500/15 via-amber-50/90 to-white border-amber-400 ring-2 ring-amber-400/80 shadow-md'
          : 'bg-white hover:bg-amber-50/40 border-amber-200/90 shadow-2xs',
        badgePill: 'bg-amber-100 text-amber-900 border-amber-300',
        accentText: 'text-amber-700',
        metricBadge: 'bg-amber-500/10 text-amber-800 border-amber-200',
        iconBg: 'bg-amber-100 text-amber-700 border-amber-300/80',
      };
    }
    if (theme === 'emerald') {
      return {
        cardBg: isMine
          ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-50/90 to-white border-emerald-400 ring-2 ring-emerald-400/80 shadow-md'
          : 'bg-white hover:bg-emerald-50/40 border-emerald-200/90 shadow-2xs',
        badgePill: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        accentText: 'text-emerald-700',
        metricBadge: 'bg-emerald-500/10 text-emerald-800 border-emerald-200',
        iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-300/80',
      };
    }
    // sky
    return {
      cardBg: isMine
        ? 'bg-gradient-to-br from-sky-500/15 via-sky-50/90 to-white border-sky-400 ring-2 ring-sky-400/80 shadow-md'
        : 'bg-white hover:bg-sky-50/40 border-sky-200/90 shadow-2xs',
      badgePill: 'bg-sky-100 text-sky-900 border-sky-300',
      accentText: 'text-sky-700',
      metricBadge: 'bg-sky-500/10 text-sky-800 border-sky-200',
      iconBg: 'bg-sky-100 text-sky-700 border-sky-300/80',
    };
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-5">
      {/* Tiêu đề & Chuyển đổi Tuần Này / Tuần Trước */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎖️</span>
            <h3 className="text-base sm:text-lg font-black text-slate-850 tracking-tight">
              Huy Hiệu Vinh Danh Tuần Lớp 6A6
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Tuyên dương 3 gương mặt xuất sắc nhất về Chăm chỉ, Nề nếp và Phát biểu
          </p>
        </div>

        {/* Nút bấm chuyển đổi Tuần */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1 self-start sm:self-auto border border-slate-200/70">
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              weekOffset === 0
                ? 'bg-white text-slate-850 shadow-xs scale-102'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📅 Tuần Này
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              weekOffset === 1
                ? 'bg-white text-slate-850 shadow-xs scale-102'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🗓️ Tuần Trước
          </button>
        </div>
      </div>

      {/* Thông báo chúc mừng nếu con đạt danh hiệu */}
      {myChildBadge && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm flex items-center gap-3 animate-fade-in">
          <span className="text-3xl animate-bounce">🎉</span>
          <div className="text-xs sm:text-sm">
            <p className="font-black text-sm sm:text-base">Chúc mừng gia đình!</p>
            <p className="text-amber-100 font-medium mt-0.5">
              Bé nhà mình đã xuất sắc đạt danh hiệu danh dự{' '}
              <strong className="text-white underline font-black">
                {myChildBadge.icon} {myChildBadge.title}
              </strong>{' '}
              ({weekOffset === 0 ? 'tuần này' : 'tuần trước'}) với thành tích{' '}
              <strong>{myChildBadge.winner.metricLabel}</strong>!
            </p>
          </div>
        </div>
      )}

      {/* Trạng thái tải dữ liệu */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400 space-y-2">
          <span className="text-2xl inline-block animate-spin">🎖️</span>
          <p className="font-semibold">Đang tổng hợp thành tích thi đua tuần...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const isMine = badge.winner.isCurrentStudent;
            const styles = getThemeStyles(badge.colorTheme, isMine);

            return (
              <div
                key={badge.id}
                className={`relative rounded-3xl border p-4.5 sm:p-5 flex flex-col justify-between transition-all ${styles.cardBg}`}
              >
                {/* Tag "Con của bạn" nếu là con mình */}
                {isMine && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-amber-500 text-white shadow-xs border border-white flex items-center gap-1 animate-pulse">
                    <span>⭐</span> Con của bạn
                  </div>
                )}

                <div>
                  {/* Icon & Tên Danh Hiệu */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-2xs shrink-0 ${styles.iconBg}`}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${styles.badgePill}`}
                      >
                        {badge.tagline}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-slate-850 mt-0.5">
                        {badge.title}
                      </h4>
                    </div>
                  </div>

                  {/* Mô tả danh hiệu */}
                  <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {/* Thông tin học sinh đạt giải */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Vinh danh học sinh:
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-black truncate block ${
                        isMine ? styles.accentText : 'text-slate-800'
                      }`}
                    >
                      {isMine ? badge.winner.fullName : badge.winner.maskedName}
                    </span>
                    <span className="text-[10.5px] font-semibold text-slate-400">
                      {badge.winner.groupName}
                    </span>
                  </div>

                  {/* Chỉ số thành tích */}
                  <div
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black text-right shrink-0 ${styles.metricBadge}`}
                  >
                    {badge.winner.metricLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
