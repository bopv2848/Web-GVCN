import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { Button } from '../../../components/common/Button';

export const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email của Thầy/Cô.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await authService.resetPasswordForEmail(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Không thể gửi email khôi phục. Vui lòng kiểm tra lại địa chỉ email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary via-secondary to-indigo-950 font-sans">
      <div className="w-full max-w-md p-6 md:p-8 bg-white rounded-3xl shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
            🔑
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Khôi phục Mật khẩu</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Nhập email tài khoản để nhận liên kết đặt lại mật khẩu an toàn
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-sm font-medium leading-relaxed">
              ✅ Hệ thống đã gửi thư hướng dẫn khôi phục mật khẩu tới <strong>{email}</strong>. Vui lòng kiểm tra hộp thư (hoặc mục Spam).
            </div>
            <Button onClick={() => navigate('/login')} variant="primary" size="lg" className="w-full">
              QUAY LẠI ĐĂNG NHẬP
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed">
                ⚠️ {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Địa chỉ Email tài khoản:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all shadow-xs"
                placeholder="phanvanbo.6a6@thcs-tanhai.edu.vn"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              GỬI LIÊN KẾT KHÔI PHỤC
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                ← Quay lại màn hình Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
