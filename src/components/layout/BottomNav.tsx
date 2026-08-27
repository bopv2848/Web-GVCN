import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface BottomNavProps {
  onOpenMobileDrawer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMobileDrawer }) => {
  const quickNavItems = [
    { id: 'dashboard', path: '/', label: 'Tổng quan', icon: '🏠' },
    { id: 'students', path: '/students', label: 'Học sinh', icon: '👥' },
    { id: 'attendance', path: '/attendance', label: 'Điểm danh', icon: '📅' },
    { id: 'points', path: '/points', label: 'Tích điểm', icon: '⭐' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-16">
        {quickNavItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all rounded-xl',
                isActive ? 'text-primary font-black scale-105' : 'text-slate-500 font-bold hover:text-slate-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-xl leading-none mb-1">{item.icon}</span>
                <span className={cn('text-[10px]', isActive ? 'text-primary font-black' : 'text-slate-500')}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* More Button */}
        <button
          onClick={onOpenMobileDrawer}
          className="flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 text-slate-500 font-bold hover:text-slate-800 active:scale-95 transition-all"
          aria-label="Mở tất cả chức năng"
        >
          <span className="text-xl leading-none mb-1">☰</span>
          <span className="text-[10px]">Tất cả</span>
        </button>
      </div>
    </nav>
  );
};
