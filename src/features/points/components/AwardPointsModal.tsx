import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [pointType, setPointType] = useState<'add' | 'subtract'>('add');
  const [points, setPoints] = useState<number>(1);
  const [stars, setStars] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Tách 2 danh mục tiêu chí riêng biệt: Điểm cộng và Điểm trừ
  const addCategories = useMemo(() => categories.filter((c) => c.type === 'add'), [categories]);
  const subtractCategories = useMemo(() => categories.filter((c) => c.type === 'subtract'), [categories]);
  const activeCategories = pointType === 'add' ? addCategories : subtractCategories;

  const handleSelectCategory = useCallback(
    (catId: string) => {
      setSelectedCategoryId(catId);
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        setPointType(cat.type);
        setPoints(Math.abs(cat.defaultPoints));
        setStars(Math.abs(cat.defaultStars));
        setReason(cat.title);
      }
    },
    [categories]
  );

  // Chuyển đổi mượt mà giữa Phần Điểm Cộng và Phần Điểm Trừ
  const handleSwitchPointType = useCallback(
    (newType: 'add' | 'subtract') => {
      setPointType(newType);
      const targetList = newType === 'add' ? addCategories : subtractCategories;
      if (targetList.length > 0) {
        const firstCat = targetList[0];
        setSelectedCategoryId(firstCat.id);
        setPoints(Math.abs(firstCat.defaultPoints));
        setStars(Math.abs(firstCat.defaultStars));
        setReason(firstCat.title);
      } else {
        setSelectedCategoryId('');
        setPoints(5);
        setStars(newType === 'add' ? 5 : 0);
        setReason('');
      }
    },
    [addCategories, subtractCategories]
  );

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
      }
      if (groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groups[0].id);
      }
      if (categories.length > 0 && !selectedCategoryId) {
        const defaultAdd = categories.find((c) => c.type === 'add') || categories[0];
        handleSelectCategory(defaultAdd.id);
      }
    }
  }, [
    isOpen,
    students,
    groups,
    categories,
    selectedStudentId,
    selectedGroupId,
    selectedCategoryId,
    handleSelectCategory,
  ]);

  // Tính toán số liệu cho Khung Xem Trước Điểm Tổng Kết Trực Tiếp (Live Preview Badge)
  const previewData = useMemo(() => {
    const safePoints = Math.max(0, points || 0);
    const safeStars = Math.max(0, stars || 0);

    if (targetType === 'student') {
      const targetStudent = students.find((s) => s.id === selectedStudentId);
      const name = targetStudent
        ? `${targetStudent.fullName} (${targetStudent.groupName || 'Chưa chia tổ'})`
        : 'Chưa chọn học sinh';
      const curPts = targetStudent?.points ?? 0;
      const curStars = targetStudent?.stars ?? 0;
      const nextPts = pointType === 'add' ? curPts + safePoints : curPts - safePoints;
      const nextStars = pointType === 'add' ? curStars + safeStars : Math.max(0, curStars - safeStars);

      return {
        targetName: name,
        targetDesc: 'Cá nhân học sinh',
        currentPoints: curPts,
        newPoints: nextPts,
        deltaPoints: pointType === 'add' ? safePoints : -safePoints,
        currentStars: curStars,
        newStars: nextStars,
        deltaStars: pointType === 'add' ? safeStars : -safeStars,
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
      const totalDeltaPts = safePoints * count;
      const totalDeltaStars = safeStars * count;
      const nextPts = pointType === 'add' ? curPts + totalDeltaPts : curPts - totalDeltaPts;
      const nextStars =
        pointType === 'add'
          ? curStars + totalDeltaStars
          : Math.max(0, curStars - totalDeltaStars);

      return {
        targetName: `${targetGroup?.name || 'Tổ'} (${count} học sinh)`,
        targetDesc: `Mỗi bạn: ${pointType === 'add' ? `+${safePoints}đ` : `-${safePoints}đ`}`,
        currentPoints: curPts,
        newPoints: nextPts,
        deltaPoints: pointType === 'add' ? totalDeltaPts : -totalDeltaPts,
        currentStars: curStars,
        newStars: nextStars,
        deltaStars: pointType === 'add' ? totalDeltaStars : -totalDeltaStars,
      };
    }

    // Cả lớp
    const count = students.length || 47;
    const curPts = students.reduce((acc, s) => acc + (s.points || 0), 0);
    const curStars = students.reduce((acc, s) => acc + (s.stars || 0), 0);
    const totalDeltaPts = safePoints * count;
    const totalDeltaStars = safeStars * count;
    const nextPts = pointType === 'add' ? curPts + totalDeltaPts : curPts - totalDeltaPts;
    const nextStars =
      pointType === 'add'
        ? curStars + totalDeltaStars
        : Math.max(0, curStars - totalDeltaStars);

    return {
      targetName: `Cả Lớp (${count} học sinh)`,
      targetDesc: `Mỗi bạn: ${pointType === 'add' ? `+${safePoints}đ` : `-${safePoints}đ`}`,
      currentPoints: curPts,
      newPoints: nextPts,
      deltaPoints: pointType === 'add' ? totalDeltaPts : -totalDeltaPts,
      currentStars: curStars,
      newStars: nextStars,
      deltaStars: pointType === 'add' ? totalDeltaStars : -totalDeltaStars,
    };
  }, [
    targetType,
    selectedStudentId,
    selectedGroupId,
    students,
    groups,
    groupSummaries,
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
      const finalPoints = pointType === 'add' ? Math.abs(points) : -Math.abs(points);
      const finalStars = pointType === 'add' ? Math.abs(stars) : -Math.abs(stars);

      await pointsService.createTransaction({
        classId,
        targetType,
        studentId: targetType === 'student' ? selectedStudentId : undefined,
        groupId: targetType === 'group' ? selectedGroupId : undefined,
        categoryId: selectedCategoryId || undefined,
        points: finalPoints,
        stars: finalStars,
        reason: reason.trim(),
        note: note.trim() || undefined,
      });

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

        {/* 2. Chọn Tiêu chí mẫu - Phân chia 2 phần riêng biệt: Điểm cộng & Điểm trừ */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">
              2. Tiêu chí nề nếp thi đua:
            </label>
            <span className="text-[11px] font-semibold text-slate-400">
              {pointType === 'add'
                ? `${addCategories.length} tiêu chí thưởng`
                : `${subtractCategories.length} tiêu chí vi phạm`}
            </span>
          </div>

          {/* 2 Tab chuyển đổi: Phần Điểm Cộng & Phần Điểm Trừ */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={() => handleSwitchPointType('add')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                pointType === 'add'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span>🌟</span>
              <span>➕ PHẦN ĐIỂM CỘNG</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPointType('subtract')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                pointType === 'subtract'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50/70 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>⚠️</span>
              <span>➖ PHẦN ĐIỂM TRỪ</span>
            </button>
          </div>

          {/* Ô chọn Dropdown đã lọc theo phần được chọn */}
          <select
            value={selectedCategoryId}
            onChange={(e) => handleSelectCategory(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none transition-colors ${
              pointType === 'add'
                ? 'border-emerald-300 focus:border-emerald-500'
                : 'border-rose-300 focus:border-rose-500'
            }`}
          >
            <option value="">
              {pointType === 'add'
                ? '-- Chọn tiêu chí khen thưởng (+Điểm / +Sao) --'
                : '-- Chọn tiêu chí vi phạm (-Điểm) --'}
            </option>
            {activeCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                [{cat.categoryGroup}] {cat.type === 'add' ? '➕' : '➖'} {cat.title} ({cat.type === 'add' ? `+${cat.defaultPoints}đ / ⭐+${cat.defaultStars}` : `${cat.defaultPoints}đ`})
              </option>
            ))}
          </select>
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
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Lý do ghi nhận:
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Trực nhật sạch sẽ, Phát biểu bài xuất sắc..."
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
