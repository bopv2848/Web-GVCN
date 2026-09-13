import React from 'react';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { MonthlyAttendanceChart } from './MonthlyAttendanceChart';
import type {
  MonthlyAttendanceReport,
  StudentMonthlyAttendance,
  AbsenceDetail,
} from '../../../types/attendance';

interface MonthlyAttendanceTabProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  isLoading: boolean;
  monthlyReport: MonthlyAttendanceReport | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGroup: string;
  onGroupChange: (g: string) => void;
  filteredStudents: StudentMonthlyAttendance[];
  onPrint: () => void;
}

export const MonthlyAttendanceTab: React.FC<MonthlyAttendanceTabProps> = ({
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  isLoading,
  monthlyReport,
  searchQuery,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  filteredStudents,
  onPrint,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Toolbar Báo cáo Tháng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-slate-700 uppercase">Chọn thời gian:</label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
          >
            <option value={2026}>Năm 2026</option>
            <option value={2027}>Năm 2027</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={onPrint}
            variant="accent"
            size="md"
            className="text-xs font-black text-slate-950 shadow-md shadow-amber-500/20"
          >
            🖨️ IN BÁO CÁO A4 / XUẤT PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 print:hidden">
          <LoadingSpinner size="lg" text="Đang phân tích số liệu chuyên cần tháng..." />
        </div>
      ) : !monthlyReport ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 print:hidden">
          Không thể tải dữ liệu báo cáo tháng.
        </div>
      ) : (
        <>
          {/* 2. Summary Cards Tháng */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4 print:hidden">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Buổi học trong tháng</span>
              <p className="text-2xl font-black text-primary mt-1">
                {monthlyReport.totalSessions} <span className="text-xs font-semibold text-slate-400">buổi</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Tỷ lệ chuyên cần</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{monthlyReport.overallRate}%</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Lượt đi muộn</span>
              <p className="text-2xl font-black text-amber-500 mt-1">
                {monthlyReport.totalLate} <span className="text-xs font-semibold text-slate-400">lượt</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Nghỉ có phép</span>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {monthlyReport.totalExcused} <span className="text-xs font-semibold text-slate-400">lượt</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Nghỉ K.phép</span>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {monthlyReport.totalUnexcused} <span className="text-xs font-semibold text-slate-400">lượt</span>
              </p>
            </div>
          </div>

          {/* 3. Biểu Đồ 4 Tổ & Biểu Đồ Xu Hướng Ngày */}
          <div className="print:hidden">
            <MonthlyAttendanceChart report={monthlyReport} />
          </div>

          {/* 4. Thống kê phân loại lý do vắng mặt trong tháng */}
          {monthlyReport.topAbsenceReasons && monthlyReport.topAbsenceReasons.length > 0 && (
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-2xs print:hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  <h4 className="text-sm font-black text-slate-850 uppercase tracking-wide">
                    Cơ Cấu Lý Do Vắng Mặt & Đi Muộn Trong Tháng ({monthlyReport.topAbsenceReasons.reduce((acc, r) => acc + r.count, 0)} lượt ghi nhận)
                  </h4>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {monthlyReport.topAbsenceReasons.map((reasonItem) => (
                  <div
                    key={reasonItem.reason}
                    className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70 flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-slate-800 line-clamp-1" title={reasonItem.reason}>
                      {reasonItem.reason}
                    </span>
                    <div className="flex items-baseline justify-between mt-2 pt-1.5 border-t border-slate-200/60">
                      <span className="text-sm font-black text-primary">
                        {reasonItem.count} <span className="text-[10px] font-semibold text-slate-400">lượt</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {reasonItem.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Danh sách học sinh cần lưu ý */}
          {monthlyReport.atRiskStudents.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl shadow-2xs print:hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <h4 className="text-sm font-black text-rose-900 uppercase tracking-wide">
                  Danh Sách Học Sinh Cần Lưu Ý / Phối Hợp Phụ Huynh ({monthlyReport.atRiskStudents.length} em)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {monthlyReport.atRiskStudents.map((st) => (
                  <div key={st.studentId} className="bg-white p-3.5 rounded-2xl border border-rose-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-850">{st.fullName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                        {st.attendanceRate}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {st.groupName} • Muộn: <strong>{st.lateCount}</strong> • Phép: <strong>{st.excusedCount}</strong> • K.Phép:{' '}
                      <strong className="text-rose-600">{st.unexcusedCount}</strong>
                    </p>
                    {st.absenceDetails && st.absenceDetails.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-rose-100 flex flex-wrap gap-1">
                        {st.absenceDetails.map((d, i) => (
                          <span
                            key={i}
                            className="text-[9.5px] px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200/80 rounded"
                          >
                            {d.date.slice(8, 10)}/{d.date.slice(5, 7)}: {d.note || (d.status === 'excused_absence' ? 'Có phép' : 'K.phép')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Bảng Chi Tiết Toàn Bộ Học Sinh Trong Tháng */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">
                  📋 Bảng Theo Dõi Chuyên Cần Chi Tiết 47 Học Sinh
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thống kê tổng hợp số buổi có mặt, muộn và nghỉ học của từng em trong Tháng {monthlyReport.month}/{monthlyReport.year}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="🔍 Tìm tên học sinh..."
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none w-48"
                />

                <select
                  value={selectedGroup}
                  onChange={(e) => onGroupChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="all">Tất cả tổ</option>
                  <option value="Tổ 1">Tổ 1</option>
                  <option value="Tổ 2">Tổ 2</option>
                  <option value="Tổ 3">Tổ 3</option>
                  <option value="Tổ 4">Tổ 4</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3">Họ và tên</th>
                    <th className="p-3">Tổ</th>
                    <th className="p-3">Chức vụ</th>
                    <th className="p-3 text-center">Có mặt</th>
                    <th className="p-3 text-center">Đi muộn</th>
                    <th className="p-3 text-center">Có phép</th>
                    <th className="p-3 text-center">K.Phép</th>
                    <th className="p-3 text-right">Tỷ lệ chuyên cần</th>
                    <th className="p-3 text-left">Ghi chú vắng mặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => (
                    <tr key={st.studentId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-850">{st.fullName}</td>
                      <td className="p-3 font-medium text-slate-600">{st.groupName}</td>
                      <td className="p-3 font-semibold text-primary">{st.classRole}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">{st.presentCount}</td>
                      <td className="p-3 text-center font-bold text-amber-600">{st.lateCount}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{st.excusedCount}</td>
                      <td className="p-3 text-center font-bold text-rose-600">{st.unexcusedCount}</td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-black text-xs ${
                            st.attendanceRate >= 95
                              ? 'text-emerald-600'
                              : st.attendanceRate >= 90
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {st.attendanceRate}%
                        </span>
                      </td>
                      <td className="p-3 text-left">
                        {st.absenceDetails && st.absenceDetails.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {st.absenceDetails.slice(0, 2).map((d: AbsenceDetail, i: number) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-medium truncate max-w-[140px]"
                                title={`${d.date}: ${d.note || (d.status === 'excused_absence' ? 'Có phép' : 'K.phép')}`}
                              >
                                {d.date.slice(8, 10)}/{d.date.slice(5, 7)}: {d.note || (d.status === 'excused_absence' ? 'Có phép' : 'K.phép')}
                              </span>
                            ))}
                            {st.absenceDetails.length > 2 && (
                              <span className="text-[10px] font-bold text-slate-400">
                                +{st.absenceDetails.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
