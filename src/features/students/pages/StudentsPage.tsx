import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const StudentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Quản lý Học sinh & Tổ thi đua
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Danh sách học sinh, phân chia tổ 1-4, nhập dữ liệu Excel và hồ sơ chi tiết.
          </p>
        </div>
      </div>

      <EmptyState
        icon="👥"
        title="Chưa có danh sách học sinh"
        description="Tính năng quản lý học sinh, phân tổ, import file Excel (.xlsx) với màn hình preview an toàn và lưu trữ ảnh avatar trên Private Storage sẽ được triển khai tại Giai đoạn 4."
        targetPhase="Phase 4 (Students & Excel Import)"
      />
    </div>
  );
};
