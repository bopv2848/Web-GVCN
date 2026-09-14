import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { soundEffects } from '../utils/soundEffects';

export const ClassroomToolsPage: React.FC = () => {
  const { currentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const [activeTab, setActiveTab] = useState<'wheel' | 'card' | 'timer'>('wheel');
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<PointCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Quản lý trạng thái Âm thanh (Đồng bộ với soundEffects & LocalStorage)
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getMuted());

  // 2. Quản lý chế độ Toàn Màn Hình (Fullscreen Mode)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. Danh sách các học sinh đã được gọi (Đồng bộ với LocalStorage theo ngày)
  const [calledStudentIds, setCalledStudentIds] = useState<Set<string>>(new Set());
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null);
  const [isPickedModalOpen, setIsPickedModalOpen] = useState<boolean>(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState<boolean>(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  // Khóa lưu trữ LocalStorage theo ngày & lớp học
  const getTodayStorageKey = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    return `gvcn_called_students_${classId}_${today}`;
  }, [classId]);

  // Lắng nghe thay đổi trạng thái Mute từ soundEffects
  useEffect(() => {
    const unsub = soundEffects.subscribeMute((muted) => {
      setIsMuted(muted);
    });
    return unsub;
  }, []);

  // Lắng nghe sự kiện thay đổi Fullscreen từ trình duyệt (kể cả khi bấm phím Esc)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  // Nạp lịch sử học sinh đã gọi trong ngày từ LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getTodayStorageKey());
      if (saved) {
        const parsedIds = JSON.parse(saved);
        if (Array.isArray(parsedIds)) {
          setCalledStudentIds(new Set(parsedIds));
        }
      }
    } catch (err) {
      console.warn('Lỗi đọc lịch sử gọi học sinh từ LocalStorage:', err);
    }
  }, [getTodayStorageKey]);

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

  // Xử lý khi một học sinh được chọn (Tự động lưu vào LocalStorage)
  const handleStudentPicked = (student: Student) => {
    setCalledStudentIds((prev) => {
      const next = new Set(prev).add(student.id);
      try {
        localStorage.setItem(getTodayStorageKey(), JSON.stringify(Array.from(next)));
      } catch (err) {
        console.warn('Lỗi lưu lịch sử gọi tên vào LocalStorage:', err);
      }
      return next;
    });
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

  // Làm mới lịch sử gọi tên và xóa LocalStorage
  const handleResetCalled = () => {
    setCalledStudentIds(new Set());
    try {
      localStorage.removeItem(getTodayStorageKey());
    } catch (err) {
      console.warn('Lỗi xóa lịch sử gọi tên khỏi LocalStorage:', err);
    }
    setRewardMessage('🔄 Đã làm mới danh sách gọi tên của tiết học này.');
    setTimeout(() => setRewardMessage(null), 3000);
  };

  // Bật / Tắt chế độ Toàn màn hình
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Lỗi khi chuyển đổi chế độ toàn màn hình:', err);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`space-y-6 transition-all duration-300 ${
        isFullscreen
          ? 'p-6 md:p-8 bg-slate-900 text-slate-100 min-h-screen overflow-y-auto'
          : ''
      }`}
    >
      {/* 1. Header & Tabs Chuyển Đổi Công Cụ */}
      <div
        className={`flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 p-5 md:p-6 rounded-3xl border shadow-xs transition-all ${
          isFullscreen
            ? 'bg-slate-800/90 border-slate-700 backdrop-blur-md'
            : 'bg-white border-slate-200/80'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className={`text-xl md:text-2xl font-black tracking-tight ${
                isFullscreen ? 'text-white' : 'text-slate-850'
              }`}
            >
              Bộ Công Cụ Tương Tác Tiết Học
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase">
              Tiết Dạy Hứng Khởi
            </span>
            {isFullscreen && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-900/60 text-cyan-300 border border-cyan-700 animate-pulse">
                ⛶ Đang Chiếu Toàn Màn Hình
              </span>
            )}
          </div>
          <p className={`text-xs font-semibold mt-1 ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
            Vòng quay may mắn gọi tên, thẻ bài bốc thăm 47 học sinh và đồng hồ đếm ngược có chuông báo
          </p>
        </div>

        {/* Các nút điều khiển: Tab chuyển đổi, Âm thanh, Toàn màn hình */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3 Tab chuyển đổi */}
          <div
            className={`flex items-center gap-1.5 p-1.5 rounded-2xl ${
              isFullscreen ? 'bg-slate-700/80' : 'bg-slate-100'
            }`}
          >
            <button
              onClick={() => setActiveTab('wheel')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'wheel'
                  ? 'bg-primary text-white shadow-xs font-black'
                  : isFullscreen
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎯 Vòng Quay 3D
            </button>
            <button
              onClick={() => setActiveTab('card')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'card'
                  ? 'bg-primary text-white shadow-xs font-black'
                  : isFullscreen
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🃏 Bốc Thăm Bí Ẩn
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'timer'
                  ? 'bg-primary text-white shadow-xs font-black'
                  : isFullscreen
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏳ Chuông Đếm Giờ
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

          {/* Nút Bật/Tắt Âm Thanh */}
          <button
            onClick={() => soundEffects.setMuted(!isMuted)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
              isMuted
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
            }`}
            title={isMuted ? 'Nhấn để Bật âm thanh' : 'Nhấn để Tắt âm thanh (Chế độ yên lặng lớp học)'}
          >
            <span>{isMuted ? '🔇 Tắt Tiếng' : '🔊 Âm Thanh'}</span>
          </button>

          {/* Nút Toàn Màn Hình */}
          <button
            onClick={handleToggleFullscreen}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
              isFullscreen
                ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 font-black'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={
              isFullscreen
                ? 'Thu nhỏ lại cửa sổ bình thường (hoặc nhấn phím Esc)'
                : 'Chiếu Toàn Màn Hình lên TV / Máy Chiếu Lớp Học'
            }
          >
            <span>{isFullscreen ? '🗗 Thu Nhỏ (Esc)' : '⛶ Toàn Màn Hình'}</span>
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
          <div
            className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between transition-all ${
              isFullscreen
                ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                : 'bg-white border-slate-200/80 text-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-3">
                <div>
                  <h3
                    className={`text-sm font-black ${
                      isFullscreen ? 'text-white' : 'text-slate-850'
                    }`}
                  >
                    Đã Gọi ({calledStudentIds.size}/{students.length})
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Đã lưu theo ngày
                  </span>
                </div>
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
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          isFullscreen
                            ? 'bg-slate-700/60 border-slate-600 text-slate-200'
                            : 'bg-slate-50 border-slate-150 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-bold">{st.fullName}</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${
                            isFullscreen ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          {st.groupName}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <span>Chưa có học sinh nào được gọi trong tiết này.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
              <span
                className={`text-[11px] font-medium ${
                  isFullscreen ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                * Tự động loại trừ để tránh gọi trùng lặp trong buổi dạy.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Vinh Danh Học Sinh Được Chọn (Nằm trong container để hiển thị khi Toàn màn hình) */}
      <PickedStudentModal
        isOpen={isPickedModalOpen}
        onClose={() => setIsPickedModalOpen(false)}
        student={pickedStudent}
        onAwardPoints={handleOpenAwardPoints}
        onSpinAgain={() => {}}
      />

      {/* 4. Modal Khen Thưởng Tích Điểm Trực Tiếp (Nằm trong container để hiển thị khi Toàn màn hình) */}
      <AwardPointsModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        classId={classId}
        onSuccess={handleAwardSuccess}
        onCategoryAdded={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
        }}
        students={students}
        groups={groups}
        categories={categories}
      />
    </div>
  );
};
