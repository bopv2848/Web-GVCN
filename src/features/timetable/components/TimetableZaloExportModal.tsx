import React, { useState, useRef, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { TimetableEntry } from '../../../types/timetable';
import { timetableService } from '../services/timetableService';
import { getSchoolWeekDays, type AcademicWeekInfo } from '../../../utils/academicWeekUtils';
import type { TimetableWeeklyOverride } from '../types/timetableOverrideTypes';
import { Check, Copy, Download, Sparkles } from 'lucide-react';

interface TimetableZaloExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimetableEntry[];
  classNameTitle: string;
  schoolName?: string;
  logoUrl?: string;
  academicWeek: AcademicWeekInfo;
  overrides?: Record<string, TimetableWeeklyOverride>;
  teacherName?: string;
}

export const TimetableZaloExportModal: React.FC<TimetableZaloExportModalProps> = ({
  isOpen,
  onClose,
  entries,
  classNameTitle,
  schoolName = 'TRƯỜNG THCS TÂN HẢI',
  logoUrl = '/logo-truong-thcs-Tan-Hai.jpg',
  academicWeek,
  overrides = {},
  teacherName = 'Thầy Phan Văn Bộ',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const days = useMemo(() => {
    return getSchoolWeekDays(academicWeek.mondayDate);
  }, [academicWeek]);

  const morningPeriods = [1, 2, 3, 4, 5];
  const afternoonPeriods = [6, 7, 8];

  const getEntryAt = (day: number, period: number) => {
    return entries.find((e) => e.dayOfWeek === day && e.period === period);
  };

  /**
   * Tạo canvas ảnh độ nét cao từ thẻ TKB
   */
  const renderCardToCanvas = async () => {
    if (!cardRef.current) return null;
    const { default: html2canvas } = await import('html2canvas');

    return html2canvas(cardRef.current, {
      scale: 2.5, // Tăng độ nét 2.5x để gửi Zalo không bị nhòe vỡ chữ
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
  };

  /**
   * Tải ảnh PNG về máy
   */
  const handleDownloadImage = async () => {
    setIsExporting(true);
    setExportMessage('Đang kết xuất ảnh Thời Khóa Biểu độ nét cao...');
    try {
      const canvas = await renderCardToCanvas();
      if (!canvas) throw new Error('Không tạo được ảnh');

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `TKB-Tuan-${academicWeek.weekNumber}-${classNameTitle.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();

      setExportMessage('🎉 Đã tải ảnh TKB thành công! Thầy có thể gửi ngay lên Zalo nhóm lớp.');
      setTimeout(() => setExportMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setExportMessage('⚠️ Lỗi kết xuất ảnh, vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 1 Chạm: Sao chép ảnh trực tiếp vào Clipboard (chỉ cần Ctrl+V vào Zalo)
   */
  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    setExportMessage('Đang sao chép ảnh vào bộ nhớ tạm (Clipboard)...');
    try {
      const canvas = await renderCardToCanvas();
      if (!canvas) throw new Error('Không tạo được ảnh');

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Không tạo được dữ liệu Blob');
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopySuccess(true);
          setExportMessage('✅ ĐÃ SAO CHÉP ẢNH! Thầy chỉ cần mở Zalo và nhấn Ctrl + V để gửi.');
          setTimeout(() => setCopySuccess(false), 4000);
          setTimeout(() => setExportMessage(null), 5000);
        } catch {
          // Fallback tải file nếu trình duyệt chặn quyền clipboard
          handleDownloadImage();
        }
      }, 'image/png', 1.0);
    } catch (err) {
      console.error(err);
      setExportMessage('⚠️ Lỗi sao chép ảnh. Đang tự động chuyển sang tải file PNG...');
      handleDownloadImage();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xuất Thẻ Ảnh Thời Khóa Biểu Gửi Zalo Nhóm Lớp (1 Chạm)"
    >
      <div className="space-y-4">
        {/* Thanh công cụ tùy biến */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Khung hình:</span>
            <button
              onClick={() => setAspectRatio('landscape')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                aspectRatio === 'landscape'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              📱 Ngang (Nhóm Zalo 16:9)
            </button>
            <button
              onClick={() => setAspectRatio('portrait')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                aspectRatio === 'portrait'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              📲 Dọc (Story / Nhật ký 9:16)
            </button>

            <span className="text-xs font-bold text-slate-600 ml-2">Buổi:</span>
            <button
              onClick={() => setSessionFilter('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sessionFilter === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Cả ngày
            </button>
            <button
              onClick={() => setSessionFilter('morning')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sessionFilter === 'morning'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Sáng
            </button>
            <button
              onClick={() => setSessionFilter('afternoon')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sessionFilter === 'afternoon'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Chiều
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-slate-300"
              />
              <span>Hiện ghi chú đổi phòng / dặn dò tuần</span>
            </label>
          </div>
        </div>

        {/* Thông báo tiến trình */}
        {exportMessage && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{exportMessage}</span>
          </div>
        )}

        {/* VÙNG THẺ ẢNH XEM TRƯỚC (CANVAS CONTAINER) */}
        <div className="overflow-x-auto p-2 bg-slate-200/60 rounded-2xl border border-slate-300 flex justify-center custom-scrollbar max-h-[58vh]">
          <div
            ref={cardRef}
            style={{
              width: aspectRatio === 'landscape' ? '860px' : '640px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            className="bg-white text-slate-900 p-6 rounded-3xl shadow-xl border-4 border-amber-400/40 relative overflow-hidden"
          >
            {/* Họa tiết trang trí góc card */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-200/40 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-tr from-blue-200/40 to-transparent rounded-tr-full pointer-events-none" />

            {/* Header Thẻ TKB */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200 mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt="Logo Trường"
                  className="w-14 h-14 object-contain rounded-2xl border border-slate-200 shadow-xs bg-white"
                />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {schoolName}
                  </h3>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{classNameTitle}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                      HỌC 2 BUỔI / NGÀY
                    </span>
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-xl bg-amber-500 text-white font-black text-xs shadow-xs uppercase tracking-wide">
                  THỜI KHÓA BIỂU TUẦN {academicWeek.weekNumber}
                </div>
                <p className="text-[11px] font-bold text-amber-900 mt-1">
                  Áp dụng từ Thứ Hai, {academicWeek.appliedDateText}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Năm học {academicWeek.academicYear} • GVCN: {teacherName}
                </p>
              </div>
            </div>

            {/* BẢNG THỜI KHÓA BIỂU */}
            <table className="w-full text-xs border-collapse border border-slate-300 text-center rounded-xl overflow-hidden relative z-10">
              <thead>
                <tr className="bg-slate-100 text-slate-850">
                  <th className="border border-slate-300 p-2 w-14 font-black">Buổi</th>
                  <th className="border border-slate-300 p-2 w-12 font-black">Tiết</th>
                  {days.map((d) => (
                    <th key={d.day} className="border border-slate-300 p-2 font-black">
                      <div className="text-xs">{d.name}</div>
                      <div className="text-[10px] font-bold text-slate-500">({d.dateStr})</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Buổi sáng */}
                {(sessionFilter === 'all' || sessionFilter === 'morning') &&
                  morningPeriods.map((p, idx) => (
                    <tr key={`morning_${p}`} className="hover:bg-slate-50/50">
                      {idx === 0 && (
                        <td
                          rowSpan={5}
                          className="border border-slate-300 p-2 font-black bg-amber-50 text-amber-900 uppercase text-[11px] tracking-wider"
                        >
                          Sáng
                        </td>
                      )}
                      <td className="border border-slate-300 p-1.5 font-bold bg-slate-50 text-slate-700">
                        {p}
                      </td>
                      {days.map((d) => {
                        const entry = getEntryAt(d.day, p);
                        const ov = entry ? overrides[entry.id] : undefined;
                        const subject = ov?.overrideSubject || entry?.subjectName || '';
                        const room = ov?.overrideRoom || entry?.roomName;
                        const color = subject
                          ? timetableService.getSubjectColor(subject)
                          : { badgeBg: '', badgeText: '', borderClass: '' };

                        return (
                          <td
                            key={d.day}
                            className={`border border-slate-300 p-1.5 align-middle ${
                              subject ? color.badgeBg : 'bg-white'
                            }`}
                          >
                            {subject ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className={`font-black text-xs ${color.badgeText}`}>
                                  {subject}
                                </span>
                                {room && (
                                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 rounded border border-blue-200 mt-0.5">
                                    {room}
                                  </span>
                                )}
                                {includeNotes && ov?.note && (
                                  <span className="text-[9px] font-black text-amber-900 bg-amber-200/90 px-1 rounded mt-0.5 truncate max-w-[100px]">
                                    📌 {ov.note}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">--</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                {/* Buổi chiều */}
                {(sessionFilter === 'all' || sessionFilter === 'afternoon') &&
                  afternoonPeriods.map((p, idx) => (
                    <tr key={`afternoon_${p}`} className="hover:bg-slate-50/50">
                      {idx === 0 && (
                        <td
                          rowSpan={3}
                          className="border border-slate-300 p-2 font-black bg-indigo-50 text-indigo-900 uppercase text-[11px] tracking-wider"
                        >
                          Chiều
                        </td>
                      )}
                      <td className="border border-slate-300 p-1.5 font-bold bg-slate-50 text-slate-700">
                        {p - 5}
                      </td>
                      {days.map((d) => {
                        const entry = getEntryAt(d.day, p);
                        const ov = entry ? overrides[entry.id] : undefined;
                        const subject = ov?.overrideSubject || entry?.subjectName || '';
                        const room = ov?.overrideRoom || entry?.roomName;
                        const color = subject
                          ? timetableService.getSubjectColor(subject)
                          : { badgeBg: '', badgeText: '', borderClass: '' };

                        return (
                          <td
                            key={d.day}
                            className={`border border-slate-300 p-1.5 align-middle ${
                              subject ? color.badgeBg : 'bg-white'
                            }`}
                          >
                            {subject ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className={`font-black text-xs ${color.badgeText}`}>
                                  {subject}
                                </span>
                                {room && (
                                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 rounded border border-blue-200 mt-0.5">
                                    {room}
                                  </span>
                                )}
                                {includeNotes && ov?.note && (
                                  <span className="text-[9px] font-black text-amber-900 bg-amber-200/90 px-1 rounded mt-0.5 truncate max-w-[100px]">
                                    📌 {ov.note}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">--</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Footer Thẻ TKB */}
            <div className="mt-4 pt-3 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-600 relative z-10">
              <div className="text-left">
                <p className="font-bold text-slate-800">
                  📢 Lời nhắn GVCN: Quý Phụ huynh vui lòng nhắc nhở các em chuẩn bị sách vở và đồng phục chu đáo.
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Web-GVCN • Hệ thống Quản trị Lớp học Thông minh • Ngày xuất: {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-xl">
                  <span>🏫</span> {classNameTitle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NÚT THAO TÁC 1 CHẠM */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isExporting}>
            Đóng
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1 Chạm Copy Zalo */}
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleCopyToClipboard}
              disabled={isExporting}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 mr-1.5" />
                  <span>Đã chép! Hãy dán (Ctrl+V) vào Zalo</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-600 mr-1.5" />
                  <span>📋 1 Chạm: Chép ảnh vào Zalo</span>
                </>
              )}
            </Button>

            {/* Nút Tải PNG */}
            <Button
              type="button"
              size="md"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="bg-primary hover:bg-primary/90 text-white font-black shadow-sm"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>{isExporting ? 'Đang xuất ảnh...' : '📸 Tải Ảnh HD Về Máy (PNG)'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
