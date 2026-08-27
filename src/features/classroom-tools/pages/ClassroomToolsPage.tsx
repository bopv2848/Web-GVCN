import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';

export const ClassroomToolsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Bộ Công cụ Tương tác Tiết học
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Vòng quay ngẫu nhiên 3D, Thẻ bài gọi tên, Đồng hồ đếm ngược/bấm giờ, Chuông Tone.js và Pháo hoa ăn mừng.
        </p>
      </div>

      <EmptyState
        icon="🎲"
        title="Công cụ lớp học sẵn sàng khởi chạy"
        description="Vòng quay ngẫu nhiên, chuông báo tiết học Synthesizer Tone.js, bộ đếm giờ (đã sửa lỗi resetTimer) và hiệu ứng Canvas Confetti sẽ hoàn thiện ở Giai đoạn 7."
        targetPhase="Phase 7 (Classroom Tools & Tone.js)"
      />
    </div>
  );
};
