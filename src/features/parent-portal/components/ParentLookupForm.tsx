import React, { useState } from 'react';
import { Button } from '../../../components/common/Button';

interface ParentLookupFormProps {
  onLookupByToken: (token: string) => Promise<void>;
  onLookupByCodeAndPin: (code: string, pin: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const ParentLookupForm: React.FC<ParentLookupFormProps> = ({
  onLookupByToken,
  onLookupByCodeAndPin,
  isLoading,
  errorMessage,
}) => {
  const [tab, setTab] = useState<'code_pin' | 'token'>('code_pin');
  const [studentCode, setStudentCode] = useState('');
  const [pin, setPin] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'code_pin') {
      onLookupByCodeAndPin(studentCode, pin);
    } else {
      onLookupByToken(tokenInput);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 md:p-8 space-y-6 animate-fade-in">
      {/* Icon & Title */}
      <div className="text-center space-y-1">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center text-3xl font-black shadow-inner mb-3">
          👨‍👩‍👦
        </div>
        <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
          Cổng Tra Cứu Phụ Huynh
        </h2>
        <p className="text-xs text-slate-500 font-semibold">
          Sổ liên lạc điện tử • Lớp 6A6 • Năm học 2026 - 2027
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab('code_pin')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            tab === 'code_pin'
              ? 'bg-white text-slate-850 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Mã HS & Mã PIN
        </button>
        <button
          type="button"
          onClick={() => setTab('token')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            tab === 'token'
              ? 'bg-white text-slate-850 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Mã Link Token
        </button>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl animate-shake">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'code_pin' ? (
          <>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                Mã học sinh của con *
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 6A601, 6A602..."
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black uppercase text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                required
              />
              <p className="text-[10.5px] text-slate-400 font-medium mt-1">
                (Mã định danh gồm 5 ký tự Thầy GVCN đã gửi)
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                Mã PIN bảo mật *
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="Nhập 4 số PIN bảo mật"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black tracking-widest text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                required
              />
              <p className="text-[10.5px] text-slate-400 font-medium mt-1">
                Gợi ý: Ngày sinh dạng DDMM (vd: 1503) hoặc 1234
              </p>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
              Dán mã liên kết Token từ Zalo *
            </label>
            <textarea
              rows={3}
              placeholder="Dán toàn bộ mã liên kết được GVCN chia sẻ..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
              required
            />
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading}
          className="w-full text-xs font-black tracking-wide shadow-md"
        >
          {isLoading ? 'Đang xác thực thông tin...' : '🔍 XEM KẾT QUẢ CỦA CON'}
        </Button>
      </form>

      {/* Support footer */}
      <div className="pt-3 border-t border-slate-100 text-center text-[11px] font-medium text-slate-400 space-y-1">
        <p>Thầy GVCN: <strong className="text-slate-600">Phan Văn Bộ</strong></p>
        <p className="text-[10px]">Trường THCS Nguyễn Văn Trỗi • Năm học 2026 - 2027</p>
      </div>
    </div>
  );
};
