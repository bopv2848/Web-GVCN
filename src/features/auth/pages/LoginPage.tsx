import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/common/Button';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'teacher' | 'parent'>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [parentToken, setParentToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Lấy đường dẫn trước đó nếu bị redirect bởi ProtectedRoute
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = (location.state as any)?.from?.pathname || '/';

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setErrorMessage('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as { message?: string };
      if (error.message?.includes('Invalid login credentials')) {
        setErrorMessage('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
      } else {
        setErrorMessage(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra kết nối mạng.');
      }
    }
  };

  const handleParentTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentToken.trim()) {
      setErrorMessage('Vui lòng nhập mã liên kết phụ huynh.');
      return;
    }
    navigate(`/invite/${parentToken.trim()}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary via-secondary to-indigo-950 font-sans">
      <div className="w-full max-w-md p-6 md:p-8 bg-white rounded-3xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-accent text-slate-950 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30">
            🚂
          </div>
          <h1 className="text-2xl font-black text-slate-850 tracking-tight">WEB GVCN</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Nền tảng Quản trị Lớp học Thông minh & Đồng hành Học sinh
          </p>
        </div>

        {/* Tab Selection: Giáo viên / Phụ huynh */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => { setActiveTab('teacher'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'teacher'
                ? 'bg-white text-primary shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👩‍🏫 Giáo viên / BGH / BCS
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('parent'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'parent'
                ? 'bg-white text-primary shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👨‍👩‍👦 Phụ huynh Tra cứu
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-4 leading-relaxed flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Giáo viên / Nhân sự trường */}
        {activeTab === 'teacher' ? (
          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Email tài khoản:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all shadow-xs"
                placeholder="giaovien@thpt-thanhxuan.edu.vn"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Mật khẩu:
                </label>
                <Link
                  to="/reset-password"
                  className="text-[11px] font-bold text-accent hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all shadow-xs pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md shadow-primary/20"
                isLoading={isLoading}
              >
                ĐĂNG NHẬP HỆ THỐNG
              </Button>
            </div>

            {/* Quick Login for Testing */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                ⚡ Đăng nhập nhanh 1-Click (Dành cho Thầy nghiệm thu):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setEmail('gvcn.lop6a6@gmail.com');
                    setPassword('Gvcn6A6@2026');
                    login('gvcn.lop6a6@gmail.com', 'Gvcn6A6@2026').then(() => navigate(from, { replace: true })).catch((err) => setErrorMessage(err.message || 'Lỗi đăng nhập'));
                  }}
                  className="p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="text-[11px] font-black text-indigo-900 flex items-center gap-1">
                    <span>👩‍🏫</span> GVCN Lớp 6A6
                  </div>
                  <div className="text-[10px] text-indigo-600 font-medium truncate mt-0.5">
                    Thầy Phan Văn Bộ
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setEmail('bcs.lop6a6@gmail.com');
                    setPassword('Bcs6A6@2026');
                    login('bcs.lop6a6@gmail.com', 'Bcs6A6@2026').then(() => navigate(from, { replace: true })).catch((err) => setErrorMessage(err.message || 'Lỗi đăng nhập'));
                  }}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="text-[11px] font-black text-emerald-900 flex items-center gap-1">
                    <span>🧑‍🎓</span> Ban Cán Sự 6A6
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium truncate mt-0.5">
                    Lê Ngọc Anh
                  </div>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Form Phụ huynh tra cứu qua Token */
          <form onSubmit={handleParentTokenSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Mã liên kết / Token mời:
              </label>
              <input
                type="text"
                required
                value={parentToken}
                onChange={(e) => setParentToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all shadow-xs"
                placeholder="Nhập mã 16-32 ký tự nhận từ GVCN..."
              />
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                Mã mời được GVCN cấp riêng cho từng phụ huynh có thời hạn bảo mật 7 ngày.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full font-black text-slate-950"
              >
                TIẾP TỤC TRA CỨU CON
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Bảo mật Supabase Auth & Row Level Security
          </span>
        </div>
      </div>
    </div>
  );
};
