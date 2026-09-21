import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from './OfflineBanner';
import { SandboxBanner } from '../../features/sandbox';

export const AppLayout: React.FC = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-100/80 overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Desktop Sidebar */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden print:h-auto print:overflow-visible print:block">
        <div className="print:hidden">
          <OfflineBanner />
          <SandboxBanner />
          <Header onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24 md:pb-8 print:p-0 print:m-0 print:overflow-visible print:h-auto print:block">
          <div className="max-w-7xl mx-auto print:max-w-none print:w-full print:m-0 print:p-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <div className="print:hidden">
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        />
        <BottomNav onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />
      </div>
    </div>
  );
};
