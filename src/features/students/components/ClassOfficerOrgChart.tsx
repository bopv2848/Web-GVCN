import React, { useState, useEffect } from 'react';
import type { Student, Group } from '../../../types/student';
import { getUserInitial } from '../../../utils/userUtils';
import { AssignOfficerModal } from './AssignOfficerModal';
import { AddCustomRoleModal } from './AddCustomRoleModal';
import { customRolesService, type CustomOfficerRole } from '../services/customRolesService';
import { studentService } from '../services/studentService';

interface ClassOfficerOrgChartProps {
  students: Student[];
  groups: Group[];
  onSelectOfficer: (student: Student) => void;
  onAssignOfficer?: (
    studentId: string | null,
    roleTitle: string,
    customRoleId?: string
  ) => Promise<void> | void;
  classId?: string;
}

export const ClassOfficerOrgChart: React.FC<ClassOfficerOrgChartProps> = ({
  students,
  groups,
  onSelectOfficer,
  onAssignOfficer,
  classId = '66666666-6666-6666-6666-666666666666',
}) => {
  // State quản lý Modal Phân công cán sự trực tiếp
  const [assigningRole, setAssigningRole] = useState<{
    roleTitle: string;
    roleIcon: string;
    currentStudent?: Student | null;
    customRoleId?: string;
  } | null>(null);

  // State quản lý Modal Thêm nhiệm vụ mới
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);

  // Danh sách các nhiệm vụ/chức danh tùy chỉnh
  const [customRoles, setCustomRoles] = useState<CustomOfficerRole[]>([]);

  // Tải danh sách nhiệm vụ tùy chỉnh khi mở trang
  useEffect(() => {
    setCustomRoles(customRolesService.getCustomRoles(classId));
  }, [classId]);

  // Phân loại các chức danh chuẩn trong Ban Điều Hành & Chuyên Trách
  const lopTruong = students.find((s) => s.classRole?.toLowerCase().includes('lớp trưởng'));
  const phoHocTap = students.find((s) => s.classRole?.toLowerCase().includes('học tập'));
  const phoLaoDong = students.find(
    (s) => s.classRole?.toLowerCase().includes('lao động') || s.classRole?.toLowerCase().includes('kỷ luật')
  );
  const phoVanThe = students.find((s) => s.classRole?.toLowerCase().includes('văn thể'));
  
  // TÁCH THỦ QUỸ VÀ SAO ĐỎ THÀNH 2 VAI TRÒ RIÊNG BIỆT
  const thuQuy = students.find((s) => s.classRole?.toLowerCase().includes('thủ quỹ'));
  const saoDo = students.find(
    (s) => s.classRole?.toLowerCase().includes('sao đỏ') || s.classRole?.toLowerCase().includes('cờ đỏ')
  );

  // Phân cán bộ theo 4 tổ
  const groupLeaders = groups.map((g) => {
    const toTruong = students.find(
      (s) => s.groupId === g.id && s.classRole?.toLowerCase().includes('tổ trưởng')
    );
    const toPho = students.find(
      (s) => s.groupId === g.id && s.classRole?.toLowerCase().includes('tổ phó')
    );
    const membersCount = students.filter((s) => s.groupId === g.id).length;
    return { group: g, toTruong, toPho, membersCount };
  });

  // Mở modal phân công
  const handleOpenAssignModal = (
    roleTitle: string,
    roleIcon: string,
    currentStudent?: Student | null,
    customRoleId?: string
  ) => {
    setAssigningRole({
      roleTitle,
      roleIcon,
      currentStudent,
      customRoleId,
    });
  };

  // Thực hiện phân công cán sự trực tiếp
  const handleAssign = async (studentId: string | null) => {
    if (!assigningRole) return;
    const { roleTitle, customRoleId } = assigningRole;

    if (onAssignOfficer) {
      await onAssignOfficer(studentId, roleTitle, customRoleId);
    } else {
      // Xử lý mặc định nếu không truyền callback
      if (studentId) {
        // Gỡ người giữ vai trò cũ nếu có
        const currentHolder = students.find(
          (s) => s.classRole?.toLowerCase() === roleTitle.toLowerCase() && s.id !== studentId
        );
        if (currentHolder) {
          await studentService.updateStudentRole(classId, currentHolder.id, 'Thành viên');
        }
        await studentService.updateStudentRole(classId, studentId, roleTitle);
      } else if (assigningRole.currentStudent) {
        await studentService.updateStudentRole(classId, assigningRole.currentStudent.id, 'Thành viên');
      }

      if (customRoleId) {
        customRolesService.updateCustomRoleStudent(classId, customRoleId, studentId);
      }
    }

    setCustomRoles(customRolesService.getCustomRoles(classId));
    setAssigningRole(null);
  };

  // Lưu nhiệm vụ tùy chỉnh mới
  const handleSaveCustomRole = async (roleData: {
    title: string;
    icon: string;
    description?: string;
    studentId?: string;
  }) => {
    const newRole = customRolesService.saveCustomRole(classId, {
      title: roleData.title,
      icon: roleData.icon,
      description: roleData.description,
      studentId: roleData.studentId || null,
    });

    if (roleData.studentId) {
      if (onAssignOfficer) {
        await onAssignOfficer(roleData.studentId, roleData.title, newRole.id);
      } else {
        await studentService.updateStudentRole(classId, roleData.studentId, roleData.title);
      }
    }

    setCustomRoles(customRolesService.getCustomRoles(classId));
  };

  // Xóa nhiệm vụ tùy chỉnh
  const handleDeleteCustomRole = async (roleId: string, roleTitle: string) => {
    if (window.confirm(`Thầy có chắc chắn muốn xóa nhiệm vụ "${roleTitle}" khỏi danh sách ban cán sự?`)) {
      const assigned = students.find((s) => s.classRole?.toLowerCase() === roleTitle.toLowerCase());
      if (assigned) {
        if (onAssignOfficer) {
          await onAssignOfficer(null, roleTitle, roleId);
        } else {
          await studentService.updateStudentRole(classId, assigned.id, 'Thành viên');
        }
      }
      customRolesService.deleteCustomRole(classId, roleId);
      setCustomRoles(customRolesService.getCustomRoles(classId));
    }
  };

  // Hàm hiển thị Thẻ Cán Sự
  const renderOfficerCard = (
    student: Student | undefined,
    roleTitle: string,
    icon: string,
    borderColor = 'border-slate-200',
    bgColor = 'bg-white',
    customRoleId?: string
  ) => {
    // 1. Thẻ khi CHƯA PHÂN CÔNG
    if (!student) {
      return (
        <div
          onClick={() => handleOpenAssignModal(roleTitle, icon, undefined, customRoleId)}
          className={`group p-4 rounded-2xl border-2 border-dashed ${borderColor} ${bgColor} hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center min-h-[140px] relative shadow-2xs`}
        >
          <span className="text-3xl mb-1 group-hover:scale-110 transition-transform opacity-70">
            {icon}
          </span>
          <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
            {roleTitle}
          </span>
          <span className="text-[11px] text-amber-700 font-bold mt-0.5 italic">
            Chưa phân công
          </span>
          <button
            type="button"
            className="mt-2 px-3 py-1 bg-primary text-white rounded-xl text-[11px] font-black shadow-2xs group-hover:bg-primary-hover active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>+</span> Phân công em này
          </button>
        </div>
      );
    }

    // 2. Thẻ khi ĐÃ CÓ HỌC SINH ĐẢM NHIỆM
    return (
      <div
        onClick={() => onSelectOfficer(student)}
        className={`group p-4 rounded-2xl border ${borderColor} ${bgColor} shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col justify-between`}
      >
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white font-black text-sm flex items-center justify-center shadow-xs overflow-hidden border border-slate-200">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                getUserInitial(student.fullName)
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 text-sm">{icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                {student.classRole || roleTitle}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                • {student.groupName || 'Tổ'}
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-850 truncate group-hover:text-primary transition-colors">
              {student.fullName}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {student.gender} • {student.code || 'HS'}
            </p>
          </div>

          {/* Nút thao tác phân công lại trên góc thẻ */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAssignModal(roleTitle, icon, student, customRoleId);
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-slate-600 transition-all text-xs cursor-pointer shadow-2xs"
              title={`Đổi học sinh khác cho vị trí ${roleTitle}`}
            >
              🔄
            </button>
            {customRoleId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCustomRole(customRoleId, roleTitle);
                }}
                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all text-xs cursor-pointer shadow-2xs"
                title="Xóa nhiệm vụ tùy chỉnh này"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium group-hover:text-primary flex items-center gap-1">
            📖 Nhiệm vụ tự quản
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenAssignModal(roleTitle, icon, student, customRoleId);
            }}
            className="text-primary font-black hover:underline cursor-pointer"
          >
            Đổi em khác →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. CẤP CHỈ ĐẠO & ĐIỀU HÀNH CHUNG */}
      <div className="flex flex-col items-center">
        {/* Giáo viên Chủ nhiệm */}
        <div className="w-full max-w-md p-4 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20 shadow-xs text-center relative mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white text-xl shadow-sm mb-2">
            👨‍🏫
          </div>
          <h3 className="text-base font-black text-primary uppercase tracking-wide">
            Thầy Phan Văn Bộ — GVCN Lớp 6A6
          </h3>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            Cố vấn sư phạm • Định hướng giáo dục & Đồng hành tự quản
          </p>
          {/* Mũi tên kết nối xuống Lớp trưởng */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300" />
        </div>

        {/* Lớp trưởng */}
        <div className="w-full max-w-md relative">
          <div className="text-center mb-1">
            <span className="text-[11px] font-black uppercase text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300">
              👑 Ban Điều Hành Lớp
            </span>
          </div>
          {renderOfficerCard(
            lopTruong,
            'Lớp Trưởng',
            '👑',
            'border-amber-300 bg-amber-50/40 shadow-xs'
          )}
        </div>
      </div>

      {/* 2. CẤP LỚP PHÓ & BAN CHUYÊN TRÁCH & SỰ VỤ */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-base">💼</span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
              Ban Chỉ Đạo Chuyên Trách & Sự Vụ
            </h3>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
              (Học tập, Lao động, Văn thể mỹ, Thủ quỹ, Sao đỏ & Nhiệm vụ bổ sung)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddRoleModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>➕</span>
            <span>Thêm nhiệm vụ mới</span>
          </button>
        </div>

        {/* Lưới các thẻ chuyên trách: Đã tách Thủ Quỹ và Sao Đỏ riêng biệt + Các nhiệm vụ tùy chỉnh + Thẻ thêm mới */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* 1. Phó Học Tập */}
          {renderOfficerCard(phoHocTap, 'Phó Học Tập', '📘', 'border-blue-200 bg-blue-50/30')}

          {/* 2. Phó Lao Động */}
          {renderOfficerCard(phoLaoDong, 'Phó Lao Động / Kỷ Luật', '🧹', 'border-emerald-200 bg-emerald-50/30')}

          {/* 3. Phó Văn Thể Mỹ */}
          {renderOfficerCard(phoVanThe, 'Phó Văn Thể Mỹ', '🎨', 'border-purple-200 bg-purple-50/30')}

          {/* 4. THỦ QUỸ (TÁCH RIÊNG) */}
          {renderOfficerCard(thuQuy, 'Thủ Quỹ', '💰', 'border-amber-200 bg-amber-50/30')}

          {/* 5. SAO ĐỎ (TÁCH RIÊNG) */}
          {renderOfficerCard(saoDo, 'Đội Sao Đỏ', '⭐', 'border-rose-200 bg-rose-50/30')}

          {/* 6. Các nhiệm vụ tùy chỉnh đã tạo */}
          {customRoles.map((cr) => {
            const assignedStu = students.find(
              (s) => s.id === cr.studentId || (s.classRole && s.classRole.toLowerCase() === cr.title.toLowerCase())
            );
            return (
              <React.Fragment key={cr.id}>
                {renderOfficerCard(
                  assignedStu,
                  cr.title,
                  cr.icon || '📌',
                  'border-indigo-200 bg-indigo-50/30',
                  'bg-white',
                  cr.id
                )}
              </React.Fragment>
            );
          })}

          {/* 7. THẺ "THÊM NHIỆM VỤ MỚI" TRỰC QUAN */}
          <div
            onClick={() => setIsAddRoleModalOpen(true)}
            className="p-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/[0.03] hover:bg-primary/10 hover:border-primary transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center min-h-[140px] group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-xl mb-1.5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-xs">
              ➕
            </div>
            <span className="text-xs font-black text-primary uppercase tracking-wide">
              Thêm Nhiệm Vụ Mới
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              (Thủ thư, Kỹ thuật, Quản ca...)
            </span>
          </div>
        </div>
      </div>

      {/* 3. CẤP BAN TỰ QUẢN 4 TỔ */}
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
          <span className="text-base">🚩</span>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
            Ban Tự Quản 4 Tổ Thi Đua
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            (Mỗi tổ gồm 1 Tổ trưởng & 1 Tổ phó)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groupLeaders.map(({ group, toTruong, toPho, membersCount }) => (
            <div
              key={group.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <h4 className="text-sm font-black text-slate-800">{group.name}</h4>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {membersCount} học sinh
                </span>
              </div>

              {/* Tổ Trưởng */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  🚩 Tổ trưởng:
                </span>
                {renderOfficerCard(
                  toTruong,
                  `Tổ Trưởng ${group.name}`,
                  '🚩',
                  'border-slate-200 bg-slate-50/40'
                )}
              </div>

              {/* Tổ Phó */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  🤝 Tổ phó:
                </span>
                {renderOfficerCard(
                  toPho,
                  `Tổ Phó ${group.name}`,
                  '🤝',
                  'border-slate-200 bg-slate-50/40'
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 4 NGUYÊN TẮC HOẠT ĐỘNG BAN CÁN SỰ (CẨM NANG SƯ PHẠM) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">🌟</span>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-amber-400">
              4 Nguyên Tắc Hoạt Động Của Ban Cán Sự Lớp 6A6
            </h4>
            <p className="text-xs text-slate-300">
              Mô hình Tự quản: "Giao quyền thật – Việc thật – Trách nhiệm thật" (Theo BAN-CAN-SU-LOP-6A6.md)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="font-black text-amber-300 text-sm block mb-1">1. Chủ Động</span>
            <p className="text-slate-200 leading-relaxed">
              Thấy việc cần làm → chủ động làm hoặc đề xuất cách giải quyết, không chờ đợi thầy nhắc nhở.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="font-black text-blue-300 text-sm block mb-1">2. Hợp Tác</span>
            <p className="text-slate-200 leading-relaxed">
              Cán sự lớp phối hợp và hỗ trợ lẫn nhau, tuyệt đối không hoạt động đơn lẻ hoặc đùn đẩy trách nhiệm.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="font-black text-emerald-300 text-sm block mb-1">3. Trách Nhiệm</span>
            <p className="text-slate-200 leading-relaxed">
              Đã nhận nhiệm vụ thì cố gắng hoàn thành. Gặp khó khăn thì chủ động báo ngay với Lớp trưởng hoặc Thầy.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="font-black text-purple-300 text-sm block mb-1">4. Sáng Tạo</span>
            <p className="text-slate-200 leading-relaxed">
              Mỗi cán sự được khuyến khích đề xuất ít nhất 1 ý tưởng nhỏ/tháng ("Đôi bạn cùng tiến", "Tổ em sạch nhất"...).
            </p>
          </div>
        </div>
      </div>

      {/* 5. MODALS */}
      {/* 5.1. Modal phân công cán sự trực tiếp */}
      {assigningRole && (
        <AssignOfficerModal
          isOpen={Boolean(assigningRole)}
          onClose={() => setAssigningRole(null)}
          roleTitle={assigningRole.roleTitle}
          roleIcon={assigningRole.roleIcon}
          currentStudent={assigningRole.currentStudent}
          allStudents={students}
          onAssign={handleAssign}
        />
      )}

      {/* 5.2. Modal thêm nhiệm vụ mới */}
      <AddCustomRoleModal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        allStudents={students}
        onSave={handleSaveCustomRole}
      />
    </div>
  );
};
