import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { PointCategory } from '../../../types/points';
import { pointsService } from '../services/pointsService';

export interface EditCriteriaFormProps {
  isOpen: boolean;
  onClose: () => void;
  category: PointCategory | null;
  onCategoryUpdated: (updatedCategory: PointCategory) => void;
}

export const EditCriteriaForm: React.FC<EditCriteriaFormProps> = ({
  isOpen,
  onClose,
  category,
  onCategoryUpdated,
}) => {
  const [title, setTitle] = useState<string>('');
  const [categoryGroup, setCategoryGroup] = useState<'Học tập' | 'Nề nếp' | 'Phong trào' | 'Đột xuất'>('Nề nếp');
  const [points, setPoints] = useState<number>(5);
  const [stars, setStars] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && category) {
      setTitle(category.title);
      setCategoryGroup(category.categoryGroup);
      setPoints(Math.abs(category.defaultPoints) || 1);
      setStars(Math.abs(category.defaultStars) || 0);
      setErrorMessage('');
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 80);
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  const isAdd = category.type === 'add';

  const handleQuickPoints = (val: number) => {
    setPoints(Math.max(1, Math.min(100, val)));
  };

  const handleAdjustPoints = (delta: number) => {
    setPoints((prev) => Math.max(1, Math.min(100, prev + delta)));
  };

  const handleQuickStars = (val: number) => {
    setStars(Math.max(0, Math.min(50, val)));
  };

  const handleAdjustStars = (delta: number) => {
    setStars((prev) => Math.max(0, Math.min(50, prev + delta)));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMessage('Vui lòng nhập tên tiêu chí.');
      titleInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const updatedData = {
        title: cleanTitle,
        categoryGroup,
        defaultPoints: Math.max(1, points),
        defaultStars: isAdd ? Math.max(0, stars) : 0,
      };

      const result = await pointsService.updateCategory(category.id, updatedData);

      const finalUpdatedCat: PointCategory = result || {
        ...category,
        title: cleanTitle,
        categoryGroup,
        defaultPoints: updatedData.defaultPoints,
        defaultStars: updatedData.defaultStars,
      };

      onCategoryUpdated(finalUpdatedCat);
      onClose();
    } catch (err: unknown) {
      console.error('Lỗi khi cập nhật tiêu chí:', err);
      setErrorMessage('Không thể lưu cập nhật. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdd ? '🌟 Điều Chỉnh Tiêu Chí Khen Thưởng' : '⚠️ Điều Chỉnh Tiêu Chí Vi Phạm'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold rounded-xl">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* 1. Tên tiêu chí */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
            Tên tiêu chí <span className="text-rose-500">*</span>:
          </label>
          <input
            ref={titleInputRef}
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Nhập tên tiêu chí thi đua..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* 2. Nhóm tiêu chí */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
            Nhóm lĩnh vực:
          </label>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {(['Học tập', 'Nề nếp', 'Phong trào', 'Đột xuất'] as const).map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setCategoryGroup(grp)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  categoryGroup === grp
                    ? isAdd
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Điểm cộng / Điểm trừ */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-slate-700">
              {isAdd ? 'Điểm thưởng mặc định (+đ):' : 'Điểm trừ mặc định (-đ):'}
            </label>
            <span
              className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                isAdd ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isAdd ? `+${points} điểm` : `-${points} điểm`}
            </span>
          </div>

          {/* Stepper + Input */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjustPoints(-5)}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              title="Giảm 5 điểm"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => handleAdjustPoints(-1)}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              title="Giảm 1 điểm"
            >
              -1
            </button>
            <input
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="flex-1 py-2 text-center rounded-xl border border-slate-300 font-black text-slate-850 text-base outline-none focus:border-primary bg-white"
            />
            <button
              type="button"
              onClick={() => handleAdjustPoints(1)}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              title="Tăng 1 điểm"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => handleAdjustPoints(5)}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              title="Tăng 5 điểm"
            >
              +5
            </button>
          </div>

          {/* Chọn nhanh mốc điểm */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Mốc nhanh:</span>
            {[2, 3, 5, 10, 15, 20].map((pVal) => (
              <button
                key={pVal}
                type="button"
                onClick={() => handleQuickPoints(pVal)}
                className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  points === pVal
                    ? isAdd
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isAdd ? `+${pVal}đ` : `-${pVal}đ`}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Số sao thưởng (chỉ hiển thị cho điểm cộng) */}
        {isAdd && (
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-1">
                <span>⭐</span>
                <span>Số sao thưởng mặc định:</span>
              </label>
              <span className="text-sm font-black px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                ⭐ {stars} sao
              </span>
            </div>

            {/* Stepper + Input */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjustStars(-1)}
                className="px-3 py-2 rounded-xl bg-white border border-amber-200 text-amber-800 font-bold text-xs hover:bg-amber-100/50 cursor-pointer"
                title="Giảm 1 sao"
              >
                -1
              </button>
              <input
                type="number"
                min={0}
                max={50}
                value={stars}
                onChange={(e) => setStars(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                className="flex-1 py-2 text-center rounded-xl border border-amber-300 font-black text-amber-950 text-base outline-none focus:border-amber-500 bg-white"
              />
              <button
                type="button"
                onClick={() => handleAdjustStars(1)}
                className="px-3 py-2 rounded-xl bg-white border border-amber-200 text-amber-800 font-bold text-xs hover:bg-amber-100/50 cursor-pointer"
                title="Tăng 1 sao"
              >
                +1
              </button>
            </div>

            {/* Chọn nhanh mốc sao */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-amber-700/80 mr-1">Mốc sao:</span>
              {[0, 1, 2, 3, 5, 10, 20].map((sVal) => (
                <button
                  key={sVal}
                  type="button"
                  onClick={() => handleQuickStars(sVal)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    stars === sVal
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60'
                  }`}
                >
                  ⭐ {sVal}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Xem trước hiển thị thẻ (Live Preview) */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Xem trước giao diện thẻ:
          </div>
          <div
            className={`p-3 rounded-xl border transition-all flex items-center gap-2.5 ${
              isAdd
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}
          >
            <span className="text-lg shrink-0">{isAdd ? '🌟' : '⚠️'}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 text-slate-700 border border-slate-200">
                  {categoryGroup}
                </span>
                <span
                  className={`text-xs sm:text-sm font-black ${
                    isAdd ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isAdd ? `+${points}đ` : `-${points}đ`}
                  {isAdd && stars > 0 && ` / ⭐+${stars}`}
                </span>
              </div>
              <div className="font-bold text-xs sm:text-sm truncate mt-1">
                {title || 'Tên tiêu chí mẫu'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <Button
            type="submit"
            variant={isAdd ? 'primary' : 'danger'}
            isLoading={isLoading}
            className="text-xs sm:text-sm px-5 py-2.5"
          >
            💾 Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Bí danh tương thích ngược
export const EditCategoryModal = EditCriteriaForm;
export type EditCategoryModalProps = EditCriteriaFormProps;
