import React, { useState, useEffect, useMemo } from 'react';
import { studentService } from '../../students/services/studentService';
import { attendanceService } from '../services/attendanceService';
import { CLASS_6A6_ID } from '../../students/constants/defaultClass6A6Students';
import type { Student } from '../../../types/student';
import { playPointsChime } from '../../../utils/soundNotification';

export interface QuickAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId?: string;
  className?: string;
  currentPeriod?: number | null;
  sessionName?: string;
  absentStudents?: Array<{ id: string; name: string; reason?: string }>;
  onSuccess?: () => void;
}

const QUICK_REASON_PRESETS = [
  { id: 'y_te', label: '🏥 Đau bụng / mệt (xuống Y tế)', icon: '🏥', reason: 'Đau bụng / mệt (xuống phòng Y tế)' },
  { id: 'don_som', label: '🚗 Phụ huynh đón sớm', icon: '🚗', reason: 'Phụ huynh đến đón về sớm' },
  { id: 'viec_nha', label: '📝 Việc gia đình đột xuất', icon: '📝', reason: 'Việc gia đình đột xuất' },
  { id: 'om_sot', label: '🤒 Sốt nhẹ / nghỉ ốm', icon: '🤒', reason: 'Sốt nhẹ / nghỉ bệnh' },
];

