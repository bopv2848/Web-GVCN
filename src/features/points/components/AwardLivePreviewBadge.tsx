import React, { useMemo } from 'react';
import type { PointCategory } from '../../../types/points';
import type { Student, Group } from '../../../types/student';
import type { GroupPointsSummary } from '../services/pointsService';

export interface AwardLivePreviewBadgeProps {
  targetType: 'student' | 'students' | 'group' | 'class';
  selectedStudentId: string;
  selectedStudentIds: string[];
  selectedGroupId: string;
  students: Student[];
  groups: Group[];
  groupSummaries?: GroupPointsSummary[];
  localCategories: PointCategory[];
  selectedAddCategoryIds: string[];
  selectedSubCategoryIds: string[];
  points: number;
  stars: number;
  pointType: 'add' | 'subtract';
}

export const AwardLivePreviewBadge: React.FC<AwardLivePreviewBadgeProps> = ({
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
}) => {
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

  return (
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
        <div
          className="font-black text-slate-900 text-sm sm:text-base truncate max-w-xs sm:max-w-md"
          title={previewData.targetName}
        >
          {previewData.targetName}
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Điểm số */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm:</span>
            <span className="text-sm font-bold text-slate-500">{previewData.currentPoints}đ</span>
            <span className="text-slate-400 font-bold mx-0.5">➔</span>
            <span
              className={`text-base sm:text-lg font-black ${
                pointType === 'add' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {previewData.newPoints}đ
            </span>
            <span
              className={`text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg ${
                pointType === 'add'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
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
  );
};
