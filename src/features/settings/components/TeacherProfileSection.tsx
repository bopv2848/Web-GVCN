import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/common/Button';
import { getUserInitial } from '../../../utils/userUtils';

export const TeacherProfileSection: React.FC = () => {
  const { user, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState<string>(user?.fullName || 'Thầy Phan Văn Bộ');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Đồng bộ lại khi user thay đổi
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || 'Thầy Phan Văn Bộ');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Xử lý chọn tệp ảnh chân dung
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn dung lượng 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Kích thước tệp ảnh không được vượt quá 5MB.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setSuccessMessage('Đã chọn ảnh chân dung mới. Thầy vui lòng bấm "Lưu Hồ Sơ GVCN" để hoàn tất.');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Không thể đọc tệp ảnh. Vui lòng thử lại với định dạng khác.');
    };
    reader.readAsDataURL(file);
  };

  // Xóa ảnh chân dung, quay về chữ cái "B"
  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSuccessMessage('Đã gỡ ảnh chân dung. Avatar sẽ hiển thị chữ cái "B" mặc định.');
  };

  // Lưu hồ sơ
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Họ và tên GVCN không được để trống.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });

      setSuccessMessage('✓ Đã cập nhật ảnh chân dung và hồ sơ GVCN thành công! Thanh Header đã được làm mới.');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Lỗi khi cập nhật hồ sơ giáo viên.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Tiêu đề mục */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xl shadow-2xs">
            👨‍🏫
          </div>
          <div>
            <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-850">
              Hồ Sơ & Ảnh Chân Dung Giáo Viên Chủ Nhiệm
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Tùy chỉnh thông tin GVCN và tải ảnh chân dung thật để hiển thị tại vòng tròn Avatar góc phải Header
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
          GVCN Chính Thức
        </span>
      </div>

      {/* Thông báo thành công / thất bại */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
          {/* Khu vực xem trước & tải ảnh */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary text-white flex items-center justify-center font-black text-4xl shadow-md overflow-hidden border-3 border-white ring-2 ring-primary/20 bg-gradient-to-br from-primary to-indigo-900">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName || 'GVCN'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getUserInitial(fullName)}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Tải ảnh chân dung"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary hover:bg-primary-hover active:scale-95 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-all"
              >
                <span className="text-xs">📷</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-[11px] font-bold shadow-2xs cursor-pointer"
              >
                Đổi ảnh chân dung
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[11px] font-semibold cursor-pointer"
                >
                  Gỡ ảnh
                </button>
              )}
            </div>

            <span className="text-[10px] text-slate-400 text-center max-w-[170px]">
              Ký tự mặc định: <strong>&quot;B&quot;</strong> (viết tắt Thầy Phan Văn Bộ). Tải ảnh chân dung để thay thế.
            </span>
          </div>

          {/* Các trường nhập thông tin */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Họ và tên Giáo viên chủ nhiệm:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-850 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-2xs"
                placeholder="Ví dụ: Thầy Phan Văn Bộ"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Số điện thoại / Zalo liên hệ:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-850 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-2xs"
                placeholder="Ví dụ: 0912 345 678"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Email tài khoản công vụ:
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'phanvanbo.6a6@thcs-tanhai.edu.vn'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Chức vụ & Lớp quản lý:
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold flex items-center justify-between">
                <span>GVCN • LỚP 6A6</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Toàn quyền</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nút lưu hồ sơ */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            className="font-black text-xs px-6 py-2.5 shadow-md shadow-primary/20 cursor-pointer flex items-center gap-1.5"
          >
            <span>💾</span>
            <span>{isSaving ? 'Đang lưu hồ sơ...' : 'LƯU HỒ SƠ & CẬP NHẬT ẢNH HEADER'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
