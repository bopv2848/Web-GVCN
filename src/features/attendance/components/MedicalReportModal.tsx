import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { EpidemicAlert } from '../../../types/attendance';

interface MedicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: EpidemicAlert;
  className?: string;
  teacherName?: string;
  schoolName?: string;
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({
  isOpen,
  onClose,
  alert,
  className = 'LỚP 6A6',
  teacherName = 'Thầy Phan Văn Bộ',
  schoolName = 'TRƯỜNG THCS NGUYỄN VĂN TRỖI',
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const formattedStartDate = alert.startDate
    ? `${alert.startDate.slice(8, 10)}/${alert.startDate.slice(5, 7)}/${alert.startDate.slice(0, 4)}`
    : '';
  const formattedEndDate = alert.endDate
    ? `${alert.endDate.slice(8, 10)}/${alert.endDate.slice(5, 7)}/${alert.endDate.slice(0, 4)}`
    : '';

  const generateZaloText = () => {
    const lines = [
      `🚨 [BÁO CÁO Y TẾ HỌC ĐƯỜNG KHẨN CẤP - ${className}]`,
      `Kính gửi: Ban Giám Hiệu & Bộ phận Y tế học đường ${schoolName}`,
      `Người báo cáo: GVCN ${teacherName}`,
      `Thời gian theo dõi: Từ ${formattedStartDate} đến ${formattedEndDate} (7 ngày qua)`,
      `-----------------------------------------`,
      `⚠️ TÌNH HÌNH DỊCH BỆNH THEO MÙA:`,
      `• Tổng số học sinh nghỉ ốm sốt / cảm cúm: ${alert.sickStudentCount} em (Vượt ngưỡng cảnh báo)`,
      `• Mức độ cảnh báo: ${alert.level === 'critical' ? '🔴 BÁO ĐỘNG ĐỎ (NGUY CƠ DỊCH)' : '🟡 CẢNH BÁO VÀNG'}`,
      ``,
      `📋 DANH SÁCH HỌC SINH NGHỈ ỐM:`,
    ];

    alert.sickStudents.forEach((st, idx) => {
      const dates = st.dates.map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`).join(', ');
      const reasons = st.reasons.join('; ');
      lines.push(`${idx + 1}. ${st.studentName} (${st.groupName}) - Ngày nghỉ: ${dates} | Lý do: ${reasons}`);
    });

    lines.push(
      ``,
      `🛡️ ĐỀ XUẤT CỦA GVCN:`,
      `1. Đề nghị Cán bộ Y tế xuống lớp kiểm tra thân nhiệt học sinh đầu giờ.`,
      `2. Kính chuyển Ban Giám Hiệu duyệt phun khử khuẩn Cloramin B phòng học sau giờ tan học chiều nay.`,
      `3. Cung cấp bổ sung dung dịch sát khuẩn tay và khẩu trang y tế dự phòng tại lớp.`,
      `Trân trọng cảm ơn!`
    );

    return lines.join('\n');
  };

  const handleCopyZalo = async () => {
    try {
      const text = generateZaloText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Không thể copy:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Báo Cáo Y Tế Học Đường & Đề Xuất Khử Khuẩn" size="lg">
      <div className="space-y-5 text-xs text-slate-800">
        {/* Banner cảnh báo */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            alert.level === 'critical'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span className="text-2xl">🚨</span>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wide">
              {alert.level === 'critical'
                ? 'BÁO ĐỘNG ĐỎ: NGUY CƠ BÙNG PHÁT DỊCH BỆNH TRONG LỚP'
                : 'CẢNH BÁO VÀNG: SỐ CA ỐM TĂNG NHANH'}
            </h4>
            <p className="mt-1 text-xs opacity-90 leading-relaxed">
              Trong 7 ngày qua ({formattedStartDate} - {formattedEndDate}), lớp ghi nhận{' '}
              <strong>{alert.sickStudentCount} học sinh</strong> nghỉ học vì biểu hiện ốm sốt / cảm cúm. GVCN cần báo ngay cho Cán bộ Y tế học đường để phối hợp xử lý khử khuẩn.
            </p>
          </div>
        </div>

        {/* Khung văn bản báo cáo */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-mono text-[11px] leading-relaxed">
          <div className="border-b border-slate-200 pb-2 flex justify-between items-center text-slate-500 text-[10px]">
            <span>ĐƠN VỊ: {schoolName}</span>
            <span>GVCN: {teacherName} • {className}</span>
          </div>

          <div>
            <p className="font-bold text-slate-900 uppercase">
              I. TỔNG HỢP {alert.sickStudentCount} CA NGHỈ ỐM THEO MÙA:
            </p>
            <div className="mt-2 space-y-1.5 pl-2">
              {alert.sickStudents.map((st, i) => (
                <div key={st.studentId} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="font-bold text-slate-800">
                    {i + 1}. {st.studentName} ({st.groupName}):
                  </span>
                  <span className="text-slate-600">
                    Nghỉ {st.dates.map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`).join(', ')} —{' '}
                    <span className="italic text-rose-700">{st.reasons.join('; ')}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="font-bold text-slate-900 uppercase">II. CÁC BIỆN PHÁP KHẨN CẤP ĐỀ XUẤT:</p>
            <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-700">
              <li>Cán bộ Y tế học đường hỗ trợ đo thân nhiệt học sinh toàn lớp vào 15 phút đầu giờ.</li>
              <li>Phun dung dịch khử khuẩn Cloramin B toàn bộ phòng học sau giờ tan học.</li>
              <li>Hướng dẫn học sinh rửa tay xà phòng, đeo khẩu trang và mở thông thoáng các cửa sổ.</li>
              <li>Theo dõi các học sinh cùng tổ bàn nếu xuất hiện biểu hiện sốt/mệt mỏi tương tự.</li>
            </ul>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handlePrint}
              className="text-xs font-bold"
            >
              🖨️ In Phiếu Đề Xuất
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="text-xs font-bold flex-1 sm:flex-initial"
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant={copied ? 'secondary' : 'primary'}
              size="md"
              onClick={handleCopyZalo}
              className="text-xs font-black flex-1 sm:flex-initial"
            >
              {copied ? '✅ ĐÃ SAO CHÉP XONG!' : '📋 SAO CHÉP GỬI ZALO (Y TẾ / BGH)'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
