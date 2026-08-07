'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { TopBar } from "@/shared/components/layout/TopBar";
import { FilterBar } from "@/shared/components/ui/FilterBar";
import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Render clean page without layout chrome for the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-background"
      style={{ minWidth: 0 }}
    >
      {/* ── Sidebar: icon rail + spaces drawer (combined) ── */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* ── Main Content Column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Filter Bar */}
        <FilterBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full h-full px-4 py-4 md:px-6 md:py-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
