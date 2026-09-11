import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { allNavItems } from './navItems';
import { cn } from '../../utils/cn';
import type { UserRole } from '../../types/auth';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const currentRole = (user?.role === 'teacher' ? 'gvcn' : user?.role) || 'gvcn';

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(currentRole as UserRole));

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
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-accent to-amber-500 text-slate-950 shadow-md font-black translate-x-1'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.iconName}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider',
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
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

      {/* Footer Branding */}
      <div className="p-4 border-t border-indigo-900/50 text-center text-indigo-300 text-[11px] font-medium">
        <p>Hệ thống Quản trị Lớp học</p>
        <p className="text-[10px] opacity-70">Thanh Xuân 2026 • React + Supabase</p>
      </div>
    </aside>
  );
};
