import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { PointCategory } from '../../../types/points';
import type { Student, Group } from '../../../types/student';
import { pointsService, type GroupPointsSummary } from '../services/pointsService';
import { AddCategoryForm } from './AddCategoryForm';

interface AwardPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onSuccess: () => void;
  students: Student[];
  groups: Group[];
  categories: PointCategory[];
  groupSummaries?: GroupPointsSummary[];
  onCategoryAdded?: (newCategory: PointCategory) => void;
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
  onCategoryAdded,
}) => {
  const [targetType, setTargetType] = useState<'student' | 'students' | 'group' | 'class'>('student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchKeyword, setStudentSearchKeyword] = useState<string>('');
  const [studentGroupFilter, setStudentGroupFilter] = useState<string>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // Quản lý danh mục tiêu chí nội bộ (hỗ trợ bổ sung tiêu chí mới tại chỗ)
  const [localCategories, setLocalCategories] = useState<PointCategory[]>(categories);
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Hỗ trợ chọn nhiều tiêu chí riêng biệt cho phần Điểm cộng và Điểm trừ
  const [selectedAddCategoryIds, setSelectedAddCategoryIds] = useState<string[]>([]);
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<string[]>([]);
  const [isCustomAdd, setIsCustomAdd] = useState<boolean>(false);
  const [isCustomSub, setIsCustomSub] = useState<boolean>(false);

  // Form bổ sung tiêu chí mới
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [categorySuccessMessage, setCategorySuccessMessage] = useState<string>('');

  const [pointType, setPointType] = useState<'add' | 'subtract'>('add');
  const [points, setPoints] = useState<number>(5);
  const [stars, setStars] = useState<number>(5);
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const reasonInputRef = useRef<HTMLInputElement | null>(null);

  // Tách 2 danh mục tiêu chí riêng biệt: Điểm cộng và Điểm trừ (kèm khử trùng lặp hiển thị)
  const addCategories = useMemo(() => {
    const seen = new Set<string>();
    return localCategories
      .filter((c) => c.type === 'add')
      .filter((c) => {
        const key = c.title.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [localCategories]);

  const subtractCategories = useMemo(() => {
    const seen = new Set<string>();
    return localCategories
      .filter((c) => c.type === 'subtract')
      .filter((c) => {
        const key = c.title.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [localCategories]);

  const activeCategories = pointType === 'add' ? addCategories : subtractCategories;

  // Bật/tắt chọn tiêu chí (Cho phép chọn nhiều hoặc bỏ chọn)
  const handleToggleCategory = useCallback(
    (cat: PointCategory) => {
      if (cat.type === 'add') {
        setIsCustomAdd(false);
        setSelectedAddCategoryIds((prev) => {
          const isAlready = prev.includes(cat.id);
          const next = isAlready ? prev.filter((id) => id !== cat.id) : [...prev, cat.id];
          const activeCats = localCategories.filter((c) => next.includes(c.id));
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
          const activeCats = localCategories.filter((c) => next.includes(c.id));
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
    [localCategories]
  );

  // Xử lý khi tiêu chí mới được tạo thành công
  const handleCategoryCreated = useCallback(
    (newCategory: PointCategory) => {
      setLocalCategories((prev) => [...prev, newCategory]);
      onCategoryAdded?.(newCategory);
      handleToggleCategory(newCategory);
      setCategorySuccessMessage(
        `Đã bổ sung tiêu chí "${newCategory.title}" vào Phần ${
          newCategory.type === 'add' ? 'Điểm Cộng' : 'Điểm Trừ'
        } thành công!`
      );
      setTimeout(() => {
        setCategorySuccessMessage('');
      }, 4000);
    },
    [handleToggleCategory, onCategoryAdded]
  );

  // Xóa tiêu chí khỏi danh mục
  const handleDeleteCategory = useCallback(
    async (e: React.MouseEvent, cat: PointCategory) => {
      e.stopPropagation();
      if (!window.confirm(`Thầy/Cô có chắc chắn muốn xóa tiêu chí "${cat.title}" khỏi danh mục không?`)) {
        return;
      }

      try {
        await pointsService.deleteCategory(cat.id);
        setLocalCategories((prev) => prev.filter((c) => c.id !== cat.id));
        if (cat.type === 'add') {
          setSelectedAddCategoryIds((prev) => prev.filter((id) => id !== cat.id));
        } else {
          setSelectedSubCategoryIds((prev) => prev.filter((id) => id !== cat.id));
        }
      } catch (err) {
        console.error('Lỗi xóa tiêu chí:', err);
      }
    },
    []
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
          const activeCats = localCategories.filter((c) => selectedAddCategoryIds.includes(c.id));
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
          const activeCats = localCategories.filter((c) => selectedSubCategoryIds.includes(c.id));
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
    [localCategories, selectedAddCategoryIds, selectedSubCategoryIds, isCustomAdd, isCustomSub]
  );

  // Lọc danh sách học sinh theo từ khóa tìm kiếm và theo Tổ
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !studentSearchKeyword.trim() ||
        s.fullName.toLowerCase().includes(studentSearchKeyword.trim().toLowerCase());

      const matchGroup =
        studentGroupFilter === 'all' ||
        s.groupId === studentGroupFilter ||
        s.groupName === groups.find((g) => g.id === studentGroupFilter)?.name;

      return matchSearch && matchGroup;
    });
  }, [students, studentSearchKeyword, studentGroupFilter, groups]);

  // Bật/tắt chọn 1 học sinh
  const handleToggleStudent = useCallback((studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }, []);

  // Chọn tất cả học sinh hiển thị theo bộ lọc
  const handleSelectAllFiltered = useCallback(() => {
    const visibleIds = filteredStudents.map((s) => s.id);
    setSelectedStudentIds((prev) => {
      const merged = new Set([...prev, ...visibleIds]);
      return Array.from(merged);
    });
  }, [filteredStudents]);

  // Bỏ chọn tất cả học sinh
  const handleClearSelectedStudents = useCallback(() => {
    setSelectedStudentIds([]);
  }, []);

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSelectedAddCategoryIds([]);
      setSelectedSubCategoryIds([]);
      setSelectedStudentIds([]);
      setStudentSearchKeyword('');
      setStudentGroupFilter('all');
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
    const selectedAddCats = localCategories.filter((c) => selectedAddCategoryIds.includes(c.id));
    const selectedSubCats = localCategories.filter((c) => selectedSubCategoryIds.includes(c.id));
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

    if (targetType === 'students') {
      const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));
      const count = selectedStudents.length;
      if (count === 0) {
        return {
          targetName: 'Chưa chọn học sinh nào',
          targetDesc: 'Vui lòng chọn ít nhất 1 học sinh bên dưới',
          currentPoints: 0,
          newPoints: 0,
          deltaPoints: 0,
          currentStars: 0,
          newStars: 0,
          deltaStars: 0,
        };
      }

      const names = selectedStudents.map((s) => s.fullName);
      const displayName =
        count <= 3
          ? names.join(', ')
          : `${names.slice(0, 3).join(', ')} và ${count - 3} bạn khác`;

      const curPts = selectedStudents.reduce((acc, s) => acc + (s.points || 0), 0);
      const curStars = selectedStudents.reduce((acc, s) => acc + (s.stars || 0), 0);
      const totalDeltaPts = deltaPts * count;
      const totalDeltaStars = deltaStrs * count;
      const nextPts = curPts + totalDeltaPts;
      const nextStars = Math.max(0, curStars + totalDeltaStars);

      return {
        targetName: `Nhóm ${count} học sinh: ${displayName}`,
        targetDesc: `${desc} (Tổng: ${totalDeltaPts > 0 ? `+${totalDeltaPts}` : totalDeltaPts}đ cho cả nhóm)`,
        currentPoints: curPts,
        newPoints: nextPts,
        deltaPoints: totalDeltaPts,
        currentStars: curStars,
        newStars: nextStars,
        deltaStars: totalDeltaStars,
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
    selectedStudentIds,
    selectedGroupId,
    students,
    groups,
    groupSummaries,
    localCategories,
    selectedAddCategoryIds,
    selectedSubCategoryIds,
    points,
    stars,
    pointType,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetType === 'students' && selectedStudentIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất 1 học sinh trong danh sách.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Vui lòng nhập hoặc chọn lý do chấm điểm.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const selectedAddCats = localCategories.filter((c) => selectedAddCategoryIds.includes(c.id));
      const selectedSubCats = localCategories.filter((c) => selectedSubCategoryIds.includes(c.id));

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
            studentIds: targetType === 'students' ? selectedStudentIds : undefined,
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
            studentIds: targetType === 'students' ? selectedStudentIds : undefined,
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
          studentIds: targetType === 'students' ? selectedStudentIds : undefined,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Chấm Điểm Nề Nếp & Thi Đua" size="3xl">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold rounded-xl">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* 1. Chọn Đối tượng áp dụng */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
            1. Áp dụng cho:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setTargetType('student')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                targetType === 'student'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              👤 1 Học sinh
            </button>
            <button
              type="button"
              onClick={() => setTargetType('students')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                targetType === 'students'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              👥 Nhiều học sinh
            </button>
            <button
              type="button"
              onClick={() => setTargetType('group')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                targetType === 'group'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🏘️ Cả Tổ
            </button>
            <button
              type="button"
              onClick={() => setTargetType('class')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                targetType === 'class'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🏫 Cả Lớp ({students.length || 47} em)
            </button>
          </div>
        </div>

        {/* Chọn Học sinh cụ thể */}
        {targetType === 'student' && (
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
              Chọn học sinh:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.groupName || 'Chưa chia tổ'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Chọn nhiều học sinh */}
        {targetType === 'students' && (
          <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90">
            {/* Thanh tìm kiếm & Lọc theo tổ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Tìm nhanh học sinh theo tên..."
                  value={studentSearchKeyword}
                  onChange={(e) => setStudentSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 outline-none focus:border-primary font-medium"
                />
                {studentSearchKeyword && (
                  <button
                    type="button"
                    onClick={() => setStudentSearchKeyword('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Nhóm nút lọc theo tổ */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setStudentGroupFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    studentGroupFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({students.length})
                </button>
                {groups.map((g) => {
                  const countInGroup = students.filter(
                    (s) => s.groupId === g.id || s.groupName === g.name
                  ).length;
                  const isSelected = studentGroupFilter === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setStudentGroupFilter(g.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g.name} ({countInGroup})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thanh thao tác nhanh */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/60 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  ✓ Chọn tất cả ({filteredStudents.length} em)
                </button>
                {selectedStudentIds.length > 0 && (
                  <>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearSelectedStudents}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      ✕ Bỏ chọn tất cả
                    </button>
                  </>
                )}
              </div>

              <span data-testid="selected-students-count" className="font-bold text-slate-700">
                Đã chọn: <span className="text-primary font-black text-sm">{selectedStudentIds.length}</span> / {students.length} em
              </span>
            </div>

            {/* Danh sách các chip học sinh đã chọn */}
            {selectedStudentIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                {selectedStudentIds.map((sid) => {
                  const std = students.find((s) => s.id === sid);
                  if (!std) return null;
                  return (
                    <span
                      key={sid}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                    >
                      <span>{std.fullName}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleStudent(sid)}
                        className="hover:text-rose-600 transition-colors font-black ml-0.5 cursor-pointer"
                        title="Bỏ chọn học sinh này"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Danh sách học sinh dạng lưới Checkbox */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-0.5">
              {filteredStudents.length === 0 ? (
                <div className="col-span-full py-6 text-center text-xs font-semibold text-slate-400">
                  Không tìm thấy học sinh nào phù hợp
                </div>
              ) : (
                filteredStudents.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-primary/5 border-primary shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStudent(s.id)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs sm:text-sm font-bold text-slate-850 truncate">
                            {s.fullName}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            {s.groupName || 'Tổ ?'}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          Điểm: <span className="font-bold text-slate-700">{s.points ?? 0}đ</span>
                          {s.stars ? <span className="text-amber-500 ml-1">⭐ {s.stars}</span> : null}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}

        {targetType === 'group' && (
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
              Chọn tổ:
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-primary outline-none"
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
              {((pointType === 'add' ? selectedAddCategoryIds.length : selectedSubCategoryIds.length) > 0 ||
                (pointType === 'add' ? isCustomAdd : isCustomSub)) && (
                <button
                  type="button"
                  onClick={() => handleClearCategories(pointType)}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  ✕ Bỏ chọn tất cả
                </button>
              )}
              <span className="text-xs font-semibold text-slate-500">
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
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <button
              type="button"
              onClick={() => handleSwitchPointType('add')}
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
              onClick={() => handleSwitchPointType('subtract')}
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
            onCategoryCreated={handleCategoryCreated}
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
                      onClick={() => handleToggleCategory(cat)}
                      className="flex-1 p-2.5 text-left text-xs sm:text-sm flex items-start gap-2.5 cursor-pointer outline-none min-w-0"
                    >
                      <span className="text-base mt-0.5 shrink-0">
                        {isSelected ? '☑️' : '⬜'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {cat.categoryGroup}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-black ${
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
                        <div className="font-bold text-xs sm:text-sm truncate mt-1" title={cat.title}>
                          {cat.title}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCategory(e, cat)}
                      className={`opacity-0 group-hover:opacity-70 hover:opacity-100 p-2.5 text-xs transition-opacity cursor-pointer shrink-0 ${
                        isSelected ? 'text-white hover:text-rose-200' : 'text-slate-400 hover:text-rose-600'
                      }`}
                      title={`Xóa tiêu chí "${cat.title}"`}
                      aria-label="Xóa"
                      data-testid={`delete-cat-${cat.id}`}
                    >
                      🗑️
                    </button>
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
                onClick={() => handleSelectCustomCategory(pointType)}
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

        {/* 3. Hình thức Thưởng / Phạt & Điểm số */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Hình thức:</label>
            <select
              value={pointType}
              onChange={(e) => handleSwitchPointType(e.target.value as 'add' | 'subtract')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-black outline-none transition-colors ${
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
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Điểm thi đua:</label>
            <input
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Sao ⭐:</label>
            <input
              type="number"
              min={0}
              max={50}
              value={stars}
              onChange={(e) => setStars(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* 4. Nội dung lý do */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs sm:text-sm font-bold text-slate-700">
              Lý do ghi nhận:
            </label>
            {(isCustomAdd || isCustomSub) && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
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
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:border-primary outline-none"
          />
        </div>

        {/* Ghi chú thêm */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
            Ghi chú chi tiết (Tùy chọn):
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Thêm thông tin hoặc người làm chứng..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-700 outline-none resize-none"
          />
        </div>

        {/* Khung Xem Trước Điểm Tổng Kết Trực Tiếp (Live Preview Badge) */}
        <div
          data-testid="live-preview-badge"
          className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all shadow-xs ${
            pointType === 'add'
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-2 flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <span className="text-base">{pointType === 'add' ? '🎯' : '⚠️'}</span>
              <span className="uppercase tracking-wide">Xem trước biến động điểm</span>
            </span>
            <span
              className={`text-xs font-black px-3 py-0.5 rounded-full border ${
                pointType === 'add'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}
            >
              {previewData.targetDesc}
            </span>
          </div>

          {/* Chi tiết biến động điểm & số liệu trực quan */}
          <div className="bg-white/95 backdrop-blur-xs rounded-xl p-3 sm:p-3.5 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="font-black text-slate-900 text-sm sm:text-base truncate max-w-xs sm:max-w-md" title={previewData.targetName}>
              {previewData.targetName}
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Điểm số */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm:</span>
                <span className="text-sm font-bold text-slate-500">{previewData.currentPoints}đ</span>
                <span className="text-slate-400 font-bold mx-0.5">➔</span>
                <span className={`text-base sm:text-lg font-black ${pointType === 'add' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {previewData.newPoints}đ
                </span>
                <span className={`text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg ${
                  pointType === 'add' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  ({previewData.deltaPoints >= 0 ? `+${previewData.deltaPoints}đ` : `${previewData.deltaPoints}đ`})
                </span>
              </div>

              {/* Sao thi đua */}
              {(stars > 0 || previewData.currentStars > 0) && (
                <div className="flex items-center gap-1.5 pl-3 sm:pl-4 border-l border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sao:</span>
                  <span className="text-sm font-bold text-slate-500">{previewData.currentStars}⭐</span>
                  <span className="text-slate-400 font-bold mx-0.5">➔</span>
                  <span className="text-base sm:text-lg font-black text-amber-500">{previewData.newStars}⭐</span>
                  <span className="text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800">
                    ({previewData.deltaStars > 0 ? `+${previewData.deltaStars}⭐` : (previewData.deltaStars < 0 ? `${previewData.deltaStars}⭐` : '0⭐')})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2.5 pt-2 border-t border-slate-100 justify-end">
          <Button type="button" variant="outline" size="md" onClick={onClose} className="px-5 py-2.5 text-xs sm:text-sm font-bold">
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="px-6 py-2.5 text-xs sm:text-sm font-black shadow-xs">
            GHI NHẬN VÀO SỔ CÁI
          </Button>
        </div>
      </form>
    </Modal>
  );
};
