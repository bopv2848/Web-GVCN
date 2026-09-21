import React, { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { SeatingZoomControl } from './SeatingZoomControl';
import type { SeatingMedicalAnalysis } from '../../../types/seating';
import { pdfExportService } from '../../reports/services/pdfExportService';

interface SeatingToolbarProps {
  isMedicalMode: boolean;
  medicalAnalysis: SeatingMedicalAnalysis;
  isRotationEnabled: boolean;
  schoolWeekInfo: { weekNumber: number; mode: 'odd' | 'even' };
  schoolYearStartDate: string;
  activeWeekMode: 'odd' | 'even';
  isSavingWeek: boolean;
  canUndo?: boolean;
  undoActionDescription?: string | null;
  hasAssignments?: boolean;
  presetsCount?: number;
  onOpenPresetsModal?: () => void;
  viewMode?: '2d' | '3d';
  onToggleViewMode?: (mode: '2d' | '3d') => void;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onFitScreen?: () => void;
  onResetZoom?: () => void;
  totalRows?: number;
  totalCols?: number;
  onOpenLayoutConfigModal?: () => void;
  onToggleRotation: (enabled: boolean) => void;
  onSelectWeekMode: (mode: 'odd' | 'even') => void;
  onOpenStartDateModal: () => void;
  onOpenClusterModal: () => void;
  onResetLayout: () => void;
  onClearLayout: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isRemoteConnected?: boolean;
  onOpenRemotePairing?: () => void;
  onUndo?: () => void;
  onSaveCurrentWeekAsBase: () => void;
  onOpenPrintModal?: () => void;
}

export const SeatingToolbar: React.FC<SeatingToolbarProps> = ({
  isMedicalMode,
  medicalAnalysis,
  isRotationEnabled,
  schoolWeekInfo,
  schoolYearStartDate,
  activeWeekMode,
  isSavingWeek,
  canUndo = false,
  undoActionDescription,
  hasAssignments = true,
  presetsCount = 0,
  onOpenPresetsModal,
  viewMode = '3d',
  onToggleViewMode,
  onToggleRotation,
  onSelectWeekMode,
  onOpenStartDateModal,
  onOpenClusterModal,
  onResetLayout,
  onClearLayout,
  totalRows,
  totalCols,
  onOpenLayoutConfigModal,
  zoomLevel = 100,
  onZoomChange,
  onFitScreen,
  onResetZoom,
  isFullscreen = false,
  onToggleFullscreen,
  isRemoteConnected = false,
  onOpenRemotePairing,
  onUndo,
  onSaveCurrentWeekAsBase,
  onOpenPrintModal,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    const printEl = document.getElementById('seating-print-layout');
    if (!printEl) {
      alert('Không tìm thấy sơ đồ lớp để xuất PDF');
      return;
    }

    setIsExportingPdf(true);
    try {
      await pdfExportService.exportToPdf(printEl, {
        fileName: `So_Do_Cho_Ngoi_Lop_6A6_${new Date().toISOString().slice(0, 10)}.pdf`,
        orientation: 'landscape',
      });
    } catch (err) {
      console.error('Lỗi xuất PDF sơ đồ lớp:', err);
      alert('Có lỗi xảy ra khi xuất PDF. Thầy có thể dùng nút IN SƠ ĐỒ LỚP A4 và chọn "Lưu dưới dạng PDF" của trình duyệt.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-4 print:hidden">
      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Phòng Học Lớp 6A6
            </h2>
            {isMedicalMode && medicalAnalysis.totalSickInSeats > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Chế độ Giám sát Dịch bệnh</span>
              </span>
            )}
            {isRotationEnabled ? (
              <button
                type="button"
                onClick={onOpenStartDateModal}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Bấm để tùy chỉnh ngày bắt đầu năm học của địa phương"
              >
                <span>🔄 Đảo Tuần Chẵn/Lẻ • Tuần {schoolWeekInfo.weekNumber} ({schoolWeekInfo.mode === 'odd' ? 'Tuần Lẻ' : 'Tuần Chẵn'})</span>
                <span className="text-[10px] opacity-75">⚙️</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenStartDateModal}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Bấm để tùy chỉnh ngày bắt đầu năm học của địa phương"
              >
                <span>📌 Chế độ: Chỗ ngồi Cố định</span>
                <span className="text-[10px] opacity-75">⚙️</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {isRotationEnabled
              ? `Đảo dãy định kỳ theo SO-DO-LOP.xlsx • Tự động tính tuần từ ngày ${schoolYearStartDate} • Kéo thả đổi chỗ • Lưu Supabase`
              : `Chỗ ngồi cố định cho lớp • Ngày bắt đầu: ${schoolYearStartDate} • Kéo - thả chuột để đổi chỗ • Lưu Supabase`}
          </p>
        </div>

        {/* Nút thao tác & 2 Chế độ Sắp Xếp Chỗ Ngồi */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bộ 2 Nút: Cố định vs Đảo Tuần Chẵn/Lẻ */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onToggleRotation(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                !isRotationEnabled
                  ? 'bg-white text-slate-850 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Bình thường: Tắt tính năng tuần chẵn/lẻ cho lớp giữ chỗ ngồi cố định"
            >
              <span>📌</span>
              <span>Cố Định</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleRotation(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                isRotationEnabled
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Mở tính năng: Đảo dãy tuần chẵn / tuần lẻ linh động cho lớp có nhu cầu"
            >
              <span>🔄</span>
              <span>Đảo Tuần Chẵn/Lẻ</span>
            </button>
          </div>

          {/* Nếu mở tính năng Đảo tuần: Hiển thị bộ chọn Tuần Lẻ / Tuần Chẵn */}
          {isRotationEnabled && (
            <div className="inline-flex items-center p-1 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-2xs">
              <button
                type="button"
                onClick={() => onSelectWeekMode('odd')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  activeWeekMode === 'odd'
                    ? 'bg-white text-blue-700 shadow-xs border border-blue-200/80'
                    : 'text-blue-700/70 hover:text-blue-900'
                }`}
              >
                <span>☀️</span>
                <span>Tuần Lẻ</span>
                {schoolWeekInfo.mode === 'odd' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onSelectWeekMode('even')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  activeWeekMode === 'even'
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200/80'
                    : 'text-emerald-700/70 hover:text-emerald-900'
                }`}
              >
                <span>🌤️</span>
                <span>Tuần Chẵn</span>
                {schoolWeekInfo.mode === 'even' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                )}
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onOpenStartDateModal}
            className="text-xs font-bold flex items-center gap-1.5"
            title="Tùy chỉnh ngày khai giảng/tựu trường thực tế của địa phương"
          >
            <span>📅</span>
            <span>Lịch Năm Học</span>
          </Button>

          {medicalAnalysis.clusters.length > 0 && (
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={onOpenClusterModal}
              className="text-xs font-black shadow-md shadow-rose-500/20"
            >
              🚨 XEM {medicalAnalysis.clusters.length} CỤM LÂY NHIỄM
            </Button>
          )}

          {/* Nút Hoàn Tác khi có lịch sử trước đó */}
          {canUndo && onUndo && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onUndo}
              className="text-xs font-black text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 animate-fade-in flex items-center gap-1.5 shadow-xs"
              title={`Hoàn tác: Khôi phục lại sơ đồ trước khi ${undoActionDescription || 'thao tác'}`}
            >
              <span>↩️</span>
              <span>Hoàn Tác</span>
            </Button>
          )}

          {/* Nút Làm Trống Sơ Đồ (Vacate desks) */}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClearLayout}
            disabled={!hasAssignments}
            className={`text-xs font-bold transition-all flex items-center gap-1 ${
              hasAssignments
                ? 'text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                : 'text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
            }`}
            title="Chuyển toàn bộ các ô bàn thành ghế trống (danh sách học sinh vẫn được bảo toàn)"
          >
            <span>🧹</span>
            <span>Làm Trống</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onResetLayout}
            className="text-xs font-bold flex items-center gap-1"
          >
            <span>🔄</span>
            <span>Sắp Xếp 4 Tổ</span>
          </Button>

          {/* Bộ chuyển đổi chế độ xem 3D / 2D */}
          {onToggleViewMode && (
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-black shadow-2xs">
              <button
                type="button"
                onClick={() => onToggleViewMode('3d')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === '3d'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem không gian phòng học 3D chân thật"
              >
                <span>🏛️</span>
                <span>3D Phòng Học</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('2d')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === '2d'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem sơ đồ dạng phẳng 2D truyền thống"
              >
                <span>🗺️</span>
                <span>2D Phẳng</span>
              </button>
            </div>
          )}

          {/* Nút Trình Chiếu Toàn Màn Hình cho Tiết Sinh Hoạt Lớp (Presentation Fullscreen) */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                isFullscreen
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
              }`}
              title="Chế độ Toàn màn hình chuyên dụng cho Tiết Sinh Hoạt Lớp: Tự động ẩn Sidebar/Header và mở rộng sơ đồ chiếm trọn 100% Tivi/Máy chiếu (Phím F)"
            >
              <span className="text-sm">{isFullscreen ? '🗗' : '📺'}</span>
              <span>{isFullscreen ? 'Thu Nhỏ' : 'Trình Chiếu'}</span>
            </button>
          )}

          {/* Nút Kết Nối Điều Khiển Từ Xa Bằng Điện Thoại (Remote Deck) */}
          {onOpenRemotePairing && (
            <button
              type="button"
              onClick={onOpenRemotePairing}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                isRemoteConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
              }`}
              title="Kết nối điện thoại để điều khiển từ xa: Bốc thăm, bấm giờ, cộng điểm thưởng trực tiếp không cần đứng cạnh máy tính"
            >
              <span className="text-sm">📱</span>
              <span>{isRemoteConnected ? 'Đã Kết Nối' : 'Điều Khiển'}</span>
              {isRemoteConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}

          {/* Bộ điều khiển thu phóng tỉ lệ hiển thị sơ đồ chỗ ngồi */}
          {onZoomChange && (
            <SeatingZoomControl
              zoomLevel={zoomLevel}
              onZoomChange={onZoomChange}
              onFitScreen={onFitScreen}
              onResetZoom={onResetZoom}
              variant="toolbar"
            />
          )}

          {onOpenPresetsModal && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onOpenPresetsModal}
              className="text-xs font-bold flex items-center gap-1.5 text-sky-700 bg-sky-50/80 border-sky-200 hover:bg-sky-100 hover:border-sky-300"
              title="Quản lý và chuyển đổi các bản mẫu sơ đồ dự phòng (Ôn thi, học nhóm...)"
            >
              <span>📑</span>
              <span>Bản Mẫu</span>
              {presetsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-sky-600 text-white text-[10px] font-black">
                  {presetsCount}
                </span>
              )}
            </Button>
          )}

          {onOpenLayoutConfigModal && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onOpenLayoutConfigModal}
              className="text-xs font-bold flex items-center gap-1.5 text-amber-900 bg-amber-50/80 border-amber-300 hover:bg-amber-100 hover:border-amber-400 shadow-2xs"
              title="Tùy chỉnh số dãy bàn (3 hoặc 4 dãy) và số bàn mỗi dãy (4-7 bàn)"
            >
              <span>🏛️</span>
              <span>Cấu Hình Bàn Ghế</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-200/80 text-amber-950 text-[10px] font-black">
                {totalCols ? totalCols / 2 : 4} Dãy • {totalRows || 6} Bàn
              </span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onOpenPrintModal || handleExportPdf}
            isLoading={isExportingPdf}
            className="text-xs font-black border-slate-300 text-slate-800 hover:bg-slate-100 shadow-2xs"
            title="Tùy chỉnh tiêu đề văn bản hành chính & Tải trực tiếp file PDF A4 khổ ngang sắc nét"
          >
            <span>📥</span>
            <span>XUẤT PDF A4</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onOpenPrintModal || (() => window.print())}
            className="text-xs font-black shadow-md shadow-primary/20"
            title="Tùy chỉnh tiêu đề văn bản hành chính & In sơ đồ lớp A4"
          >
            🖨️ IN SƠ ĐỒ LỚP A4
          </Button>
        </div>
      </div>

      {/* Banner thông báo khi đang xem trước Tuần Chẵn */}
      {isRotationEnabled && activeWeekMode === 'even' && (
        <div className="bg-emerald-50/90 border border-emerald-200 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌤️</span>
            <div>
              <p className="font-black text-emerald-900">
                Đang xem trước Sơ đồ đảo dãy Tuần Chẵn (Tổ 3 ↔ Tổ 4 | Tổ 1 ↔ Tổ 2)
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Sơ đồ đã xoay chuẩn theo file SO-DO-LOP.xlsx của nhà trường. Thầy có thể in ngay hoặc bấm lưu để cố định làm sơ đồ chính thức.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onSaveCurrentWeekAsBase}
            disabled={isSavingWeek}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-sm cursor-pointer"
          >
            {isSavingWeek ? 'Đang lưu Supabase...' : '💾 Lưu Sơ Đồ Này Lên Supabase'}
          </Button>
        </div>
      )}
    </div>
  );
};
