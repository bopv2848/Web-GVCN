import React, { useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { TimetableEntry } from '../../../types/timetable';
import { getSchoolWeekDays, type AcademicWeekInfo } from '../../../utils/academicWeekUtils';

interface TimetablePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimetableEntry[];
  classNameTitle: string;
  schoolName?: string;
  logoUrl?: string;
  academicWeek?: AcademicWeekInfo;
}

export const TimetablePrintModal: React.FC<TimetablePrintModalProps> = ({
  isOpen,
  onClose,
  entries,
  classNameTitle,
  schoolName = 'TRƯỜNG THCS TÂN HẢI',
  logoUrl = '/logo-truong-thcs-Tan-Hai.jpg',
  academicWeek,
}) => {
  const days = useMemo(() => {
    if (academicWeek?.mondayDate) {
      return getSchoolWeekDays(academicWeek.mondayDate);
    }
    return [
      { day: 2, name: 'Thứ 2', dateStr: '', fullDateStr: '', isToday: false },
      { day: 3, name: 'Thứ 3', dateStr: '', fullDateStr: '', isToday: false },
      { day: 4, name: 'Thứ 4', dateStr: '', fullDateStr: '', isToday: false },
      { day: 5, name: 'Thứ 5', dateStr: '', fullDateStr: '', isToday: false },
      { day: 6, name: 'Thứ 6', dateStr: '', fullDateStr: '', isToday: false },
    ];
  }, [academicWeek]);

  const morningPeriods = [1, 2, 3, 4, 5];
  const afternoonPeriods = [6, 7, 8];

  const getSubject = (day: number, period: number) => {
    return entries.find((e) => e.dayOfWeek === day && e.period === period)?.subjectName || '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bản In Thời Khóa Biểu Chuẩn Sư Phạm">
      <div className="space-y-4">
        {/* Vùng xem trước bản in */}
        <div className="p-6 bg-white border border-slate-300 rounded-2xl text-slate-900 font-sans print:p-0 print:border-none">
          <div className="flex items-center justify-between pb-4 border-b border-slate-300 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="Logo Trường"
                className="w-14 h-14 object-contain rounded-full border border-slate-300 shadow-xs"
              />
              <div className="text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {schoolName}
                </h3>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  THỜI KHÓA BIỂU {classNameTitle}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                {academicWeek?.fullAppliedText || 'Tuần 2, áp dụng từ ngày 14 tháng 9 năm 2026'}
              </p>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Năm học {academicWeek?.academicYear || '2026 - 2027'}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                GVCN: Thầy Phan Văn Bộ
              </p>
            </div>
          </div>

          {/* Bảng thời khóa biểu dạng in */}
          <table className="w-full text-xs border-collapse border border-slate-400 text-center">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-400 p-2 w-16">Buổi</th>
                <th className="border border-slate-400 p-2 w-14">Tiết</th>
                {days.map((d) => (
                  <th key={d.day} className="border border-slate-400 p-2 font-black">
                    <div>{d.name}</div>
                    {d.dateStr && (
                      <div className="text-[10px] font-medium text-slate-600">
                        ({d.dateStr})
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Buổi sáng */}
              {morningPeriods.map((p, idx) => (
                <tr key={p}>
                  {idx === 0 && (
                    <td
                      rowSpan={5}
                      className="border border-slate-400 p-2 font-black bg-slate-50 uppercase tracking-widest text-[11px]"
                    >
                      Sáng
                    </td>
                  )}
                  <td className="border border-slate-400 p-1.5 font-bold bg-slate-50">
                    Tiết {p}
                  </td>
                  {days.map((d) => (
                    <td key={d.day} className="border border-slate-400 p-1.5 font-semibold">
                      {getSubject(d.day, p)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Ngăn cách buổi */}
              <tr className="bg-slate-200/60 font-bold text-[10px]">
                <td colSpan={7} className="border border-slate-400 py-1 text-slate-600">
                  --- NGHỈ TRƯA & BÁN TRÚ ---
                </td>
              </tr>

              {/* Buổi chiều */}
              {afternoonPeriods.map((p, idx) => (
                <tr key={p}>
                  {idx === 0 && (
                    <td
                      rowSpan={3}
                      className="border border-slate-400 p-2 font-black bg-slate-50 uppercase tracking-widest text-[11px]"
                    >
                      Chiều
                    </td>
                  )}
                  <td className="border border-slate-400 p-1.5 font-bold bg-slate-50">
                    Tiết {p - 5}
                  </td>
                  {days.map((d) => (
                    <td key={d.day} className="border border-slate-400 p-1.5 font-semibold">
                      {getSubject(d.day, p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Chữ ký xác nhận */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 text-center text-xs">
            <div>
              <p className="font-bold uppercase text-slate-600">HIỆU TRƯỞNG DUYỆT</p>
              <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold uppercase text-slate-600">GIÁO VIÊN CHỦ NHIỆM</p>
              <p className="text-[10px] text-slate-400 italic mt-0.5">Thầy Phan Văn Bộ</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
          <Button size="sm" onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white">
            🖨️ In Ngay (Print A4)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
