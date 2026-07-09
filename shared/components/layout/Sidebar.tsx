'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { useClickUp } from '@/shared/context/ClickUpContext';

import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  FolderKanban, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  History,
  User as UserIcon,
  CheckSquare,
  Calendar,
  Settings,
  FolderOpen
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { token, teams, selectedTeamId, setToken } = useClickUp();

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const role = user?.role || 'staff';

  // Define navigation based on roles
  const getNavItems = () => {
    const items: { name: string; href: string; icon: any }[] = [];

    // Overview/Reporting sections
    if (role === 'product_manager' || role === 'stakeholder') {
      items.push({ name: 'Overview', href: '/', icon: LayoutDashboard });
      items.push({ name: 'Reporting Center', href: '/reporting', icon: ClipboardList });
    }
    if (role === 'product_manager') {
      items.push({ name: 'Team Performance', href: '/team', icon: Users });
      items.push({ name: 'Project Health', href: '/projects', icon: FolderKanban });
    }

    // New Workspace/Platform sections
    if (role === 'product_manager' || role === 'staff') {
      items.push({ name: 'My Tasks', href: '/mytasks', icon: CheckSquare });
    }
    if (role === 'product_manager') {
      items.push({ name: 'Projects & Tasks', href: '/workspace', icon: FolderOpen });
    }
    if (role === 'product_manager' || role === 'staff') {
      items.push({ name: 'Calendar', href: '/calendar', icon: Calendar });
    }
    if (role === 'product_manager') {
      items.push({ name: 'Team Members', href: '/members', icon: Users });
    }
    
    // Settings visible to all
    items.push({ name: 'Settings', href: '/settings', icon: Settings });

    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          flex flex-col bg-secondary border-r border-slate-700/20 transition-all duration-300 ease-in-out
          fixed inset-y-0 left-0 z-[70] lg:relative
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-60 w-64'}
        `}
      >

      {/* Logo Area */}
      <div className="h-14 flex items-center px-4 border-b border-slate-700/10">
        <img 
          src="/brand/White.png" 
          alt="TM Labs Logo" 
          className="w-8 h-8 object-contain flex-shrink-0" 
        />
        {!isCollapsed && (
          <span className="ml-3 font-display font-bold text-lg text-primary truncate">
            TM Labs
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center p-2 rounded-lg transition-colors duration-150 group
                ${isActive 
                  ? 'bg-brand-pink/10 text-brand-pink' 
                  : 'text-secondary hover:bg-elevated hover:text-primary'
                }
              `}
            >
              <Icon size={20} className={isActive ? 'text-brand-pink' : 'text-secondary group-hover:text-primary'} />
              {!isCollapsed && (
                <span className="ml-3 text-body font-medium truncate">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile Area */}
      <div className="p-2 border-t border-slate-700/10 space-y-1">
        {!isCollapsed && selectedTeam?.name && (
          <div className="mb-2 px-2 py-2 rounded-lg bg-elevated/40 border border-slate-700/10">
            <div className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Workspace</div>
            <div className="text-caption font-semibold text-primary truncate">
              {selectedTeam.name}
            </div>
          </div>
        )}

        {!isCollapsed && user && (
          <div className="mb-2 px-2 py-2 rounded-lg bg-elevated/40 border border-slate-700/10 flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
              {user.email[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-muted uppercase tracking-widest font-bold">
                {role.replace('_', ' ')}
              </div>
              <div className="text-caption font-semibold text-primary truncate" title={user.email}>
                {user.email}
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={async () => {
            if (confirm('Are you sure you want to logout?')) {
              await logout();
            }
          }}
          className="w-full flex items-center p-2 rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors group"
        >
          <LogOut size={20} className="group-hover:text-red-500" />
          {!isCollapsed && <span className="ml-3 text-body font-medium">Logout</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center p-2 rounded-lg text-secondary hover:bg-elevated hover:text-primary transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : (
            <>
              <ChevronLeft size={20} />
              <span className="ml-3 text-body font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}


