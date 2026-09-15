import React, { useState } from 'react';
import type { PointCategory } from '../../../types/points';
import { AddCategoryForm } from './AddCategoryForm';

export interface AwardCriteriaGridProps {
  classId: string;
  pointType: 'add' | 'subtract';
  onSwitchPointType: (type: 'add' | 'subtract') => void;
  activeCategories: PointCategory[];
  selectedAddCategoryIds: string[];
  selectedSubCategoryIds: string[];
  isCustomAdd: boolean;
  isCustomSub: boolean;
  onToggleCategory: (cat: PointCategory) => void;
  onSelectCustomCategory: (type: 'add' | 'subtract') => void;
  onClearCategories: (type: 'add' | 'subtract') => void;
  onEditCategory: (cat: PointCategory) => void;
  onDeleteCategory: (e: React.MouseEvent, cat: PointCategory) => void;
  onCategoryCreated: (newCategory: PointCategory) => void;
  categorySuccessMessage: string;
}

export const AwardCriteriaGrid: React.FC<AwardCriteriaGridProps> = ({
  classId,
  pointType,
  onSwitchPointType,
  activeCategories,
  selectedAddCategoryIds,
  selectedSubCategoryIds,
  isCustomAdd,
  isCustomSub,
  onToggleCategory,
  onSelectCustomCategory,
  onClearCategories,
  onEditCategory,
  onDeleteCategory,
  onCategoryCreated,
  categorySuccessMessage,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);

  const selectedCount =
    pointType === 'add' ? selectedAddCategoryIds.length : selectedSubCategoryIds.length;
  const isCustomActive = pointType === 'add' ? isCustomAdd : isCustomSub;

  const handleCreated = (newCat: PointCategory) => {
    setIsAddingCategory(false);
    onCategoryCreated(newCat);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
          2. Tiêu chí nề nếp thi đua (Chọn 1 hoặc nhiều tiêu chí):
        </label>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddingCategory((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs border ${
              isAddingCategory
                ? 'bg-slate-200 text-slate-700 border-slate-300'
                : pointType === 'add'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700'
            }`}
            title={`Bổ sung tiêu chí mới vào phần ${pointType === 'add' ? 'Điểm cộng' : 'Điểm trừ'}`}
          >
            <span>{isAddingCategory ? '✕ Đóng form' : '➕ Bổ sung tiêu chí'}</span>
          </button>
          {(selectedCount > 0 || isCustomActive) && (
            <button
              type="button"
              onClick={() => onClearCategories(pointType)}
              className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              ✕ Bỏ chọn tất cả
            </button>
          )}
          <span className="text-xs font-semibold text-slate-500">
            {selectedCount > 0
              ? `Đã chọn: ${selectedCount} tiêu chí`
              : isCustomActive
              ? 'Đang nhập tiêu chí khác'
              : 'Chưa chọn tiêu chí nào'}
          </span>
        </div>
      </div>

      {/* 2 Tab chuyển đổi: Phần Điểm Cộng & Phần Điểm Trừ */}
      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <button
          type="button"
          onClick={() => onSwitchPointType('add')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            pointType === 'add'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <span className="text-base">🌟</span>
          <span>➕ PHẦN ĐIỂM CỘNG</span>
          {selectedAddCategoryIds.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                pointType === 'add' ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
              }`}
            >
              {selectedAddCategoryIds.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onSwitchPointType('subtract')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            pointType === 'subtract'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-rose-50/70 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <span className="text-base">⚠️</span>
          <span>➖ PHẦN ĐIỂM TRỪ</span>
          {selectedSubCategoryIds.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                pointType === 'subtract' ? 'bg-white text-rose-800' : 'bg-rose-600 text-white'
              }`}
            >
              {selectedSubCategoryIds.length}
            </span>
          )}
        </button>
      </div>

      {/* Thông báo tạo tiêu chí thành công */}
      {categorySuccessMessage && (
        <div className="mb-2 px-3.5 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
          <span>🎉</span>
          <span>{categorySuccessMessage}</span>
        </div>
      )}

      {/* Form bổ sung tiêu chí mới trực tiếp */}
      <AddCategoryForm
        isOpen={isAddingCategory}
        onClose={() => setIsAddingCategory(false)}
        classId={classId}
        pointType={pointType}
        onCategoryCreated={handleCreated}
      />

      {/* Danh sách thẻ chọn đa tiêu chí dạng lưới (Multi-select Chips Grid) */}
      <div className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 max-h-72 sm:max-h-80 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {activeCategories.map((cat) => {
            const isSelected =
              pointType === 'add'
                ? selectedAddCategoryIds.includes(cat.id)
                : selectedSubCategoryIds.includes(cat.id);

            return (
              <div
                key={cat.id}
                className={`group rounded-xl border transition-all flex items-center overflow-hidden ${
                  isSelected
                    ? pointType === 'add'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-500/20'
                    : 'bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleCategory(cat)}
                  className="flex-1 p-2.5 text-left text-xs sm:text-sm flex items-start gap-2.5 cursor-pointer outline-none min-w-0"
                >
                  <span className="text-base mt-0.5 shrink-0">
                    {isSelected ? '☑️' : '⬜'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {cat.categoryGroup}
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCategory(cat);
                        }}
                        className={`text-xs sm:text-sm font-black px-1.5 py-0.5 rounded transition-all cursor-pointer hover:underline inline-flex items-center gap-1 ${
                          isSelected
                            ? 'text-white hover:bg-white/20'
                            : cat.type === 'add'
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-rose-600 hover:bg-rose-50'
                        }`}
                        title={`Bấm để điều chỉnh điểm số & sao của tiêu chí "${cat.title}"`}
                        data-testid={`badge-edit-cat-${cat.id}`}
                      >
                        <span>{cat.type === 'add' ? `+${cat.defaultPoints}đ` : `${cat.defaultPoints}đ`}</span>
                        {cat.defaultStars > 0 && <span> / ⭐+{cat.defaultStars}</span>}
                        <span className="text-[10px] opacity-70">✏️</span>
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm truncate mt-1" title={cat.title}>
                      {cat.title}
                    </div>
                  </div>
                </button>
                <div className="flex items-center pr-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCategory(cat);
                    }}
                    className={`p-1.5 sm:p-2 text-xs rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'text-white/80 hover:text-white hover:bg-white/20'
                        : 'text-slate-400 hover:text-primary hover:bg-slate-100'
                    }`}
                    title={`Điều chỉnh điểm, sao và tiêu chí "${cat.title}"`}
                    aria-label="Chỉnh sửa tiêu chí"
                    data-testid={`edit-cat-${cat.id}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDeleteCategory(e, cat)}
                    className={`opacity-0 sm:group-hover:opacity-70 hover:opacity-100 p-1.5 sm:p-2 text-xs transition-opacity cursor-pointer ${
                      isSelected ? 'text-white hover:text-rose-200' : 'text-slate-400 hover:text-rose-600'
                    }`}
                    title={`Xóa tiêu chí "${cat.title}"`}
                    aria-label="Xóa"
                    data-testid={`delete-cat-${cat.id}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}

          {/* Nút Bổ sung tiêu chí mới vào danh mục */}
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className={`p-2.5 rounded-xl text-left text-xs sm:text-sm transition-all border flex items-center gap-2.5 cursor-pointer ${
              pointType === 'add'
                ? 'bg-white hover:bg-emerald-50 text-emerald-800 border-dashed border-emerald-400'
                : 'bg-white hover:bg-rose-50 text-rose-800 border-dashed border-rose-400'
            }`}
          >
            <span className="text-base shrink-0">➕</span>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs sm:text-sm">
                {pointType === 'add'
                  ? '➕ Tạo tiêu chí mới...'
                  : '➕ Tạo tiêu chí vi phạm mới...'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Lưu vĩnh viễn vào danh mục của lớp
              </div>
            </div>
          </button>

          {/* Nút Tiêu chí khác (Tự do nhập điểm & lý do cho 1 lần) */}
          <button
            type="button"
            onClick={() => onSelectCustomCategory(pointType)}
            className={`p-2.5 rounded-xl text-left text-xs sm:text-sm transition-all border flex items-center gap-2.5 cursor-pointer ${
              (pointType === 'add' ? isCustomAdd : isCustomSub)
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                : 'bg-white hover:bg-amber-50 text-slate-700 border-dashed border-amber-300'
            }`}
          >
            <span className="text-base shrink-0">
              {(pointType === 'add' ? isCustomAdd : isCustomSub) ? '✨' : '📝'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs sm:text-sm">
                {pointType === 'add'
                  ? '✨ Tiêu chí thưởng khác...'
                  : '✨ Vi phạm / Nhắc nhở khác...'}
              </div>
              <div
                className={`text-[11px] ${
                  (pointType === 'add' ? isCustomAdd : isCustomSub)
                    ? 'text-amber-100'
                    : 'text-amber-700'
                } mt-0.5`}
              >
                Tự do nhập điểm số & lý do tùy biến
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
