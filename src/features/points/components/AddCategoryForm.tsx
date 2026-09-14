import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../../components/common/Button';
import { pointsService, type CreateCategoryParams } from '../services/pointsService';
import type { PointCategory } from '../../../types/points';

interface AddCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  pointType: 'add' | 'subtract';
  onCategoryCreated: (newCategory: PointCategory) => void;
}

export const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
  isOpen,
  onClose,
  classId,
  pointType,
  onCategoryCreated,
}) => {
  const [title, setTitle] = useState('');
  const [categoryGroup, setCategoryGroup] = useState<'Học tập' | 'Nề nếp' | 'Phong trào' | 'Đột xuất'>('Nề nếp');
  const [points, setPoints] = useState(5);
  const [stars, setStars] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setErrorMessage('');
      setCategoryGroup('Nề nếp');
      if (pointType === 'add') {
        setPoints(5);
        setStars(5);
      } else {
        setPoints(5);
        setStars(0);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, pointType]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tên tiêu chí');
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const params: CreateCategoryParams = {
        classId,
        type: pointType,
        categoryGroup,
        title: title.trim(),
        defaultPoints: Number(points) || 1,
        defaultStars: pointType === 'add' ? (Number(stars) || 0) : 0,
      };

      const created = await pointsService.createCategory(params);
      onCategoryCreated(created);
      onClose();
    } catch (err) {
      console.error('Lỗi tạo tiêu chí mới:', err);
      setErrorMessage('Không thể tạo tiêu chí. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`mb-3 p-3.5 rounded-2xl border-2 transition-all shadow-xs ${
        pointType === 'add'
          ? 'bg-emerald-50/95 border-emerald-300'
          : 'bg-rose-50/95 border-rose-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{pointType === 'add' ? '🌟' : '⚠️'}</span>
          <span
            className={`text-xs font-black uppercase ${
              pointType === 'add' ? 'text-emerald-900' : 'text-rose-900'
            }`}
          >
            Bổ sung tiêu chí {pointType === 'add' ? 'Điểm Cộng' : 'Điểm Trừ'} mới
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer p-1"
          aria-label="Đóng form bổ sung"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Tên tiêu chí <span className="text-rose-500">*</span>:
          </label>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder={
              pointType === 'add'
                ? 'VD: Đạt giải Nhất thể thao, Giúp bạn tiến bộ, Tuyên dương dưới cờ...'
                : 'VD: Không đeo khăn quàng, Nói tục chửi thề, Quên sách vở...'
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {errorMessage && (
            <p className="text-[11px] font-bold text-rose-600 mt-1">{errorMessage}</p>
          )}
        </div>

        {/* Nhóm tiêu chí */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Nhóm tiêu chí:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['Học tập', 'Nề nếp', 'Phong trào', 'Đột xuất'] as const).map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setCategoryGroup(grp)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  categoryGroup === grp
                    ? pointType === 'add'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* Điểm & Sao mặc định */}
        <div className={`grid ${pointType === 'add' ? 'grid-cols-2' : 'grid-cols-1'} gap-2.5`}>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Điểm mặc định ({pointType === 'add' ? '+' : '-'}điểm):
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={points}
              onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {pointType === 'add' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Sao thi đua mặc định (⭐):
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={stars}
                onChange={(e) => setStars(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <Button
            type="button"
            variant={pointType === 'add' ? 'primary' : 'danger'}
            onClick={() => handleSubmit()}
            isLoading={isLoading}
            className="text-xs px-4 py-1.5"
          >
            💾 Lưu tiêu chí mới
          </Button>
        </div>
      </div>
    </div>
  );
};
