import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { PointCategory } from '../../../types/points';
import type { Student, Group } from '../../../types/student';
import { pointsService, type GroupPointsSummary } from '../services/pointsService';

interface AwardPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onSuccess: () => void;
  students: Student[];
  groups: Group[];
  categories: PointCategory[];
  groupSummaries?: GroupPointsSummary[];
}

export const AwardPointsModal: React.FC<AwardPointsModalProps> = ({
  isOpen,
  onClose,
  classId,
  onSuccess,
  students,
  groups,
  categories,
  groupSummaries,
}) => {
  const [targetType, setTargetType] = useState<'student' | 'group' | 'class'>('student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // Hỗ trợ chọn nhiều tiêu chí riêng biệt cho phần Điểm cộng và Điểm trừ
  const [selectedAddCategoryIds, setSelectedAddCategoryIds] = useState<string[]>([]);
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<string[]>([]);
  const [isCustomAdd, setIsCustomAdd] = useState<boolean>(false);
  const [isCustomSub, setIsCustomSub] = useState<boolean>(false);

  const [pointType, setPointType] = useState<'add' | 'subtract'>('add');
  const [points, setPoints] = useState<number>(5);
  const [stars, setStars] = useState<number>(5);
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const reasonInputRef = useRef<HTMLInputElement | null>(null);

  // Tách 2 danh mục tiêu chí riêng biệt: Điểm cộng và Điểm trừ
  const addCategories = useMemo(() => categories.filter((c) => c.type === 'add'), [categories]);
  const subtractCategories = useMemo(() => categories.filter((c) => c.type === 'subtract'), [categories]);
  const activeCategories = pointType === 'add' ? addCategories : subtractCategories;

  // Bật/tắt chọn tiêu chí (Cho phép chọn nhiều hoặc bỏ chọn)
  const handleToggleCategory = useCallback(
    (cat: PointCategory) => {
      if (cat.type === 'add') {
        setIsCustomAdd(false);
        setSelectedAddCategoryIds((prev) => {
          const isAlready = prev.includes(cat.id);
          const next = isAlready ? prev.filter((id) => id !== cat.id) : [...prev, cat.id];
          const activeCats = categories.filter((c) => next.includes(c.id));
          const totalPts = activeCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);
          const totalStrs = activeCats.reduce((sum, c) => sum + Math.abs(c.defaultStars), 0);

          if (next.length > 0) {
            setPoints(totalPts);
            setStars(totalStrs);
            setReason(activeCats.map((c) => c.title).join('; '));
          } else {
            setPoints(5);
            setStars(5);
            setReason('');
          }
          return next;
        });
      } else {
        setIsCustomSub(false);
        setSelectedSubCategoryIds((prev) => {
          const isAlready = prev.includes(cat.id);
          const next = isAlready ? prev.filter((id) => id !== cat.id) : [...prev, cat.id];
          const activeCats = categories.filter((c) => next.includes(c.id));
          const totalPts = activeCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);

          if (next.length > 0) {
            setPoints(totalPts);
            setStars(0);
            setReason(activeCats.map((c) => c.title).join('; '));
          } else {
            setPoints(5);
            setStars(0);
            setReason('');
          }
          return next;
        });
      }
    },
    [categories]
  );

  // Chọn chế độ "Tiêu chí khác..." để tự do nhập
  const handleSelectCustomCategory = useCallback((type: 'add' | 'subtract') => {
    if (type === 'add') {
      setSelectedAddCategoryIds([]);
      setIsCustomAdd(true);
      setReason('');
      setPoints(5);
      setStars(5);
    } else {
      setSelectedSubCategoryIds([]);
      setIsCustomSub(true);
      setReason('');
      setPoints(5);
      setStars(0);
    }
    setTimeout(() => {
      reasonInputRef.current?.focus();
    }, 50);
  }, []);

  // Bỏ chọn tất cả tiêu chí của tab hiện tại
  const handleClearCategories = useCallback((type: 'add' | 'subtract') => {
    if (type === 'add') {
      setSelectedAddCategoryIds([]);
      setIsCustomAdd(false);
    } else {
      setSelectedSubCategoryIds([]);
      setIsCustomSub(false);
    }
    setReason('');
  }, []);

  // Chuyển đổi giữa 2 Tab Điểm Cộng và Điểm Trừ
  const handleSwitchPointType = useCallback(
    (newType: 'add' | 'subtract') => {
      setPointType(newType);
      if (newType === 'add') {
        if (selectedAddCategoryIds.length > 0) {
          const activeCats = categories.filter((c) => selectedAddCategoryIds.includes(c.id));
          setPoints(activeCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0));
          setStars(activeCats.reduce((sum, c) => sum + Math.abs(c.defaultStars), 0));
          setReason(activeCats.map((c) => c.title).join('; '));
        } else if (!isCustomAdd) {
          setPoints(5);
          setStars(5);
          setReason('');
        }
      } else {
        if (selectedSubCategoryIds.length > 0) {
          const activeCats = categories.filter((c) => selectedSubCategoryIds.includes(c.id));
          setPoints(activeCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0));
          setStars(0);
          setReason(activeCats.map((c) => c.title).join('; '));
        } else if (!isCustomSub) {
          setPoints(5);
          setStars(0);
          setReason('');
        }
      }
    },
    [categories, selectedAddCategoryIds, selectedSubCategoryIds, isCustomAdd, isCustomSub]
  );

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSelectedAddCategoryIds([]);
      setSelectedSubCategoryIds([]);
      setIsCustomAdd(false);
      setIsCustomSub(false);
      setPointType('add');
      setPoints(5);
      setStars(5);
      setReason('');
      setNote('');
      if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
      }
      if (groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groups[0].id);
      }
    }
  }, [isOpen, students, groups, selectedStudentId, selectedGroupId]);

  // Tính toán số liệu cho Khung Xem Trước Điểm Tổng Kết Trực Tiếp (Live Preview Badge)
  const previewData = useMemo(() => {
    const selectedAddCats = categories.filter((c) => selectedAddCategoryIds.includes(c.id));
    const selectedSubCats = categories.filter((c) => selectedSubCategoryIds.includes(c.id));
    const hasDual = selectedAddCats.length > 0 && selectedSubCats.length > 0;

    let deltaPts: number;
    let deltaStrs: number;
    let desc: string;

    if (hasDual) {
      const addPts = selectedAddCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);
      const subPts = selectedSubCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);
      deltaPts = addPts - subPts;
      deltaStrs = selectedAddCats.reduce((sum, c) => sum + Math.abs(c.defaultStars), 0);
      desc = `Thưởng +${addPts}đ, Phạt -${subPts}đ`;
    } else {
      const safePoints = Math.max(0, points || 0);
      const safeStars = Math.max(0, stars || 0);
      deltaPts = pointType === 'add' ? safePoints : -safePoints;
      deltaStrs = pointType === 'add' ? safeStars : -safeStars;
      desc =
        targetType === 'student'
          ? 'Cá nhân học sinh'
          : pointType === 'add'
          ? `Mỗi bạn: +${safePoints}đ`
          : `Mỗi bạn: -${safePoints}đ`;
    }

    if (targetType === 'student') {
      const targetStudent = students.find((s) => s.id === selectedStudentId);
      const name = targetStudent
        ? `${targetStudent.fullName} (${targetStudent.groupName || 'Chưa chia tổ'})`
        : 'Chưa chọn học sinh';
      const curPts = targetStudent?.points ?? 0;
      const curStars = targetStudent?.stars ?? 0;
      const nextPts = curPts + deltaPts;
      const nextStars = Math.max(0, curStars + deltaStrs);

      return {
        targetName: name,
        targetDesc: desc,
        currentPoints: curPts,
        newPoints: nextPts,
        deltaPoints: deltaPts,
        currentStars: curStars,
        newStars: nextStars,
        deltaStars: deltaStrs,
      };
    }

    if (targetType === 'group') {
      const targetGroup = groups.find((g) => g.id === selectedGroupId);
      const groupStudents = students.filter(
        (s) => s.groupId === selectedGroupId || s.groupName === targetGroup?.name
      );
      const targetSummary = groupSummaries?.find(
        (g) => g.id === selectedGroupId || g.name === targetGroup?.name
      );
      const count = groupStudents.length || 1;
      const curPts =
        targetSummary?.totalPoints ??
        groupStudents.reduce((acc, s) => acc + (s.points || 0), 0);
      const curStars =
        targetSummary?.totalStars ??
        groupStudents.reduce((acc, s) => acc + (s.stars || 0), 0);
      const totalDeltaPts = deltaPts * count;
      const totalDeltaStars = deltaStrs * count;
      const nextPts = curPts + totalDeltaPts;
      const nextStars = Math.max(0, curStars + totalDeltaStars);

      return {
        targetName: `${targetGroup?.name || 'Tổ'} (${count} học sinh)`,
        targetDesc: desc,
        currentPoints: curPts,
        newPoints: nextPts,
        deltaPoints: totalDeltaPts,
        currentStars: curStars,
        newStars: nextStars,
        deltaStars: totalDeltaStars,
      };
    }

    // Cả lớp
    const count = students.length || 47;
    const curPts = students.reduce((acc, s) => acc + (s.points || 0), 0);
    const curStars = students.reduce((acc, s) => acc + (s.stars || 0), 0);
    const totalDeltaPts = deltaPts * count;
    const totalDeltaStars = deltaStrs * count;
    const nextPts = curPts + totalDeltaPts;
    const nextStars = Math.max(0, curStars + totalDeltaStars);

    return {
      targetName: `Cả Lớp (${count} học sinh)`,
      targetDesc: desc,
      currentPoints: curPts,
      newPoints: nextPts,
      deltaPoints: totalDeltaPts,
      currentStars: curStars,
      newStars: nextStars,
      deltaStars: totalDeltaStars,
    };
  }, [
    targetType,
    selectedStudentId,
    selectedGroupId,
    students,
    groups,
    groupSummaries,
    categories,
    selectedAddCategoryIds,
    selectedSubCategoryIds,
    points,
    stars,
    pointType,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Vui lòng nhập hoặc chọn lý do chấm điểm.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const selectedAddCats = categories.filter((c) => selectedAddCategoryIds.includes(c.id));
      const selectedSubCats = categories.filter((c) => selectedSubCategoryIds.includes(c.id));

      if (selectedAddCats.length > 0 && selectedSubCats.length > 0) {
        // Ghi nhận đồng thời 2 giao dịch minh bạch cho Thưởng và Vi phạm
        const addPts = selectedAddCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);
        const addStrs = selectedAddCats.reduce((sum, c) => sum + Math.abs(c.defaultStars), 0);
        const subPts = selectedSubCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);

        await Promise.all([
          pointsService.createTransaction({
            classId,
            targetType,
            studentId: targetType === 'student' ? selectedStudentId : undefined,
            groupId: targetType === 'group' ? selectedGroupId : undefined,
            categoryId: selectedAddCats[0].id,
            points: addPts,
            stars: addStrs,
            reason: selectedAddCats.map((c) => c.title).join('; '),
            note: note.trim() || undefined,
          }),
          pointsService.createTransaction({
            classId,
            targetType,
            studentId: targetType === 'student' ? selectedStudentId : undefined,
            groupId: targetType === 'group' ? selectedGroupId : undefined,
            categoryId: selectedSubCats[0].id,
            points: -subPts,
            stars: 0,
            reason: selectedSubCats.map((c) => c.title).join('; '),
            note: note.trim() || undefined,
          }),
        ]);
      } else {
        const finalPoints = pointType === 'add' ? Math.abs(points) : -Math.abs(points);
        const finalStars = pointType === 'add' ? Math.abs(stars) : -Math.abs(stars);
        const activeIds = pointType === 'add' ? selectedAddCategoryIds : selectedSubCategoryIds;
        const primaryCatId = activeIds.length > 0 ? activeIds[0] : undefined;

        await pointsService.createTransaction({
          classId,
          targetType,
          studentId: targetType === 'student' ? selectedStudentId : undefined,
          groupId: targetType === 'group' ? selectedGroupId : undefined,
          categoryId: primaryCatId,
          points: finalPoints,
          stars: finalStars,
          reason: reason.trim(),
          note: note.trim() || undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Lỗi khi ghi nhận điểm thi đua.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chấm Điểm Nề Nếp & Thi Đua" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* 1. Chọn Đối tượng áp dụng */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
            1. Áp dụng cho:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTargetType('student')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                targetType === 'student'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              👤 1 Học sinh
            </button>
            <button
              type="button"
              onClick={() => setTargetType('group')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                targetType === 'group'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              👥 Cả Tổ
            </button>
            <button
              type="button"
              onClick={() => setTargetType('class')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                targetType === 'class'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🏫 Cả Lớp (47 em)
            </button>
          </div>
        </div>

        {/* Chọn Học sinh cụ thể hoặc Tổ cụ thể */}
        {targetType === 'student' && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Chọn học sinh:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.groupName || 'Chưa chia tổ'})
                </option>
              ))}
            </select>
          </div>
        )}

        {targetType === 'group' && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Chọn tổ:
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Chọn Tiêu chí mẫu - Cho phép chọn nhiều tiêu chí hoặc tự do nhập */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">
              2. Tiêu chí nề nếp thi đua (Chọn 1 hoặc nhiều tiêu chí):
            </label>
            <div className="flex items-center gap-2">
              {((pointType === 'add' ? selectedAddCategoryIds.length : selectedSubCategoryIds.length) > 0 ||
                (pointType === 'add' ? isCustomAdd : isCustomSub)) && (
                <button
                  type="button"
                  onClick={() => handleClearCategories(pointType)}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  ✕ Bỏ chọn tất cả
                </button>
              )}
              <span className="text-[11px] font-semibold text-slate-400">
                {pointType === 'add'
                  ? selectedAddCategoryIds.length > 0
                    ? `Đã chọn: ${selectedAddCategoryIds.length} tiêu chí`
                    : isCustomAdd
                    ? 'Đang nhập tiêu chí khác'
                    : 'Chưa chọn tiêu chí nào'
                  : selectedSubCategoryIds.length > 0
                  ? `Đã chọn: ${selectedSubCategoryIds.length} tiêu chí`
                  : isCustomSub
                  ? 'Đang nhập tiêu chí khác'
                  : 'Chưa chọn tiêu chí nào'}
              </span>
            </div>
          </div>

          {/* 2 Tab chuyển đổi: Phần Điểm Cộng & Phần Điểm Trừ */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={() => handleSwitchPointType('add')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                pointType === 'add'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span>🌟</span>
              <span>➕ PHẦN ĐIỂM CỘNG</span>
              {selectedAddCategoryIds.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    pointType === 'add' ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {selectedAddCategoryIds.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPointType('subtract')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                pointType === 'subtract'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50/70 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>⚠️</span>
              <span>➖ PHẦN ĐIỂM TRỪ</span>
              {selectedSubCategoryIds.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    pointType === 'subtract' ? 'bg-white text-rose-800' : 'bg-rose-600 text-white'
                  }`}
                >
                  {selectedSubCategoryIds.length}
                </span>
              )}
            </button>
          </div>

          {/* Danh sách thẻ chọn đa tiêu chí dạng lưới (Multi-select Chips Grid) */}
          <div className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 max-h-56 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeCategories.map((cat) => {
                const isSelected =
                  pointType === 'add'
                    ? selectedAddCategoryIds.includes(cat.id)
                    : selectedSubCategoryIds.includes(cat.id);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`p-2 rounded-xl text-left text-xs transition-all border flex items-start gap-2 cursor-pointer ${
                      isSelected
                        ? pointType === 'add'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-500/20'
                        : 'bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <span className="text-sm mt-0.5 shrink-0">
                      {isSelected ? '☑️' : '⬜'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {cat.categoryGroup}
                        </span>
                        <span
                          className={`text-[11px] font-black ${
                            isSelected
                              ? 'text-white'
                              : cat.type === 'add'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {cat.type === 'add' ? `+${cat.defaultPoints}đ` : `${cat.defaultPoints}đ`}
                          {cat.defaultStars > 0 && ` / ⭐+${cat.defaultStars}`}
                        </span>
                      </div>
                      <div className="font-bold text-xs truncate mt-0.5" title={cat.title}>
                        {cat.title}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Nút Tiêu chí khác (Tự do nhập điểm & lý do) */}
              <button
                type="button"
                onClick={() => handleSelectCustomCategory(pointType)}
                className={`p-2 rounded-xl text-left text-xs transition-all border flex items-center gap-2 cursor-pointer ${
                  (pointType === 'add' ? isCustomAdd : isCustomSub)
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-dashed border-amber-300'
                }`}
              >
                <span className="text-sm shrink-0">
                  {(pointType === 'add' ? isCustomAdd : isCustomSub) ? '✨' : '➕'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs">
                    {pointType === 'add'
                      ? '✨ Tiêu chí thưởng khác...'
                      : '✨ Vi phạm / Nhắc nhở khác...'}
                  </div>
                  <div
                    className={`text-[10px] ${
                      (pointType === 'add' ? isCustomAdd : isCustomSub)
                        ? 'text-amber-100'
                        : 'text-amber-700'
                    }`}
                  >
                    Tự do nhập điểm số & lý do tùy biến
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Hình thức Thưởng / Phạt & Điểm số */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Hình thức:</label>
            <select
              value={pointType}
              onChange={(e) => handleSwitchPointType(e.target.value as 'add' | 'subtract')}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-black outline-none transition-colors ${
                pointType === 'add'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-rose-300 bg-rose-50 text-rose-800'
              }`}
            >
              <option value="add">➕ Cộng thưởng</option>
              <option value="subtract">➖ Trừ vi phạm</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Điểm thi đua:</label>
            <input
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Sao ⭐:</label>
            <input
              type="number"
              min={0}
              max={50}
              value={stars}
              onChange={(e) => setStars(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* 4. Nội dung lý do */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-600">
              Lý do ghi nhận:
            </label>
            {(isCustomAdd || isCustomSub) && (
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.2 rounded-md border border-amber-200">
                ✍️ Chế độ nhập tự do (Tiêu chí khác)
              </span>
            )}
          </div>
          <input
            ref={reasonInputRef}
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              pointType === 'add'
                ? 'VD: Giúp đỡ bạn học tiến bộ, Nhặt được của rơi, Phát biểu bài...'
                : 'VD: Đi học trễ, Không làm bài tập, Nói chuyện riêng...'
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:border-primary outline-none"
          />
        </div>

        {/* Ghi chú thêm */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Ghi chú chi tiết (Tùy chọn):
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Thêm thông tin hoặc người làm chứng..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 outline-none resize-none"
          />
        </div>

        {/* Khung Xem Trước Điểm Tổng Kết Trực Tiếp (Live Preview Badge) */}
        <div
          data-testid="live-preview-badge"
          className={`p-3 rounded-2xl border transition-all ${
            pointType === 'add'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black mb-1.5">
            <span className="flex items-center gap-1.5">
              <span>{pointType === 'add' ? '🎯' : '⚠️'}</span>
              <span className="uppercase tracking-wide">Xem trước biến động điểm</span>
            </span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                pointType === 'add'
                  ? 'bg-emerald-200/70 text-emerald-800'
                  : 'bg-rose-200/70 text-rose-800'
              }`}
            >
              {previewData.targetDesc}
            </span>
          </div>

          {/* Chi tiết biến động */}
          <div className="bg-white/90 backdrop-blur-xs rounded-xl p-2.5 border border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="font-bold text-slate-800 truncate max-w-xs sm:max-w-md" title={previewData.targetName}>
              {previewData.targetName}
            </div>

            <div className="flex items-center gap-3">
              {/* Điểm số */}
              <div className="flex items-center gap-1 font-semibold">
                <span className="text-slate-500">{previewData.currentPoints}đ</span>
                <span className="text-slate-400 font-normal">➔</span>
                <span className={`font-black ${pointType === 'add' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {previewData.newPoints}đ
                </span>
                <span className={`text-[11px] font-bold ${pointType === 'add' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  ({previewData.deltaPoints >= 0 ? `+${previewData.deltaPoints}đ` : `${previewData.deltaPoints}đ`})
                </span>
              </div>

              {/* Sao */}
              {(stars > 0 || previewData.currentStars > 0) && (
                <div className="flex items-center gap-1 font-semibold pl-2.5 border-l border-slate-200">
                  <span className="text-slate-500">{previewData.currentStars}⭐</span>
                  <span className="text-slate-400 font-normal">➔</span>
                  <span className="font-black text-amber-600">{previewData.newStars}⭐</span>
                  <span className="text-[11px] font-bold text-amber-700">
                    ({previewData.deltaStars > 0 ? `+${previewData.deltaStars}⭐` : (previewData.deltaStars < 0 ? `${previewData.deltaStars}⭐` : '0⭐')})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-100 justify-end">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            GHI NHẬN VÀO SỔ CÁI
          </Button>
        </div>
      </form>
    </Modal>
  );
};
