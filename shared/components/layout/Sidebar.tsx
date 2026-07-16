'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useWorkspace } from '@/shared/context/WorkspaceContext';

import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  FolderKanban, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  CheckSquare,
  Calendar,
  Settings,
  FolderOpen,
  ListTodo,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { teams, selectedTeamId } = useClickUp();
  const { spaces } = useWorkspace();

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const role = user?.role || 'staff';

  // ── Collect all lists from workspace hierarchy ─────────────────────────────
  // For Staff: these are the "projects" they can navigate to
  const allLists: { id: string; name: string; color: string }[] = [];
  for (const space of (spaces || [])) {
    for (const list of (space.folderlessLists || [])) {
      allLists.push({ id: list.id, name: list.name, color: list.color || space.color || '#FF3396' });
    }
    for (const folder of (space.folders || [])) {
      for (const list of (folder.lists || [])) {
        allLists.push({ id: list.id, name: list.name, color: list.color || space.color || '#FF3396' });
      }
    }
  }

  const renderNavLink = (item: { name: string; href: string; icon: any }) => {
    const isActive = item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(item.href + '/');
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
          <span className="ml-3 text-body font-medium truncate">{item.name}</span>
        )}
      </Link>
    );
  };

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
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1">

        {/* ── STAFF ── */}
        {role === 'staff' && (
          <>
            {renderNavLink({ name: 'My Tasks', href: '/mytasks', icon: CheckSquare })}
            {renderNavLink({ name: 'Calendar', href: '/calendar', icon: Calendar })}

            {/* Assigned Projects */}
            {allLists.length > 0 && (
              <>
                {!isCollapsed && (
                  <p className="text-[10px] text-muted uppercase tracking-widest font-bold pt-4 pb-1 px-2">
                    My Projects
                  </p>
                )}
                {isCollapsed && <div className="border-t border-slate-700/20 my-2" />}
                {allLists.map(list => {
                  const href = `/workspace/${list.id}`;
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={list.id}
                      href={href}
                      title={list.name}
                      className={`
                        flex items-center p-2 rounded-lg transition-colors duration-150 group text-caption font-medium
                        ${isActive
                          ? 'bg-brand-pink/10 text-brand-pink'
                          : 'text-secondary hover:bg-elevated hover:text-primary'
                        }
                      `}
                    >
                      <span
                        className="w-[18px] h-[18px] rounded-sm flex-shrink-0 flex items-center justify-center"
                        style={{ background: `${list.color}22`, border: `1.5px solid ${list.color}55` }}
                      >
                        <ListTodo size={11} style={{ color: list.color }} />
                      </span>
                      {!isCollapsed && (
                        <span className="ml-3 truncate">{list.name}</span>
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* ── STAKEHOLDER ── */}
        {role === 'stakeholder' && (
          <>
            {renderNavLink({ name: 'Overview', href: '/', icon: LayoutDashboard })}
            {renderNavLink({ name: 'Reporting Center', href: '/reporting', icon: ClipboardList })}
            {renderNavLink({ name: 'Project Health', href: '/projects', icon: FolderKanban })}
            {renderNavLink({ name: 'Team Performance', href: '/team', icon: Users })}
          </>
        )}

        {/* ── PRODUCT MANAGER ── */}
        {role === 'product_manager' && (
          <>
            {renderNavLink({ name: 'Dashboard', href: '/', icon: LayoutDashboard })}
            {renderNavLink({ name: 'My Tasks', href: '/mytasks', icon: CheckSquare })}
            {renderNavLink({ name: 'Workspace', href: '/workspace', icon: FolderOpen })}
            {renderNavLink({ name: 'Calendar', href: '/calendar', icon: Calendar })}
            {renderNavLink({ name: 'Team Members', href: '/members', icon: Users })}
            {renderNavLink({ name: 'Reporting Center', href: '/reporting', icon: ClipboardList })}
            {renderNavLink({ name: 'Team Performance', href: '/team', icon: Users })}
            {renderNavLink({ name: 'Project Health', href: '/projects', icon: FolderKanban })}
          </>
        )}

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
        
        {renderNavLink({ name: 'Settings', href: '/settings', icon: Settings })}

        {/* Notification Bell (staff + PM only) */}
        {role !== 'stakeholder' && (
          <NotificationBell isCollapsed={isCollapsed} />
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