export const QuickAbsenceModal: React.FC<QuickAbsenceModalProps> = ({
  isOpen,
  onClose,
  classId,
  className = 'Lớp 6A6',
  currentPeriod,
  sessionName = 'Sáng',
  absentStudents = [],
  onSuccess,
}) => {
  const targetClassId = classId || CLASS_6A6_ID;

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startPeriod, setStartPeriod] = useState<number>(() => {
    if (currentPeriod && currentPeriod >= 1 && currentPeriod <= 8) return currentPeriod;
    return sessionName === 'Chiều' ? 6 : 1;
  });
  const [selectedReason, setSelectedReason] = useState<string>(QUICK_REASON_PRESETS[0].reason);
  const [customNote, setCustomNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [returningStudentId, setReturningStudentId] = useState<string | null>(null);

  // Nạp danh sách học sinh của lớp
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    studentService.getStudents(targetClassId).then((data) => {
      if (isMounted) {
        setStudents(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen, targetClassId]);

  // Cập nhật lại tiết mặc định khi currentPeriod thay đổi
  useEffect(() => {
    if (currentPeriod && currentPeriod >= 1 && currentPeriod <= 8) {
      setStartPeriod(currentPeriod);
    } else {
      setStartPeriod(sessionName === 'Chiều' ? 6 : 1);
    }
  }, [currentPeriod, sessionName]);

  // Lọc danh sách học sinh theo từ khóa tìm kiếm
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.groupName && s.groupName.toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  // Tập hợp các ID học sinh đang vắng để đánh dấu trên danh sách
  const absentStudentIds = useMemo(() => {
    return new Set(absentStudents.map((s) => s.id));
  }, [absentStudents]);

  if (!isOpen) return null;

  // Thực hiện ghi nhận vắng nhanh
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng chọn một học sinh để ghi nhận!' });
      return;
    }

    const finalReason = customNote.trim() ? customNote.trim() : selectedReason;
    const sessionType = startPeriod > 5 ? 'afternoon' : 'morning';

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const ok = await attendanceService.quickRecordAbsence({
        classId: targetClassId,
        studentId: selectedStudentId,
        startPeriod,
        reason: finalReason,
        sessionType,
      });

      if (ok) {
        playPointsChime();
        const st = students.find((s) => s.id === selectedStudentId);
        setFeedbackMsg({
          type: 'success',
          text: `Đã ghi nhận vắng em ${st?.fullName || ''} từ Tiết ${startPeriod}!`,
        });
        setSelectedStudentId('');
        setCustomNote('');
        if (onSuccess) onSuccess();
      } else {
        setFeedbackMsg({ type: 'error', text: 'Không thể cập nhật điểm danh. Vui lòng thử lại!' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Đã xảy ra lỗi khi ghi nhận điểm danh.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cho học sinh quay trở lại lớp học
  const handleReturnToClass = async (studentId: string, studentName: string) => {
    setReturningStudentId(studentId);
    try {
      const sessionType = startPeriod > 5 ? 'afternoon' : 'morning';
      const ok = await attendanceService.cancelQuickAbsence({
        classId: targetClassId,
        studentId,
        sessionType,
      });

      if (ok) {
        playPointsChime();
        setFeedbackMsg({
          type: 'success',
          text: `Đã khôi phục hiện diện cho em ${studentName}!`,
        });
        if (onSuccess) onSuccess();
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Lỗi khôi phục hiện diện.' });
    } finally {
      setReturningStudentId(null);
    }
  };

  const periodOptions = sessionName === 'Chiều' ? [6, 7, 8] : [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* 1. TIÊU ĐỀ POPUP (HEADER) */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-wide uppercase flex items-center gap-2">
                <span>Ghi Nhận Vắng Nhanh Cho Tiết Này</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  1-Click
                </span>
              </h3>
              <p className="text-xs text-emerald-200/90 font-medium">
                {className} • Buổi {sessionName}{' '}
                {currentPeriod ? `(Tiết ${currentPeriod} hiện tại)` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
            title="Đóng hộp thoại"
          >
            ✕
          </button>
        </div>

        {/* 2. THÔNG BÁO PHẢN HỒI (TOAST / FEEDBACK) */}
        {feedbackMsg && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between border-b ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-slate-700 ml-2 font-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3. NỘI DUNG CHÍNH (FORM + DANH SÁCH VẮNG) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* PHẦN A: FORM GHI NHẬN VẮNG MỚI */}
          <form onSubmit={handleQuickSubmit} className="space-y-4">
            {/* BƯỚC 1: CHỌN HỌC SINH */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>1. Chọn học sinh xin về sớm / vắng:</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {students.length} học sinh
                </span>
              </label>

              {/* Ô tìm kiếm học sinh */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Gõ tên hoặc số thứ tự học sinh..."
                  className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Danh sách học sinh dạng cuộn chọn nhanh */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-2xl border border-slate-200 shadow-inner">
                {filteredStudents.map((st) => {
                  const isSelected = selectedStudentId === st.id;
                  const isAlreadyAbsent = absentStudentIds.has(st.id);

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStudentId(st.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400/50'
                          : isAlreadyAbsent
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                    >
                      <span className="truncate flex-1">{st.fullName}</span>
                      {isAlreadyAbsent && (
                        <span className="text-[9px] px-1 rounded bg-amber-200 text-amber-900 shrink-0">
                          Vắng
                        </span>
                      )}
                      {isSelected && <span className="text-white text-xs shrink-0">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BƯỚC 2: CHỌN TIẾT BẮT ĐẦU VẮNG */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                2. Tiết bắt đầu về sớm:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {periodOptions.map((p) => {
                  const isSelected = startPeriod === p;
                  const isCurrent = currentPeriod === p;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setStartPeriod(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-400/50'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      Tiết {p} {isCurrent ? '(Hiện tại)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BƯỚC 3: CHỌN LÝ DO VẮNG */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                3. Lý do vắng / xin về:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_REASON_PRESETS.map((preset) => {
                  const isSelected = selectedReason === preset.reason;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedReason(preset.reason);
                        setCustomNote('');
                      }}
                      className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                        isSelected && !customNote
                          ? 'bg-teal-50 text-teal-900 border-teal-500 ring-2 ring-teal-400/40 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50/50'
                      }`}
                    >
                      <span className="text-base">{preset.icon}</span>
                      <span className="truncate">{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Nhập lý do tùy chỉnh */}
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Hoặc nhập lý do cụ thể khác (ví dụ: Thi đấu thể thao, việc riêng...)"
                className="w-full mt-2 px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            {/* NÚT XÁC NHẬN GHI NHẬN */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedStudentId}
              className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                isSubmitting || !selectedStudentId
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Đang ghi nhận vào hệ thống...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Ghi Nhận Vắng Ngay</span>
                </>
              )}
            </button>
          </form>

          {/* PHẦN B: DANH SÁCH HỌC SINH ĐANG VẮNG TRONG BUỔI & NÚT QUAY LẠI LỚP */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span>📋 Danh sách học sinh vắng trong buổi ({sessionName}):</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  {absentStudents.length} em
                </span>
              </h4>
            </div>

            {absentStudents.length === 0 ? (
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center text-xs font-bold text-emerald-800">
                🎉 Hiện tại cả 47 học sinh đều đang có mặt đầy đủ trong lớp.
              </div>
            ) : (
              <div className="space-y-2">
                {absentStudents.map((st) => (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-900">{st.name}</p>
                      <p className="text-[11px] text-amber-800 font-medium">
                        Lý do: <span className="font-bold">{st.reason || 'Vắng'}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={returningStudentId === st.id}
                      onClick={() => handleReturnToClass(st.id, st.name)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      title="Học sinh đã quay lại lớp, khôi phục hiện diện"
                    >
                      {returningStudentId === st.id ? (
                        <span>Đang khôi phục...</span>
                      ) : (
                        <>
                          <span>🔄</span>
                          <span>Quay lại lớp</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. CHÂN HỘP THOẠI (FOOTER) */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <a
            href="/attendance"
            className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1"
          >
            <span>Mở trang Điểm danh đầy đủ</span>
            <span>↗</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-black cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
