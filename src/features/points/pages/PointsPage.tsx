import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { pointsService, type GroupPointsSummary } from '../services/pointsService';
import { studentService } from '../../students/services/studentService';
import { AwardPointsModal } from '../components/AwardPointsModal';
import type { PointCategory, PointTransaction } from '../../../types/points';
import type { Student, Group } from '../../../types/student';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const PointsPage: React.FC = () => {
  const { currentClass, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const [groupSummaries, setGroupSummaries] = useState<GroupPointsSummary[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [categories, setCategories] = useState<PointCategory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [highlightedTxId, setHighlightedTxId] = useState<string | null>(null);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tự động mở modal khi có query param ?action=award
  useEffect(() => {
    if (searchParams.get('action') === 'award') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Đóng modal và dọn dẹp param trên URL
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    if (searchParams.get('action') === 'award') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('action');
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  // 1. Tải toàn bộ dữ liệu ban đầu
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumData, txData, catData, stdData, grpData] = await Promise.all([
        pointsService.getGroupPointsSummary(classId),
        pointsService.getRecentTransactions(classId, 25),
        pointsService.getCategories(classId),
        studentService.getStudents(classId),
        studentService.getGroups(classId),
      ]);
      setGroupSummaries(sumData);
      setTransactions(txData);
      setCategories(catData);
      setStudents(stdData);
      setGroups(grpData);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu thi đua:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Kích hoạt kết nối Realtime WebSockets
  useEffect(() => {
    setIsRealtimeActive(true);

    const unsubscribe = pointsService.subscribeToPoints(classId, async (payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const newRow = payload.new;

        // Tải thông tin chi tiết của học sinh cho dòng mới
        const studentInfo = students.find((s) => s.id === newRow.student_id);

        const newTx: PointTransaction = {
          id: newRow.id,
          studentId: newRow.student_id,
          studentName: studentInfo?.fullName || 'Học sinh',
          points: newRow.points,
          stars: newRow.stars,
          reason: newRow.reason,
          note: newRow.note,
          occurredAt: newRow.occurred_at,
          createdBy: newRow.created_by,
          reversalOfId: newRow.reversal_of_id,
        };

        // Chèn giao dịch mới lên đầu danh sách
        setTransactions((prev) => [newTx, ...prev.filter((t) => t.id !== newTx.id)]);

        // Cập nhật lại bảng xếp hạng 4 Tổ tức thì
        const updatedSummaries = await pointsService.getGroupPointsSummary(classId);
        setGroupSummaries(updatedSummaries);

        // Hiệu ứng phát sáng
        setHighlightedTxId(newTx.id);
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedTxId(null);
        }, 3000);
      }
    });

    return () => {
      setIsRealtimeActive(false);
      unsubscribe();
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, [classId, students]);

  // 3. Hoàn tác giao dịch
  const handleReverse = async (tx: PointTransaction) => {
    const confirmReversal = window.confirm(
      `Thầy/Cô có chắc chắn muốn hoàn tác giao dịch "${tx.reason}" (${tx.points > 0 ? '+' : ''}${tx.points}đ) của em ${tx.studentName}?`
    );
    if (!confirmReversal) return;

    try {
      await pointsService.reverseTransaction(tx.id, 'GVCN yêu cầu hủy kết quả');
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert('Lỗi hoàn tác: ' + (error.message || 'Không thể hoàn tác'));
    }
  };

  const rankMedals = ['🥇', '🥈', '🥉', '🎗️'];

  return (
    <div className="space-y-6">
      {/* Header & Trạng thái Realtime */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Tích Điểm & Sổ Cái Thi Đua 6A6
            </h2>
            {isRealtimeActive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Realtime Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Ngoại tuyến</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Sổ cái minh bạch Append-only • Ban Cán Sự và GVCN cùng tham gia chấm điểm nề nếp
          </p>
        </div>
      </div>

      {/* Bảng Xếp Hạng Thi Đua 4 Tổ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">
            🏆 Bảng Xếp Hạng Thi Đua 4 Tổ (Tuần Hiện Tại)
          </h3>
          <span className="text-xs font-bold text-slate-400">
            Tự động cập nhật tức thì
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {groupSummaries.map((g, idx) => (
            <div
              key={g.id}
              className={`p-4 rounded-3xl border transition-all ${
                idx === 0
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100/60 border-amber-300 shadow-sm'
                  : 'bg-white border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-black text-slate-850">
                  {rankMedals[idx] || '🎗️'} Hạng {g.rank}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                  {g.name}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-850">
                    {g.totalPoints > 0 ? `+${g.totalPoints}` : g.totalPoints}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 ml-1">điểm</span>
                </div>
                <div className="text-amber-500 font-black text-sm sm:text-base">
                  ⭐ {g.totalStars} sao
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dòng Nhật Ký Sổ Cái Thời Gian Thực */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">
              📜 Nhật Ký Giao Dịch Sổ Cái Thời Gian Thực (Append-only Ledger)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ghi nhận đầy đủ thời gian, người chấm và lý do; hoàn tác minh bạch không xóa lịch sử
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {transactions.length} giao dịch gần nhất
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <LoadingSpinner size="md" text="Đang đồng bộ sổ cái thi đua từ Supabase..." />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <span className="text-3xl block mb-2">⭐</span>
            Chưa có giao dịch thi đua nào. Thầy/Cô hãy bấm "+ Chấm điểm thi đua" để bắt đầu!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isHighlight = highlightedTxId === tx.id;
              const isPositive = tx.points >= 0;
              const isReversal = Boolean(tx.reversalOfId) || tx.reason.includes('[HOÀN TÁC]');

              return (
                <div
                  key={tx.id}
                  className={`py-3.5 px-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                    isHighlight
                      ? 'bg-amber-100/90 ring-2 ring-amber-400 shadow-md animate-pulse'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isReversal
                          ? 'bg-slate-100 text-slate-750'
                          : isPositive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isReversal ? '↩️' : isPositive ? '➕' : '➖'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-850">
                          {tx.studentName}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-400">
                          {new Date(tx.occurredAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                        {tx.reason}
                        {tx.note && <span className="text-slate-400 ml-1">({tx.note})</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span
                        className={`text-sm sm:text-base font-black ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${tx.points}` : tx.points}đ
                      </span>
                      {tx.stars !== 0 && (
                        <span className="text-amber-500 text-xs sm:text-sm font-bold ml-1.5">
                          ⭐ {tx.stars > 0 ? `+${tx.stars}` : tx.stars}
                        </span>
                      )}
                    </div>

                    {/* Nút Hoàn tác (Chỉ GVCN & Admin) */}
                    {(user?.role === 'gvcn' || user?.role === 'admin') && !isReversal && (
                      <button
                        onClick={() => handleReverse(tx)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hoàn tác giao dịch này"
                      >
                        ↩️ Hoàn tác
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Chấm điểm */}
      <AwardPointsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        classId={classId}
        onSuccess={() => {
          loadInitialData();
          handleCloseModal();
        }}
        onCategoryAdded={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
        }}
        students={students}
        groups={groups}
        categories={categories}
        groupSummaries={groupSummaries}
      />
    </div>
  );
};
