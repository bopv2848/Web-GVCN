import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { attendanceService } from '../services/attendanceService';
import { sortVietnameseList } from '../../../utils/vietnameseNameSort';
import type {
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  SessionType,
} from '../../../types/attendance';

export const useDailyAttendance = (classId: string, todayStr: string) => {
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedType, setSelectedType] = useState<SessionType>('morning');
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingDaily, setIsLoadingDaily] = useState<boolean>(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const [searchQueryDaily, setSearchQueryDaily] = useState<string>('');
  const [selectedGroupDaily, setSelectedGroupDaily] = useState<string>('all');
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [editingNoteRecord, setEditingNoteRecord] = useState<AttendanceRecord | null>(null);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Tải phiên điểm danh ngày
  const loadDailySession = useCallback(async () => {
    setIsLoadingDaily(true);
    try {
      const sess = await attendanceService.getOrCreateSession(classId, selectedDate, selectedType);
      setSession(sess);

      const recs = await attendanceService.getSessionRecords(sess.id, classId);
      setRecords(recs);
    } catch (err) {
      console.error('Lỗi nạp phiên điểm danh ngày:', err);
    } finally {
      setIsLoadingDaily(false);
    }
  }, [classId, selectedDate, selectedType]);

  useEffect(() => {
    loadDailySession();
  }, [loadDailySession]);

  // 2. Kích hoạt Realtime WebSockets cho phiên ngày
  useEffect(() => {
    if (!session?.id) return;

    setIsRealtimeActive(true);

    const unsubscribe = attendanceService.subscribeToAttendance(session.id, (payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        const updatedRow = payload.new;

        setRecords((prev) =>
          prev.map((r) =>
            r.id === updatedRow.id
              ? {
                  ...r,
                  status: updatedRow.status as AttendanceStatus,
                  note: updatedRow.note,
                  updatedAt: updatedRow.updated_at,
                }
              : r
          )
        );

        setRecentlyUpdatedId(updatedRow.id);
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => {
          setRecentlyUpdatedId(null);
        }, 2500);
      } else if (payload.eventType === 'INSERT') {
        attendanceService.getSessionRecords(session.id, classId).then(setRecords);
      }
    });

    return () => {
      setIsRealtimeActive(false);
      unsubscribe();
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, [session?.id, classId]);

  // 3. Handlers điểm danh hàng ngày
  const handleStatusChange = async (recordId: string, newStatus: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
    );

    try {
      await attendanceService.updateRecordStatus(recordId, newStatus);
    } catch (err) {
      console.error('Lỗi cập nhật điểm danh:', err);
      if (session) {
        const fresh = await attendanceService.getSessionRecords(session.id, classId);
        setRecords(fresh);
      }
    }
  };

  const handleSaveNote = async (note: string | null) => {
    if (!editingNoteRecord) return;
    const recordId = editingNoteRecord.id;

    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, note } : r))
    );

    try {
      await attendanceService.updateRecordNote(recordId, note);
    } catch (err) {
      console.error('Lỗi lưu ghi chú chuyên cần:', err);
      if (session) {
        const fresh = await attendanceService.getSessionRecords(session.id, classId);
        setRecords(fresh);
      }
    }
  };

  const handleMarkAllPresent = async () => {
    if (!session) return;
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'present' })));
    try {
      await attendanceService.markAllPresent(session.id);
    } catch (err) {
      console.error('Lỗi điểm danh tất cả:', err);
    }
  };

  const handleToggleLock = async () => {
    if (!session) return;
    const newLockState = !session.isLocked;
    setSession({ ...session, isLocked: newLockState });
    try {
      await attendanceService.toggleLockSession(session.id, newLockState);
    } catch (err) {
      console.error('Lỗi đổi trạng thái khóa:', err);
      setSession({ ...session, isLocked: !newLockState });
    }
  };

  // 4. Memos lọc dữ liệu & tính toán KPI thống kê
  const uniqueGroupsDaily = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.groupName) set.add(r.groupName);
    });
    return Array.from(set).sort();
  }, [records]);

  const filteredRecordsDaily = useMemo(() => {
    const list = records.filter((r) => {
      const matchSearch = r.studentName.toLowerCase().includes(searchQueryDaily.toLowerCase().trim());
      const matchGroup = selectedGroupDaily === 'all' || r.groupName === selectedGroupDaily;
      return matchSearch && matchGroup;
    });
    return sortVietnameseList(list, (r) => r.studentName);
  }, [records, searchQueryDaily, selectedGroupDaily]);

  const statsDaily = useMemo(() => {
    const total = records.length;
    if (total === 0) {
      return { total: 0, presentCount: 0, lateCount: 0, excusedCount: 0, unexcusedCount: 0, rate: 100 };
    }
    const presentCount = records.filter((r) => r.status === 'present').length;
    const lateCount = records.filter((r) => r.status === 'late').length;
    const excusedCount = records.filter((r) => r.status === 'excused_absence').length;
    const unexcusedCount = records.filter((r) => r.status === 'unexcused_absence').length;
    const rate = Math.round(((presentCount + lateCount) / total) * 100);

    return { total, presentCount, lateCount, excusedCount, unexcusedCount, rate };
  }, [records]);

  return {
    selectedDate,
    setSelectedDate,
    selectedType,
    setSelectedType,
    session,
    records,
    isLoadingDaily,
    isRealtimeActive,
    searchQueryDaily,
    setSearchQueryDaily,
    selectedGroupDaily,
    setSelectedGroupDaily,
    recentlyUpdatedId,
    editingNoteRecord,
    setEditingNoteRecord,
    handleStatusChange,
    handleSaveNote,
    handleMarkAllPresent,
    handleToggleLock,
    uniqueGroupsDaily,
    filteredRecordsDaily,
    statsDaily,
  };
};
