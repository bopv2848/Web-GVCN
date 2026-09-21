import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { PointCategory } from '../../../types/points';
import type { Student, Group } from '../../../types/student';
import { pointsService } from '../services/pointsService';

export interface UseAwardPointsFormProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  students: Student[];
  groups: Group[];
  categories: PointCategory[];
  onCategoryAdded?: (newCategory: PointCategory) => void;
  onCategoryUpdated?: (updatedCategory: PointCategory) => void;
}

export const useAwardPointsForm = ({
  classId,
  isOpen,
  onClose,
  onSuccess,
  students,
  groups,
  categories,
  onCategoryAdded,
  onCategoryUpdated,
}: UseAwardPointsFormProps) => {
  const [targetType, setTargetType] = useState<'student' | 'students' | 'group' | 'class'>('student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');

  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

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

  // Form điều chỉnh điểm cộng, điểm trừ và số sao của tiêu chí
  const [editingCategory, setEditingCategory] = useState<PointCategory | null>(null);
  const [categorySuccessMessage, setCategorySuccessMessage] = useState<string>('');

  const [pointType, setPointType] = useState<'add' | 'subtract'>('add');
  const [points, setPoints] = useState<number>(5);
  const [stars, setStars] = useState<number>(5);
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const reasonInputRef = useRef<HTMLInputElement | null>(null);
  const categoryMsgTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (categoryMsgTimeoutRef.current) clearTimeout(categoryMsgTimeoutRef.current);
    };
  }, []);

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
      if (categoryMsgTimeoutRef.current) clearTimeout(categoryMsgTimeoutRef.current);
      categoryMsgTimeoutRef.current = setTimeout(() => {
        setCategorySuccessMessage('');
      }, 4000);
    },
    [handleToggleCategory, onCategoryAdded]
  );

  // Xử lý khi tiêu chí được chỉnh sửa thành công (điểm cộng, điểm trừ, sao)
  const handleCategoryUpdated = useCallback(
    (updatedCat: PointCategory) => {
      setLocalCategories((prev) =>
        prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
      );
      onCategoryUpdated?.(updatedCat);

      if (updatedCat.type === 'add') {
        setSelectedAddCategoryIds((prev) => {
          if (!prev.includes(updatedCat.id)) return prev;
          const activeCats = localCategories
            .map((c) => (c.id === updatedCat.id ? updatedCat : c))
            .filter((c) => prev.includes(c.id));
          const totalPts = activeCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);
          const totalStrs = activeCats.reduce((sum, c) => sum + Math.abs(c.defaultStars), 0);
          setPoints(totalPts);
          setStars(totalStrs);
          setReason(activeCats.map((c) => c.title).join('; '));
          return prev;
        });
      } else {
        setSelectedSubCategoryIds((prev) => {
          if (!prev.includes(updatedCat.id)) return prev;
          const activeCats = localCategories
            .map((c) => (c.id === updatedCat.id ? updatedCat : c))
            .filter((c) => prev.includes(c.id));
          const totalPts = activeCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);
          setPoints(totalPts);
          setReason(activeCats.map((c) => c.title).join('; '));
          return prev;
        });
      }

      setCategorySuccessMessage(
        `Đã điều chỉnh tiêu chí "${updatedCat.title}" (${
          updatedCat.type === 'add' ? `+${updatedCat.defaultPoints}` : `-${updatedCat.defaultPoints}`
        }đ${updatedCat.type === 'add' && updatedCat.defaultStars > 0 ? `, ⭐+${updatedCat.defaultStars}` : ''}) thành công!`
      );
      if (categoryMsgTimeoutRef.current) clearTimeout(categoryMsgTimeoutRef.current);
      categoryMsgTimeoutRef.current = setTimeout(() => {
        setCategorySuccessMessage('');
      }, 4000);
    },
    [localCategories, onCategoryUpdated]
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

  // Bật/tắt chọn 1 học sinh
  const handleToggleStudent = useCallback((studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }, []);

  // Chọn tất cả học sinh hiển thị theo bộ lọc
  const handleSelectAllFiltered = useCallback((visibleIds: string[]) => {
    setSelectedStudentIds((prev) => {
      const merged = new Set([...prev, ...visibleIds]);
      return Array.from(merged);
    });
  }, []);

  // Bỏ chọn tất cả học sinh
  const handleClearSelectedStudents = useCallback(() => {
    setSelectedStudentIds([]);
  }, []);

  // Reset khi mở modal (Chỉ reset toàn bộ khi modal chuyển từ đóng sang mở)
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setErrorMessage('');
      setSelectedAddCategoryIds([]);
      setSelectedSubCategoryIds([]);
      setSelectedStudentIds([]);
      setIsCustomAdd(false);
      setIsCustomSub(false);
      setPointType('add');
      setPoints(5);
      setStars(5);
      setReason('');
      setNote('');
      if (students.length > 0) {
        setSelectedStudentId(students[0].id);
      }
      if (groups.length > 0) {
        setSelectedGroupId(groups[0].id);
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, students, groups]);

  // Tự động gán học sinh hoặc tổ mặc định khi danh sách nạp sau mà không xóa dữ liệu người dùng đang nhập
  useEffect(() => {
    if (isOpen) {
      if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
      }
      if (groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groups[0].id);
      }
    }
  }, [isOpen, students, groups, selectedStudentId, selectedGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveStudentId = selectedStudentId || students[0]?.id;
    const effectiveGroupId = selectedGroupId || groups[0]?.id;

    if (targetType === 'student' && !effectiveStudentId) {
      setErrorMessage('Vui lòng đợi danh sách học sinh tải xong hoặc chọn học sinh.');
      return;
    }
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
        const addPts = selectedAddCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);
        const addStrs = selectedAddCats.reduce((sum, c) => sum + Math.abs(c.defaultStars), 0);
        const subPts = selectedSubCats.reduce((sum, c) => sum + Math.abs(c.defaultPoints), 0);

        await Promise.all([
          pointsService.createTransaction({
            classId,
            targetType,
            studentId: targetType === 'student' ? effectiveStudentId : undefined,
            studentIds: targetType === 'students' ? selectedStudentIds : undefined,
            groupId: targetType === 'group' ? effectiveGroupId : undefined,
            categoryId: selectedAddCats[0].id,
            points: addPts,
            stars: addStrs,
            reason: selectedAddCats.map((c) => c.title).join('; '),
            note: note.trim() || undefined,
          }),
          pointsService.createTransaction({
            classId,
            targetType,
            studentId: targetType === 'student' ? effectiveStudentId : undefined,
            studentIds: targetType === 'students' ? selectedStudentIds : undefined,
            groupId: targetType === 'group' ? effectiveGroupId : undefined,
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
          studentId: targetType === 'student' ? effectiveStudentId : undefined,
          studentIds: targetType === 'students' ? selectedStudentIds : undefined,
          groupId: targetType === 'group' ? effectiveGroupId : undefined,
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

  return {
    targetType,
    setTargetType,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudentIds,
    handleToggleStudent,
    handleSelectAllFiltered,
    handleClearSelectedStudents,
    selectedGroupId,
    setSelectedGroupId,
    localCategories,
    activeCategories,
    selectedAddCategoryIds,
    selectedSubCategoryIds,
    isCustomAdd,
    isCustomSub,
    editingCategory,
    setEditingCategory,
    categorySuccessMessage,
    pointType,
    points,
    setPoints,
    stars,
    setStars,
    reason,
    setReason,
    note,
    setNote,
    isLoading,
    errorMessage,
    reasonInputRef,
    handleToggleCategory,
    handleCategoryCreated,
    handleCategoryUpdated,
    handleDeleteCategory,
    handleSelectCustomCategory,
    handleClearCategories,
    handleSwitchPointType,
    handleSubmit,
  };
};
