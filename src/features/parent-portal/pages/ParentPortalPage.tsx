import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { parentPortalService } from '../services/parentPortalService';
import { ParentLookupForm } from '../components/ParentLookupForm';
import { ParentStudentProfileCard } from '../components/ParentStudentProfileCard';
import { ParentOverviewTab } from '../components/ParentOverviewTab';
import { ParentPointLedgerTab } from '../components/ParentPointLedgerTab';
import { ParentAttendanceTab } from '../components/ParentAttendanceTab';
import { ParentTimetableTab } from '../components/ParentTimetableTab';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { studentService } from '../../students/services/studentService';
import type { Student } from '../../../types/student';
import type { ParentStudentPortalData } from '../types';

export const ParentPortalPage: React.FC = () => {
  const { token: urlToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  const navigate = useNavigate();

  const { isAuthenticated, currentClass, membership, user } = useAuth();
  const isTeacher =
    isAuthenticated &&
    (membership?.role === 'gvcn' || user?.role === 'gvcn' || user?.role === 'admin');

  const [portalData, setPortalData] = useState<ParentStudentPortalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'points' | 'attendance' | 'timetable'>(
    'overview'
  );

  // Danh sách học sinh cho chế độ Thầy GVCN xem trước
  const [teacherStudents, setTeacherStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  const loadStudentData = useCallback(async (studentId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await parentPortalService.getStudentPortalData(studentId);
      setPortalData(data);
    } catch (err: unknown) {
      console.error('Lỗi tải dữ liệu cổng phụ huynh:', err);
      setErrorMessage('Không thể tải dữ liệu học sinh. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const classId = currentClass?.id;

  // Tải danh sách học sinh nếu là GVCN đăng nhập
  useEffect(() => {
    if (isTeacher && classId) {
      studentService
        .getStudents(classId)
        .then((students) => {
          setTeacherStudents(students);
        })
        .catch((err) => console.error('Lỗi tải danh sách học sinh xem trước:', err));
    }
  }, [isTeacher, classId]);

  // Tự động chọn học sinh đầu tiên cho GVCN xem trước khi chưa chọn
  useEffect(() => {
    if (isTeacher && teacherStudents.length > 0 && !selectedStudentId && !urlToken && !queryToken) {
      const firstStudentId = teacherStudents[0].id;
      setSelectedStudentId(firstStudentId);
      loadStudentData(firstStudentId);
    }
  }, [isTeacher, teacherStudents, selectedStudentId, urlToken, queryToken, loadStudentData]);

  const handleLookupByToken = useCallback(
    async (tokenStr: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await parentPortalService.lookupByToken(tokenStr);
        if (result.success && result.data) {
          setPortalData(result.data);
          localStorage.setItem('parent_portal_token', tokenStr);
        } else {
          setErrorMessage(result.error || 'Không tìm thấy dữ liệu học sinh.');
        }
      } catch {
        setErrorMessage('Đã xảy ra lỗi kết nối máy chủ.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleLookupByCodeAndPin = useCallback(
    async (code: string, pin: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await parentPortalService.lookupByCodeAndPin(code, pin);
        if (result.success && result.data) {
          setPortalData(result.data);
          localStorage.setItem('parent_portal_token', code);
        } else {
          setErrorMessage(result.error || 'Tra cứu không thành công.');
        }
      } catch {
        setErrorMessage('Lỗi kết nối máy chủ.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Tự động nhận diện token từ URL hoặc localStorage khi vào trang
  useEffect(() => {
    const activeToken = urlToken || queryToken;
    if (activeToken) {
      handleLookupByToken(activeToken);
    } else if (!isTeacher) {
      // Khôi phục phiên tra cứu gần nhất nếu phụ huynh quay lại
      const savedToken = localStorage.getItem('parent_portal_token');
      if (savedToken) {
        handleLookupByToken(savedToken);
      }
    }
  }, [urlToken, queryToken, isTeacher, handleLookupByToken]);

  // Xử lý Thầy đổi học sinh trong dropdown xem trước
  const handleTeacherSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (studentId) {
      loadStudentData(studentId);
    } else {
      setPortalData(null);
    }
  };

  // Sao chép link gửi Zalo phụ huynh
  const handleCopyZaloLink = () => {
    if (!portalData) return;
    const shareUrl = `${window.location.origin}/tra-cuu/${portalData.student.code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Đăng xuất / Đổi học sinh khác
  const handleReset = () => {
    localStorage.removeItem('parent_portal_token');
    setPortalData(null);
    setErrorMessage(null);
    if (urlToken || queryToken) {
      navigate('/tra-cuu', { replace: true });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full px-2 sm:px-4 py-4 md:py-6">
      {/* 1. THANH CÔNG CỤ DÀNH RIÊNG CHO GVCN (Khi Thầy đăng nhập xem trước) */}
      {isTeacher && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 md:p-5 rounded-3xl shadow-xl space-y-3 border border-indigo-500/30 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-sm font-black shadow-sm">
                👁️
              </span>
              <div>
                <h3 className="text-sm md:text-base font-black tracking-tight text-white flex items-center gap-2">
                  Chế độ Xem trước Cổng Phụ Huynh (GVCN)
                </h3>
                <p className="text-xs text-indigo-200/80 font-medium">
                  Xem chính xác những gì phụ huynh nhìn thấy khi mở link từ Zalo
                </p>
              </div>
            </div>

            {/* Nút sao chép link Zalo */}
            {portalData && (
              <button
                onClick={handleCopyZaloLink}
                className="self-start md:self-auto px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-md"
              >
                <span>{copySuccess ? '✓ Đã sao chép!' : '📋 Copy Link Tra Cứu Zalo'}</span>
              </button>
            )}
          </div>

          {/* Dropdown chọn học sinh trong lớp */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-indigo-900/60">
            <label className="text-xs font-bold text-indigo-200 whitespace-nowrap">
              Xem sổ liên lạc của em:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleTeacherSelectStudent(e.target.value)}
              className="bg-slate-800 border border-indigo-700/60 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400 w-full sm:w-80"
            >
              <option value="">-- Chọn học sinh để xem trước --</option>
              {teacherStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code || 'HS'} - {s.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 2. HEADER THƯƠNG HIỆU (Khi truy cập công khai ngoài AppLayout) */}
      {!isTeacher && (
        <div className="text-center space-y-1.5 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200/70 text-amber-900 text-xs font-black mb-1">
            <span>🏫</span> TRƯỜNG THCS TÂN HẢI
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
            Sổ Liên Lạc Điện Tử • Lớp 6A6
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Kênh tra cứu trực tuyến nề nếp, chuyên cần và học tập của học sinh
          </p>
        </div>
      )}

      {/* 3. TRẠNG THÁI TẢI DỮ LIỆU */}
      {isLoading && (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" text="Đang tải dữ liệu sổ liên lạc của con..." />
        </div>
      )}

      {/* 4. CHƯA CÓ DỮ LIỆU HỌC SINH -> HIỂN THỊ FORM TRA CỨU */}
      {!isLoading && !portalData && (
        <ParentLookupForm
          onLookupByToken={handleLookupByToken}
          onLookupByCodeAndPin={handleLookupByCodeAndPin}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />
      )}

      {/* 5. ĐÃ CÓ DỮ LIỆU HỌC SINH -> HIỂN THỊ SỔ LIÊN LẠC CHI TIẾT */}
      {!isLoading && portalData && (
        <div className="space-y-5 animate-fade-in">
          {/* Thẻ Hồ Sơ Học Sinh */}
          <ParentStudentProfileCard data={portalData} onLogout={handleReset} />

          {/* Thanh chuyển Tab */}
          <div className="flex rounded-2xl bg-slate-200/70 p-1 gap-1 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📌</span> Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'points'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⭐</span> Điểm thi đua ({portalData.pointTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'attendance'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📅</span> Chuyên cần ({portalData.attendanceRate}%)
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'timetable'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🗓️</span> Thời khóa biểu
            </button>
          </div>

          {/* Nội dung Tab */}
          <div className="transition-all">
            {activeTab === 'overview' && (
              <ParentOverviewTab data={portalData} onSelectTab={setActiveTab} />
            )}
            {activeTab === 'points' && <ParentPointLedgerTab data={portalData} />}
            {activeTab === 'attendance' && <ParentAttendanceTab data={portalData} />}
            {activeTab === 'timetable' && <ParentTimetableTab data={portalData} />}
          </div>
        </div>
      )}
    </div>
  );
};
