import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const SeatingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Sơ đồ Chỗ ngồi Lớp học
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Bố trí sơ đồ bàn học trực quan, kéo thả học sinh (Drag & Drop) mượt mà trên cả máy tính và điện thoại.
        </p>
      </div>

      <EmptyState
        icon="🪑"
        title="Chưa thiết lập sơ đồ lớp"
        description="Tính năng xếp chỗ ngồi kéo thả bằng cảm ứng và chuột, tự động xếp chỗ nam nữ và thu hồi chỗ ngồi sẽ được triển khai tại Giai đoạn 7."
        targetPhase="Phase 7 (Seating & Interactive Tools)"
      />
    </div>
  );
};
