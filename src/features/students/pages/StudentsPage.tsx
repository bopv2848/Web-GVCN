import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Student, Group } from '../../../types/student';
import { studentService } from '../services/studentService';
import type { StudentFormData } from '../schemas/studentSchema';
import { useAuth } from '../../../hooks/useAuth';

import { StudentCard } from '../components/StudentCard';
import { RoleBadge } from '../components/RoleBadge';
import { OfficerTaskModal } from '../components/OfficerTaskModal';
import { StudentFormModal } from '../components/StudentFormModal';
import { DeleteStudentModal } from '../components/DeleteStudentModal';
import { ImportExportModal } from '../components/ImportExportModal';
import { InviteTokenModal } from '../components/InviteTokenModal';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const StudentsPage: React.FC = () => {
  const { currentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
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

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
            Quản Lý Học Sinh & Tổ Thi Đua
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Danh sách học sinh, phân tổ, hồ sơ cá nhân và mã liên kết phụ huynh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-base font-black text-slate-800">Không tìm thấy học sinh nào</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? `Không có kết quả khớp với từ khóa "${searchQuery}"` : 'Lớp chưa có học sinh nào. Thầy/Cô hãy thêm học sinh mới!'}
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
