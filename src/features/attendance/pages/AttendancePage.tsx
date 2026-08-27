import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const AttendancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Điểm danh Chuyên cần
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Điểm danh nhanh 1 chạm theo ngày (Có mặt, Đi muộn, Vắng phép, Không phép), lưu người thực hiện và thời gian thực.
        </p>
      </div>

      <EmptyState
        icon="📅"
        title="Chưa có phiên điểm danh nào"
        description="Tính năng điểm danh theo ngày, điểm danh nhanh 1 chạm cả lớp và thống kê tỷ lệ hiện diện tự động sẽ hoạt động trong Giai đoạn 5."
        targetPhase="Phase 5 (Attendance Sessions)"
      />
    </div>
  );
};
