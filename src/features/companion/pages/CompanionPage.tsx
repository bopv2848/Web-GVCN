import React from 'react';
import { EmptyState } from '../../../components/common/EmptyState';
import { useAuth } from '../../../hooks/useAuth';

export const CompanionPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'gvcn' && user?.role !== 'admin') {
    return (
      <div className="p-6 md:p-12 text-center bg-white rounded-3xl border border-rose-200 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-3xl">
          🔒
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Khu vực Bảo mật Giới hạn</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          "Trạm đồng hành" chứa thông tin nhạy cảm của học sinh, chỉ Giáo viên Chủ nhiệm mới có quyền truy cập.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              Trạm Đồng Hành Học Sinh
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 uppercase">
              Bảo mật cấp cao
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Hồ sơ hỗ trợ học sinh có hoàn cảnh đặc biệt, nhật ký can thiệp và làm việc cùng gia đình.
          </p>
        </div>
      </div>

      <EmptyState
        icon="🛡️"
        title="Chưa có hồ sơ đồng hành nào"
        description="Mô-đun hồ sơ đồng hành được bảo vệ bởi Row Level Security (RLS), mã hóa dữ liệu riêng tư và cơ chế lưu trữ lịch sử sư phạm an toàn sẽ hoạt động tại Giai đoạn 6."
        targetPhase="Phase 6 (Companion Vault & RLS)"
      />
    </div>
  );
};
