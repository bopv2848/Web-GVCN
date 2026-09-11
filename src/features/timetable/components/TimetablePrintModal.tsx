import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { TimetableEntry } from '../../../types/timetable';

interface TimetablePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimetableEntry[];
  classNameTitle: string;
}

export const TimetablePrintModal: React.FC<TimetablePrintModalProps> = ({
  isOpen,
  onClose,
  entries,
  classNameTitle,
}) => {
  const days = [
    { day: 2, name: 'Thứ 2' },
    { day: 3, name: 'Thứ 3' },
    { day: 4, name: 'Thứ 4' },
    { day: 5, name: 'Thứ 5' },
    { day: 6, name: 'Thứ 6' },
  ];

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
          <div className="text-center pb-4 border-b border-slate-300 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              TRƯỜNG THCS TÂN HẢI
            </h3>
            <h2 className="text-xl font-black text-slate-900 mt-1 uppercase tracking-tight">
              THỜI KHÓA BIỂU {classNameTitle}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Năm học 2026 - 2027 • GVCN: Thầy Phan Văn Bộ
            </p>
          </div>

          {/* Bảng thời khóa biểu dạng in */}
          <table className="w-full text-xs border-collapse border border-slate-400 text-center">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-400 p-2 w-16">Buổi</th>
                <th className="border border-slate-400 p-2 w-14">Tiết</th>
                {days.map((d) => (
                  <th key={d.day} className="border border-slate-400 p-2 font-black">
                    {d.name}
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
