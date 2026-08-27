import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, isSessionExpired, refreshSession, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <LoadingSpinner size="lg" text="Đang xác thực phiên làm việc an toàn..." />
      </div>
    );
  }

  // Nếu phiên đăng nhập hết hạn
  if (isSessionExpired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-md w-full p-6 md:p-8 bg-white rounded-3xl shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-3xl">
            ⏳
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Phiên làm việc đã hết hạn</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Để bảo vệ dữ liệu học sinh, phiên đăng nhập của Thầy đã tự động khóa sau thời gian không hoạt động.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={logout} variant="outline" size="md">
              Đăng xuất
            </Button>
            <Button onClick={refreshSession} variant="primary" size="md">
              Làm mới phiên
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
