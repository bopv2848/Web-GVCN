import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { pointsService, type GroupPointsSummary } from '../services/pointsService';
import { studentService } from '../../students/services/studentService';
import { AwardPointsModal } from '../components/AwardPointsModal';
import { ReverseTransactionModal } from '../components/ReverseTransactionModal';
import type { PointCategory, PointTransaction } from '../../../types/points';
import type { Student, Group } from '../../../types/student';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { cn } from '../../../utils/cn';
import { playPointsChime, playUndoChime } from '../../../utils/soundNotification';

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
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [highlightedTxId, setHighlightedTxId] = useState<string | null>(null);

  // State Modal Hoàn tác giao dịch kèm ghi chú phản hồi cho Ban cán sự
  const [reversingTx, setReversingTx] = useState<PointTransaction | null>(null);
  const [isReversing, setIsReversing] = useState<boolean>(false);

  // Thông báo nổi khi có sự kiện Realtime từ Ban cán sự
  const [realtimeNotification, setRealtimeNotification] = useState<{
    id: string;
    type: 'insert' | 'delete';
    message: string;
    subtext?: string;
  } | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const studentsRef = useRef<Student[]>([]);
  const profilesMapRef = useRef<Record<string, string>>({
    '601dce7f-13e4-4680-b2f9-f86ed1a17079': 'Thầy Phan Văn Bộ (GVCN)',
    'dd877932-f537-412d-baf5-018ba482a1e3': 'Lê Ngọc Anh (Lớp trưởng)',
  });

  // Bộ lọc lịch sử sổ cái
  const [filterWeek, setFilterWeek] = useState<'all' | 'this_week' | 'last_week' | 'today'>('this_week');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'add' | 'subtract' | 'reversal'>('all');
  const [filterCreator, setFilterCreator] = useState<'all' | 'bancansu' | 'gvcn'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Nhận diện giao dịch do Ban Cán Sự hay GVCN chấm
  const isBcsTransaction = useCallback((tx: PointTransaction) => {
    const by = (tx.createdBy || '').toLowerCase();
    return (
      by.includes('bcs') ||
      by.includes('ban cán sự') ||
      by.includes('lớp trưởng') ||
      by.includes('ngọc anh') ||
      tx.createdBy === 'dd877932-f537-412d-baf5-018ba482a1e3'
    );
  }, []);

  const isGvcnTransaction = useCallback((tx: PointTransaction) => {
    const by = (tx.createdBy || '').toLowerCase();
    return (
      by.includes('thầy') ||
      by.includes('bộ') ||
      by.includes('gvcn') ||
      by.includes('giáo viên') ||
      tx.createdBy === '601dce7f-13e4-4680-b2f9-f86ed1a17079' ||
      by.includes('dev-gvcn')
    );
  }, []);

  // Đếm số lượng giao dịch theo người chấm
  const creatorCounts = useMemo(() => {
    let bcs = 0;
    let gvcn = 0;
    transactions.forEach((tx) => {
      if (isBcsTransaction(tx)) bcs++;
      else if (isGvcnTransaction(tx)) gvcn++;
    });
    return { bcs, gvcn, total: transactions.length };
  }, [transactions, isBcsTransaction, isGvcnTransaction]);

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

  // Cập nhật studentsRef mỗi khi students thay đổi
  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  // 1. Tải toàn bộ dữ liệu ban đầu
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumData, txData, catData, stdData, grpData, profMap] = await Promise.all([
        pointsService.getGroupPointsSummary(classId),
        pointsService.getRecentTransactions(classId, 100),
        pointsService.getCategories(classId),
        studentService.getStudents(classId),
        studentService.getGroups(classId),
        pointsService.getProfilesMap(),
      ]);
      setGroupSummaries(sumData);
      setTransactions(txData);
      setCategories(catData);
      setStudents(stdData);
      setGroups(grpData);
      if (profMap) {
        profilesMapRef.current = { ...profilesMapRef.current, ...profMap };
      }
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
    setRealtimeStatus('connecting');

    const unsubscribe = pointsService.subscribeToPoints(
      classId,
      async (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const newRow = payload.new;

          // Tải thông tin chi tiết của học sinh cho dòng mới
          const studentInfo = studentsRef.current.find((s) => s.id === newRow.student_id);
          const creatorName =
            profilesMapRef.current[newRow.created_by] || 'Ban Cán Sự / GVCN';

          const newTx: PointTransaction = {
            id: newRow.id,
            studentId: newRow.student_id,
            studentName: studentInfo?.fullName || 'Học sinh',
            groupName: studentInfo?.groupName || undefined,
            points: newRow.points,
            stars: newRow.stars,
            reason: newRow.reason,
            note: newRow.note,
            occurredAt: newRow.occurred_at,
            createdBy: creatorName,
            reversalOfId: newRow.reversal_of_id,
          };

          // Chèn giao dịch mới lên đầu danh sách
          setTransactions((prev) => [newTx, ...prev.filter((t) => t.id !== newTx.id)]);

          // Cập nhật lại bảng xếp hạng 4 Tổ tức thì
          const updatedSummaries = await pointsService.getGroupPointsSummary(classId);
          setGroupSummaries(updatedSummaries);

          // Phân biệt giao dịch hoàn tác hay giao dịch chấm điểm mới
          const isReversalTx = Boolean(newRow.reversal_of_id) || (newRow.reason || '').includes('[HOÀN TÁC]');

          if (isReversalTx) {
            playUndoChime();
            setRealtimeNotification({
              id: newRow.id,
              type: 'delete',
              message: `↩️ ${creatorName} đã hoàn tác giao dịch điểm của ${
                studentInfo?.fullName || 'học sinh'
              }`,
              subtext: newRow.note ? `Lý do phản hồi: "${newRow.note}"` : newRow.reason,
            });
          } else {
            playPointsChime();
            const sign = newRow.points > 0 ? '+' : '';
            setRealtimeNotification({
              id: newRow.id,
              type: 'insert',
              message: `${creatorName} vừa chấm ${sign}${newRow.points} điểm cho ${
                studentInfo?.fullName || 'học sinh'
              }`,
              subtext: newRow.reason,
            });
          }

          if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
          notificationTimeoutRef.current = setTimeout(() => {
            setRealtimeNotification(null);
          }, 5000);

          // Hiệu ứng phát sáng
          setHighlightedTxId(newTx.id);
          if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = setTimeout(() => {
            setHighlightedTxId(null);
          }, 3500);
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const deletedId = payload.old.id;

          setTransactions((prev) => prev.filter((t) => t.id !== deletedId));

          const updatedSummaries = await pointsService.getGroupPointsSummary(classId);
          setGroupSummaries(updatedSummaries);

          playUndoChime();
          setRealtimeNotification({
            id: `del-${deletedId}`,
            type: 'delete',
            message: 'Một giao dịch chấm điểm vừa được hoàn tác / thu hồi từ xa.',
          });
          if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
          notificationTimeoutRef.current = setTimeout(() => {
            setRealtimeNotification(null);
          }, 4000);
        }
      },
      (status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('error');
        } else {
          setRealtimeStatus('connecting');
        }
      }
    );

    return () => {
      setIsRealtimeActive(false);
      unsubscribe();
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, [classId]);

  // Xác định khoảng thời gian theo bộ lọc tuần
  const getFilterDateRange = useCallback((filter: 'all' | 'this_week' | 'last_week' | 'today') => {
    if (filter === 'all') return null;

    const now = new Date();
    if (filter === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { start, end };
    }

    const offset = filter === 'last_week' ? 1 : 0;
    const dayOfWeek = now.getDay(); // 0 là Chủ Nhật, 1 là Thứ Hai...
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday - offset * 7, 0, 0, 0, 0);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);

    return { start: monday, end: sunday };
  }, []);

  // Danh sách giao dịch sau khi áp dụng bộ lọc (Tuần, Tổ, Loại điểm, Từ khóa)
  const filteredTransactions = useMemo(() => {
    const range = getFilterDateRange(filterWeek);
    const kw = searchKeyword.trim().toLowerCase();

    return transactions.filter((tx) => {
      // 1. Lọc theo thời gian (Tuần / Hôm nay)
      if (range) {
        const txDate = new Date(tx.occurredAt);
        if (txDate < range.start || txDate > range.end) {
          return false;
        }
      }

      // 2. Lọc theo Tổ
      if (filterGroup !== 'all') {
        const std = students.find((s) => s.id === tx.studentId);
        const matchesGroup =
          std?.groupId === filterGroup ||
          std?.groupName === filterGroup ||
          tx.groupName === filterGroup;
        if (!matchesGroup) return false;
      }

      // 3. Lọc theo Loại điểm
      const isReversal = Boolean(tx.reversalOfId) || tx.reason.includes('[HOÀN TÁC]');
      if (filterType === 'reversal') {
        if (!isReversal) return false;
      } else if (filterType === 'add') {
        if (isReversal || tx.points <= 0) return false;
      } else if (filterType === 'subtract') {
        if (isReversal || tx.points >= 0) return false;
      }

      // 4. Tìm kiếm từ khóa (Tên học sinh, lý do, ghi chú)
      if (kw) {
        const nameMatch = (tx.studentName || '').toLowerCase().includes(kw);
        const reasonMatch = (tx.reason || '').toLowerCase().includes(kw);
        const noteMatch = (tx.note || '').toLowerCase().includes(kw);
        if (!nameMatch && !reasonMatch && !noteMatch) return false;
      }

      // 5. Lọc theo Người thực hiện (Ban Cán Sự vs GVCN)
      if (filterCreator === 'bancansu') {
        if (!isBcsTransaction(tx)) return false;
      } else if (filterCreator === 'gvcn') {
        if (!isGvcnTransaction(tx)) return false;
      }

      return true;
    });
  }, [
    transactions,
    filterWeek,
    filterGroup,
    filterType,
    filterCreator,
    searchKeyword,
    getFilterDateRange,
    students,
    isBcsTransaction,
    isGvcnTransaction,
  ]);

  // Tổng điểm của các giao dịch đang hiển thị theo bộ lọc
  const totalFilteredPoints = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => acc + tx.points, 0);
  }, [filteredTransactions]);

  const isFilterActive =
    filterWeek !== 'this_week' ||
    filterGroup !== 'all' ||
    filterType !== 'all' ||
    filterCreator !== 'all' ||
    Boolean(searchKeyword.trim());

  // 3. Hoàn tác giao dịch kèm lý do phản hồi cho Ban cán sự
  const handleConfirmReverse = async (reason: string) => {
    if (!reversingTx) return;
    setIsReversing(true);

    try {
      const res = await pointsService.reverseTransaction(reversingTx.id, reason);
      if (res) {
        // Cập nhật lại số liệu tức thì
        const [sumData, txData] = await Promise.all([
          pointsService.getGroupPointsSummary(classId),
          pointsService.getRecentTransactions(classId, 100),
        ]);
        setGroupSummaries(sumData);
        setTransactions(txData);

        playUndoChime();
        setRealtimeNotification({
          id: `rev-${reversingTx.id}-${Date.now()}`,
          type: 'delete',
          message: `Đã hoàn tác giao dịch của em ${reversingTx.studentName}`,
          subtext: `Lý do phản hồi: "${reason}"`,
        });
        if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = setTimeout(() => {
          setRealtimeNotification(null);
        }, 5000);

        setReversingTx(null);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert('Lỗi hoàn tác: ' + (error.message || 'Không thể hoàn tác'));
    } finally {
      setIsReversing(false);
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
            {isRealtimeActive && realtimeStatus === 'connected' && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Realtime Live (Đã đồng bộ)</span>
              </span>
            )}
            {isRealtimeActive && realtimeStatus === 'connecting' && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Đang kết nối WebSocket...</span>
              </span>
            )}
            {(!isRealtimeActive || realtimeStatus === 'error') && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Ngoại tuyến (Chế độ cục bộ)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Sổ cái minh bạch Append-only • Đồng bộ tức thì giữa Điện thoại Ban Cán Sự & Máy tính GVCN
          </p>
        </div>
      </div>

      {/* Thông báo nổi Realtime Toast khi có điểm mới hoặc thu hồi */}
      {realtimeNotification && (
        <div
          className={cn(
            'fixed top-5 right-5 z-50 flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 max-w-md animate-bounce',
            realtimeNotification.type === 'insert'
              ? 'bg-slate-900/95 text-white border-emerald-500/80 shadow-emerald-950/20'
              : 'bg-slate-900/95 text-white border-amber-500/80 shadow-amber-950/20'
          )}
        >
          <span className="text-2xl mt-0.5">
            {realtimeNotification.type === 'insert' ? '⭐' : '↩️'}
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md',
                  realtimeNotification.type === 'insert'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                )}
              >
                {realtimeNotification.type === 'insert'
                  ? '⚡ Ban Cán Sự vừa ghi điểm'
                  : '⚡ Hoàn tác giao dịch'}
              </span>
              <button
                type="button"
                onClick={() => setRealtimeNotification(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-sm font-bold mt-1 text-white">
              {realtimeNotification.message}
            </p>
            {realtimeNotification.subtext && (
              <p className="text-xs text-slate-300 mt-1 italic">
                "{realtimeNotification.subtext}"
              </p>
            )}
          </div>
        </div>
      )}

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
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

        {/* Thanh công cụ lọc đa năng (Tuần, Tổ, Loại điểm, Tìm kiếm) */}
        <div className="bg-slate-50/80 p-3.5 md:p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Lọc theo thời gian (Tuần / Hôm nay) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-500 shrink-0">
                ⏱️ Thời gian:
              </span>
              {[
                { id: 'this_week', label: '📅 Tuần này' },
                { id: 'last_week', label: '🗓️ Tuần trước' },
                { id: 'today', label: '⚡ Hôm nay' },
                { id: 'all', label: '🌐 Tất cả' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterWeek(tab.id as 'all' | 'this_week' | 'last_week' | 'today')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                    filterWeek === tab.id
                      ? 'bg-primary text-white shadow-xs font-black'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Ô tìm kiếm học sinh / lý do */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="🔍 Tìm tên học sinh, lý do..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent font-medium"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-200/70">
            {/* Lọc theo Tổ */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                👥 Tổ:
              </span>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
              >
                <option value="all">Tất cả các tổ</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo Loại điểm */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                🏷️ Loại điểm:
              </span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'add' | 'subtract' | 'reversal')}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
              >
                <option value="all">Tất cả điểm</option>
                <option value="add">➕ Chỉ điểm cộng (+)</option>
                <option value="subtract">➖ Chỉ điểm trừ (-)</option>
                <option value="reversal">↩️ Chỉ hoàn tác</option>
              </select>
            </div>

            {/* Lọc theo Người thực hiện (Ban Cán Sự vs GVCN) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                👤 Người chấm:
              </span>
              <div className="inline-flex p-0.5 bg-slate-200/70 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setFilterCreator('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    filterCreator === 'all'
                      ? 'bg-white text-slate-850 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Tất cả ({creatorCounts.total})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCreator('bancansu')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                    filterCreator === 'bancansu'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-blue-700 hover:bg-blue-50/80'
                  )}
                  title="Chỉ xem các lượt điểm do Ban Cán Sự lớp chấm để duyệt lại tính công tâm"
                >
                  <span>⭐ Ban Cán Sự</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-black',
                      filterCreator === 'bancansu'
                        ? 'bg-blue-800 text-white'
                        : 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {creatorCounts.bcs}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCreator('gvcn')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                    filterCreator === 'gvcn'
                      ? 'bg-slate-800 text-white shadow-xs font-black'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                  title="Chỉ xem các lượt điểm do GVCN chấm"
                >
                  <span>👨‍🏫 GVCN</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-black',
                      filterCreator === 'gvcn'
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {creatorCounts.gvcn}
                  </span>
                </button>
              </div>
            </div>

            {/* Thống kê kết quả & Nút đặt lại */}
            <div className="ml-auto flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80">
                Hiển thị: <strong className="text-slate-900">{filteredTransactions.length}</strong> giao dịch
                {filteredTransactions.length > 0 && (
                  <span className="ml-1.5 text-slate-600 font-semibold">
                    (Tổng: {totalFilteredPoints > 0 ? `+${totalFilteredPoints}` : totalFilteredPoints}đ)
                  </span>
                )}
              </span>

              {isFilterActive && (
                <button
                  onClick={() => {
                    setFilterWeek('this_week');
                    setFilterGroup('all');
                    setFilterType('all');
                    setFilterCreator('all');
                    setSearchKeyword('');
                  }}
                  className="px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                  title="Đặt lại toàn bộ bộ lọc"
                >
                  🔄 Đặt lại
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Banner hỗ trợ rà soát công tâm khi lọc điểm Ban Cán Sự */}
        {filterCreator === 'bancansu' && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⭐</span>
              <div>
                <p className="font-bold text-blue-950">
                  Chế độ kiểm duyệt: Đang hiển thị {filteredTransactions.length} lượt chấm do Ban Cán Sự lớp thực hiện
                </p>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Thầy/Cô rà soát tính công tâm trước khi xếp loại tuần. Bấm nút <strong>↩️ Hoàn tác</strong> nếu học sinh chấm sai hoặc chưa chuẩn xác.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilterCreator('all')}
              className="text-blue-700 hover:text-blue-900 underline font-bold text-xs shrink-0 ml-3 cursor-pointer"
            >
              Hiển thị tất cả
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center">
            <LoadingSpinner size="md" text="Đang đồng bộ sổ cái thi đua từ Supabase..." />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <span className="text-3xl block mb-2">⭐</span>
            Chưa có giao dịch thi đua nào. Thầy hãy bấm nút "⭐ Chấm điểm thi đua" ở menu để bắt đầu!
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="font-bold text-slate-700 mb-1">Không tìm thấy giao dịch nào phù hợp với bộ lọc</p>
            <p className="text-slate-400 mb-3">Thầy thử thay đổi tuần, tổ hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => {
                setFilterWeek('all');
                setFilterGroup('all');
                setFilterType('all');
                setFilterCreator('all');
                setSearchKeyword('');
              }}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs hover:bg-slate-100 cursor-pointer shadow-2xs"
            >
              Xem tất cả giao dịch
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isHighlight = highlightedTxId === tx.id;
              const isPositive = tx.points >= 0;
              const isReversal = Boolean(tx.reversalOfId) || tx.reason.includes('[HOÀN TÁC]');
              const studentInfo = students.find((s) => s.id === tx.studentId);
              const groupName = tx.groupName || studentInfo?.groupName;

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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-850">
                          {tx.studentName}
                        </span>
                        {groupName && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {groupName}
                          </span>
                        )}

                        {/* Huy hiệu Người thực hiện (Ban cán sự vs GVCN) */}
                        {isBcsTransaction(tx) ? (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"
                            title={`Chấm bởi: ${tx.createdBy}`}
                          >
                            <span>⭐</span>
                            <span>{tx.createdBy.includes('(') ? tx.createdBy.split('(')[0].trim() : (tx.createdBy || 'Ban Cán Sự')}</span>
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"
                            title={`Chấm bởi: ${tx.createdBy}`}
                          >
                            <span>👨‍🏫</span>
                            <span>GVCN</span>
                          </span>
                        )}

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
                        onClick={() => setReversingTx(tx)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hoàn tác giao dịch này và gửi phản hồi cho Ban cán sự"
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
        onCategoryUpdated={(updatedCat) => {
          setCategories((prev) =>
            prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
          );
        }}
        students={students}
        groups={groups}
        categories={categories}
        groupSummaries={groupSummaries}
      />

      {/* Modal Hoàn tác giao dịch kèm lý do phản hồi cho Ban cán sự */}
      <ReverseTransactionModal
        isOpen={Boolean(reversingTx)}
        onClose={() => setReversingTx(null)}
        transaction={reversingTx}
        onConfirm={handleConfirmReverse}
        isLoading={isReversing}
      />
    </div>
  );
};
