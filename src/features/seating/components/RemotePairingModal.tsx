import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { RemoteSessionInfo } from '../services/seatingRemoteService';

export interface RemotePairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId?: string;
  className?: string;
  sessionInfo?: RemoteSessionInfo;
  session?: RemoteSessionInfo;
  isConnected: boolean;
  connectedDeviceName?: string;
}

export const RemotePairingModal: React.FC<RemotePairingModalProps> = ({
  isOpen,
  onClose,
  classId,
  className = '6A6',
  sessionInfo: sessionInfoProp,
  session: sessionProp,
  isConnected,
  connectedDeviceName,
}) => {
  const currentSession = sessionInfoProp || sessionProp;
  const currentClassId = classId || currentSession?.classId || 'default-class';
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [customHost, setCustomHost] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      // Ưu tiên IP LAN nếu người dùng đang truy cập qua IP LAN
      return window.location.host;
    }
    return 'localhost:3000';
  });
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Xây dựng link truy cập cho điện thoại
  const remoteUrl = currentSession
    ? `${window.location.protocol}//${customHost}/seating/remote?classId=${encodeURIComponent(
        currentClassId
      )}&session=${encodeURIComponent(currentSession.sessionId)}&pin=${encodeURIComponent(currentSession.pin)}`
    : '';

  useEffect(() => {
    if (!isOpen || !remoteUrl) return;

    QRCode.toDataURL(remoteUrl, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Lỗi sinh mã QR Remote:', err));
  }, [isOpen, remoteUrl]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && remoteUrl) {
      navigator.clipboard.writeText(remoteUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📱 Điều Khiển Từ Xa Bằng Điện Thoại / Máy Tính Bảng"
      size="lg"
    >
      <div className="space-y-5 text-slate-700">
        {/* Banner trạng thái kết nối */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
            isConnected
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              {isConnected ? (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                </>
              )}
            </span>
            <div>
              <p className="text-xs font-black">
                {isConnected ? '🟢 Đã kết nối Điện thoại thành công' : '⏳ Đang chờ Điện thoại quét mã...'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isConnected
                  ? `Thiết bị: ${connectedDeviceName || 'Điện thoại của Thầy'}`
                  : `Lớp: ${className} • Kênh Supabase Realtime WSS`}
              </p>
            </div>
          </div>
          {isConnected && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-black">
              Sẵn sàng điều khiển
            </span>
          )}
        </div>

        {/* Khung hiển thị QR Code */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-3xl border border-slate-200/80">
          <div className="shrink-0 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Mã QR Điều Khiển Từ Xa"
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                Đang tạo mã QR...
              </div>
            )}
          </div>

          <div className="space-y-3 w-full">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mã PIN xác thực</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3.5 py-1.5 bg-white border-2 border-primary/40 rounded-xl text-2xl font-black text-primary tracking-widest shadow-2xs">
                  {currentSession?.pin || '----'}
                </span>
                <span className="text-[11px] text-slate-400">Tự động điền khi quét camera</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ Host / Mạng LAN</p>
              <input
                type="text"
                value={customHost}
                onChange={(e) => setCustomHost(e.target.value.trim())}
                className="mt-1 w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary"
                title="Thay đổi IP LAN nếu điện thoại truy cập chung mạng WiFi (ví dụ: 192.168.1.10:3000)"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                💡 Nếu dùng WiFi trường, Thầy đổi `localhost` thành IP máy tính (vd: 10.228.215.227:3000).
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="w-full text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span>{isCopied ? '✅ Đã sao chép link' : '📋 Sao chép đường link Remote'}</span>
            </Button>
          </div>
        </div>

        {/* Hướng dẫn 3 bước */}
        <div className="space-y-1.5 text-xs text-slate-600 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/70">
          <p className="font-black text-amber-900 flex items-center gap-1.5">
            <span>💡</span>
            <span>Hướng dẫn sử dụng nhanh:</span>
          </p>
          <ul className="list-decimal list-inside space-y-1 text-[11.5px] text-amber-950">
            <li>Dùng ứng dụng Camera hoặc Zalo trên điện thoại quét mã QR phía trên.</li>
            <li>Bàn điều khiển mở ra ngay trên điện thoại, không cần mật khẩu.</li>
            <li>Thầy có thể thoải mái đứng giữa lớp giảng bài và bấm nút bốc thăm hoặc đếm ngược!</li>
          </ul>
        </div>

        {/* Nút đóng */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="primary" size="md" onClick={onClose} className="text-xs font-black">
            Đã hiểu & Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
