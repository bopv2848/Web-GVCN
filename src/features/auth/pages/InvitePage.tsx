import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService, type VerifyTokenResult } from '../../../services/authService';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useAuth } from '../../../hooks/useAuth';

export const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [tokenResult, setTokenResult] = useState<VerifyTokenResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenResult({ isValid: false, error: 'Không tìm thấy mã liên kết.' });
        setIsLoading(false);
        return;
      }

      try {
        const res = await authService.verifyInviteToken(token);
        setTokenResult(res);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setTokenResult({ isValid: false, error: error.message || 'Lỗi kiểm tra mã mời.' });
      } finally {
        setIsLoading(false);
      }
    }

    checkToken();
  }, [token]);

  const handleClaim = async () => {
    if (!token || !user) return;
    setIsClaiming(true);
    setClaimError('');
    try {
      await authService.claimInviteToken(token, user.id);
      setClaimSuccess(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setClaimError(error.message || 'Không thể liên kết tài khoản. Vui lòng thử lại.');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
        <LoadingSpinner size="lg" text="Đang kiểm tra mã mời liên kết phụ huynh..." />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary via-secondary to-indigo-950 font-sans">
      <div className="w-full max-w-md p-6 md:p-8 bg-white rounded-3xl shadow-2xl border border-white/20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-inner">
          👨‍👩‍👦
        </div>

        <h1 className="text-2xl font-black text-slate-850 tracking-tight mb-1">
          Liên kết Phụ huynh Học sinh
        </h1>
        <p className="text-xs text-slate-500 font-medium mb-6">
          Cổng kết nối Sổ liên lạc điện tử Web-GVCN
        </p>

        {!tokenResult?.isValid ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium leading-relaxed">
              ⚠️ {tokenResult?.error || 'Mã mời không hợp lệ hoặc đã hết hạn.'}
            </div>
            <Button onClick={() => navigate('/')} variant="outline" size="md" className="w-full">
              Về Trang chủ
            </Button>
          </div>
        ) : claimSuccess ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium leading-relaxed">
              🎉 <strong>Liên kết thành công!</strong> Quý phụ huynh đã được kết nối với hồ sơ của em <strong>{tokenResult.studentName}</strong>.
            </div>
            <Button onClick={() => navigate('/parent-portal')} variant="primary" size="lg" className="w-full">
              VÀO CỔNG TRA CỨU CON
            </Button>
          </div>
        ) : (
          <div className="space-y-5 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-500">Học sinh:</span>
                <span className="font-black text-slate-800">{tokenResult.studentName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-500">Lớp học:</span>
                <span className="font-bold text-primary">{tokenResult.className}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-500">Quan hệ:</span>
                <span className="font-bold text-slate-700">{tokenResult.relationship}</span>
              </div>
            </div>

            {claimError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {claimError}
              </div>
            )}

            {isAuthenticated ? (
              <Button
                onClick={handleClaim}
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isClaiming}
              >
                XÁC NHẬN LIÊN KẾT TÀI KHOẢN
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 text-center font-medium">
                  Vui lòng đăng nhập hoặc tạo tài khoản để hoàn tất liên kết:
                </p>
                <Button
                  onClick={() => navigate('/login', { state: { returnTo: `/invite/${token}` } })}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  ĐĂNG NHẬP ĐỂ LIÊN KẾT
                </Button>
              </div>
            )}

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                ← Quay lại Trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
