import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';

interface HeaderProps {
  onOpenMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileDrawer }) => {
  const { user, currentClass, setRole } = useAuth();

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    gvcn: { label: 'GVCN', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    bancansu: { label: 'Ban Cán Sự', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' },
    bgh: { label: 'BGH (Chỉ đọc)', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' },
    student: { label: 'Học Sinh', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
    parent: { label: 'Phụ Huynh', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300' },
    admin: { label: 'Quản Trị Viên', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300' },
  };

  const currentRole = user?.role || 'gvcn';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 md:h-20 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Left: Mobile hamburger & Class Info */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onOpenMobileDrawer}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
          aria-label="Mở menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-xl font-black text-primary tracking-tight">
              {currentClass?.name || 'LỚP 12A1'}
            </h1>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-400">|</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
              {currentClass?.schoolName || 'THPT THANH XUÂN'}
            </span>
          </div>
          <p className="text-[11px] md:text-xs font-semibold text-accent truncate max-w-[200px] md:max-w-md">
            ⭐ {currentClass?.themeMonth || 'CHỦ ĐIỂM THÁNG 9'}
          </p>
        </div>
      </div>

      {/* Right: Role Switcher & User Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Role Switcher for dev/testing */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 md:p-1.5 rounded-2xl border border-slate-200">
          <label htmlFor="role-select" className="hidden lg:inline-block text-[11px] font-bold text-slate-500 pl-2">
            Vai trò:
          </label>
          <select
            id="role-select"
            value={currentRole}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="text-xs md:text-sm font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none focus:border-primary cursor-pointer shadow-xs"
          >
            <option value="gvcn">👩‍🏫 GVCN (Toàn quyền)</option>
            <option value="bancansu">🧑‍💼 Ban cán sự</option>
            <option value="bgh">🏛️ Ban giám hiệu</option>
            <option value="parent">👨‍👩‍👦 Phụ huynh</option>
            <option value="student">🎓 Học sinh</option>
          </select>
        </div>

        {/* User Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs shadow-sm">
            {user?.fullName?.charAt(0) || 'G'}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
              {user?.fullName || 'Giáo viên'}
            </p>
            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${roleLabels[currentRole].badgeClass}`}>
              {roleLabels[currentRole].label}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
