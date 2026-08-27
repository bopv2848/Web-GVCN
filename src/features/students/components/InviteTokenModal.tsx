import React, { useState } from 'react';
import type { Student } from '../../../types/student';
import { Button } from '../../../components/common/Button';

interface InviteTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const InviteTokenModal: React.FC<InviteTokenModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const token = student.guardianToken || 'a1b2c3d4e5f67890123456789abcdef0';
  const inviteUrl = `${window.location.origin}/invite/${token}`;
  const sampleMessage = `Kính gửi Phụ huynh em ${student.fullName} (${student.groupName}),\nThầy/Cô GVCN xin gửi đường link liên kết Sổ theo dõi nề nếp và học tập điện tử của con:\n👉 ${inviteUrl}\n(Mã liên kết có thời hạn 7 ngày).`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(sampleMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-primary mx-auto flex items-center justify-center text-3xl font-black mb-3 shadow-inner">
          👨‍👩‍👦
        </div>

        <h3 className="text-xl font-black text-slate-850 mb-1">
          Mã Mời Phụ Huynh Học Sinh
        </h3>
        <p className="text-xs text-slate-500 font-semibold mb-5">
          Em: <strong className="text-primary font-black">{student.fullName}</strong> ({student.groupName})
        </p>

        {/* Token Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 mb-5">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Đường link liên kết bảo mật (7 ngày):
            </span>
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="w-full px-3 py-2 text-xs font-mono text-slate-800 bg-white rounded-xl border border-slate-300 select-all"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Mẫu tin nhắn gửi Zalo / SMS cho Phụ huynh:
            </span>
            <textarea
              readOnly
              rows={3}
              value={sampleMessage}
              className="w-full p-2.5 text-xs text-slate-700 bg-white rounded-xl border border-slate-300 resize-none select-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleCopyLink}
            variant="outline"
            size="md"
            className="flex-1 text-xs font-bold"
          >
            {copied ? '✓ ĐÃ COPY LINK' : '🔗 COPY LINK'}
          </Button>
          <Button
            type="button"
            onClick={handleCopyMessage}
            variant="primary"
            size="md"
            className="flex-1 text-xs font-black"
          >
            {copied ? '✓ ĐÃ COPY' : '📱 COPY TIN NHẮN'}
          </Button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
