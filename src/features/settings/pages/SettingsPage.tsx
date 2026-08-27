import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Cài đặt Lớp & Hệ thống
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Cấu hình nhận diện lớp (Banner, Slogan, Chủ điểm tháng), tiêu chí thi đua, sao lưu và di chuyển dữ liệu cũ.
        </p>
      </div>

      <EmptyState
        icon="⚙️"
        title="Trung tâm Cấu hình & Sao lưu"
        description="Tính năng đổi theme màu sắc, quản trị tiêu chí cộng trừ điểm và công cụ import backup JSON cũ từ phiên bản trước sẽ hoạt động tại Giai đoạn 4 và Giai đoạn 8."
        targetPhase="Phase 4 & Phase 8 (Settings & Migration Engine)"
      />
    </div>
  );
};
