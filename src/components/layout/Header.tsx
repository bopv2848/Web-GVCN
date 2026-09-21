import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserInitial } from '../../utils/userUtils';
import type { UserRole } from '../../types/auth';
import { SandboxBadgeButton } from '../../features/sandbox';

interface HeaderProps {
  onOpenMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileDrawer }) => {
  const { user, currentClass, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    gvcn: { label: 'GVCN', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    teacher: { label: 'GVCN', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    bancansu: { label: 'Ban Cán Sự', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' },
    bgh: { label: 'BGH (Chỉ đọc)', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' },
    bgh_viewer: { label: 'BGH (Chỉ đọc)', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' },
    student: { label: 'Học Sinh', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
    parent: { label: 'Phụ Huynh', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300' },
    admin: { label: 'Quản Trị Viên', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300' },
  };

  const currentRole = user?.role || 'gvcn';
  const roleBadge = roleLabels[currentRole] || roleLabels.gvcn;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 md:h-20 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs print:hidden">
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

        {/* Logo Trường THCS Tân Hải */}
        <div className="flex-shrink-0">
          <img
            src={currentClass?.logoUrl || '/logo-truong-thcs-Tan-Hai.jpg'}
            alt="Logo Trường THCS Tân Hải"
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl object-contain bg-white border border-slate-200/90 p-0.5 shadow-xs transition-transform hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo-truong-thcs-Tan-Hai.jpg';
            }}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-xl font-black text-primary tracking-tight">
              {currentClass?.name || 'LỚP 6A6'}
            </h1>
            {currentClass?.isDemo && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                ☁️ Test Supabase
              </span>
            )}
            <span className="hidden sm:inline-block text-xs font-bold text-slate-400">|</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-600">
              {currentClass?.schoolName || 'TRƯỜNG THCS TÂN HẢI'}
            </span>
          </div>
          <p className="text-[11px] md:text-xs font-semibold text-accent truncate max-w-[200px] md:max-w-md">
            ⭐ {currentClass?.themeMonth || 'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG'}
          </p>
        </div>
      </div>

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-2 md:gap-4 relative">
        {/* Nút huy hiệu Chế độ Thử nghiệm Sandbox */}
        <SandboxBadgeButton />

        {/* User Badge with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
            aria-label="Menu tài khoản"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs md:text-sm shadow-sm overflow-hidden border border-slate-200">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'GVCN'}
                  className="w-full h-full object-cover"
                />
              ) : (
                getUserInitial(user?.fullName)
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                {user?.fullName || 'Thầy Phan Văn Bộ'}
              </p>
              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${roleBadge.badgeClass}`}>
                {roleBadge.label}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.fullName || 'Thầy Phan Văn Bộ'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'phanvanbo.6a6@thcs-tanhai.edu.vn'}</p>
              </div>
              <div className="p-1 space-y-0.5">
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <span>📷</span>
                  <span>Hồ sơ & Ảnh chân dung</span>
                </Link>
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <span>🚪</span>
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
