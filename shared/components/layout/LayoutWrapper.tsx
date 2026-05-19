'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { TopBar } from "@/shared/components/layout/TopBar";
import { FilterBar } from "@/shared/components/ui/FilterBar";
import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Render clean page without layout chrome for the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <FilterBar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
