import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { allNavItems } from './navItems';
import { cn } from '../../utils/cn';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const currentRole = user?.role || 'gvcn';

  // Automatically close drawer when navigating
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(currentRole));

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative flex flex-col w-4/5 max-w-xs h-full bg-primary text-slate-100 shadow-2xl z-10 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent text-slate-950 flex items-center justify-center font-black text-base">
              🚂
            </div>
            <div>
              <h2 className="text-sm font-black text-white">WEB GVCN</h2>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                Lớp 12A1
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-lg active:scale-95 transition-all"
            aria-label="Đóng menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all min-h-[48px]',
                  isActive
                    ? 'bg-gradient-to-r from-accent to-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-200 hover:bg-white/10 active:bg-white/15'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.iconName}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[9px] font-black px-2 py-0.5 rounded-full uppercase',
                        isActive ? 'bg-slate-950 text-amber-300' : 'bg-rose-500/30 text-rose-200'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info on Mobile */}
        <div className="p-4 border-t border-indigo-900/50 bg-indigo-950/40">
          <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
          <p className="text-[10px] text-slate-400 capitalize">Vai trò: {user?.role}</p>
        </div>
      </div>
    </div>
  );
};
