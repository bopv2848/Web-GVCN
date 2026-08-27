import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/common/Button';
import type { UserRole } from '../../../types/auth';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('gvcn');
  const [email, setEmail] = useState('giaovien.12a1@thpt-thanhxuan.edu.vn');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary via-secondary to-indigo-950 font-sans">
      <div className="w-full max-w-md p-6 md:p-8 bg-white rounded-3xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-accent text-slate-950 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30">
            🚂
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">WEB GVCN 2.0</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Nền tảng Quản trị Lớp học Thông minh & Đồng hành Học sinh
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Chọn vai trò trải nghiệm:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all shadow-xs"
            >
              <option value="gvcn">👩‍🏫 Giáo viên Chủ nhiệm (Toàn quyền)</option>
              <option value="bancansu">🧑‍💼 Ban cán sự Lớp</option>
              <option value="bgh">🏛️ Ban giám hiệu (Chỉ đọc báo cáo)</option>
              <option value="parent">👨‍👩‍👦 Phụ huynh học sinh</option>
              <option value="student">🎓 Học sinh</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Email đăng nhập:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
              placeholder="nhap-email@truong.edu.vn"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Mật khẩu:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              VÀO HỆ THỐNG TRẢI NGHIỆM
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            🔒 Supabase Auth & RLS sẽ kết nối ở Phase 3
          </span>
        </div>
      </div>
    </div>
  );
};
