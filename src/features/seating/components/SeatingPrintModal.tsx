import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { SeatingPrintCustomHeader } from '../hooks/useSeatingPrintConfig';
import { getStudentPrintFontSize, splitStudentName } from '../utils/seatingPrintNameUtils';
import type { ClassroomElementsConfig } from '../../../types/seating';
import { ClassroomDoorArrowSVG } from './ClassroomDoor2D';

interface SeatingPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerConfig: SeatingPrintCustomHeader;
  onUpdateHeaderConfig: (partial: Partial<SeatingPrintCustomHeader>) => void;
  onResetHeaderConfig: () => void;
  logoUrl?: string;
  onExportPdf: () => Promise<void>;
  isExportingPdf: boolean;
  totalStudents?: number;
  femaleStudents?: number;
  elementsConfig?: ClassroomElementsConfig;
}

export const SeatingPrintModal: React.FC<SeatingPrintModalProps> = ({
  isOpen,
  onClose,
  headerConfig,
  onUpdateHeaderConfig,
  onResetHeaderConfig,
  logoUrl,
  onExportPdf,
  isExportingPdf,
  totalStudents,
  femaleStudents,
  elementsConfig,
}) => {
  const doorPos = elementsConfig?.doorPosition || 'right';
  const doorAngle = elementsConfig?.doorAngle ?? 180;
  const isPointingLeft = doorAngle >= 90 && doorAngle < 270;
  const teacherDeskPos = elementsConfig?.teacherDeskPosition || 'right';

  const handlePrint = () => {
    // Đóng modal để nhường toàn bộ khung nhìn cho trang in A4 sơ đồ, sau đó mở hộp thoại in
    onClose();
    const originalTitle = document.title;
    // Tạm xóa tiêu đề trang để trình duyệt không chèn header mặc định lên đầu trang in
    document.title = '';
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }, 150);
  };

  const defaultClassSizeText = `(Sĩ số: ${totalStudents ?? 0}/Nữ: ${femaleStudents ?? 0})`;
  const rawCustom = headerConfig.classSizeText?.trim();
  const previewClassSize = rawCustom
    ? (rawCustom.startsWith('(') ? rawCustom : `(${rawCustom})`)
    : defaultClassSizeText;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tùy Chỉnh Tiêu Đề Văn Bản Hành Chính & In Sơ Đồ A4"
      size="2xl"
      hideOnPrint={true}
    >
      <div className="space-y-5">
        {/* Hướng dẫn nhanh */}
        <div className="bg-blue-50/80 border border-blue-200 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
          <span className="text-xl shrink-0">🏛️</span>
          <div>
            <p className="font-black text-blue-950">
              Tùy biến trực tiếp tiêu đề hành chính trước khi Xuất PDF hoặc In A4
            </p>
            <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
              Thầy có thể sửa nhanh tên trường, tên GVCN, năm học và ngày lập sơ đồ. Thông tin sẽ tự động lưu nhớ cho các lần in sau mà không làm thay đổi cấu hình cơ sở dữ liệu.
            </p>
          </div>
        </div>

        {/* Form nhập liệu thông tin hành chính */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>✍️</span>
              <span>Thông Tin Văn Bản Hành Chính</span>
            </span>
            <button
              type="button"
              onClick={onResetHeaderConfig}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
              title="Khôi phục lại tên trường, lớp, giáo viên mặc định của hệ thống"
            >
              <span>↺</span>
              <span>Đặt lại mặc định</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Tên trường */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tên Trường / Cơ quan:
              </label>
              <input
                type="text"
                value={headerConfig.schoolName}
                onChange={(e) => onUpdateHeaderConfig({ schoolName: e.target.value })}
                placeholder="Ví dụ: TRƯỜNG THCS TÂN HẢI - NĂM HỌC 2025-2026"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-slate-900 bg-white"
              />
            </div>

            {/* Tên lớp */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tên Lớp:
              </label>
              <input
                type="text"
                value={headerConfig.className}
                onChange={(e) => onUpdateHeaderConfig({ className: e.target.value })}
                placeholder="Ví dụ: LỚP 6A6"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-slate-900 bg-white"
              />
            </div>

            {/* Giáo viên chủ nhiệm */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Giáo viên chủ nhiệm:
              </label>
              <input
                type="text"
                value={headerConfig.teacherName}
                onChange={(e) => onUpdateHeaderConfig({ teacherName: e.target.value })}
                placeholder="Ví dụ: Thầy Phan Văn Bộ"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-slate-900 bg-white"
              />
            </div>

            {/* Năm học */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Năm học:
              </label>
              <input
                type="text"
                value={headerConfig.academicYear}
                onChange={(e) => onUpdateHeaderConfig({ academicYear: e.target.value })}
                placeholder="Ví dụ: 2026 - 2027"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-slate-900 bg-white"
              />
            </div>

            {/* Tiêu đề bản in */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tiêu đề sơ đồ:
              </label>
              <input
                type="text"
                value={headerConfig.title}
                onChange={(e) => onUpdateHeaderConfig({ title: e.target.value })}
                placeholder="Ví dụ: SƠ ĐỒ CHỖ NGỒI HỌC SINH"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-slate-900 bg-white"
              />
            </div>

            {/* Ngày lập sơ đồ */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ngày lập / Ngày in:
              </label>
              <input
                type="text"
                value={headerConfig.appliedDate}
                onChange={(e) => onUpdateHeaderConfig({ appliedDate: e.target.value })}
                placeholder="Ví dụ: 18/09/2026 hoặc Ngày 18 tháng 9 năm 2026"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-slate-900 bg-white"
              />
            </div>

            {/* Ghi chú / Chế độ */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Chế độ / Ghi chú ban hành:
              </label>
              <input
                type="text"
                value={headerConfig.modeNote}
                onChange={(e) => onUpdateHeaderConfig({ modeNote: e.target.value })}
                placeholder="Ví dụ: Chế độ: Chỗ ngồi cố định hoặc Áp dụng Học kỳ I..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-slate-900 bg-white"
              />
            </div>

            {/* Tùy chọn In Sĩ số lớp cạnh tên phòng học */}
            <div className="md:col-span-2 pt-2 border-t border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      aria-label="In kèm Sĩ số lớp"
                      checked={headerConfig.showClassSize !== false}
                      onChange={(e) => onUpdateHeaderConfig({ showClassSize: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary" />
                  </label>
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>👥</span>
                      <span>In kèm Sĩ số lớp cạnh tên phòng học</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Mặc định: <strong className="text-slate-700">{defaultClassSizeText}</strong> (Tự động cập nhật theo danh sách lớp)
                    </p>
                  </div>
                </div>

                {headerConfig.showClassSize !== false && (
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <span className="text-[11px] font-bold text-slate-600 shrink-0">Nội dung tùy chỉnh:</span>
                    <input
                      type="text"
                      value={headerConfig.classSizeText ?? ''}
                      onChange={(e) => onUpdateHeaderConfig({ classSizeText: e.target.value })}
                      placeholder={defaultClassSizeText}
                      className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-slate-900 bg-white w-full sm:w-56"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tùy chọn In Mũi tên Cửa Ra Vào trên bản in A4 / PDF */}
            <div className="md:col-span-2 pt-2 border-t border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      aria-label="In kèm Mũi tên Cửa Ra Vào"
                      checked={headerConfig.showDoorArrow !== false}
                      onChange={(e) => onUpdateHeaderConfig({ showDoorArrow: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary" />
                  </label>
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🚪</span>
                      <span>In kèm Mũi tên Cửa Ra Vào ({doorPos === 'left' ? 'Hành lang Trái' : 'Hành lang Phải'})</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Hiển thị dấu mũi tên &quot;Cửa ra vào&quot; trên sơ đồ A4/PDF để BGH và giáo viên nắm rõ hướng vào lớp
                    </p>
                  </div>
                </div>

                {headerConfig.showDoorArrow !== false && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span>Vị trí:</span>
                      <strong className="text-blue-700">{doorPos === 'left' ? 'Bên Trái' : 'Bên Phải'}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>Mũi tên:</span>
                      <strong className="text-emerald-700">{isPointingLeft ? 'Chỉ sang Trái ⇦' : 'Chỉ sang Phải ⇨'}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bộ chuyển đổi chế độ in: Màu rực rỡ vs Đen trắng tương phản cao */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🎨</span>
              <span>Chế Độ Màu Bản In (Tối ưu theo máy in):</span>
            </span>
            <span className="text-[10.5px] font-semibold text-slate-500 normal-case">
              {headerConfig.colorMode === 'monochrome' ? 'Đang chọn: Laser Đen Trắng' : 'Đang chọn: Phun Màu'}
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
            {/* Lựa chọn 1: In Màu rực rỡ */}
            <button
              type="button"
              onClick={() => onUpdateHeaderConfig({ colorMode: 'color' })}
              className={`p-3 rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                headerConfig.colorMode !== 'monochrome'
                  ? 'bg-white text-slate-900 border-2 border-blue-500 shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200/60 border-2 border-transparent'
              }`}
            >
              <span className="text-2xl shrink-0">🌈</span>
              <div className="space-y-0.5">
                <div className="font-black text-xs flex items-center gap-1.5">
                  <span>In Màu Rực Rỡ</span>
                  {headerConfig.colorMode !== 'monochrome' && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-slate-500 leading-snug">
                  Dành cho máy in màu <strong>Epson / HP Ink Tank</strong>: phân tổ xanh - lục - cam - hồng, huy hiệu ban cán sự đa sắc rực rỡ.
                </p>
              </div>
            </button>

            {/* Lựa chọn 2: In Đen Trắng siêu tương phản */}
            <button
              type="button"
              onClick={() => onUpdateHeaderConfig({ colorMode: 'monochrome' })}
              className={`p-3 rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                headerConfig.colorMode === 'monochrome'
                  ? 'bg-slate-950 text-white border-2 border-slate-950 shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200/60 border-2 border-transparent'
              }`}
            >
              <span className="text-2xl shrink-0">🖨️</span>
              <div className="space-y-0.5">
                <div className="font-black text-xs flex items-center gap-1.5">
                  <span>In Đen Trắng Nét Đậm</span>
                  {headerConfig.colorMode === 'monochrome' && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                      Đang bật
                    </span>
                  )}
                </div>
                <p className={`text-[10.5px] leading-snug ${
                  headerConfig.colorMode === 'monochrome' ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  Dành cho máy in laser <strong>Canon LBP2900 / LaserJet</strong>: nền trắng tinh khiết, viền đen nét đậm đôi, không lem xám bẩn giấy.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Tùy chỉnh Phông chữ & Kiểu hiển thị tên học sinh */}
        <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>🖋️</span>
            <span>Cỡ Chữ & Kiểu Hiển Thị Tên Học Sinh (Times New Roman)</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Chọn Cỡ chữ in: 12pt, 13pt, 14pt */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Cỡ chữ tên học sinh:
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                {([12, 13, 14] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onUpdateHeaderConfig({ fontSize: sz })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      (headerConfig.fontSize || 14) === sz
                        ? 'bg-white text-primary shadow-xs ring-1 ring-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{sz}pt</span>
                    <span className="text-[9px] font-semibold opacity-70">
                      {sz === 14 ? 'Chuẩn rõ' : sz === 13 ? 'Vừa vặn' : 'Lớp đông'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Chọn Định dạng Viết hoa / Thường */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Kiểu chữ họ tên:
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => onUpdateHeaderConfig({ nameCase: 'default' })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    (headerConfig.nameCase || 'default') === 'default'
                      ? 'bg-white text-primary shadow-xs ring-1 ring-slate-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Chữ Thường</span>
                  <span className="text-[9px] font-semibold opacity-70">Nguyễn Văn An</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateHeaderConfig({ nameCase: 'uppercase' })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    headerConfig.nameCase === 'uppercase'
                      ? 'bg-white text-primary shadow-xs ring-1 ring-slate-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>VIẾT HOA</span>
                  <span className="text-[9px] font-semibold opacity-70">NGUYỄN VĂN AN</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Tùy chọn Tự động co nhỏ 1 cỡ cho tên dài quá 4 từ */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <span className="text-base shrink-0 mt-0.5">📐</span>
              <div>
                <p className="text-xs font-bold text-slate-850">
                  Tự động co nhỏ 1 cỡ (Auto Font-Fit) nếu tên dài hơn 4 từ
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Học sinh có tên dài (5-6 từ) sẽ tự động giảm từ {(headerConfig.fontSize || 14)}pt xuống {(headerConfig.fontSize || 14) - 1}pt để giữ ô bàn học luôn cân đối, không chiếm quá 2 dòng.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                aria-label="Tự động co nhỏ 1 cỡ cho tên dài"
                checked={headerConfig.autoFitLongNames !== false}
                onChange={(e) => onUpdateHeaderConfig({ autoFitLongNames: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>

        {/* Khung Xem Trước Trực Quan Tiêu Đề (Live Preview) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>👁️</span>
              <span>Xem trước bản in A4:</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              headerConfig.colorMode === 'monochrome'
                ? 'bg-slate-900 text-white'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {headerConfig.colorMode === 'monochrome' ? 'Chế độ Laser Đen Trắng' : 'Chế độ In Màu Rực Rỡ'} • {headerConfig.fontSize || 14}pt
            </span>
          </span>
          <div
            style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
            className={`px-4 pb-4 pt-5.5 bg-white rounded-2xl shadow-xs text-slate-900 font-serif ${
              headerConfig.colorMode === 'monochrome' ? 'border-2 border-slate-900' : 'border-2 border-slate-300'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b-2 ${
              headerConfig.colorMode === 'monochrome' ? 'border-slate-900' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl || '/logo-truong-thcs-Tan-Hai.jpg'}
                  alt="Logo Trường"
                  className={`w-12 h-12 object-contain rounded-full border shrink-0 ${
                    headerConfig.colorMode === 'monochrome'
                      ? 'border-slate-800 grayscale contrast-125'
                      : 'border-slate-300'
                  }`}
                />
                <div>
                  <h1 className="text-xs font-black uppercase text-slate-900 tracking-wider leading-tight">
                    {headerConfig.schoolName || 'TRƯỜNG THCS TÂN HẢI'}
                  </h1>
                  <p className={`text-sm font-black uppercase tracking-wide leading-tight mt-0.5 ${
                    headerConfig.colorMode === 'monochrome' ? 'text-black' : 'text-blue-900'
                  }`}>
                    {headerConfig.className || 'LỚP 6A6'}
                  </p>
                </div>
              </div>

              {/* Khối ở giữa: Icon và Phòng học lớp canh giữa kèm Sĩ số */}
              <div className="text-center px-2">
                <div className={`font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                  headerConfig.colorMode === 'monochrome' ? 'text-black' : 'text-slate-850'
                }`}>
                  <span>🗺️ PHÒNG HỌC {headerConfig.className || 'LỚP 6A6'}</span>
                  {headerConfig.showClassSize !== false && (
                    <span className={`font-bold normal-case text-[11px] md:text-xs ${
                      headerConfig.colorMode === 'monochrome' ? 'text-black font-bold' : 'text-slate-700'
                    }`}>
                      {previewClassSize}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider">
                  {headerConfig.title || 'SƠ ĐỒ CHỖ NGỒI HỌC SINH'}
                </h2>
                <p className="text-[11px] font-bold text-slate-700 leading-tight mt-0.5">
                  GVCN: {headerConfig.teacherName} • Năm học: {headerConfig.academicYear}
                </p>
                <p className={`text-[9.5px] leading-tight ${
                  headerConfig.colorMode === 'monochrome' ? 'text-slate-800 font-bold' : 'text-slate-500 font-semibold'
                }`}>
                  {headerConfig.modeNote}
                </p>
              </div>
            </div>

            {/* Mẫu thử nghiệm hiển thị tên học sinh (đồng bộ 2 dòng: chữ lót + tên ở hàng 2) */}
            <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                <span className="text-[9px] text-slate-400 font-semibold mb-0.5">Mẫu tên tiêu chuẩn (4 từ):</span>
                {(() => {
                  const s1 = splitStudentName('Nguyễn Hoàng Anh Tuấn', headerConfig.nameCase);
                  return (
                    <div
                      style={{
                        fontFamily: "'Times New Roman', Times, Georgia, serif",
                        fontSize: `${headerConfig.fontSize || 14}px`,
                      }}
                      className="font-bold leading-tight flex flex-col items-center justify-center"
                    >
                      <span className="block leading-tight">{s1.firstLine}</span>
                      <span className="block leading-tight">{s1.secondLine}</span>
                    </div>
                  );
                })()}
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                <span className="text-[9px] text-slate-400 font-semibold mb-0.5">
                  Mẫu tên dài ({headerConfig.autoFitLongNames !== false ? `tự co ${getStudentPrintFontSize('Công Tằng Tôn Nữ Bích Ngọc', headerConfig.fontSize || 14, true)}pt` : 'giữ nguyên'}):
                </span>
                {(() => {
                  const s2 = splitStudentName('Công Tằng Tôn Nữ Bích Ngọc', headerConfig.nameCase);
                  return (
                    <div
                      style={{
                        fontFamily: "'Times New Roman', Times, Georgia, serif",
                        fontSize: `${getStudentPrintFontSize('Công Tằng Tôn Nữ Bích Ngọc', headerConfig.fontSize || 14, headerConfig.autoFitLongNames !== false)}px`,
                      }}
                      className="font-bold leading-tight flex flex-col items-center justify-center"
                    >
                      <span className="block leading-tight">{s2.firstLine}</span>
                      <span className="block leading-tight">{s2.secondLine}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Xem trước Bục Giảng & Cửa Ra Vào trên bản in (3 tầng xếp dọc: Cửa -> Bàn -> Bảng) */}
            <div className={`mt-2 pt-2 border-t flex flex-col gap-1 text-[10px] ${
              headerConfig.colorMode === 'monochrome' ? 'border-slate-900' : 'border-slate-200'
            }`}>
              {/* Tầng 1: Cửa Ra Vào (phía trên cùng, sát mép hành lang) */}
              {headerConfig.showDoorArrow !== false && (
                <div className={`flex w-full ${doorPos === 'left' ? 'justify-start pl-0.5' : 'justify-end pr-0.5'}`}>
                  <ClassroomDoorArrowSVG
                    isPointingLeft={isPointingLeft}
                    isMonochrome={headerConfig.colorMode === 'monochrome'}
                    className="w-20 h-4.5 shrink-0"
                  />
                </div>
              )}

              {/* Tầng 2: Bàn Giáo Viên (phía trên Bảng, hơi thụt vào so với Cửa) */}
              <div className={`flex w-full ${
                teacherDeskPos === 'left'
                  ? 'justify-start pl-4'
                  : teacherDeskPos === 'center'
                  ? 'justify-center'
                  : 'justify-end pr-4'
              }`}>
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] flex items-center gap-1 shrink-0 ${
                  headerConfig.colorMode === 'monochrome' ? 'bg-white border border-black text-black font-black' : 'bg-amber-50 border border-amber-300 text-amber-900'
                }`}>
                  👩‍🏫 {elementsConfig?.teacherDeskLabel || 'Bàn Giáo Viên'}
                </span>
              </div>

              {/* Tầng 3: Bảng Lớp Học (ở phía dưới cùng, trung tâm phòng học) */}
              <div className="w-full flex justify-center">
                <span className={`w-full max-w-md py-0.5 px-3 rounded text-white font-black text-[9px] uppercase tracking-wider text-center ${
                  headerConfig.colorMode === 'monochrome' ? 'bg-black' : 'bg-slate-800'
                }`}>
                  🏫 BẢNG LỚP HỌC (TRUNG TÂM PHÒNG HỌC)
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[8px] text-slate-400">
              <span>Định dạng xuất: Khổ ngang A4 ({headerConfig.colorMode === 'monochrome' ? 'Laser Đơn Sắc Siêu Nét' : 'Màu Sắc Rực Rỡ'}) • Phông Times New Roman {headerConfig.fontSize || 14}pt {headerConfig.nameCase === 'uppercase' ? '(Viết Hoa)' : ''}</span>
              <span>Ngày lập: {headerConfig.appliedDate}</span>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="text-[11px] text-slate-500 font-medium">
            {headerConfig.colorMode === 'monochrome' ? (
              <>💡 Mẹo máy in Canon 2900: Đã cấu hình phông chữ <strong className="text-slate-800">Times New Roman cỡ {headerConfig.fontSize || 14}pt {headerConfig.nameCase === 'uppercase' ? '(Viết Hoa)' : ''}</strong>, tự động xuống dòng hiển thị trọn vẹn 100% họ tên học sinh và viền nét đậm rõ ràng.</>
            ) : (
              <>💡 Mẹo in màu: Phông chữ <strong className="text-slate-800">Times New Roman cỡ {headerConfig.fontSize || 14}pt {headerConfig.nameCase === 'uppercase' ? '(Viết Hoa)' : ''}</strong> chuẩn thể thức hành chính, tự động xuống hàng tên học sinh. Khi in, chọn <strong className="text-slate-800">Khổ ngang (Landscape)</strong>.</>
            )}
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isExportingPdf}
            >
              Đóng
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onExportPdf}
              isLoading={isExportingPdf}
              className="text-xs font-black shadow-md shadow-primary/20 bg-emerald-600 hover:bg-emerald-700 text-white"
              title="Tải trực tiếp file PDF A4 sắc nét gửi Zalo"
            >
              <span>📥</span>
              <span>XUẤT FILE PDF A4</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handlePrint}
              disabled={isExportingPdf}
              className="text-xs font-black shadow-md shadow-primary/20"
              title="Mở hộp thoại in của trình duyệt"
            >
              <span>🖨️</span>
              <span>IN NGAY (CTRL+P)</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
