import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const RewardsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Shop Đổi quà từ Sao Tích lũy
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Danh mục quà tặng khích lệ học tập, giá sao, tồn kho và lịch sử đổi quà của học sinh.
        </p>
      </div>

      <EmptyState
        icon="🎁"
        title="Cửa hàng quà tặng đang trống"
        description="Tính năng thiết lập danh mục quà tặng, đổi quà trừ sao và phê duyệt yêu cầu đổi quà của học sinh sẽ được kết nối ở Giai đoạn 5."
        targetPhase="Phase 5 (Rewards & Redemptions)"
      />
    </div>
  );
};
