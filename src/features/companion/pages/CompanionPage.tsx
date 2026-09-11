import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { companionService } from '../services/companionService';
import { studentService } from '../../students/services/studentService';
import type { CompanionCase, CaseStatus, CompanionFormData } from '../types';
import type { Student } from '../../../types/student';

import { CompanionKpiCards } from '../components/CompanionKpiCards';
import { CompanionCaseCard } from '../components/CompanionCaseCard';
import { CompanionCaseModal } from '../components/CompanionCaseModal';
import { CompanionDetailModal } from '../components/CompanionDetailModal';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const CompanionPage: React.FC = () => {
  const { user, currentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';
  const authorId = user?.id || '00000000-0000-0000-0000-000000000001';

  // 1. Kiểm tra quyền truy cập nghiêm ngặt (Chỉ GVCN và Admin)
  const isAuthorized = user?.role === 'gvcn' || user?.role === 'admin';

  const [cases, setCases] = useState<CompanionCase[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Bộ lọc & Chế độ bảo mật
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isPrivacyMasked, setIsPrivacyMasked] = useState<boolean>(true); // Mặc định bật che mờ chống nhìn trộm

  // Modals state
  const [isCaseModalOpen, setIsCaseModalOpen] = useState<boolean>(false);
  const [editingCase, setEditingCase] = useState<CompanionCase | null>(null);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<CompanionCase | null>(null);

  // 2. Tải danh sách hồ sơ đồng hành & danh sách học sinh
  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      const [casesData, studentsData] = await Promise.all([
        companionService.getCompanionCases(classId),
        studentService.getStudents(classId),
      ]);
      setCases(casesData);
      setStudents(studentsData);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu trạm đồng hành:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId, isAuthorized]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 3. Xử lý Tạo / Cập nhật hồ sơ
  const handleSaveCase = async (formData: CompanionFormData) => {
    if (editingCase) {
      await companionService.updateCompanionCase(editingCase.id, formData);
    } else {
      await companionService.createCompanionCase(classId, authorId, formData);
    }
    await loadData();
  };

  // 4. Đổi nhanh trạng thái (Active / Monitoring / Completed)
  const handleQuickStatusChange = async (caseId: string, newStatus: CaseStatus) => {
    try {
      await companionService.updateCompanionCase(caseId, { status: newStatus });
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error('Lỗi đổi trạng thái ca:', err);
    }
  };

  // 5. Xóa mềm hồ sơ
  const handleDeleteCase = async (caseId: string) => {
    try {
      await companionService.softDeleteCase(caseId);
      await loadData();
    } catch (err) {
      console.error('Lỗi xóa mềm hồ sơ:', err);
    }
  };

  // 6. Tính toán KPI
  const kpi = useMemo(() => companionService.calculateKpi(cases), [cases]);

  // 7. Lọc danh sách hồ sơ
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.primaryConcern.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchSeverity = severityFilter === 'all' || c.severityLevel === severityFilter;
      return matchSearch && matchStatus && matchSeverity;
    });
  }, [cases, searchQuery, statusFilter, severityFilter]);

  if (!isAuthorized) {
    return (
      <div className="p-8 md:p-16 text-center bg-white rounded-3xl border border-rose-200 shadow-sm max-w-lg mx-auto mt-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-3xl">
          🔒
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Khu Vực Bảo Mật Giới Hạn</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          "Trạm đồng hành" lưu trữ hồ sơ học sinh diện đặc biệt và thông tin nhạy cảm. Chỉ Giáo viên Chủ nhiệm mới có quyền truy cập khu vực này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Nút hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Trạm Đồng Hành Học Sinh
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase">
              Bảo mật tối mật (RLS)
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Không gian sư phạm theo dõi học sinh diện đặc biệt, lưu vết nhật ký can thiệp và làm việc cùng phụ huynh
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Nút Bật/Tắt che mờ chống nhìn trộm */}
          <Button
            onClick={() => setIsPrivacyMasked((prev) => !prev)}
            variant={isPrivacyMasked ? 'outline' : 'secondary'}
            size="sm"
            className="text-xs font-bold shadow-xs"
          >
            {isPrivacyMasked ? '👁️ Đang che mờ (An toàn)' : '🙈 Đang hiển thị rõ'}
          </Button>

          {/* Nút Tạo hồ sơ mới */}
          <Button
            onClick={() => {
              setEditingCase(null);
              setIsCaseModalOpen(true);
            }}
            variant="primary"
            size="sm"
            className="text-xs font-bold shadow-xs"
          >
            ➕ Lập Hồ Sơ Mới
          </Button>

          <Button onClick={loadData} variant="ghost" size="sm" className="text-xs font-bold">
            🔄 Làm mới
          </Button>
        </div>
      </div>

      {/* 2. Thẻ chỉ số KPI */}
      <CompanionKpiCards kpi={kpi} />

      {/* 3. Thanh công cụ tìm kiếm & lọc */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, mã HS hoặc vấn đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Lọc theo Trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🤝 Đang hỗ trợ</option>
            <option value="monitoring">👀 Theo dõi định kỳ</option>
            <option value="completed">✨ Đã tiến bộ</option>
          </select>

          {/* Lọc theo Mức độ */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="critical">🚨 Khẩn cấp</option>
            <option value="medium">⚠️ Cần lưu ý</option>
            <option value="low">🌱 Theo dõi nhẹ</option>
          </select>

          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
            {filteredCases.length}/{cases.length} ca
          </span>
        </div>
      </div>

      {/* 4. Danh sách Hồ sơ Ca đồng hành */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" text="Đang tải hồ sơ Trạm Đồng Hành bảo mật..." />
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-3xl mb-2">🤝</p>
          <h3 className="text-base font-black text-slate-800 mb-1">
            {cases.length === 0
              ? 'Chưa có hồ sơ đồng hành nào được lập'
              : 'Không tìm thấy hồ sơ phù hợp'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 font-medium">
            {cases.length === 0
              ? 'Khi có học sinh cần quan tâm đặc biệt (hoàn cảnh khó khăn, sa sút học tập, nề nếp), Thầy hãy bấm nút bên dưới để tạo hồ sơ theo dõi riêng.'
              : 'Thầy hãy thử điều chỉnh lại từ khóa tìm kiếm hoặc bộ lọc trạng thái.'}
          </p>
          {cases.length === 0 && (
            <Button
              onClick={() => {
                setEditingCase(null);
                setIsCaseModalOpen(true);
              }}
              variant="primary"
              size="sm"
              className="text-xs font-bold shadow-xs"
            >
              ➕ Lập Hồ Sơ Đồng Hành Đầu Tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((item) => (
            <CompanionCaseCard
              key={item.id}
              companionCase={item}
              isPrivacyMasked={isPrivacyMasked}
              onOpenDetail={(c) => setSelectedCaseForDetail(c)}
              onEdit={(c) => {
                setEditingCase(c);
                setIsCaseModalOpen(true);
              }}
              onQuickStatusChange={handleQuickStatusChange}
              onDelete={handleDeleteCase}
            />
          ))}
        </div>
      )}

      {/* Modal Lập / Sửa Hồ Sơ */}
      <CompanionCaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onSave={handleSaveCase}
        editingCase={editingCase}
        students={students}
      />

      {/* Modal Chi Tiết & Thêm Nhật Ký */}
      <CompanionDetailModal
        isOpen={Boolean(selectedCaseForDetail)}
        onClose={() => setSelectedCaseForDetail(null)}
        companionCase={selectedCaseForDetail}
        onUpdateAdded={loadData}
      />
    </div>
  );
};
