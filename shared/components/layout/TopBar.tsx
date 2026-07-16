'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { RefreshCw, Moon, Sun, Circle, Loader2, X, Menu } from 'lucide-react';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useFilters } from '@/shared/context/FilterContext';

import { NotificationBell } from '@/features/notifications/NotificationBell';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.authenticated) setUserEmail(data.email); })
      .catch(() => {});

    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme-mode');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : !prefersLight;
    setIsDarkMode(isDark);
    applyTheme(isDark);
  }, []);

  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    localStorage.setItem('theme-mode', newIsDark ? 'dark' : 'light');
    applyTheme(newIsDark);
  };

  const { isLoading, isConfigured, refreshData } = useClickUp();
  const { isFiltered, resetFilters } = useFilters();

  const getTitle = () => {
    if (pathname === '/') return 'Dashboard Overview';
    if (pathname === '/reporting') return 'Reporting Center';
    if (pathname === '/team') return 'Team Performance';
    if (pathname === '/projects') return 'Project Health';
    if (pathname === '/mytasks') return 'My Tasks';
    if (pathname === '/workspace') return 'Projects & Tasks';
    if (pathname.startsWith('/workspace/')) return 'List View';
    if (pathname === '/calendar') return 'Workspace Calendar';
    if (pathname === '/members') return 'Team Member Management';
    if (pathname === '/settings') return 'Settings';
    return 'TM Labs Dashboard';
  };

  return (
    <header className="h-16 bg-card border-b border-slate-700/20 px-6 flex items-center justify-between sticky top-0 z-sticky shadow-sm">
      {/* View Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-secondary hover:text-primary transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-base sm:text-lg md:text-h2 font-bold text-primary tracking-tight truncate max-w-[140px] sm:max-w-none">{getTitle()}</h2>

        <div className="hidden lg:flex items-center gap-2 ml-6">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Status:</span>
          {isFiltered ? (
            <button 
              onClick={resetFilters}
              className="px-2.5 py-1 rounded-full bg-brand-pink/10 border border-brand-pink/20 text-[10px] font-bold text-brand-pink hover:bg-brand-pink hover:text-white transition-all uppercase tracking-tight flex items-center gap-1"
            >
              Filtered View <X size={10} />
            </button>
          ) : (
            <div className="px-2.5 py-1 rounded-full bg-secondary border border-slate-700/30 text-[10px] font-bold text-secondary uppercase tracking-tight">
              All Tasks
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 mr-2">
          {isConfigured ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <Circle size={6} className="fill-green-500 text-green-500" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live Sync</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
              <Circle size={6} className="fill-red-500 text-red-500" />
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Offline</span>
            </div>
          )}
        </div>

        <button 
          onClick={refreshData}
          disabled={isLoading || !isConfigured}
          className={`flex items-center gap-2 px-2.5 py-2 sm:px-4 sm:py-2 rounded-xl text-caption font-bold transition-all shadow-sm ${isLoading ? 'bg-secondary text-muted' : 'bg-brand-pink text-white hover:bg-opacity-90 hover:scale-105 shadow-brand-pink/20'}`}
          title={isLoading ? 'Syncing...' : 'Sync Now'}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          <span className="hidden sm:inline">{isLoading ? 'Syncing...' : 'Sync Now'}</span>
        </button>

        <div className="w-px h-6 bg-slate-700/20 mx-1" />

        {userEmail && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-elevated border border-slate-700/20">
            <div className="w-6 h-6 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
              {userEmail[0]}
            </div>
            <span className="text-caption font-semibold text-primary max-w-[140px] truncate" title={userEmail}>
              {userEmail}
            </span>
          </div>
        )}

        <NotificationBell />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-secondary hover:bg-elevated hover:text-primary transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
