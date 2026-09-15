import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { Button } from '../../../components/common/Button';
import {
  getAcademicWeekInfo,
  getStoredAcademicWeekConfig,
  saveStoredAcademicWeekConfig,
  type AcademicWeekCustomConfig,
} from '../../../utils/academicWeekUtils';
import { Calendar, Clock, GraduationCap, RotateCcw, Save } from 'lucide-react';

interface AcademicWeekConfigSectionProps {
  classId: string;
}

export const AcademicWeekConfigSection: React.FC<AcademicWeekConfigSectionProps> = ({ classId }) => {
  const initial = getStoredAcademicWeekConfig();

  const [startDate, setStartDate] = useState<string>(initial.startDate || '2026-09-07');
  const [weekOffset, setWeekOffset] = useState<number>(initial.weekOffset ?? 0);
  const [semester1Weeks, setSemester1Weeks] = useState<number>(initial.semester1Weeks ?? 18);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tải cấu hình đã lưu từ Supabase Cloud khi mở trang
  useEffect(() => {
    let isMounted = true;
    async function loadCloudConfig() {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('theme_config')
          .eq('id', classId)
          .single();

        if (!error && data?.theme_config?.academicWeek && isMounted) {
          const conf = data.theme_config.academicWeek as AcademicWeekCustomConfig;
          if (conf.startDate) setStartDate(conf.startDate);
          if (typeof conf.weekOffset === 'number') setWeekOffset(conf.weekOffset);
          if (typeof conf.semester1Weeks === 'number') setSemester1Weeks(conf.semester1Weeks);
          saveStoredAcademicWeekConfig(conf);
        }
      } catch (err) {
        console.warn('Lỗi đọc cấu hình tuần học từ Supabase:', err);
      }
    }

    if (classId) {
      loadCloudConfig();
    }

    return () => {
      isMounted = false;
    };
  }, [classId]);

  // Xem trước kết quả tính toán tức thì theo dữ liệu đang chỉnh sửa
  const previewInfo = useMemo(() => {
    return getAcademicWeekInfo(new Date(), {
      startDate,
      weekOffset,
      semester1Weeks,
    });
  }, [startDate, weekOffset, semester1Weeks]);

  // Lưu cấu hình
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const newConfig: AcademicWeekCustomConfig = {
      startDate,
      weekOffset: Number(weekOffset) || 0,
      semester1Weeks: Number(semester1Weeks) || 18,
    };

    try {
      // 1. Lưu ngay vào bộ nhớ đệm LocalStorage & phát sự kiện cập nhật giao diện
      saveStoredAcademicWeekConfig(newConfig);

      // 2. Lưu đồng bộ lên Supabase Cloud trong cột theme_config của bảng classes
      const { data: classData } = await supabase
        .from('classes')
        .select('theme_config')
        .eq('id', classId)
        .single();

      const currentTheme = classData?.theme_config || {};
      const updatedTheme = {
        ...currentTheme,
        academicWeek: newConfig,
      };

      const { error: updateError } = await supabase
        .from('classes')
        .update({ theme_config: updatedTheme })
        .eq('id', classId);

      if (updateError) {
        console.warn('Cảnh báo: Không thể đồng bộ Supabase Cloud, cấu hình đã lưu nội bộ:', updateError);
      }

      setSuccessMessage('Đã lưu và áp dụng cấu hình tuần học thành công! Toàn bộ hệ thống đã được đồng bộ.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình tuần học:', err);
      setErrorMessage('Đã xảy ra lỗi khi lưu cấu hình. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Đặt lại mặc định
  const handleResetDefault = () => {
    const defaultConfig: AcademicWeekCustomConfig = {
      startDate: '2026-09-07',
      weekOffset: 0,
      semester1Weeks: 18,
    };
    setStartDate(defaultConfig.startDate!);
    setWeekOffset(defaultConfig.weekOffset!);
    setSemester1Weeks(defaultConfig.semester1Weeks!);
    saveStoredAcademicWeekConfig(defaultConfig);
    setSuccessMessage('Đã khôi phục cài đặt tuần học về mặc định (Bắt đầu 07/09/2026, 0 tuần bù, 18 tuần HK1).');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
      {/* Tiêu đề phần cấu hình */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <h3 className="text-base md:text-lg font-black text-slate-850 tracking-tight">
              Cấu Hình Tuần Học & Lịch Dạy Bù / Nghỉ Lễ
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Chủ động điều chỉnh ngày bắt đầu năm học hoặc cộng/trừ số tuần nghỉ Tết, thiên tai, dạy bù
          </p>
        </div>

        <Button
          type="button"
          onClick={handleResetDefault}
          variant="outline"
          size="sm"
          className="text-xs font-bold self-start sm:self-auto text-slate-600 hover:text-primary"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Đặt lại mặc định
        </Button>
      </div>

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

      {/* Live Preview kết quả trực quan */}
      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-indigo-50/70 border border-indigo-100">
        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 block mb-2">
          Xem trước kết quả hiển thị trên Trang Tổng quan (Live Preview):
        </span>

        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-50 text-blue-600">
            <Calendar className="w-4 h-4" />
          </span>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm">
            <span className="font-bold text-slate-800">
              Thứ Hai, ngày 14 tháng 09 năm 2026
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 inline" />
              <span>{previewInfo.weekLabel}</span>
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-primary">
              <Clock className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>16:48:00</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] font-medium text-slate-600 mt-2.5">
          👉 <strong>Khoảng ngày tuần hiện tại:</strong> Từ Thứ Hai ({previewInfo.weekStartDate}) đến Chủ Nhật ({previewInfo.weekEndDate}) • Niên khóa: {previewInfo.academicYear}
        </p>
      </div>

      {/* Form cấu hình chi tiết */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Ngày bắt đầu năm học (Tuần 1) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Ngày bắt đầu Tuần học 1 (Thứ Hai):
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none bg-white"
            />
            <p className="text-[11px] text-slate-500">
              Ngày Thứ Hai đầu tiên của năm học (mặc định ngày <strong>07/09/2026</strong> sau lễ Khai giảng 05/09).
            </p>
          </div>

          {/* 2. Số tuần thực học Học kỳ I */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Tổng số tuần thực học Học kỳ I:
            </label>
            <input
              type="number"
              min={12}
              max={22}
              required
              value={semester1Weeks}
              onChange={(e) => setSemester1Weeks(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-primary outline-none bg-white"
            />
            <p className="text-[11px] text-slate-500">
              Quy chuẩn THCS là <strong>18 tuần</strong>. Vượt qua số tuần này hệ thống sẽ tự động chuyển sang <strong>Học kỳ II</strong>.
            </p>
          </div>

          {/* 3. Độ lệch tuần (Week Offset - Nghỉ lễ / Dạy bù) */}
          <div className="md:col-span-2 space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Điều chỉnh Tuần Nghỉ lễ / Dạy bù (Độ lệch tuần):
              </label>
              <span className="text-xs font-black text-primary bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                Hiện tại: {weekOffset > 0 ? `+${weekOffset} tuần (Dạy bù)` : weekOffset < 0 ? `${weekOffset} tuần (Nghỉ lễ/Tết)` : '0 tuần (Chuẩn tiến độ)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Nếu trường nghỉ lễ/Tết kéo dài làm lùi tiến độ, Thầy/Cô chọn <strong>-1 hoặc -2</strong>. Nếu trường dạy bù hoặc đẩy sớm tiến độ, Thầy/Cô chọn <strong>+1 hoặc +2</strong>.
            </p>

            {/* Các nút chọn nhanh độ lệch */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { label: '-2 Tuần (Nghỉ dài)', val: -2 },
                { label: '-1 Tuần (Nghỉ Tết/Lễ)', val: -1 },
                { label: '0 Tuần (Chuẩn)', val: 0 },
                { label: '+1 Tuần (Dạy bù)', val: 1 },
                { label: '+2 Tuần (Đẩy tiến độ)', val: 2 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => setWeekOffset(btn.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    weekOffset === btn.val
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-slate-500 font-semibold">Tự nhập:</span>
                <input
                  type="number"
                  min={-10}
                  max={10}
                  value={weekOffset}
                  onChange={(e) => setWeekOffset(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-center rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Nút lưu cấu hình */}
        <div className="flex justify-end pt-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full sm:w-auto font-black px-6 shadow-md"
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-1.5" />
            LƯU CẤU HÌNH TUẦN HỌC
          </Button>
        </div>
      </form>
    </div>
  );
};
