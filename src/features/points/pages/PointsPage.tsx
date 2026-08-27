import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const PointsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Tích điểm & Sổ cái Thi đua
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Ghi nhận điểm cộng/trừ cho cá nhân, tổ và cả lớp; hệ thống sổ cái Append-only với tính năng hoàn tác (Reversal).
        </p>
      </div>

      <EmptyState
        icon="⭐"
        title="Chưa có giao dịch tích điểm"
        description="Sổ cái điểm thi đua minh bạch (Append-only Ledger), hoàn tác không xóa lịch sử, âm thanh Ting-Ting và hiệu ứng pháo hoa Confetti sẽ hoạt động trong Giai đoạn 5."
        targetPhase="Phase 5 (Point Ledger & Transactions)"
      />
    </div>
  );
};
