import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const OfflineBanner: React.FC = () => {
  const { isOffline } = useAuth();

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2 animate-slide-up sticky top-0 z-50">
      <span>📡</span>
      <span>Đang mất kết nối Internet. Dữ liệu của Thầy/Cô được lưu tạm an toàn trên thiết bị.</span>
    </div>
  );
};
