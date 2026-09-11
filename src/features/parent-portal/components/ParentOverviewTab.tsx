import React from 'react';
import type { ParentStudentPortalData } from '../types';
import { ParentTopStarsLeaderboard } from './ParentTopStarsLeaderboard';

interface ParentOverviewTabProps {
  data: ParentStudentPortalData;
  onSelectTab: (tab: 'points' | 'attendance' | 'timetable') => void;
}

export const ParentOverviewTab: React.FC<ParentOverviewTabProps> = ({ data, onSelectTab }) => {
  const { student, pointTransactions, attendanceHistory } = data;

  const recentTransactions = pointTransactions.slice(0, 3);
  const recentAttendance = attendanceHistory.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Khát vọng & Năng khiếu của con */}
      {(student.goals || student.talents) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {student.goals && (
            <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                <span>🎯</span> Mục tiêu phấn đấu của con
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{student.goals}"
              </p>
            </div>
          )}

          {student.talents && (
            <div className="p-4 rounded-3xl bg-sky-50/70 border border-sky-200/70 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-sky-900 uppercase tracking-wider">
                <span>🎨</span> Năng khiếu & Sở thích
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{student.talents}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bảng vinh danh Top 5 Sao Thưởng của Lớp 6A6 */}
      <ParentTopStarsLeaderboard
        currentStudentCode={student.code}
      />

      {/* Grid 2 cột: Hoạt động điểm gần nhất & Chuyên cần gần nhất */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Điểm mới nhất */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <span>⭐</span> Điểm thi đua mới nhất
            </h4>
            <button
              onClick={() => onSelectTab('points')}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Xem tất cả ({pointTransactions.length}) →
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3 text-center">
              Chưa có ghi nhận điểm số trong tuần.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-800 truncate">{tx.reason}</p>
                    <span className="text-[10.5px] text-slate-400">
                      {new Date(tx.occurredAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] font-black ${
                      tx.points > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {tx.points > 0 ? `+${tx.points}` : tx.points} đ
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chuyên cần gần nhất */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <span>📅</span> Điểm danh các buổi gần đây
            </h4>
            <button
              onClick={() => onSelectTab('attendance')}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Xem tất cả ({attendanceHistory.length}) →
            </button>
          </div>

          {recentAttendance.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3 text-center">
              Chưa có dữ liệu điểm danh.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentAttendance.map((att) => (
                <div key={att.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Ngày {att.sessionDate}
                    </span>
                    <span className="text-[10.5px] text-slate-400">
                      Buổi {att.sessionType === 'morning' ? 'Sáng' : 'Chiều'}
                    </span>
                  </div>
                  <div>
                    {att.status === 'present' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Có mặt
                      </span>
                    )}
                    {att.status === 'late' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Đi muộn
                      </span>
                    )}
                    {att.status === 'excused' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Có phép
                      </span>
                    )}
                    {att.status === 'unexcused' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        K.Phép
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thông tin giáo viên chủ nhiệm & Hỗ trợ */}
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-black shrink-0">
            👨‍🏫
          </div>
          <div>
            <p className="font-black text-slate-800">
              Giáo viên Chủ nhiệm: {student.teacherName}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Số điện thoại / Zalo Thầy: {student.teacherPhone || '0988.xxx.xxx'}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 sm:text-right">
          <p>Giờ tiếp nhận trao đổi: Sau 17h00 hàng ngày</p>
          <p>Trường THCS Nguyễn Văn Trỗi</p>
        </div>
      </div>
    </div>
  );
};
