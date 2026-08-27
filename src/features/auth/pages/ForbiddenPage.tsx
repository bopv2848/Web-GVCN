import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-16 text-center bg-white rounded-3xl border border-rose-100 shadow-sm max-w-2xl mx-auto my-6">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-4xl text-rose-600 mb-6 shadow-inner">
        🚫
      </div>
      <h2 className="text-2xl font-black text-slate-850 tracking-tight mb-2">
        403 - Quyền Truy Cập Bị Giới Hạn
      </h2>
      <p className="text-sm md:text-base text-slate-500 max-w-md mx-auto mb-6 leading-relaxed font-medium">
        Tài khoản của bạn không có thẩm quyền truy cập vào phân hệ này. Dữ liệu lớp học được bảo vệ nghiêm ngặt bởi chính sách an toàn thông tin giáo dục.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate(-1)} variant="outline" size="md">
          Quay lại trang trước
        </Button>
        <Button onClick={() => navigate('/')} variant="primary" size="md">
          Về Trang chủ Lớp
        </Button>
      </div>
    </div>
  );
};
