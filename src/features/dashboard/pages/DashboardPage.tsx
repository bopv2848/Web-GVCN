import React from 'react';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import { useAuth } from '../../../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { currentClass } = useAuth();

  return (
    <div className="space-y-6">
      {/* Banner Top */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 mb-3 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider">
            {currentClass?.academicYear || 'Năm học 2026 - 2027'}
          </span>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
            {currentClass?.themeTitle || 'CHUYẾN TÀU THANH XUÂN'}
          </h1>
          <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
            Chào mừng Thầy đến với không gian quản trị thông minh Lớp 12A1. Sẵn sàng cho một ngày học tập hứng khởi!
          </p>
        </div>
      </div>

      {/* Overview Metric Cards (Empty / Real State Placeholders) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Sĩ số lớp</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 text-lg">👥</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-slate-800">--</span>
            <p className="text-xs text-slate-400 mt-1 font-medium">Chờ kết nối danh sách học sinh</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Chuyên cần hôm nay</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 text-lg">📅</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-slate-800">-- %</span>
            <p className="text-xs text-slate-400 mt-1 font-medium">Chưa có phiên điểm danh</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tổng điểm thi đua</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 text-lg">⭐</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-slate-800">--</span>
            <p className="text-xs text-slate-400 mt-1 font-medium">Sổ cái Append-only Phase 5</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Nhiệm vụ tuần</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 text-lg">✓</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-slate-800">--</span>
            <p className="text-xs text-slate-400 mt-1 font-medium">0 việc cần làm</p>
          </div>
        </Card>
      </div>

      {/* Main Empty State Content */}
      <EmptyState
        icon="📊"
        title="Tổng quan Lớp học chưa có dữ liệu"
        description="Ứng dụng đang ở Giai đoạn 1 (Nền tảng App Shell). Dữ liệu học sinh, điểm danh và sổ cái thi đua thời gian thực sẽ được kết nối ở Giai đoạn 4 và Giai đoạn 5."
        targetPhase="Phase 4 & Phase 5 (Supabase PostgreSQL)"
      />
    </div>
  );
};
