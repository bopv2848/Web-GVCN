import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { classConfigService } from '../services/classConfigService';
import { classConfigSchema, type ClassConfigFormData } from '../schemas/classConfigSchema';
import { storageService } from '../../../services/storageService';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const SettingsPage: React.FC = () => {
  const { currentClass, user, updateCurrentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const [formData, setFormData] = useState<ClassConfigFormData>({
    name: 'LỚP 6A6',
    schoolName: 'TRƯỜNG THCS TÂN HẢI',
    schoolAddress: 'Xã Tân Hải, Tỉnh Lâm Đồng',
    schoolPhone: '',
    academicYear: '2026 - 2027',
    gradeLevel: 6,
    themeMonth: 'CHỦ ĐIỂM THÁNG 9: MÁI TRƯỜNG MẾN YÊU',
    themeTitle: 'CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ',
    bannerColorClass: 'from-[#1e1b4b] to-[#312e81]',
    bannerUrl: null,
    logoUrl: '/logo-truong-thcs-Tan-Hai.jpg',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Tải cấu hình lớp
  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = await classConfigService.getClassConfig(classId);
      setFormData(config);
      setHasBackup(Boolean(classConfigService.getPreviousConfigBackup(classId)));
    } catch (err) {
      console.warn('Lỗi tải cấu hình:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Xử lý tải lên Logo trường
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setErrorMessage('');
    try {
      const url = await storageService.uploadSchoolLogo(file, classId);
      setFormData((prev) => ({ ...prev, logoUrl: url }));
      setSuccessMessage('Đã tải ảnh logo trường thành công! Nhớ bấm "Lưu Thay Đổi" để cập nhật hệ thống.');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Không thể tải logo trường lên.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Đặt lại logo mặc định THCS Tân Hải
  const handleResetDefaultLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '/logo-truong-thcs-Tan-Hai.jpg' }));
    setSuccessMessage('Đã chọn Logo chính thức TRƯỜNG THCS TÂN HẢI. Nhớ bấm "Lưu Thay Đổi" để áp dụng.');
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    setErrorMessage('');
    try {
      const url = await storageService.uploadClassBanner(file, classId);
      setFormData((prev) => ({ ...prev, bannerUrl: url }));
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Không thể tải banner lên.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const validation = classConfigSchema.safeParse(formData);
    if (!validation.success) {
      setErrorMessage(validation.error.errors[0]?.message || 'Dữ liệu không hợp lệ.');
      return;
    }

    setIsSaving(true);
    try {
      await classConfigService.updateClassConfig(classId, validation.data);

      // Cập nhật ngay AuthContext để Header phía trên đổi tức thì mà không cần F5
      if (updateCurrentClass) {
        updateCurrentClass({
          name: validation.data.name,
          schoolName: validation.data.schoolName,
          themeTitle: validation.data.themeTitle,
          logoUrl: validation.data.logoUrl || '/logo-truong-thcs-Tan-Hai.jpg',
          academicYear: validation.data.academicYear,
        });
      }

      setSuccessMessage('Đã lưu và cập nhật cấu hình Trường & Lớp học thành công!');
      setHasBackup(true);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Không thể cập nhật cấu hình.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestorePrevious = () => {
    const backup = classConfigService.getPreviousConfigBackup(classId);
    if (backup) {
      setFormData(backup);
      setSuccessMessage('Đã nạp lại bản sao lưu cấu hình trước đó. Bấm "Lưu Thay Đổi" để áp dụng.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <LoadingSpinner size="lg" text="Đang tải cấu hình nhận diện lớp học..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
            Cấu Hình & Nhận Diện Lớp Học
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Tùy biến tên trường, tên lớp, chủ điểm tháng, màu sắc nhận diện và hình ảnh banner
          </p>
        </div>

        {hasBackup && (
          <Button
            type="button"
            onClick={handleRestorePrevious}
            variant="outline"
            size="sm"
            className="text-xs font-bold whitespace-nowrap"
          >
            ↩️ Khôi phục cấu hình trước
          </Button>
        )}
      </div>

      {/* Live Preview Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
          Xem trước giao diện Banner trực tiếp (Live Preview):
        </span>

        <div
          className={`p-6 md:p-8 rounded-3xl bg-gradient-to-r ${formData.bannerColorClass} text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[170px]`}
          style={{
            backgroundImage: formData.bannerUrl
              ? `linear-gradient(rgba(30, 27, 75, 0.75), rgba(49, 46, 129, 0.85)), url(${formData.bannerUrl})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <img
                src={formData.logoUrl || '/logo-truong-thcs-Tan-Hai.jpg'}
                alt="Logo preview"
                className="w-8 h-8 rounded-full border border-white/40 object-contain bg-white/10"
              />
              <span className="text-[11px] font-black tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                {formData.schoolName} • {formData.academicYear}
              </span>
            </div>
            <span className="text-xs font-black text-amber-400 bg-black/30 px-3 py-1 rounded-full">
              ⭐ {formData.themeMonth}
            </span>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-400 drop-shadow-md">
              {formData.name} - {formData.themeTitle}
            </h1>
            <p className="text-xs text-indigo-200 font-semibold mt-1">
              GVCN: {user?.fullName || 'Thầy Phan Văn Bộ'} • {formData.schoolAddress || 'Xã Tân Hải, Tỉnh Lâm Đồng'}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PHẦN 1: QUẢN LÝ LOGO VÀ THÔNG TIN NHÀ TRƯỜNG */}
        <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏫</span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
              1. Thông Tin & Logo Nhà Trường
            </h3>
          </div>

          {/* Khối quản lý Logo Trường */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white rounded-xl border border-slate-200">
            <div className="relative group flex-shrink-0">
              <img
                src={formData.logoUrl || '/logo-truong-thcs-Tan-Hai.jpg'}
                alt="Logo trường"
                className="w-20 h-20 object-contain rounded-full border-2 border-primary/30 shadow-md bg-slate-50 p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-truong-thcs-Tan-Hai.jpg';
                }}
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-black bg-emerald-600 text-white rounded-full">
                Logo
              </span>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Huy hiệu / Biểu trưng chính thức của Trường
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hiển thị trên thanh Header góc trên, Báo cáo A4, Sơ đồ chỗ ngồi, Phiếu chuyên cần và Thời khóa biểu.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-secondary transition-colors shadow-xs">
                  <span>📷 Tải logo mới lên</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleResetDefaultLogo}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 border border-slate-300 transition-colors"
                >
                  🔄 Dùng Logo THCS Tân Hải gốc
                </button>
              </div>

              {isUploadingLogo && (
                <p className="text-xs text-amber-600 font-bold">Đang tải logo lên đám mây...</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Tên trường */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Tên Trường học:
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none"
                placeholder="vd: TRƯỜNG THCS TÂN HẢI"
              />
            </div>

            {/* Địa chỉ trường */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Địa chỉ trường học:
              </label>
              <input
                type="text"
                value={formData.schoolAddress || ''}
                onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none"
                placeholder="vd: Xã Tân Hải, Tỉnh Lâm Đồng"
              />
            </div>

            {/* Số điện thoại trường */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Số điện thoại / Hotline nhà trường:
              </label>
              <input
                type="text"
                value={formData.schoolPhone || ''}
                onChange={(e) => setFormData({ ...formData, schoolPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none"
                placeholder="vd: 02633.xxx.xxx"
              />
            </div>

            {/* Niên khóa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Niên khóa học tập:
              </label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none"
                placeholder="vd: 2026 - 2027"
              />
            </div>
          </div>
        </div>

        {/* PHẦN 2: THÔNG TIN & NHẬN DIỆN LỚP HỌC */}
        <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
              2. Thông Tin & Khẩu Hiệu Lớp Chủ Nhiệm
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên lớp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Tên Lớp học:
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none"
                placeholder="vd: LỚP 6A6"
              />
            </div>

            {/* Khối lớp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Khối lớp (Grade):
              </label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none bg-white"
              >
                {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Khối {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Khẩu hiệu / Tiêu đề theme */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Khẩu hiệu / Slogan / Tên chủ đề lớp:
              </label>
              <input
                type="text"
                required
                value={formData.themeTitle}
                onChange={(e) => setFormData({ ...formData, themeTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none"
                placeholder="vd: CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Dòng khẩu hiệu hiển thị ngay trên đầu trang Tổng quan (Dashboard) và thanh tiêu đề lớp.
              </p>
            </div>

            {/* Chủ điểm tháng */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Chủ điểm hoạt động tháng:
              </label>
              <input
                type="text"
                required
                value={formData.themeMonth}
                onChange={(e) => setFormData({ ...formData, themeMonth: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none"
                placeholder="vd: CHỦ ĐIỂM THÁNG 9: MÁI TRƯỜNG MẾN YÊU"
              />
            </div>
          </div>
        </div>

        {/* PHẦN 3: GIAO DIỆN & BANNER LỚP */}
        <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎨</span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
              3. Giao Diện & Hình Nền Banner Lớp
            </h3>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tải ảnh nền Banner tùy biến (Tối đa 5MB):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBannerUpload}
                disabled={isUploadingBanner}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
              />
              {formData.bannerUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bannerUrl: null })}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Gỡ ảnh banner (Dùng màu nền)
                </button>
              )}
            </div>
            {isUploadingBanner && <p className="text-xs text-amber-600 font-bold">Đang tải ảnh banner lên...</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto font-black px-8"
            isLoading={isSaving}
          >
            💾 LƯU CẤU HÌNH NHẬN DIỆN
          </Button>
        </div>
      </form>
    </div>
  );
};
