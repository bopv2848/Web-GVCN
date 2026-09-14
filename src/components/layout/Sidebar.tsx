import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { allNavItems } from './navItems';
import { cn } from '../../utils/cn';
import type { UserRole } from '../../types/auth';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const currentRole = (user?.role === 'teacher' ? 'gvcn' : user?.role) || 'gvcn';

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(currentRole as UserRole));

  const isItemActive = (itemPath: string) => {
    if (itemPath.includes('?')) {
      const [path, query] = itemPath.split('?');
      return location.pathname === path && location.search.includes(query);
    }
    if (itemPath === '/points') {
      return location.pathname === '/points' && !location.search.includes('action=award');
    }
    if (itemPath === '/') {
      return location.pathname === '/' && !location.search;
    }
    return location.pathname === itemPath;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-primary text-slate-100 border-r border-indigo-950/60 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 p-6 border-b border-indigo-900/50">
        <div className="w-10 h-10 rounded-2xl bg-accent text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
          🚂
        </div>
        <div>
          <h2 className="text-base font-black tracking-tight text-white">WEB GVCN</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
            PRO 2.0
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
        {visibleNavItems.map((item) => {
          const active = isItemActive(item.path);
          const isActionItem = item.id === 'points-award';
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                'flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all group',
                active
                  ? 'bg-gradient-to-r from-accent to-amber-500 text-slate-950 shadow-md font-black translate-x-1'
                  : isActionItem
                  ? 'bg-amber-400/10 text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)] hover:bg-amber-400/20 hover:border-amber-300 hover:text-white hover:shadow-[0_0_16px_rgba(251,191,36,0.35)]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn('text-lg transition-transform group-hover:scale-110', isActionItem && !active && 'animate-pulse')}>
                  {item.iconName}
                </span>
                <span className={cn('truncate', isActionItem && 'font-black text-amber-100')}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider',
                    active
                      ? 'bg-slate-950 text-amber-300'
                      : isActionItem
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-indigo-900/50 text-center text-indigo-300 text-[11px] font-medium">
        <p>Hệ thống Quản trị Lớp học</p>
        <p className="text-[10px] opacity-70">Thanh Xuân 2026 • React + Supabase</p>
      </div>
    </aside>
  );
};
