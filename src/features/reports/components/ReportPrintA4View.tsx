import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import type { ComprehensiveClassReport } from '../types';
import { reportVerificationService } from '../services/reportVerificationService';

interface ReportPrintA4ViewProps {
  report: ComprehensiveClassReport;
}

export const ReportPrintA4View: React.FC<ReportPrintA4ViewProps> = ({ report }) => {
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);
  const dateStr = today.getDate();
  const monthStr = today.getMonth() + 1;
  const yearStr = today.getFullYear();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const docId = useMemo(
    () => `DOC-${yearStr}${String(monthStr).padStart(2, '0')}${String(dateStr).padStart(2, '0')}-${report.className}`,
    [yearStr, monthStr, dateStr, report.className]
  );

  useEffect(() => {
    const verificationUrl = reportVerificationService.generateVerificationUrl({
      docId,
      className: report.className,
      schoolName: report.schoolName,
      teacherName: user?.fullName || report.teacherName,
      periodTitle: report.periodTitle,
      totalStudents: report.kpi.totalStudents,
      attendanceRate: report.kpi.overallAttendanceRate,
      totalPoints: report.kpi.totalPoints,
      signedAt: today.toISOString(),
    });

    reportVerificationService.generateQrCodeDataUrl(verificationUrl).then((dataUrl) => {
      if (dataUrl) setQrCodeUrl(dataUrl);
    });
  }, [docId, report, user?.fullName, today]);

  return (
    <div
      id="report-print-a4-view"
      className="hidden print:block font-serif text-slate-900 bg-white p-8 max-w-[210mm] mx-auto text-xs leading-relaxed"
    >
      {/* 1. Quốc hiệu & Tiêu ngữ */}
      <div className="flex justify-between items-start pb-4 border-b border-slate-900 mb-6">
        <div className="flex items-center gap-3">
          <img
            src={report.logoUrl || '/logo-truong-thcs-Tan-Hai.jpg'}
            alt="Logo Trường"
            className="w-14 h-14 object-contain rounded-full border border-slate-300 shadow-xs"
          />
          <div className="text-left font-bold">
            <p className="uppercase tracking-wider text-[11px] text-slate-700">PHÒNG GIÁO DỤC VÀ ĐÀO TẠO</p>
            <p className="uppercase font-black tracking-wide text-[12px] text-slate-900">{report.schoolName}</p>
            <p className="font-extrabold text-sm mt-0.5 text-slate-900">{report.className}</p>
          </div>
        </div>

        <div className="text-center font-bold">
          <p className="uppercase tracking-wider text-[11px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="italic font-semibold text-[11.5px]">Độc lập - Tự do - Hạnh phúc</p>
          <div className="w-28 h-0.5 bg-slate-900 mx-auto mt-1.5"></div>
        </div>
      </div>

      {/* 2. Tiêu đề Báo cáo */}
      <div className="text-center my-6">
        <h1 className="text-base font-black uppercase tracking-wide">
          BÁO CÁO TỔNG KẾT THI ĐUA & CHUYÊN CẦN LỚP HỌC
        </h1>
        <p className="font-bold mt-1 text-[13px] uppercase">{report.periodTitle}</p>
        <p className="text-[11px] italic mt-0.5 text-slate-700">
          ({report.dateRangeText} • Sĩ số: {report.kpi.totalStudents} học sinh • GVCN:{' '}
          {report.teacherName})
        </p>
      </div>

      {/* 3. Tóm tắt chỉ số chung */}
      <div className="border border-slate-800 p-3.5 mb-6 bg-slate-50/40">
        <p className="font-bold uppercase text-[11px] mb-2">I. TỔNG QUAN CHỈ SỐ NỀ NẾP & CHUYÊN CẦN:</p>
        <div className="grid grid-cols-2 gap-y-1 text-[11px]">
          <p>• Tổng điểm thi đua toàn lớp: <strong>{report.kpi.totalPoints > 0 ? `+${report.kpi.totalPoints}` : report.kpi.totalPoints} điểm</strong></p>
          <p>• Tỷ lệ chuyên cần bình quân: <strong>{report.kpi.overallAttendanceRate}%</strong></p>
          <p>• Tổng điểm thưởng cộng: <strong className="text-emerald-800">+{report.kpi.positivePoints} điểm</strong></p>
          <p>• Tổng lượt đi học muộn: <strong>{report.kpi.totalLate} lượt</strong></p>
          <p>• Tổng điểm trừ nề nếp: <strong className="text-rose-800">-{report.kpi.negativePoints} điểm</strong></p>
          <p>• Lượt nghỉ học: <strong>{report.kpi.totalExcused} có phép, {report.kpi.totalUnexcused} không phép</strong></p>
          <p>• Tổng số giao dịch ghi sổ cái: <strong>{report.kpi.totalTransactions} lượt</strong></p>
          <p>• Số học sinh cần gia đình phối hợp: <strong>{report.studentsNeedingCare.length} em</strong></p>
        </div>
      </div>

      {/* 4. Bảng Kết quả 4 Tổ */}
      <div className="mb-6">
        <p className="font-bold uppercase text-[11px] mb-2">II. BẢNG XẾP HẠNG THI ĐUA 4 TỔ:</p>
        <table className="w-full border-collapse border border-slate-800 text-center text-[11px]">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-slate-800 p-1.5 w-16">Xếp hạng</th>
              <th className="border border-slate-800 p-1.5 text-left pl-3">Tổ thi đua</th>
              <th className="border border-slate-800 p-1.5 w-20">Sĩ số</th>
              <th className="border border-slate-800 p-1.5 w-28">Tổng điểm</th>
              <th className="border border-slate-800 p-1.5 w-28">Chuyên cần</th>
              <th className="border border-slate-800 p-1.5">Danh hiệu thi đua</th>
            </tr>
          </thead>
          <tbody>
            {report.groupStats.map((g) => (
              <tr key={g.groupId}>
                <td className="border border-slate-800 p-1.5 font-bold">Hạng {g.rank}</td>
                <td className="border border-slate-800 p-1.5 font-bold text-left pl-3">{g.groupName}</td>
                <td className="border border-slate-800 p-1.5">{g.memberCount} HS</td>
                <td className="border border-slate-800 p-1.5 font-bold">
                  {g.totalPoints > 0 ? `+${g.totalPoints}` : g.totalPoints}
                </td>
                <td className="border border-slate-800 p-1.5 font-bold">{g.attendanceRate}%</td>
                <td className="border border-slate-800 p-1.5">{g.badge}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Học sinh tiêu biểu & Cần lưu ý */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Top 5 */}
        <div className="border border-slate-800 p-3">
          <p className="font-bold uppercase text-[10.5px] mb-2 text-center border-b border-slate-300 pb-1">
            III. TOP HỌC SINH XUẤT SẮC TIÊU BIỂU
          </p>
          <div className="space-y-1.5 text-[10.5px]">
            {report.topStudents.slice(0, 5).map((s, idx) => (
              <div key={s.studentId} className="flex justify-between items-center">
                <span>
                  <strong>{idx + 1}. {s.fullName}</strong> ({s.groupName})
                </span>
                <span className="font-bold">+{s.totalPoints}đ (⭐{s.stars})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cần phối hợp */}
        <div className="border border-slate-800 p-3">
          <p className="font-bold uppercase text-[10.5px] mb-2 text-center border-b border-slate-300 pb-1">
            IV. HỌC SINH CẦN GIA ĐÌNH PHỐI HỢP
          </p>
          <div className="space-y-1.5 text-[10.5px]">
            {report.studentsNeedingCare.length === 0 ? (
              <p className="italic text-center text-slate-600">Không có trường hợp cần lưu ý</p>
            ) : (
              report.studentsNeedingCare.slice(0, 5).map((s, idx) => (
                <div key={s.studentId} className="flex justify-between items-center">
                  <span>
                    <strong>{idx + 1}. {s.fullName}</strong> ({s.groupName})
                  </span>
                  <span className="font-bold text-rose-800">
                    {s.totalPoints < 0 ? `${s.totalPoints}đ` : ''}{' '}
                    {s.lateCount > 0 ? `(Muộn: ${s.lateCount})` : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 6. Nhận xét của GVCN */}
      <div className="border border-slate-800 p-3 mb-8">
        <p className="font-bold uppercase text-[11px] mb-1">V. Ý KIẾN NHẬN XÉT CỦA GIÁO VIÊN CHỦ NHIỆM:</p>
        <p className="text-[11px] text-justify italic">
          - Toàn thể 47 học sinh duy trì nền nếp học tập nghiêm túc, tham gia phát biểu xây dựng bài sôi nổi.
          <br />
          - Ban cán sự lớp và các Tổ trưởng làm việc trách nhiệm, nắm chắc nề nếp và hỗ trợ điều hành lớp tốt.
          <br />
          - Đề nghị quý phụ huynh tiếp tục đồng hành, nhắc nhở con em đi học đúng giờ và chuẩn bị bài chu đáo trước khi tới trường.
        </p>
      </div>

      {/* 7. Chữ ký Phê duyệt */}
      <div className="grid grid-cols-2 text-center font-bold text-[11.5px] mt-8 pt-4">
        <div>
          <p className="uppercase">BAN GIÁM HIỆU PHÊ DUYỆT</p>
          <p className="italic font-normal text-[10.5px]">(Ký, ghi rõ họ tên và đóng dấu)</p>
          <div className="h-20"></div>
          <p className="uppercase font-extrabold">HIỆU TRƯỞNG</p>
        </div>

        <div>
          <p className="italic font-normal text-[11px]">
            Tân Hải, ngày {dateStr} tháng {monthStr} năm {yearStr}
          </p>
          <p className="uppercase mt-0.5">GIÁO VIÊN CHỦ NHIỆM</p>
          <p className="italic font-normal text-[10.5px]">(Ký và ghi rõ họ tên)</p>
          <div className="h-20 flex items-center justify-center overflow-hidden">
            {user?.signatureUrl && user?.showSignatureInReports !== false ? (
              <img
                src={user.signatureUrl}
                alt="Chữ ký Thầy Phan Văn Bộ"
                className="max-h-16 max-w-[160px] object-contain drop-shadow-xs"
              />
            ) : (
              <div className="h-16"></div>
            )}
          </div>
          <p className="uppercase font-extrabold">{user?.fullName || report.teacherName || 'THẦY PHAN VĂN BỘ'}</p>
        </div>
      </div>

      {/* 8. Tem bảo mật & Mã QR xác thực điện tử chống giả mạo */}
      <div className="mt-8 pt-3 border-t border-dashed border-slate-400 flex items-center justify-between text-[10px] text-slate-600">
        <div className="flex items-center gap-3">
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="Mã QR Xác thực báo cáo"
              className="w-14 h-14 border border-slate-300 p-0.5 rounded-xs bg-white shrink-0 shadow-xs"
            />
          )}
          <div>
            <p className="font-bold text-slate-800 flex items-center gap-1.5 uppercase">
              <span>🛡️ VĂN BẢN XÁC THỰC ĐIỆN TỬ CHÍNH THỨC</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-bold">TÍCH XANH</span>
            </p>
            <p className="text-slate-600 mt-0.5">
              Mã tra cứu: <span className="font-mono font-bold text-slate-900">{docId}</span>
            </p>
            <p className="italic text-slate-500 text-[9.5px] mt-0.5">
              Quét mã QR bằng máy ảnh hoặc Zalo để đối soát dữ liệu điểm thi đua và chuyên cần gốc từ Web-GVCN.
            </p>
          </div>
        </div>
        <div className="text-right text-[9.5px] text-slate-400 leading-tight">
          <p className="font-semibold text-slate-600">Hệ thống Sổ GVCN 4.0</p>
          <p>THCS Tân Hải • 2025 - 2026</p>
          <p className="italic text-[9px] text-emerald-700 font-semibold mt-0.5">✓ Đã xác thực số hóa</p>
        </div>
      </div>
    </div>
  );
};
