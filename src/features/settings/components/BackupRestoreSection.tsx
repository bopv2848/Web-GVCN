import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../components/common/Button';
import {
  backupService,
  type BackupResult,
  type ClassBackupPayload,
  type RestoreResult,
  type SelectiveRestoreOptions,
  type PreRestoreSnapshot,
} from '../services/backupService';
import { backupSnapshotService } from '../services/backupSnapshotService';
import { RestoreConfirmModal } from './RestoreConfirmModal';

interface BackupRestoreSectionProps {
  classId: string;
  className: string;
  schoolName: string;
}

export const BackupRestoreSection: React.FC<BackupRestoreSectionProps> = ({
  classId,
  className,
  schoolName,
}) => {
  // State sao lưu (Export)
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [backupResult, setBackupResult] = useState<BackupResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // State phục hồi (Restore)
  const [isValidatingFile, setIsValidatingFile] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [pendingBackup, setPendingBackup] = useState<ClassBackupPayload | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // State hoàn tác (Snapshot / Undo)
  const [activeSnapshot, setActiveSnapshot] = useState<PreRestoreSnapshot | null>(null);
  const [isUndoing, setIsUndoing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Kiểm tra bản sao lưu snapshot khi nạp component
  useEffect(() => {
    const existingSnapshot = backupSnapshotService.getLatestSnapshot(classId);
    setActiveSnapshot(existingSnapshot);
  }, [classId]);

  // 1. Xử lý xuất sao lưu
  const handleExportBackup = async () => {
    setIsExporting(true);
    setBackupResult(null);
    setExportError(null);
    setRestoreResult(null);

    try {
      const result = await backupService.exportFullClassBackup(classId, className, schoolName);
      setBackupResult(result);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Lỗi xuất bản sao lưu lớp học:', err);
      setExportError(error.message || 'Không thể tạo bản sao lưu. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Kích hoạt chọn tệp khôi phục
  const handleTriggerFileInput = () => {
    setRestoreError(null);
    setRestoreResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // 3. Xử lý thẩm định an toàn file bằng Zod Schema
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsValidatingFile(true);
    setRestoreError(null);

    try {
      const validation = await backupService.validateBackupFile(file);

      if (!validation.valid || !validation.payload) {
        setRestoreError(validation.error || 'Tệp sao lưu không hợp lệ.');
        return;
      }

      setPendingBackup(validation.payload);
      setPendingFileName(file.name);
      setIsConfirmModalOpen(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setRestoreError(error.message || 'Lỗi đọc tệp sao lưu.');
    } finally {
      setIsValidatingFile(false);
    }
  };

  // 4. Xác nhận khôi phục dữ liệu có chọn lọc & tự động chụp snapshot
  const handleConfirmRestore = async (selectedOptions: SelectiveRestoreOptions) => {
    if (!pendingBackup) return;

    setIsRestoring(true);
    setRestoreError(null);

    try {
      // BƯỚC 1: Tự động chụp lại trạng thái hiện tại (Pre-restore Auto-Backup)
      const snapshot = await backupSnapshotService.createPreRestoreSnapshot(classId, className, schoolName);
      setActiveSnapshot(snapshot);

      // BƯỚC 2: Tiến hành phục hồi các phân hệ được chọn
      const result = await backupService.restoreFullClassBackup(classId, pendingBackup, selectedOptions);
      setRestoreResult(result);
      setIsConfirmModalOpen(false);
      setPendingBackup(null);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Lỗi khôi phục dữ liệu:', err);
      setRestoreError(error.message || 'Không thể hoàn tất khôi phục dữ liệu.');
    } finally {
      setIsRestoring(false);
    }
  };

  // 5. Xử lý hoàn tác về trạng thái trước lần nạp (Undo Restore)
  const handleUndoRestore = async () => {
    if (!activeSnapshot) return;
    const confirmUndo = window.confirm(
      `Thầy có chắc chắn muốn hoàn tác về trạng thái lớp lúc ${new Date(activeSnapshot.timestamp).toLocaleTimeString('vi-VN')} ngày ${new Date(activeSnapshot.timestamp).toLocaleDateString('vi-VN')} không?`
    );
    if (!confirmUndo) return;

    setIsUndoing(true);
    setRestoreError(null);

    try {
      const result = await backupSnapshotService.restoreSnapshot(classId);
      setRestoreResult(result);
      // Xóa snapshot sau khi đã hoàn tác thành công
      backupSnapshotService.clearSnapshot(classId);
      setActiveSnapshot(null);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setRestoreError(error.message || 'Lỗi khi hoàn tác dữ liệu.');
    } finally {
      setIsUndoing(false);
    }
  };

  const handleDismissSnapshot = () => {
    backupSnapshotService.clearSnapshot(classId);
    setActiveSnapshot(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Tiêu đề mục */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-xl shadow-2xs">
            💾
          </div>
          <div>
            <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-850">
              Sao Lưu & Phục Hồi Dữ Liệu An Toàn
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Xuất hoặc nạp lại dữ liệu lớp học có chọn lọc, hỗ trợ kiểm định Zod Schema và tự động tạo điểm hoàn tác
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
          🛡️ Tự động chụp dự phòng
        </span>
      </div>

      {/* Thanh cảnh báo & nút hoàn tác (Undo Banner) */}
      {activeSnapshot && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⏪</span>
            <div>
              <span className="font-bold text-amber-900 block">
                Bản sao lưu dự phòng tự động (Snapshot):
              </span>
              <span className="text-[11px] text-amber-800">
                Được chụp lúc {new Date(activeSnapshot.timestamp).toLocaleTimeString('vi-VN')} ngày {new Date(activeSnapshot.timestamp).toLocaleDateString('vi-VN')}. Thầy có thể hoàn tác lại nếu vừa nạp nhầm file.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleUndoRestore}
              disabled={isUndoing}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl text-[11px] shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{isUndoing ? 'Đang hoàn tác...' : '⏪ Hoàn Tác Ngay'}</span>
            </button>
            <button
              type="button"
              onClick={handleDismissSnapshot}
              title="Đóng thông báo này nếu Thầy đã hài lòng với bản mới"
              className="px-2.5 py-1.5 text-slate-400 hover:text-slate-600 font-medium text-[11px] cursor-pointer"
            >
              ✕ Bỏ qua
            </button>
          </div>
        </div>
      )}

      {/* Thông tin 4 phân hệ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <div className="flex items-center gap-2">
            <span className="text-base">👥</span>
            <span className="text-xs font-bold text-slate-700">Học sinh & Tổ</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            47 học sinh, ban cán sự, mã định danh
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <div className="flex items-center gap-2">
            <span className="text-base">🪑</span>
            <span className="text-xs font-bold text-slate-700">Sơ đồ lớp học</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            4 dãy chỗ ngồi, cấu hình đảo tuần
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <span className="text-xs font-bold text-slate-700">Điểm danh</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Phiên sáng/chiều, ghi chú chuyên cần
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <div className="flex items-center gap-2">
            <span className="text-base">⭐</span>
            <span className="text-xs font-bold text-slate-700">Sổ thi đua</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Tiêu chí & lịch sử cộng trừ điểm
          </p>
        </div>
      </div>

      {/* Kết quả tải xuống bản sao lưu */}
      {backupResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-900 font-black">
            <span>🎉</span>
            <span>Đã tạo và tải xuống bản sao lưu thành công!</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-semibold">
            Tệp: <code className="bg-white/80 px-2 py-0.5 rounded border border-emerald-300 font-mono text-slate-800">{backupResult.fileName}</code>
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-emerald-700 font-medium">
            <span>👥 {backupResult.studentCount} học sinh</span>
            <span>•</span>
            <span>📅 {backupResult.sessionCount} buổi điểm danh</span>
            <span>•</span>
            <span>⭐ {backupResult.transactionCount} giao dịch điểm</span>
            <span>•</span>
            <span>📦 {formatFileSize(backupResult.fileSizeBytes)}</span>
          </div>
        </div>
      )}

      {/* Kết quả phục hồi */}
      {restoreResult && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-950 font-black">
              <span>🚀</span>
              <span>ĐÃ PHỤC HỒI DỮ LIỆU THÀNH CÔNG!</span>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer"
            >
              🔄 Tải lại trang
            </button>
          </div>
          <p className="text-[11px] text-blue-800 font-semibold">{restoreResult.message}</p>
        </div>
      )}

      {/* Báo lỗi nếu có */}
      {(exportError || restoreError) && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold space-y-1">
          <p>❌ {exportError || restoreError}</p>
        </div>
      )}

      {/* Nút thao tác chính */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <p className="text-[11px] text-slate-400 font-medium max-w-md">
          💡 Hệ thống luôn tự động tạo bản chụp dự phòng ngầm trước khi nạp tệp mới để Thầy yên tâm dữ liệu không bao giờ bị mất mát.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            onClick={handleTriggerFileInput}
            variant="outline"
            size="md"
            isLoading={isValidatingFile}
            className="w-full sm:w-auto font-bold text-xs px-5 py-2.5 cursor-pointer border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5"
          >
            <span>📥</span>
            <span>{isValidatingFile ? 'Đang đọc tệp...' : 'PHỤC HỒI TỪ FILE JSON'}</span>
          </Button>

          <Button
            type="button"
            onClick={handleExportBackup}
            variant="primary"
            size="md"
            isLoading={isExporting}
            className="w-full sm:w-auto font-black text-xs px-6 py-2.5 shadow-md shadow-primary/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>💾</span>
            <span>{isExporting ? 'Đang gom dữ liệu...' : 'TẢI BẢN SAO LƯU (JSON)'}</span>
          </Button>
        </div>
      </div>

      <RestoreConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmRestore}
        isLoading={isRestoring}
        backupPayload={pendingBackup}
        fileName={pendingFileName}
      />
    </div>
  );
};
