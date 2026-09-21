import React from 'react';
import type { Student } from '../../../types/student';
import type { SeatingMedicalAnalysis } from '../../../types/seating';
import { Button } from '../../../components/common/Button';

interface StudentMedicalModalProps {
  student: Student | null;
  medicalAnalysis: SeatingMedicalAnalysis;
  sickReasonMap: Map<string, string>;
  onClose: () => void;
}

export const StudentMedicalModal: React.FC<StudentMedicalModalProps> = ({
  student,
  medicalAnalysis,
  sickReasonMap,
  onClose,
}) => {
  if (!student) return null;

  const isSick = medicalAnalysis.sickStudentIds.has(student.id);
  const isAtRisk = medicalAnalysis.atRiskNeighborStudentIds.has(student.id);
  const firstChar = student.fullName.charAt(student.fullName.lastIndexOf(' ') + 1) || 'H';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg font-black">
            {firstChar}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-850">{student.fullName}</h3>
            <p className="text-xs text-slate-500 font-semibold">
              {student.gender} • {student.groupName} • {student.classRole}
            </p>
          </div>
        </div>

        {/* Trạng thái y tế */}
        {isSick ? (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 text-rose-900">
            <span className="font-black block">🔴 Đang nghỉ ốm sốt theo mùa</span>
            <p className="text-[11px] text-rose-800">
              Lý do ghi nhận: {sickReasonMap.get(student.id) || 'Ốm sốt'}
            </p>
          </div>
        ) : isAtRisk ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1 text-amber-900">
            <span className="font-black block">⚠️ Ngồi cạnh học sinh đang nghỉ ốm</span>
            <p className="text-[11px] text-amber-800">
              Khuyến nghị: Nhắc nhở em đeo khẩu trang trong giờ học, kiểm tra thân nhiệt đầu giờ và bố trí ngồi giãn cách nếu có bàn trống.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold">
            ✅ Sức khỏe bình thường • Không ghi nhận triệu chứng
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
