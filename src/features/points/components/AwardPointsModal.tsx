import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { PointCategory } from '../../../types/points';
import type { Student, Group } from '../../../types/student';
import type { GroupPointsSummary } from '../services/pointsService';
import { useAwardPointsForm } from '../hooks/useAwardPointsForm';
import { AwardStudentBatchList } from './AwardStudentBatchList';
import { AwardCriteriaGrid } from './AwardCriteriaGrid';
import { EditCriteriaForm } from './EditCriteriaForm';
import { AwardLivePreviewBadge } from './AwardLivePreviewBadge';

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
  onCategoryUpdated?: (updatedCategory: PointCategory) => void;
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
  onCategoryUpdated,
}) => {
  const {
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
    localCategories,
  } = useAwardPointsForm({
    classId,
    isOpen,
    onClose,
    onSuccess,
    students,
    groups,
    categories,
    onCategoryAdded,
    onCategoryUpdated,
  });

  return (
    <>
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

          {/* Chọn 1 Học sinh cụ thể */}
          {targetType === 'student' && (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Chọn học sinh:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={students.length === 0}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-850 bg-slate-50 focus:bg-white focus:border-primary outline-none"
              >
                {students.length === 0 ? (
                  <option value="">⏳ Đang nạp danh sách học sinh...</option>
                ) : (
                  students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.groupName || 'Chưa chia tổ'})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Chọn nhiều học sinh - Component con AwardStudentBatchList */}
          {targetType === 'students' && (
            <AwardStudentBatchList
              students={students}
              groups={groups}
              selectedStudentIds={selectedStudentIds}
              onToggleStudent={handleToggleStudent}
              onSelectAllFiltered={handleSelectAllFiltered}
              onClearSelectedStudents={handleClearSelectedStudents}
            />
          )}

          {/* Chọn Tổ */}
          {targetType === 'group' && (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Chọn tổ:
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-850 bg-slate-50 focus:bg-white focus:border-primary outline-none"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Lưới Tiêu chí thi đua - Component con AwardCriteriaGrid */}
          <AwardCriteriaGrid
            classId={classId}
            pointType={pointType}
            onSwitchPointType={handleSwitchPointType}
            activeCategories={activeCategories}
            selectedAddCategoryIds={selectedAddCategoryIds}
            selectedSubCategoryIds={selectedSubCategoryIds}
            isCustomAdd={isCustomAdd}
            isCustomSub={isCustomSub}
            onToggleCategory={handleToggleCategory}
            onSelectCustomCategory={handleSelectCustomCategory}
            onClearCategories={handleClearCategories}
            onEditCategory={(cat) => setEditingCategory(cat)}
            onDeleteCategory={handleDeleteCategory}
            onCategoryCreated={handleCategoryCreated}
            categorySuccessMessage={categorySuccessMessage}
          />

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

          {/* Khung Xem Trước Điểm Tổng Kết Trực Tiếp - Component con AwardLivePreviewBadge */}
          <AwardLivePreviewBadge
            targetType={targetType}
            selectedStudentId={selectedStudentId}
            selectedStudentIds={selectedStudentIds}
            selectedGroupId={selectedGroupId}
            students={students}
            groups={groups}
            groupSummaries={groupSummaries}
            localCategories={localCategories}
            selectedAddCategoryIds={selectedAddCategoryIds}
            selectedSubCategoryIds={selectedSubCategoryIds}
            points={points}
            stars={stars}
            pointType={pointType}
          />

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

      {/* Modal Điều chỉnh điểm cộng, điểm trừ, số sao của tiêu chí - Component con EditCriteriaForm */}
      <EditCriteriaForm
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </>
  );
};