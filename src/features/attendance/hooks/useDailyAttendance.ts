import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { attendanceService } from '../services/attendanceService';
import { sortVietnameseList } from '../../../utils/vietnameseNameSort';
import type {
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  SessionType,
} from '../../../types/attendance';

export interface UndoGroupAction {
  groupName: string;
  count: number;
  previousRecords: Array<{ id: string; status: AttendanceStatus; note: string | null | undefined }>;
  actionDescription: string;
}

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
  const [undoAction, setUndoAction] = useState<UndoGroupAction | null>(null);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

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

  const handleMarkGroupStatus = async (
    groupName: string,
    status: AttendanceStatus,
    note?: string | null
  ) => {
    if (!session || session.isLocked) return;

    // Chụp lại trạng thái cũ của học sinh trong tổ trước khi thay đổi (để hỗ trợ Hoàn tác 1 chạm)
    const previousRecords = records
      .filter((r) => r.groupName === groupName)
      .map((r) => ({ id: r.id, status: r.status, note: r.note ?? null }));

    setRecords((prev) =>
      prev.map((r) =>
        r.groupName === groupName
          ? {
              ...r,
              status,
              note: note !== undefined ? note : (status === 'present' ? null : r.note),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Kích hoạt thanh thông báo Hoàn tác trong 5 giây
    setUndoAction({
      groupName,
      count: previousRecords.length,
      previousRecords,
      actionDescription: `Đã cập nhật ${previousRecords.length} học sinh ${groupName}`,
    });

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setUndoAction(null);
    }, 5000);

    try {
      await attendanceService.markGroupStatus(session.id, groupName, status, note);
    } catch (err) {
      console.error('Lỗi điểm danh theo tổ:', err);
      const fresh = await attendanceService.getSessionRecords(session.id, classId);
      setRecords(fresh);
    }
  };

  const handleUndoGroupAction = async () => {
    if (!undoAction || !session || session.isLocked) return;

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    const previousRecords = undoAction.previousRecords;
    const map = new Map(previousRecords.map((r) => [r.id, r]));

    // Khôi phục bộ nhớ UI lập tức
    setRecords((prev) =>
      prev.map((r) => {
        const prevRec = map.get(r.id);
        if (prevRec) {
          return {
            ...r,
            status: prevRec.status,
            note: prevRec.note,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    setUndoAction(null);

    try {
      await attendanceService.restoreGroupRecords(session.id, previousRecords);
    } catch (err) {
      console.error('Lỗi khi hoàn tác điểm danh theo tổ:', err);
      const fresh = await attendanceService.getSessionRecords(session.id, classId);
      setRecords(fresh);
    }
  };

  const handleDismissUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoAction(null);
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
    handleMarkGroupStatus,
    undoAction,
    handleUndoGroupAction,
    handleDismissUndo,
    handleToggleLock,
    uniqueGroupsDaily,
    filteredRecordsDaily,
    statsDaily,
  };
};
