import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Sổ Theo dõi & Báo cáo Tổng kết
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Thống kê số liệu thực 100% theo ngày, tuần, tháng, học kỳ và xuất bảng in file PDF sắc nét.
        </p>
      </div>

      <EmptyState
        icon="📊"
        title="Chưa có dữ liệu tổng hợp báo cáo"
        description="Báo cáo tuần/tháng/học kỳ tính toán trực tiếp từ dữ liệu giao dịch thật (đã loại bỏ 100% Math.sin) và xuất PDF sẽ hoạt động trong Giai đoạn 5."
        targetPhase="Phase 5 (Real Data Reports & PDF Export)"
      />
    </div>
  );
};
