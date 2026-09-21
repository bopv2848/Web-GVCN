import React, { useState } from 'react';
import type { Student } from '../../../types/student';
import { Button } from '../../../components/common/Button';
import { excelParser } from '../utils/excelParser';

interface DeleteAllStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  students: Student[];
  className?: string;
  onOpenImport?: () => void;
  canDeleteAll?: boolean;
}

export const DeleteAllStudentsModal: React.FC<DeleteAllStudentsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  students,
  className = 'Lớp 6A6',
  onOpenImport,
  canDeleteAll = true,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const normalizedConfirm = confirmText.trim().toUpperCase();
  const isMatch = normalizedConfirm === 'XÓA HẾT' || normalizedConfirm === 'XOA HET';

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await excelParser.exportToExcel(students, `${className}_SaoLuu_TruocKhiXoa`);
      setHasBackedUp(true);
    } catch (err) {
      console.error('Lỗi sao lưu Excel:', err);
      setErrorMsg('Không thể xuất file sao lưu. Thầy vui lòng thử lại!');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDelete = async () => {
    if (!canDeleteAll || !isMatch) return;
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirm();
      onClose();
      // Nếu có callback mở hộp thoại nhập Excel, mở ngay để Thầy nạp danh sách mới
      if (onOpenImport) {
        onOpenImport();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Không thể xóa danh sách học sinh. Vui lòng thử lại!');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-rose-200 my-8 animate-fade-in text-slate-850">
        {!canDeleteAll ? (
          <div className="space-y-4 text-center py-3">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl font-black shadow-inner">
              🔒
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Giới Hạn Quyền Thao Tác
            </h3>
            <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-950 text-left space-y-2">
              <p className="font-black text-amber-900 flex items-center gap-1.5">
                <span>⛔</span>
                <span>Chỉ Giáo viên chủ nhiệm chính thức:</span>
              </p>
              <p className="leading-relaxed">
                Hành động xóa sạch toàn bộ học sinh là thao tác có mức độ rủi ro cao nhất. Hệ thống chỉ cho phép tài khoản giữ vai trò <strong>Giáo viên chủ nhiệm chính thức (Chủ sở hữu lớp)</strong> hoặc <strong>Quản trị viên</strong> thực hiện.
              </p>
              <p className="leading-relaxed text-slate-600">
                Các tài khoản Giáo viên bộ môn hoặc Cán sự lớp không có thẩm quyền truy cập tính năng này.
              </p>
            </div>
            <Button
              type="button"
              onClick={onClose}
              variant="primary"
              size="md"
              className="w-full font-bold text-xs"
            >
              ĐÃ HIỂU VÀ QUAY LẠI
            </Button>
          </div>
        ) : (
          <>
        {/* Header Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-3xl font-black mb-3 shadow-inner">
            🚨
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Xóa Toàn Bộ Danh Sách Học Sinh
          </h3>
          <p className="text-xs text-rose-600 font-bold mt-1 uppercase tracking-wider">
            Thao tác dọn sạch để nạp danh sách học sinh mới
          </p>
        </div>

        {/* Warning Details */}
        <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-2 mb-5">
          <p className="font-bold flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Cảnh báo quan trọng:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed pl-1">
            <li>
              Hành động này sẽ xóa toàn bộ <strong>{students.length} học sinh</strong> hiện có khỏi lớp.
            </li>
            <li>
              Lưới sơ đồ chỗ ngồi sẽ được tự động làm mới về trạng thái bàn trống, không còn lưu vết tên học sinh cũ.
            </li>
            <li>
              Sau khi xóa sạch, sĩ số lớp sẽ về <strong>0</strong> để Thầy nạp tệp Excel danh sách mới hoàn toàn.
            </li>
          </ul>
        </div>

        {/* 1-Click Backup Button */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3 mb-5">
          <div>
            <span className="text-xs font-bold text-blue-950 block">
              {hasBackedUp ? '✓ Đã tải bản sao lưu Excel thành công!' : 'Khuyên dùng: Tải bản sao lưu dự phòng'}
            </span>
            <span className="text-[11px] text-blue-700 block mt-0.5">
              Lưu lại file Excel danh sách hiện tại về máy tính trước khi xóa
            </span>
          </div>
          <Button
            type="button"
            onClick={handleBackup}
            disabled={isBackingUp || students.length === 0}
            variant={hasBackedUp ? 'outline' : 'primary'}
            size="sm"
            className="whitespace-nowrap font-bold text-xs shrink-0"
          >
            {isBackingUp ? 'Đang xuất...' : hasBackedUp ? '✓ Tải lại' : '📥 Sao lưu Excel'}
          </Button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold rounded-xl mb-4">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Confirmation Text Input */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-bold text-slate-700">
            Để xác nhận an toàn, Thầy vui lòng gõ chữ <span className="text-rose-600 font-black">XÓA HẾT</span> vào ô dưới đây:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Gõ XÓA HẾT..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm text-rose-600 placeholder:font-sans placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="md"
            className="flex-1 font-bold text-xs"
            disabled={isDeleting}
          >
            HỦY BỎ
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            variant="danger"
            size="md"
            className="flex-1 font-black text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30"
            disabled={!isMatch || isDeleting}
            isLoading={isDeleting}
          >
            {isDeleting ? 'ĐANG XÓA TOÀN BỘ...' : `XÓA SẠCH ${students.length} HỌC SINH`}
          </Button>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
