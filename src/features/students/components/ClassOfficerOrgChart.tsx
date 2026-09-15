import React from 'react';
import type { Student, Group } from '../../../types/student';
import { getUserInitial } from '../../../utils/userUtils';

interface ClassOfficerOrgChartProps {
  students: Student[];
  groups: Group[];
  onSelectOfficer: (student: Student) => void;
}

export const ClassOfficerOrgChart: React.FC<ClassOfficerOrgChartProps> = ({
  students,
  groups,
  onSelectOfficer,
}) => {
  // Phân loại các chức danh trong ban cán sự
  const lopTruong = students.find((s) => s.classRole?.toLowerCase().includes('lớp trưởng'));
  
  const phoHocTap = students.find((s) => s.classRole?.toLowerCase().includes('học tập'));
  const phoLaoDong = students.find(
    (s) => s.classRole?.toLowerCase().includes('lao động') || s.classRole?.toLowerCase().includes('kỷ luật')
  );
  const phoVanThe = students.find((s) => s.classRole?.toLowerCase().includes('văn thể'));
  const banSuVu = students.filter(
    (s) => s.classRole?.toLowerCase().includes('thủ quỹ') || s.classRole?.toLowerCase().includes('sao đỏ')
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

  const renderOfficerCard = (
    student: Student | undefined,
    roleTitle: string,
    icon: string,
    borderColor = 'border-slate-200',
    bgColor = 'bg-white'
  ) => {
    if (!student) {
      return (
        <div className={`p-4 rounded-2xl border border-dashed ${borderColor} ${bgColor} flex flex-col items-center justify-center text-center min-h-[130px]`}>
          <span className="text-2xl mb-1 opacity-50">{icon}</span>
          <span className="text-xs font-bold text-slate-400">{roleTitle}</span>
          <span className="text-[11px] text-slate-400 mt-1 italic">Chưa phân công</span>
        </div>
      );
    }

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
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium group-hover:text-primary flex items-center gap-1">
            📖 Nhiệm vụ tự quản
          </span>
          <span className="text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            Chi tiết →
          </span>
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

      {/* 2. CẤP LỚP PHÓ & BAN CHUYÊN TRÁCH */}
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
          <span className="text-base">💼</span>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
            Ban Chỉ Đạo Chuyên Trách & Sự Vụ
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            (Học tập, Lao động, Văn thể mỹ, Sao đỏ, Thủ quỹ)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderOfficerCard(phoHocTap, 'Phó Học Tập', '📘', 'border-blue-200 bg-blue-50/30')}
          {renderOfficerCard(phoLaoDong, 'Phó Lao Động / Kỷ Luật', '🧹', 'border-emerald-200 bg-emerald-50/30')}
          {renderOfficerCard(phoVanThe, 'Phó Văn Thể Mỹ', '🎨', 'border-purple-200 bg-purple-50/30')}
          {banSuVu[0] ? (
            renderOfficerCard(banSuVu[0], banSuVu[0].classRole || 'Thủ Quỹ', '⭐', 'border-amber-200 bg-amber-50/30')
          ) : (
            renderOfficerCard(undefined, 'Thủ Quỹ / Sao Đỏ', '⭐')
          )}
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

              {/* To Truong */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  🚩 Tổ trưởng:
                </span>
                {renderOfficerCard(toTruong, 'Tổ Trưởng', '🚩', 'border-slate-200 bg-slate-50/40')}
              </div>

              {/* To Pho */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  🤝 Tổ phó:
                </span>
                {renderOfficerCard(toPho, 'Tổ Phó', '🤝', 'border-slate-200 bg-slate-50/40')}
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
    </div>
  );
};
