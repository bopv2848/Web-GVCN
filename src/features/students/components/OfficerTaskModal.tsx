import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import type { Student } from '../../../types/student';
import { getOfficerTaskGuide } from '../constants/officerTasksGuide';
import { RoleBadge } from './RoleBadge';

interface OfficerTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const OfficerTaskModal: React.FC<OfficerTaskModalProps> = ({ isOpen, onClose, student }) => {
  const [copied, setCopied] = useState(false);

  if (!student) return null;

  const guide = getOfficerTaskGuide(student.classRole, student.fullName);

  const handleCopyZaloMessage = async () => {
    const textToCopy = `📢 LỜI DẶN BAN CÁN SỰ LỚP 6A6 - THCS TÂN HẢI\n` +
      `👤 Học sinh: ${student.fullName} (${student.classRole} - ${student.groupName})\n` +
      `🎯 Trọng tâm tuần này: ${guide.weeklyFocus}\n` +
      `✨ Kim chỉ nam: "${guide.motto}"\n` +
      `📋 Nhiệm vụ chính:\n` +
      guide.coreTasks.map((t, idx) => `  ${idx + 1}. ${t}`).join('\n') +
      `\n💡 Mẹo xử lý: ${guide.handlingTip}\n` +
      `---\nGVCN: Thầy Phan Văn Bộ`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback nếu clipboard API bị chặn
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
          <p className="font-semibold leading-relaxed text-blue-850 pl-5">
            {guide.weeklyFocus}
          </p>
        </div>

        {/* Danh sách nhiệm vụ cụ thể */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Nhiệm Vụ Cốt Lõi Phụ Trách:
          </h4>
          <div className="space-y-2 text-xs">
            {guide.coreTasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70 transition-colors"
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

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopyZaloMessage}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
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
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
