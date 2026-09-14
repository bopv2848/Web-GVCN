import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import type { Student } from '../../../types/student';
import { getOfficerTaskGuide } from '../constants/officerTasksGuide';
import { RoleBadge } from './RoleBadge';

interface OfficerTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const QUICK_SUGGESTIONS = [
  'Mang theo sổ ghi chép nề nếp',
  'Đôn đốc tổ trực nhật lúc 7h10',
  'Kiểm tra vở bài tập Toán & Văn',
  'Báo cáo Thầy cuối buổi học',
];

export const OfficerTaskModal: React.FC<OfficerTaskModalProps> = ({ isOpen, onClose, student }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [editedMessage, setEditedMessage] = useState('');
  const [hasCustomEdits, setHasCustomEdits] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (student && isOpen) {
      setIsEditing(false);
      setCustomNote('');
      setEditedMessage('');
      setHasCustomEdits(false);
      setCopied(false);
    }
  }, [student, isOpen]);

  if (!student) return null;

  const guide = getOfficerTaskGuide(student.classRole, student.fullName);

  const generateBaseMessage = (note: string) => {
    return (
      `📢 LỜI DẶN BAN CÁN SỰ LỚP 6A6 - THCS TÂN HẢI\n` +
      `👤 Học sinh: ${student.fullName} (${student.classRole} - ${student.groupName})\n` +
      `🎯 Trọng tâm tuần này: ${guide.weeklyFocus}\n` +
      `✨ Kim chỉ nam: "${guide.motto}"\n` +
      `📋 Nhiệm vụ chính:\n` +
      guide.coreTasks.map((t, idx) => `  ${idx + 1}. ${t}`).join('\n') +
      `\n💡 Mẹo xử lý: ${guide.handlingTip}\n` +
      (note.trim() ? `\n📌 Lời dặn riêng của Thầy: ${note.trim()}\n` : '') +
      `---\nGVCN: Thầy Phan Văn Bộ`
    );
  };

  const currentMessage = hasCustomEdits ? editedMessage : generateBaseMessage(customNote);

  const handleToggleEdit = () => {
    if (!isEditing) {
      setEditedMessage(currentMessage);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleResetToDefault = () => {
    setCustomNote('');
    setHasCustomEdits(false);
    setEditedMessage(generateBaseMessage(''));
  };

  const handleAddSuggestion = (text: string) => {
    if (!customNote.trim()) {
      setCustomNote(text);
    } else if (!customNote.includes(text)) {
      setCustomNote(`${customNote}; ${text}`);
    }
    setHasCustomEdits(false);
  };

  const handleCopyZaloMessage = async () => {
    try {
      await navigator.clipboard.writeText(currentMessage);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert('Đã tạo nội dung lời dặn!');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sổ Tay Tự Quản & Phân Công Nhiệm Vụ 6A6" size="lg">
      <div className="space-y-4 text-slate-800">
        {/* Header Ban cán sự */}
        <div className="flex items-start justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900">{student.fullName}</h3>
              <RoleBadge role={student.classRole} />
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              {student.groupName} • Sĩ số lớp: 47 học sinh • GVCN: Thầy Phan Văn Bộ
            </p>
          </div>
          <div className="text-2xl bg-white p-2.5 rounded-2xl shadow-xs border border-slate-200">
            {guide.icon}
          </div>
        </div>

        {isEditing ? (
          /* Chế độ soạn thảo toàn văn */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>✏️</span>
                <span>Soạn thảo nội dung gửi Zalo:</span>
              </span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-slate-500 hover:text-amber-800 text-xs font-semibold cursor-pointer transition-colors"
                title="Khôi phục lại nội dung ban đầu theo mẫu cẩm nang"
              >
                🔄 Khôi phục mẫu gốc
              </button>
            </div>

            <textarea
              aria-label="Nội dung lời dặn gửi Zalo"
              value={editedMessage}
              onChange={(e) => {
                setEditedMessage(e.target.value);
                setHasCustomEdits(true);
              }}
              rows={11}
              className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs text-slate-850 font-mono leading-relaxed bg-slate-50/60 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              placeholder="Nội dung lời dặn..."
            />
            <p className="text-[11px] text-slate-400 italic">
              💡 Thầy có thể thêm bớt câu chữ hoặc ghi chú riêng trước khi bấm sao chép gửi Zalo.
            </p>
          </div>
        ) : (
          /* Chế độ xem cẩm nang + ghi chú riêng */
          <div className="space-y-3.5">
            {/* Khẩu hiệu kim chỉ nam */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <span className="text-base shrink-0">✨</span>
              <div>
                <span className="font-extrabold block text-amber-950 uppercase tracking-wide text-[11px] mb-0.5">
                  Kim Chỉ Nam Tự Quản:
                </span>
                <p className="italic leading-relaxed">{guide.motto}</p>
              </div>
            </div>

            {/* Trọng tâm tuần này */}
            <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-2xl text-xs text-blue-900">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-[11px] text-blue-950 mb-1">
                <span>🎯</span>
                <span>Trọng tâm tuần này:</span>
              </div>
              <p className="font-semibold leading-relaxed text-blue-900 pl-5">
                {guide.weeklyFocus}
              </p>
            </div>

            {/* Danh sách nhiệm vụ cụ thể */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Nhiệm Vụ Cốt Lõi Phụ Trách:
              </h4>
              <div className="space-y-1.5 text-xs">
                {guide.coreTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed text-slate-700 font-medium">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mẹo xử lý sư phạm 7 bước */}
            <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
              <span className="text-base shrink-0">💡</span>
              <div>
                <span className="font-extrabold block text-emerald-900 uppercase text-[10.5px] mb-0.5">
                  Kỹ năng ứng xử khi bạn chưa hợp tác:
                </span>
                <p className="text-slate-700 leading-relaxed">{guide.handlingTip}</p>
              </div>
            </div>

            {/* Ghi chú cá nhân bổ sung của Thầy */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="custom-note-input"
                  className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                >
                  <span>📝</span>
                  <span>Lời dặn bổ sung của Thầy (nếu có):</span>
                </label>
                {customNote && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomNote('');
                      setHasCustomEdits(false);
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold cursor-pointer transition-colors"
                  >
                    Xóa ghi chú
                  </button>
                )}
              </div>
              <input
                id="custom-note-input"
                type="text"
                value={customNote}
                onChange={(e) => {
                  setCustomNote(e.target.value);
                  setHasCustomEdits(false);
                }}
                placeholder="Ví dụ: Dặn riêng em mang theo sổ ghi chép, kiểm tra trực nhật lúc 7h10..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-850 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400 font-semibold">Gợi ý nhanh:</span>
                {QUICK_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSuggestion(sug)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nút hành động cố định ở đáy, tối ưu ngón tay cái */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5 pt-3 pb-1 border-t border-slate-100 z-10">
          <button
            type="button"
            onClick={handleToggleEdit}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] sm:min-h-0 ${
              isEditing
                ? 'bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>{isEditing ? '👁️ Xem cẩm nang' : '✏️ Chỉnh sửa nội dung'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyZaloMessage}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[44px] sm:min-h-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <span>{copied ? '✓ Đã sao chép' : '📋 Sao chép lời dặn gửi Zalo'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer min-h-[44px] sm:min-h-0"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
