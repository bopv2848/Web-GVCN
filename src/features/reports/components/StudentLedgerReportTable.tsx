import React, { useState, useMemo } from 'react';
import type { StudentReportStat } from '../types';
import { Button } from '../../../components/common/Button';

interface StudentLedgerReportTableProps {
  students: StudentReportStat[];
  onExportExcel: () => void;
}

export const StudentLedgerReportTable: React.FC<StudentLedgerReportTableProps> = ({
  students,
  onExportExcel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Lấy danh sách tổ duy nhất
  const groupOptions = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => {
      if (s.groupId) map.set(s.groupId, s.groupName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [students]);

  // Lọc học sinh
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGroup = selectedGroup === 'all' || s.groupId === selectedGroup;
      return matchSearch && matchGroup;
    });
  }, [students, searchQuery, selectedGroup]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5 md:p-6">
      {/* 1. Header & Bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base md:text-lg font-black text-slate-850 tracking-tight flex items-center gap-2">
            <span>📋</span> Bảng Đối Soát Sổ Cái 47 Học Sinh
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Chi tiết điểm cộng/trừ thi đua và thống kê chuyên cần từng em trong lớp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onExportExcel} variant="primary" size="sm" className="text-xs font-bold shadow-xs">
            📥 Xuất File Excel (.xlsx)
          </Button>
        </div>
      </div>

      {/* 2. Thanh tìm kiếm & lọc tổ */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Tìm tên hoặc mã học sinh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tất cả 4 Tổ</option>
            {groupOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
            {filteredStudents.length}/{students.length} HS
          </span>
        </div>
      </div>

      {/* 3. Bảng dữ liệu chi tiết */}
      <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-black uppercase text-[10.5px] tracking-wider border-b border-slate-200">
              <th className="p-3 text-center w-12">Hạng</th>
              <th className="p-3 w-24">Mã HS</th>
              <th className="p-3">Họ và tên</th>
              <th className="p-3 w-28">Tổ</th>
              <th className="p-3 w-28">Chức vụ</th>
              <th className="p-3 text-center w-24">Điểm thi đua</th>
              <th className="p-3 text-center w-16">Sao</th>
              <th className="p-3 text-center w-16">Muộn</th>
              <th className="p-3 text-center w-16">Có phép</th>
              <th className="p-3 text-center w-16">K.Phép</th>
              <th className="p-3 text-center w-24">Chuyên cần</th>
              <th className="p-3 text-center w-28">Nề nếp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-8 text-center text-slate-400 italic">
                  Không tìm thấy học sinh phù hợp với bộ lọc tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.studentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-center font-black text-slate-700">{s.rank}</td>
                  <td className="p-3 font-mono font-bold text-slate-500">{s.code}</td>
                  <td className="p-3 font-black text-slate-850">{s.fullName}</td>
                  <td className="p-3 font-bold text-slate-600">{s.groupName}</td>
                  <td className="p-3 text-slate-500">{s.classRole}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-black text-xs ${
                        s.totalPoints > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.totalPoints < 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.totalPoints > 0 ? `+${s.totalPoints}` : s.totalPoints}
                    </span>
                  </td>
                  <td className="p-3 text-center font-black text-amber-600">⭐ {s.stars}</td>
                  <td className="p-3 text-center font-bold text-slate-700">
                    {s.lateCount > 0 ? <span className="text-amber-600">{s.lateCount}</span> : '-'}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-700">
                    {s.excusedCount > 0 ? s.excusedCount : '-'}
                  </td>
                  <td className="p-3 text-center font-bold">
                    {s.unexcusedCount > 0 ? (
                      <span className="text-rose-600 font-black">{s.unexcusedCount}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-3 text-center font-black text-emerald-700">
                    {s.attendanceRate}%
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                        s.conductAssessment === 'Tốt'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.conductAssessment === 'Khá'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.conductAssessment}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
