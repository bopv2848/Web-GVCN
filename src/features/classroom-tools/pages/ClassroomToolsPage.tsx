import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { studentService } from '../../students/services/studentService';
import { pointsService } from '../../points/services/pointsService';
import type { Student, Group } from '../../../types/student';
import type { PointCategory } from '../../../types/points';
import { LuckyWheel } from '../components/LuckyWheel';
import { MysteryCardPicker } from '../components/MysteryCardPicker';
import { ClassroomTimer } from '../components/ClassroomTimer';
import { PickedStudentModal } from '../components/PickedStudentModal';
import { AwardPointsModal } from '../../points/components/AwardPointsModal';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const ClassroomToolsPage: React.FC = () => {
  const { currentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const [activeTab, setActiveTab] = useState<'wheel' | 'card' | 'timer'>('wheel');
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<PointCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Danh sách các học sinh đã được gọi trong tiết học hôm nay
  const [calledStudentIds, setCalledStudentIds] = useState<Set<string>>(new Set());
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null);
  const [isPickedModalOpen, setIsPickedModalOpen] = useState<boolean>(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState<boolean>(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  // Nạp 47 học sinh, 4 tổ và tiêu chí từ Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stds, grps, cats] = await Promise.all([
        studentService.getStudents(classId),
        studentService.getGroups(classId),
        pointsService.getCategories(classId),
      ]);
      setStudents(stds);
      setGroups(grps);
      setCategories(cats);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu học sinh cho công cụ lớp:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Xử lý khi một học sinh được chọn
  const handleStudentPicked = (student: Student) => {
    setCalledStudentIds((prev) => new Set(prev).add(student.id));
    setPickedStudent(student);
    setIsPickedModalOpen(true);
  };

  // Mở modal cộng điểm thi đua cho học sinh vừa trúng
  const handleOpenAwardPoints = () => {
    setIsAwardModalOpen(true);
  };

  const handleAwardSuccess = () => {
    setIsAwardModalOpen(false);
    setRewardMessage(`🎉 Đã cộng điểm thi đua thành công cho ${pickedStudent?.fullName}!`);
    setTimeout(() => setRewardMessage(null), 4000);
  };

  const handleResetCalled = () => {
    setCalledStudentIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Tabs Chuyển Đổi Công Cụ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Bộ Công Cụ Tương Tác Tiết Học
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase">
              Tiết Dạy Hứng Khởi
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Vòng quay may mắn gọi tên, thẻ bài bốc thăm 47 học sinh và đồng hồ đếm ngược có chuông báo
          </p>
        </div>

        {/* 3 Tab chuyển đổi */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('wheel')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wheel'
                ? 'bg-primary text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎯 Vòng Quay 3D
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'card'
                ? 'bg-primary text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🃏 Bốc Thăm Bí Ẩn
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'timer'
                ? 'bg-primary text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⏳ Chuông Đếm Giờ
          </button>
        </div>
      </div>

      {rewardMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl animate-fade-in flex items-center justify-between">
          <span>{rewardMessage}</span>
          <button onClick={() => setRewardMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* 2. Nội dung công cụ chính */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-bold text-slate-500">Đang chuẩn bị danh sách học sinh Lớp 6A6...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cột trái: Công cụ chính (Vòng quay, Thẻ bài, hoặc Timer) */}
          <div className="lg:col-span-3">
            {activeTab === 'wheel' && (
              <LuckyWheel
                students={students}
                onStudentPicked={handleStudentPicked}
                calledStudentIds={calledStudentIds}
                onResetCalled={handleResetCalled}
              />
            )}

            {activeTab === 'card' && (
              <MysteryCardPicker
                students={students}
                onStudentPicked={handleStudentPicked}
                calledStudentIds={calledStudentIds}
              />
            )}

            {activeTab === 'timer' && <ClassroomTimer />}
          </div>

          {/* Cột phải: Lịch sử các em đã được gọi trong tiết học */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="text-sm font-black text-slate-850">
                  Đã Gọi ({calledStudentIds.size}/{students.length})
                </h3>
                {calledStudentIds.size > 0 && (
                  <button
                    onClick={handleResetCalled}
                    className="text-[11px] text-primary hover:underline font-bold"
                  >
                    Xóa lịch sử
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                {calledStudentIds.size > 0 ? (
                  students
                    .filter((s) => calledStudentIds.has(s.id))
                    .map((st, index) => (
                      <div
                        key={st.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-bold text-slate-800">{st.fullName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{st.groupName}</span>
                      </div>
                    ))
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <span>Chưa có học sinh nào được gọi trong tiết này.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 font-medium">
                * Học sinh đã gọi sẽ tạm thời không xuất hiện ở các lượt tiếp theo để đảm bảo công bằng.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Vinh Danh Học Sinh Được Chọn */}
      <PickedStudentModal
        isOpen={isPickedModalOpen}
        onClose={() => setIsPickedModalOpen(false)}
        student={pickedStudent}
        onAwardPoints={handleOpenAwardPoints}
        onSpinAgain={() => {}}
      />

      {/* 4. Modal Khen Thưởng Tích Điểm Trực Tiếp */}
      <AwardPointsModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        classId={classId}
        onSuccess={handleAwardSuccess}
        students={students}
        groups={groups}
        categories={categories}
      />
    </div>
  );
};
