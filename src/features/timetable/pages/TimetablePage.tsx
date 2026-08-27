import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const TimetablePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Thời khóa biểu Tuần
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Lịch học các thứ trong tuần, tiết sáng/chiều, phòng học và nhập file Excel TKB có cấu trúc.
        </p>
      </div>

      <EmptyState
        icon="🗓️"
        title="Chưa có dữ liệu thời khóa biểu"
        description="Tính năng xem TKB tuần, nhập file Excel tự động phân tích môn học và giáo viên phụ trách sẽ được tích hợp ở Giai đoạn 7."
        targetPhase="Phase 7 (Timetable & Excel Parser)"
      />
    </div>
  );
};
