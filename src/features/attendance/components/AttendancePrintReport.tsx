import React from 'react';
import type { MonthlyAttendanceReport } from '../../../types/attendance';

interface AttendancePrintReportProps {
  report: MonthlyAttendanceReport;
  schoolName?: string;
  className?: string;
  teacherName?: string;
}

export const AttendancePrintReport: React.FC<AttendancePrintReportProps> = ({
  report,
  schoolName = 'TRƯỜNG THCS NGUYỄN VĂN TRỖI',
  className = 'LỚP 6A6',
  teacherName = 'Thầy Phan Văn Bộ',
}) => {
  return (
    <div className="hidden print:block font-serif text-slate-900 bg-white p-8 max-w-[210mm] mx-auto text-xs leading-relaxed">
      {/* 1. Header Báo cáo Hành chính Giáo dục */}
      <div className="flex justify-between items-start pb-4 border-b border-slate-900 mb-6">
        <div className="text-center font-bold">
          <p className="uppercase tracking-wider">PHÒNG GD&ĐT QUẬN THANH XUÂN</p>
          <p className="uppercase font-black tracking-wide">{schoolName}</p>
          <p className="font-extrabold text-sm mt-1">{className}</p>
        </div>

        <div className="text-center font-bold">
          <p className="uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="italic font-semibold">Độc lập - Tự do - Hạnh phúc</p>
          <div className="w-24 h-0.5 bg-slate-900 mx-auto mt-1"></div>
        </div>
      </div>

      {/* 2. Tiêu đề Báo cáo */}
      <div className="text-center my-6">
        <h1 className="text-base font-black uppercase tracking-wide">
          BÁO CÁO THỐNG KÊ CHUYÊN CẦN HỌC SINH
        </h1>
        <p className="font-bold mt-1 text-[13px]">
          THÁNG {report.month} NĂM {report.year} • NĂM HỌC 2026 - 2027
        </p>
        <p className="text-[11px] italic mt-1 text-slate-600">
          (Giáo viên chủ nhiệm: {teacherName} • Sĩ số: {report.totalStudents} học sinh)
        </p>
      </div>

      {/* 3. Tóm tắt chỉ số chung */}
      <div className="border border-slate-800 p-3 mb-6 bg-slate-50/50">
        <p className="font-bold uppercase text-[11px] mb-1.5">I. TỔNG QUAN TÌNH HÌNH CHUYÊN CẦN TOÀN LỚP:</p>
        <div className="grid grid-cols-2 gap-y-1 text-[11px]">
          <p>• Tổng số buổi học tổ chức trong tháng: <strong>{report.totalSessions} buổi</strong></p>
          <p>• Tỷ lệ chuyên cần bình quân toàn lớp: <strong>{report.overallRate}%</strong></p>
          <p>• Tổng lượt đi muộn toàn lớp: <strong>{report.totalLate} lượt</strong></p>
          <p>• Tổng lượt nghỉ có phép: <strong>{report.totalExcused} lượt</strong></p>
          <p>• Tổng lượt nghỉ không phép: <strong>{report.totalUnexcused} lượt</strong></p>
          <p>• Số học sinh cần gia đình lưu ý (vắng/muộn nhiều): <strong>{report.atRiskStudents.length} em</strong></p>
        </div>

        {report.topAbsenceReasons && report.topAbsenceReasons.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-300 text-[10.5px]">
            <span className="font-bold uppercase">• Phân loại lý do vắng chủ yếu trong tháng: </span>
            <span className="text-slate-800">
              {report.topAbsenceReasons.map((r) => `${r.reason} (${r.count} lượt - ${r.percentage}%)`).join(' • ')}
            </span>
          </div>
        )}
      </div>

      {/* 4. Bảng 1: Thống kê theo 4 Tổ */}
      <div className="mb-6">
        <p className="font-bold uppercase text-[11px] mb-2">II. THỐNG KÊ CHUYÊN CẦN THEO 4 TỔ THI ĐUA:</p>
        <table className="w-full border-collapse border border-slate-800 text-center text-[11px]">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-slate-800 p-1.5">Tổ thi đua</th>
              <th className="border border-slate-800 p-1.5">Sĩ số</th>
              <th className="border border-slate-800 p-1.5">Có mặt (Lượt)</th>
              <th className="border border-slate-800 p-1.5">Đi muộn</th>
              <th className="border border-slate-800 p-1.5">Có phép</th>
              <th className="border border-slate-800 p-1.5">K.Phép</th>
              <th className="border border-slate-800 p-1.5">Tỷ lệ chuyên cần</th>
              <th className="border border-slate-800 p-1.5">Xếp hạng</th>
            </tr>
          </thead>
          <tbody>
            {report.groupStats.map((g) => (
              <tr key={g.groupId}>
                <td className="border border-slate-800 p-1.5 font-bold text-left pl-3">{g.groupName}</td>
                <td className="border border-slate-800 p-1.5">{g.memberCount}</td>
                <td className="border border-slate-800 p-1.5">{g.presentCount}</td>
                <td className="border border-slate-800 p-1.5">{g.lateCount}</td>
                <td className="border border-slate-800 p-1.5">{g.excusedCount}</td>
                <td className="border border-slate-800 p-1.5">{g.unexcusedCount}</td>
                <td className="border border-slate-800 p-1.5 font-bold">{g.attendanceRate}%</td>
                <td className="border border-slate-800 p-1.5 font-bold">Hạng {g.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Bảng 2: Học sinh cần lưu ý (nếu có) */}
      {report.atRiskStudents.length > 0 && (
        <div className="mb-6">
          <p className="font-bold uppercase text-[11px] mb-2 text-rose-800">
            III. DANH SÁCH HỌC SINH CẦN LƯU Ý / PHỐI HỢP PHỤ HUYNH:
          </p>
          <table className="w-full border-collapse border border-slate-800 text-center text-[10.5px]">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-800 p-1 w-8">STT</th>
                <th className="border border-slate-800 p-1 text-left pl-2">Họ và tên học sinh</th>
                <th className="border border-slate-800 p-1">Tổ</th>
                <th className="border border-slate-800 p-1">Muộn</th>
                <th className="border border-slate-800 p-1">Có phép</th>
                <th className="border border-slate-800 p-1">K.Phép</th>
                <th className="border border-slate-800 p-1">Tỷ lệ %</th>
                <th className="border border-slate-800 p-1 text-left pl-2">Lý do vắng mặt chi tiết</th>
                <th className="border border-slate-800 p-1 text-left pl-2">Biện pháp GVCN đã xử lý</th>
              </tr>
            </thead>
            <tbody>
              {report.atRiskStudents.map((st, idx) => (
                <tr key={st.studentId}>
                  <td className="border border-slate-800 p-1">{idx + 1}</td>
                  <td className="border border-slate-800 p-1 font-bold text-left pl-2">{st.fullName}</td>
                  <td className="border border-slate-800 p-1">{st.groupName}</td>
                  <td className="border border-slate-800 p-1">{st.lateCount}</td>
                  <td className="border border-slate-800 p-1">{st.excusedCount}</td>
                  <td className="border border-slate-800 p-1 font-bold text-rose-700">{st.unexcusedCount}</td>
                  <td className="border border-slate-800 p-1 font-bold">{st.attendanceRate}%</td>
                  <td className="border border-slate-800 p-1 text-left pl-2 text-[9.5px]">
                    {st.absenceDetails && st.absenceDetails.length > 0
                      ? st.absenceDetails
                          .map(
                            (d) =>
                              `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}: ${
                                d.note || (d.status === 'excused_absence' ? 'Có phép' : 'K.phép')
                              }`
                          )
                          .join('; ')
                      : 'Chủ yếu đi muộn đầu giờ'}
                  </td>
                  <td className="border border-slate-800 p-1 text-left pl-2 italic text-[10px]">
                    {st.unexcusedCount > 0 ? 'Đã gọi điện trao đổi trực tiếp với PH' : 'Nhắc nhở nề nếp đầu giờ'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. Bảng 3: Chi tiết 47 học sinh */}
      <div className="mb-6 break-before-page">
        <p className="font-bold uppercase text-[11px] mb-2">
          IV. BẢNG THEO DÕI CHUYÊN CẦN CHI TIẾT 47 HỌC SINH (SẮP XẾP THEO TÊN):
        </p>
        <table className="w-full border-collapse border border-slate-800 text-center text-[10px]">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-slate-800 p-1 w-8">STT</th>
              <th className="border border-slate-800 p-1 text-left pl-2">Họ và tên</th>
              <th className="border border-slate-800 p-1">Tổ</th>
              <th className="border border-slate-800 p-1">Chức vụ</th>
              <th className="border border-slate-800 p-1">Có mặt</th>
              <th className="border border-slate-800 p-1">Muộn</th>
              <th className="border border-slate-800 p-1">Phép</th>
              <th className="border border-slate-800 p-1">K.Phép</th>
              <th className="border border-slate-800 p-1">Tỷ lệ</th>
              <th className="border border-slate-800 p-1 text-left pl-2">Chi tiết lý do vắng / Chú thích</th>
            </tr>
          </thead>
          <tbody>
            {report.studentSummaries.map((s, idx) => (
              <tr key={s.studentId}>
                <td className="border border-slate-800 p-0.5">{idx + 1}</td>
                <td className="border border-slate-800 p-0.5 font-bold text-left pl-2">{s.fullName}</td>
                <td className="border border-slate-800 p-0.5">{s.groupName}</td>
                <td className="border border-slate-800 p-0.5">{s.classRole}</td>
                <td className="border border-slate-800 p-0.5">{s.presentCount}</td>
                <td className="border border-slate-800 p-0.5">{s.lateCount}</td>
                <td className="border border-slate-800 p-0.5">{s.excusedCount}</td>
                <td className="border border-slate-800 p-0.5 font-semibold text-rose-700">{s.unexcusedCount}</td>
                <td className="border border-slate-800 p-0.5 font-bold">{s.attendanceRate}%</td>
                <td className="border border-slate-800 p-0.5 text-left pl-2 text-[9px] text-slate-700">
                  {s.absenceDetails && s.absenceDetails.length > 0
                    ? s.absenceDetails
                        .map(
                          (d) =>
                            `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}: ${
                              d.note || (d.status === 'excused_absence' ? 'Có phép' : 'K.phép')
                            }`
                        )
                        .join('; ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 7. Phần chữ ký xác nhận */}
      <div className="flex justify-between items-start mt-8 pt-4 break-inside-avoid text-center">
        <div className="w-56 font-bold">
          <p className="uppercase text-[11px]">BAN GIÁM HIỆU PHÊ DUYỆT</p>
          <p className="italic text-[10px] text-slate-500 font-normal mt-0.5">(Ký, đóng dấu và ghi rõ họ tên)</p>
          <div className="h-20"></div>
          <p className="text-xs font-black">........................................</p>
        </div>

        <div className="w-56 font-bold">
          <p className="italic text-[10px] text-slate-600 font-normal">
            Hà Nội, ngày ... tháng ... năm {report.year}
          </p>
          <p className="uppercase text-[11px] mt-0.5">GIÁO VIÊN CHỦ NHIỆM</p>
          <p className="italic text-[10px] text-slate-500 font-normal mt-0.5">(Ký và ghi rõ họ tên)</p>
          <div className="h-20"></div>
          <p className="text-xs font-black">{teacherName}</p>
        </div>
      </div>
    </div>
  );
};
