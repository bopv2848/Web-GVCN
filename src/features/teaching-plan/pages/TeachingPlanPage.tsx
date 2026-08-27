import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const TeachingPlanPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Lịch Báo Giảng Tiết Dạy
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Kế hoạch giảng dạy theo tuần, môn học, tên bài dạy, phân phối chương trình và giáo viên bộ môn.
        </p>
      </div>

      <EmptyState
        icon="📖"
        title="Chưa có lịch báo giảng tuần này"
        description="Mô-đun lịch báo giảng hợp nhất (loại bỏ mã trùng lặp) với các tab thứ 2 đến thứ 7 sẽ được triển khai tại Giai đoạn 7."
        targetPhase="Phase 7 (Unified Teaching Plan)"
      />
    </div>
  );
};
