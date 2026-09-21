import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Student, Group } from '../../../types/student';
import { studentService } from '../services/studentService';
import type { StudentFormData } from '../schemas/studentSchema';
import { useAuth } from '../../../hooks/useAuth';
import { canDeleteAllStudents } from '../../../utils/permissionUtils';

import { StudentCard } from '../components/StudentCard';
import { RoleBadge } from '../components/RoleBadge';
import { OfficerTaskModal } from '../components/OfficerTaskModal';
import { StudentFormModal } from '../components/StudentFormModal';
import { DeleteStudentModal } from '../components/DeleteStudentModal';
import { DeleteAllStudentsModal } from '../components/DeleteAllStudentsModal';
import { ImportExportModal } from '../components/ImportExportModal';
import { InviteTokenModal } from '../components/InviteTokenModal';
import { ClassOfficerOrgChart } from '../components/ClassOfficerOrgChart';
import { customRolesService } from '../services/customRolesService';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const StudentsPage: React.FC = () => {
  const { currentClass, user, membership } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';
  const canDeleteAll = canDeleteAllStudents(user, membership);

  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filters & View Mode
  const [activeTab, setActiveTab] = useState<'students' | 'officers'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [inviteStudent, setInviteStudent] = useState<Student | null>(null);
  const [taskStudent, setTaskStudent] = useState<Student | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsData, groupsData] = await Promise.all([
        studentService.getStudents(classId),
        studentService.getGroups(classId),
      ]);
      setStudents(studentsData);
      setGroups(groupsData);
    } catch (err) {
      console.warn('Lỗi tải danh sách học sinh:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const officerCount = useMemo(() => {
    return students.filter((s) => s.classRole && s.classRole !== 'Thành viên').length;
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        s.code?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const isOfficer = s.classRole && s.classRole !== 'Thành viên';
      const matchGroup =
        selectedGroup === 'all'
          ? true
          : selectedGroup === 'officers'
            ? isOfficer
            : s.groupName === selectedGroup;
      const matchGender = selectedGender === 'all' || s.gender === selectedGender;
      return matchSearch && matchGroup && matchGender;
    });
  }, [students, searchQuery, selectedGroup, selectedGender]);

  // Statistics KPI
  const stats = useMemo(() => {
    const total = students.length;
    const maleCount = students.filter((s) => s.gender === 'Nam').length;
    const femaleCount = students.filter((s) => s.gender === 'Nữ').length;
    const boardingCount = students.filter((s) => s.boardingType === 'Bán trú').length;
    const guardianLinkedCount = students.filter((s) => s.guardianStatus === 'active').length;
    return { total, maleCount, femaleCount, boardingCount, guardianLinkedCount };
  }, [students]);

  // Handlers
  const handleSaveStudent = async (formData: StudentFormData) => {
    if (editingStudent) {
      await studentService.updateStudent(editingStudent.id, formData);
    } else {
      await studentService.createStudent(classId, formData);
    }
    await loadData();
  };

  const handleDeleteStudent = async (studentId: string) => {
    await studentService.softDeleteStudent(studentId);
    await loadData();
  };

  const handleDeleteAllStudents = async () => {
    if (!canDeleteAll) {
      showToast('Thao tác bị từ chối: Chỉ GVCN chính thức mới có quyền xóa toàn bộ học sinh!');
      return;
    }
    const res = await studentService.deleteAllStudents(classId, {
      role: user?.role,
      membershipRole: membership?.role,
    });
    showToast(`Đã xóa sạch toàn bộ ${res.count} học sinh. Thầy/Cô có thể nạp danh sách mới ngay bây giờ!`);
    await loadData();
  };

  const handleAssignOfficer = async (
    studentId: string | null,
    roleTitle: string,
    customRoleId?: string
  ) => {
    try {
      if (!studentId) {
        // Gỡ phân công học sinh đang giữ vai trò này
        const currentHolder = students.find((s) => s.classRole?.toLowerCase() === roleTitle.toLowerCase());
        if (currentHolder) {
          await studentService.updateStudentRole(classId, currentHolder.id, 'Thành viên');
          showToast(`Đã hủy phân công chức vụ "${roleTitle}" của em ${currentHolder.fullName}`);
        }
        if (customRoleId) {
          customRolesService.updateCustomRoleStudent(classId, customRoleId, null);
        }
      } else {
        // Chuyển người giữ chức vụ cũ về Thành viên (nếu có và khác studentId mới)
        const currentHolder = students.find(
          (s) => s.classRole?.toLowerCase() === roleTitle.toLowerCase() && s.id !== studentId
        );
        if (currentHolder) {
          await studentService.updateStudentRole(classId, currentHolder.id, 'Thành viên');
        }

        await studentService.updateStudentRole(classId, studentId, roleTitle);
        const assignedStudent = students.find((s) => s.id === studentId);
        showToast(
          `Đã phân công em ${assignedStudent?.fullName || 'học sinh'} làm "${roleTitle}" thành công!`
        );

        if (customRoleId) {
          customRolesService.updateCustomRoleStudent(classId, customRoleId, studentId);
        }
      }
      await loadData();
    } catch (err) {
      console.error('Lỗi khi phân công cán sự:', err);
      showToast('Có lỗi xảy ra khi phân công. Vui lòng thử lại!');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast thông báo phân công thành công */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border border-slate-700 backdrop-blur-md animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
            Tổ Chức Lớp Học & Phân Tổ
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Quản lý danh sách học sinh, cơ cấu ban cán sự, phân chia 4 tổ và liên kết phụ huynh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canDeleteAll && students.length > 0 && (
            <Button
              type="button"
              onClick={() => setIsDeleteAllOpen(true)}
              variant="outline"
              size="md"
              className="flex-1 sm:flex-initial text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all"
              title="Xóa toàn bộ danh sách học sinh để nạp danh sách mới"
            >
              🗑️ Xóa tất cả ({students.length})
            </Button>
          )}
          <Button
            onClick={() => setIsImportOpen(true)}
            variant="outline"
            size="md"
            className="flex-1 sm:flex-initial text-xs font-bold"
          >
            📊 Nhập / Xuất Excel
          </Button>
          <Button
            onClick={() => {
              setEditingStudent(null);
              setIsFormOpen(true);
            }}
            variant="primary"
            size="md"
            className="flex-1 sm:flex-initial text-xs font-black"
          >
            + THÊM HỌC SINH
          </Button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Sĩ số lớp</span>
          <p className="text-2xl font-black text-primary mt-1">{stats.total} <span className="text-xs font-semibold text-slate-400">học sinh</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Giới tính</span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            <span className="text-blueAccent">{stats.maleCount}♂</span> / <span className="text-rose-500">{stats.femaleCount}♀</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Bán trú</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.boardingCount} <span className="text-xs font-semibold text-slate-400">em</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Liên kết Phụ huynh</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.guardianLinkedCount}/{stats.total}</p>
        </div>
      </div>

      {/* Tab Switcher: Danh Sách Học Sinh VS Cơ Cấu Ban Cán Sự */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'students'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📋 Danh Sách & Phân Tổ</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('officers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'officers'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🏛️ Cơ Cấu Ban Cán Sự</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'officers' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {officerCount} cán bộ
          </span>
        </button>
      </div>

      {activeTab === 'officers' ? (
        <ClassOfficerOrgChart
          students={students}
          groups={groups}
          classId={classId}
          onSelectOfficer={(stu) => setTaskStudent(stu)}
          onAssignOfficer={handleAssignOfficer}
        />
      ) : (
        <>
          {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Tìm kiếm học sinh theo họ tên..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:border-primary outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Group Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedGroup === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({students.length})
          </button>
          <button
            onClick={() => setSelectedGroup('officers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              selectedGroup === 'officers'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>👑</span>
            <span>Cán sự ({officerCount})</span>
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedGroup === g.name
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Gender Filter & View Mode */}
        <div className="flex items-center gap-2">
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-primary' : 'text-slate-500'
              }`}
              title="Xem dạng thẻ"
            >
              📱 Thẻ
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white shadow-xs text-primary' : 'text-slate-500'
              }`}
              title="Xem dạng bảng"
            >
              📄 Bảng
            </button>
          </div>
        </div>
      </div>

      {/* Main Student List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <LoadingSpinner size="lg" text="Đang tải danh sách học sinh..." />
        </div>
      ) : students.length === 0 ? (
        <div className="p-10 md:p-14 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-xs max-w-xl mx-auto my-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-3xl mb-3 border border-amber-200/60 shadow-inner">
            📋
          </div>
          <h3 className="text-lg font-black text-slate-850">Danh Sách Học Sinh Đang Trống</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed font-medium">
            Lớp học hiện chưa có học sinh nào. Thầy/Cô hãy tải lên tệp Excel danh sách học sinh mới hoặc thêm từng em thủ công để bắt đầu năm học.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Button
              type="button"
              onClick={() => setIsImportOpen(true)}
              variant="primary"
              size="md"
              className="w-full sm:w-auto font-black text-xs px-6 shadow-md shadow-primary/25"
            >
              📊 Nhập Danh Sách Từ Excel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditingStudent(null);
                setIsFormOpen(true);
              }}
              variant="outline"
              size="md"
              className="w-full sm:w-auto font-bold text-xs px-6"
            >
              + Thêm Học Sinh Thủ Công
            </Button>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-base font-black text-slate-800">Không tìm thấy học sinh nào</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? `Không có kết quả khớp với từ khóa "${searchQuery}"` : 'Không có học sinh trong bộ lọc này.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={(s) => {
                setEditingStudent(s);
                setIsFormOpen(true);
              }}
              onDelete={(s) => setDeletingStudent(s)}
              onShowInvite={(s) => setInviteStudent(s)}
              onShowTasks={(s) => setTaskStudent(s)}
            />
          ))}
        </div>
      ) : (
        /* Compact Table View */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">STT</th>
                  <th className="p-3.5">Họ và tên</th>
                  <th className="p-3.5">Tổ</th>
                  <th className="p-3.5">Chức vụ</th>
                  <th className="p-3.5">Lưu trú</th>
                  <th className="p-3.5">Điểm / Sao</th>
                  <th className="p-3.5">Phụ huynh</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-850 block">{student.fullName}</span>
                      <span className="text-[10px] text-slate-400">{student.gender} {student.birthDate ? `• ${student.birthDate}` : ''}</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700">{student.groupName}</td>
                    <td className="p-3.5">
                      <RoleBadge
                        role={student.classRole}
                        onClick={() => setTaskStudent(student)}
                      />
                    </td>
                    <td className="p-3.5 text-slate-600">{student.boardingType || 'Bán trú'}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-emerald-600">+{student.points}đ</span>
                      <span className="text-amber-500 font-bold ml-1.5">⭐{student.stars}</span>
                    </td>
                    <td className="p-3.5">
                      {student.guardianStatus === 'active' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          ✓ Đã nối
                        </span>
                      ) : (
                        <button
                          onClick={() => setInviteStudent(student)}
                          className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-[10px] hover:bg-amber-100"
                        >
                          🔗 Gửi mã
                        </button>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingStudent(student);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeletingStudent(student)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveStudent}
        student={editingStudent}
        groups={groups}
        classId={classId}
      />

      <DeleteStudentModal
        isOpen={Boolean(deletingStudent)}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDeleteStudent}
        student={deletingStudent}
      />

      <ImportExportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={loadData}
        students={students}
        classId={classId}
        className={currentClass?.name || '6A6'}
        onOpenDeleteAll={canDeleteAll ? () => setIsDeleteAllOpen(true) : undefined}
        canDeleteAll={canDeleteAll}
      />

      <DeleteAllStudentsModal
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAllStudents}
        students={students}
        className={currentClass?.name || '6A6'}
        onOpenImport={() => setIsImportOpen(true)}
        canDeleteAll={canDeleteAll}
      />

      <InviteTokenModal
        isOpen={Boolean(inviteStudent)}
        onClose={() => setInviteStudent(null)}
        student={inviteStudent}
      />

      <OfficerTaskModal
        isOpen={Boolean(taskStudent)}
        onClose={() => setTaskStudent(null)}
        student={taskStudent}
      />
    </div>
  );
};
