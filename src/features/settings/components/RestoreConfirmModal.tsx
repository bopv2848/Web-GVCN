import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { ClassBackupPayload, SelectiveRestoreOptions } from '../types/backupTypes';

interface RestoreConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: SelectiveRestoreOptions) => Promise<void>;
  isLoading: boolean;
  backupPayload: ClassBackupPayload | null;
  fileName: string;
}

export const RestoreConfirmModal: React.FC<RestoreConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  backupPayload,
  fileName,
}) => {
  const [options, setOptions] = useState<SelectiveRestoreOptions>({
    restoreConfig: true,
    restoreStudents: true,
    restoreSeating: true,
    restoreAttendance: true,
    restorePoints: true,
  });

  // Khởi tạo tùy chọn khi mở modal
  useEffect(() => {
    if (isOpen) {
      setOptions({
        restoreConfig: true,
        restoreStudents: true,
        restoreSeating: true,
        restoreAttendance: true,
        restorePoints: true,
      });
    }
  }, [isOpen]);

  if (!backupPayload) return null;

  const { meta, data } = backupPayload;
  const exportedDate = meta.exportedAt
    ? new Date(meta.exportedAt).toLocaleString('vi-VN')
    : 'Không xác định';

  const studentCount = data.students?.length ?? meta.totalStudents ?? 0;
  const seatCount = data.seating?.assignments?.length ?? 0;
  const sessionCount = data.attendance?.sessions?.length ?? meta.totalAttendanceSessions ?? 0;
  const pointCount = data.points?.transactions?.length ?? meta.totalPointTransactions ?? 0;
  const className = meta.className || (data.classConfig?.name as string) || 'LỚP 6A6';
  const schoolName = meta.schoolName || (data.classConfig?.schoolName as string) || 'TRƯỜNG THCS TÂN HẢI';

  const hasAnySelected = Object.values(options).some(Boolean);

  const toggleAll = (checked: boolean) => {
    setOptions({
      restoreConfig: checked,
      restoreStudents: checked,
      restoreSeating: checked,
      restoreAttendance: checked,
      restorePoints: checked,
    });
  };

  const handleCheckboxChange = (key: keyof SelectiveRestoreOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title="Xác Nhận Khôi Phục Dữ Liệu">
      <div className="space-y-4 text-xs">
        {/* Hộp thông tin tệp sao lưu */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base">📄</span>
            <span className="font-bold text-slate-800 break-all">{fileName}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Thời điểm tạo:</span>
              <span className="font-bold text-slate-800">{exportedDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Phiên bản dữ liệu:</span>
              <span className="font-bold text-slate-800">v{meta.version || '2.0.0'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Lớp & Trường:</span>
              <span className="font-bold text-primary">{className} • {schoolName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Tổng quan:</span>
              <span className="font-bold text-emerald-700">{studentCount} HS • {seatCount} ghế • {sessionCount} buổi</span>
            </div>
          </div>
        </div>

        {/* Tùy chọn phục hồi từng phần (Selective Restore) */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>🎯</span>
              <span>Chọn các phân hệ cần phục hồi:</span>
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => toggleAll(true)}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Chọn tất cả
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => toggleAll(false)}
                className="text-slate-500 hover:underline cursor-pointer"
              >
                Bỏ chọn hết
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-0.5">
            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.restoreConfig}
                  onChange={() => handleCheckboxChange('restoreConfig')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span className="font-semibold text-slate-700">⚙️ Cấu hình & Nhận diện lớp</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Tên lớp, trường, năm học</span>
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.restoreStudents}
                  onChange={() => handleCheckboxChange('restoreStudents')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span className="font-semibold text-slate-700">👥 Danh sách học sinh & Tổ</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                {studentCount} học sinh
              </span>
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.restoreSeating}
                  onChange={() => handleCheckboxChange('restoreSeating')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span className="font-semibold text-slate-700">🪑 Sơ đồ lớp & Xoay chỗ ngồi</span>
              </div>
              <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                {seatCount} vị trí
              </span>
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.restoreAttendance}
                  onChange={() => handleCheckboxChange('restoreAttendance')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span className="font-semibold text-slate-700">📅 Dữ liệu điểm danh chuyên cần</span>
              </div>
              <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                {sessionCount} phiên điểm danh
              </span>
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.restorePoints}
                  onChange={() => handleCheckboxChange('restorePoints')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span className="font-semibold text-slate-700">⭐ Sổ cái điểm & Lịch sử thi đua</span>
              </div>
              <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                {pointCount} giao dịch điểm
              </span>
            </label>
          </div>
        </div>

        {/* Thông báo chế độ an toàn Auto-Backup */}
        <div className="p-3 bg-emerald-50 border border-emerald-300/80 rounded-2xl text-emerald-900 flex items-start gap-2.5">
          <span className="text-base leading-none mt-0.5">🛡️</span>
          <div className="space-y-0.5">
            <span className="font-bold text-[11px] block">Tự động chụp bản sao lưu dự phòng (Pre-restore Auto-Backup):</span>
            <p className="text-[10px] text-emerald-800 leading-normal">
              Trước khi ghi đè, hệ thống sẽ tự động chụp lại trạng thái hiện tại. Thầy có thể bấm nút &quot;Hoàn tác&quot; để khôi phục lại bất cứ lúc nào nếu chọn nhầm file.
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs font-bold"
          >
            Hủy Bỏ
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => onConfirm(options)}
            isLoading={isLoading}
            disabled={!hasAnySelected || isLoading}
            className="text-xs font-black px-5 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Đang Khôi Phục...' : '✅ Bắt Đầu Khôi Phục'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
