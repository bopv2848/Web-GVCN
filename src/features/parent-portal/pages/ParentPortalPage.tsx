import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const ParentPortalPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Cổng Tra cứu Dành cho Phụ huynh
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Xem thông tin chuyên cần, điểm thưởng và nhận xét của riêng con em thông qua liên kết mã mời bảo mật.
        </p>
      </div>

      <EmptyState
        icon="👨‍👩‍👦"
        title="Không gian kết nối Gia đình & Nhà trường"
        description="Cổng tra cứu phụ huynh với cơ chế liên kết tài khoản qua Token bảo mật (thay thế mã 5 số cũ), nhận thông báo tức thì sẽ được triển khai tại Giai đoạn 6."
        targetPhase="Phase 6 (Secure Parent Portal)"
      />
    </div>
  );
};
