'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useWorkspace } from '@/shared/context/WorkspaceContext';

import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Folder,
  List,
  Users,
  ClipboardList,
  FolderKanban,
  FolderOpen,
  ListTodo,
  UserCheck,
  Plus,
  Home,
  Inbox,
  Target,
  FileText,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  name: string;
  href: string;
  icon: any;
}

// ─── Icon Rail Button (Fixed ultra-thin strip with Floating Hover Tooltip) ────
function RailIcon({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  href?: string;
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const base =
    'relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150 group cursor-pointer';
  const cls = active
    ? `${base} bg-brand-pink/20 text-brand-pink border border-brand-pink/30 shadow-sm`
    : `${base} text-[#8A9CC8] hover:bg-white/10 hover:text-white`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <Link href={href} className={cls}>
            <Icon size={18} />
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-brand-pink rounded-r-full" />
            )}
          </Link>
        ) : (
          <button className={cls} onClick={onClick}>
            <Icon size={18} />
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="text-xs font-semibold bg-slate-900 text-white border border-slate-700 px-2.5 py-1.5 shadow-xl z-[100]"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Collapsible Space Section (Tier 1 Category Space) ────────────────────────
function SpaceSection({
  space,
  pathname,
  tasks,
}: {
  space: any;
  pathname: string;
  tasks: any[];
}) {
  const [open, setOpen] = useState(true);
  const spaceHref = `/workspace/space/${space.id}`;
  const isSpaceActive = pathname === spaceHref || pathname.startsWith(spaceHref + '/');

  return (
    <div>
      <div className="flex items-center justify-between px-2 py-1 group">
        {/* Collapse toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-4 h-4 flex-shrink-0 text-[#4A5A82] hover:text-[#8A9CC8] transition-colors"
          title={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        </button>

        {/* Space name — navigable link */}
        <Link
          href={spaceHref}
          className={`flex-1 min-w-0 ml-1 text-[10px] font-bold uppercase tracking-widest truncate transition-colors ${
            isSpaceActive
              ? 'text-brand-pink'
              : 'text-[#4A5A82] hover:text-[#8A9CC8]'
          }`}
        >
          {space.name}
        </Link>

        {/* Add List shortcut (PM only) */}
        <button
          className="w-4 h-4 rounded hover:bg-white/10 flex items-center justify-center text-[#4A5A82] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title={`Add List to ${space.name}`}
          onClick={() => {
            // handled via Space Overview page
            window.location.href = spaceHref;
          }}
        >
          <Plus size={11} />
        </button>
      </div>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {/* Tier 3 Folder-less list channels */}
          {(space.folderlessLists || []).map((list: any) => {
            const href = `/workspace/${list.id}`;
            const isActive = pathname === href;
            const taskCount = tasks.filter((t) => t.list_id === list.id).length;

            return (
              <Link
                key={list.id}
                href={href}
                className={`flex items-center justify-between gap-2 pl-4 pr-2 py-[5px] text-[12px] font-medium rounded-md mx-1 transition-all ${
                  isActive
                    ? 'bg-brand-purple/20 text-white border border-brand-purple/30 font-semibold'
                    : 'text-[#8A9CC8] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <List size={13} className="flex-shrink-0 opacity-70" />
                  <span className="truncate">{list.name}</span>
                </div>
                {taskCount > 0 && (
                  <span className="text-[10px] font-bold text-[#4A5A82] bg-white/5 px-1.5 py-0.2 rounded-full flex-shrink-0">
                    {taskCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Tier 2 Folders */}
          {(space.folders || []).map((folder: any) => (
            <FolderSection
              key={folder.id}
              folder={folder}
              pathname={pathname}
              tasks={tasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Collapsible Folder Section (Tier 2 Project Folders) ──────────────────────
function FolderSection({
  folder,
  pathname,
  tasks,
}: {
  folder: any;
  pathname: string;
  tasks: any[];
}) {
  const [open, setOpen] = useState(false);
  const folderHref = `/workspace/folder/${folder.id}`;
  const isFolderActive = pathname === folderHref || pathname.startsWith(folderHref + '/');

  return (
    <div>
      <div className="flex items-center gap-1 pl-3 pr-2 py-[5px] mx-1 rounded-md group hover:bg-white/5 transition-all">
        {/* Collapse toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-4 h-4 flex-shrink-0 text-[#4A5A82] hover:text-[#8A9CC8] transition-colors"
          title={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronDown size={12} className="opacity-70" /> : <ChevronRight size={12} className="opacity-70" />}
        </button>

        <Folder size={13} className="flex-shrink-0 opacity-70 text-brand-pink ml-0.5" />

        {/* Folder name — navigable link */}
        <Link
          href={folderHref}
          className={`flex-1 min-w-0 ml-1 text-[12px] font-medium truncate transition-colors ${
            isFolderActive ? 'text-white font-semibold' : 'text-[#8A9CC8] hover:text-white'
          }`}
        >
          {folder.name}
        </Link>
      </div>

      {open && (
        <div className="space-y-0.5">
          {/* Tier 3 List channels in Folder */}
          {(folder.lists || []).map((list: any) => {
            const href = `/workspace/${list.id}`;
            const isActive = pathname === href;
            const taskCount = tasks.filter((t) => t.list_id === list.id).length;

            return (
              <Link
                key={list.id}
                href={href}
                className={`flex items-center justify-between gap-2 pl-8 pr-2 py-[5px] text-[11.5px] font-medium rounded-md mx-1 transition-all ${
                  isActive
                    ? 'bg-brand-purple/20 text-white border border-brand-purple/30 font-semibold'
                    : 'text-[#8A9CC8] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <ListTodo size={12} className="flex-shrink-0 opacity-60" />
                  <span className="truncate">{list.name}</span>
                </div>
                {taskCount > 0 && (
                  <span className="text-[10px] font-bold text-[#4A5A82] bg-white/5 px-1.5 py-0.2 rounded-full flex-shrink-0">
                    {taskCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar Export ──────────────────────────────────────────────────────
export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { teams, selectedTeamId } = useClickUp();
  const { spaces, tasks, members } = useWorkspace();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const role = user?.role || 'staff';
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  // Find user's profile display name
  const myProfile = members.find((m: any) => m.email === user?.email);
  const displayName = myProfile?.full_name || (user?.email ? user.email.split('@')[0] : 'User');

  // Sync theme state
  useEffect(() => {
    const saved = localStorage.getItem('theme-mode');
    setIsDarkMode(saved ? saved === 'dark' : true);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('theme-mode', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // ── Collect all assigned lists for staff ─────────────────────────────────
  const allLists: { id: string; name: string; spaceName: string; color: string }[] = [];
  for (const space of spaces || []) {
    for (const list of space.folderlessLists || []) {
      allLists.push({
        id: list.id,
        name: list.name,
        spaceName: space.name,
        color: list.color || space.color || '#FF3396',
      });
    }
    for (const folder of space.folders || []) {
      for (const list of folder.lists || []) {
        allLists.push({
          id: list.id,
          name: list.name,
          spaceName: space.name,
          color: list.color || space.color || '#FF3396',
        });
      }
    }
  }

  // ── Section 1: Far-Left Control Rail Items (Fixed Ultra-Thin Strip) ───────
  const staffRailItems: NavItem[] = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'My Tasks', href: '/mytasks', icon: CheckSquare },
    { name: 'Projects & Tasks', href: '/workspace', icon: FolderOpen },
    { name: 'Project Health', href: '/projects', icon: FolderKanban },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const pmRailItems: NavItem[] = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'My Tasks', href: '/mytasks', icon: CheckSquare },
    { name: 'Projects & Spaces', href: '/workspace', icon: FolderOpen },
    { name: 'Project Health', href: '/projects', icon: FolderKanban },
    { name: 'Team Performance', href: '/team', icon: Users },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Team Members', href: '/members', icon: UserCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const stakeholderRailItems: NavItem[] = [
    { name: 'Home / Overview', href: '/', icon: Home },
    { name: 'Project Health', href: '/projects', icon: FolderKanban },
    { name: 'Team Performance', href: '/team', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const railItems =
    role === 'staff'
      ? staffRailItems
      : role === 'product_manager'
      ? pmRailItems
      : stakeholderRailItems;

  const isNavActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ── 2-PANEL SIDEBAR ARCHITECTURE (ClickUp Pattern) ── */}
      <aside
        className={`
          flex h-full flex-shrink-0 transition-transform duration-300 ease-in-out
          fixed inset-y-0 left-0 z-40 lg:z-30 lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ display: 'flex', flexDirection: 'row' }}
      >
        {/* ══ PANEL 1: FAR-LEFT CONTROL RAIL (Fixed Ultra-Thin ~52px Strip) ══ */}
        <div
          className="flex flex-col items-center py-3 gap-1 flex-shrink-0"
          style={{
            width: '52px',
            background: 'var(--cu-icon-rail, #0B1428)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Logo */}
          <div className="mb-3 flex items-center justify-center w-9 h-9">
            <img src="/brand/White.png" alt="TM Labs" className="w-7 h-7 object-contain" />
          </div>

          <div className="w-full px-1.5 flex flex-col items-center gap-1">
            {railItems.map((item) => (
              <RailIcon
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.name}
                active={isNavActive(item.href)}
              />
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Notification Bell */}
          {role !== 'stakeholder' && (
            <div className="px-1.5 mb-1">
              <NotificationBell isCollapsed={true} />
            </div>
          )}

          {/* Theme Switcher Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8A9CC8] hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="text-xs font-semibold bg-slate-900 text-white border border-slate-700 px-2.5 py-1.5 z-[100]"
            >
              {isDarkMode ? 'Light mode' : 'Dark mode'}
            </TooltipContent>
          </Tooltip>

          {/* User Profile Avatar with Floating Hover Tooltip */}
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to logout?')) await logout();
                  }}
                  className="w-9 h-9 rounded-full bg-brand-pink/20 text-brand-pink border border-brand-pink/30 flex items-center justify-center font-bold text-sm uppercase hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer mb-1 flex-shrink-0"
                >
                  {user.email[0]}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={8}
                className="text-xs font-medium bg-slate-900 text-white border border-slate-700 p-2.5 space-y-1 z-[100]"
              >
                <div className="font-bold text-white text-[13px]">{displayName}</div>
                <div className="text-[11px] text-brand-pink font-semibold uppercase tracking-wider">
                  {role.replace('_', ' ')}
                </div>
                <div className="text-[10px] text-slate-400">{user.email}</div>
                <div className="text-[10px] text-red-400 pt-1 border-t border-slate-800">
                  Click to logout
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* ══ PANEL 2: SECONDARY SPACES & PROJECTS PANEL (Left Drawer) ═══════ */}
        {drawerOpen && (
          <div
            className="flex flex-col h-full overflow-hidden flex-shrink-0"
            style={{
              width: '220px',
              background: 'var(--bg-secondary, #1A2847)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Drawer Header: "Spaces" Title + Explicit "+" Creation Trigger */}
            <div className="h-[52px] flex items-center justify-between px-3 flex-shrink-0 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-white uppercase tracking-wider">
                  Spaces
                </span>
                <span className="text-[10px] font-semibold text-[#4A5A82] bg-white/5 px-1.5 py-0.2 rounded">
                  {(spaces || []).length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const name = prompt('Create new Space name:');
                    if (name) alert(`Space creation triggered: ${name}`);
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded text-[#8A9CC8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Create new Space (+)"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-5 h-5 flex items-center justify-center rounded text-[#8A9CC8] hover:text-white transition-colors cursor-pointer"
                  title="Collapse drawer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Drawer Hierarchy Content */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
              {/* ── Quick Access Views ── */}
              <div>
                <p className="text-[10px] font-bold text-[#4A5A82] uppercase tracking-widest px-2 mb-1">
                  Quick Views
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/mytasks"
                    className={`flex items-center justify-between px-2 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                      pathname === '/mytasks'
                        ? 'bg-brand-pink/15 text-brand-pink font-semibold border border-brand-pink/30'
                        : 'text-[#8A9CC8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare size={14} className="text-brand-pink" />
                      <span>My Tasks</span>
                    </div>
                  </Link>

                  <Link
                    href="/workspace"
                    className={`flex items-center justify-between px-2 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                      pathname === '/workspace'
                        ? 'bg-brand-pink/15 text-brand-pink font-semibold border border-brand-pink/30'
                        : 'text-[#8A9CC8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen size={14} />
                      <span>All Workspace Tasks</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* ── STAFF: Assigned Projects ── */}
              {role === 'staff' && (
                <div>
                  <p className="text-[10px] font-bold text-[#4A5A82] uppercase tracking-widest px-2 mb-1.5">
                    Assigned Projects
                  </p>
                  {allLists.length > 0 ? (
                    <div className="space-y-0.5">
                      {allLists.map((list) => {
                        const href = `/workspace/${list.id}`;
                        const isActive = pathname === href || pathname.startsWith(href);
                        const taskCount = tasks.filter((t) => t.list_id === list.id).length;

                        return (
                          <Link
                            key={list.id}
                            href={href}
                            className={`flex items-center justify-between px-2 py-[5px] text-[12px] font-medium rounded-md transition-all ${
                              isActive
                                ? 'bg-brand-purple/20 text-white border border-brand-purple/30 font-semibold'
                                : 'text-[#8A9CC8] hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span
                                className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                                style={{
                                  background: `${list.color}28`,
                                  border: `1px solid ${list.color}55`,
                                }}
                              />
                              <span className="truncate">{list.name}</span>
                            </div>
                            {taskCount > 0 && (
                              <span className="text-[10px] font-bold text-[#4A5A82] bg-white/5 px-1.5 py-0.2 rounded-full">
                                {taskCount}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-2 text-[11px] text-[#4A5A82] italic">
                      No projects assigned yet.
                    </p>
                  )}
                </div>
              )}

              {/* ── PM / ADMIN: Tiered Spaces & Projects Hierarchy ── */}
              {(role === 'product_manager' || role === 'stakeholder') && (
                <div>
                  <div className="flex items-center justify-between px-2 mb-1.5">
                    <p className="text-[10px] font-bold text-[#4A5A82] uppercase tracking-widest">
                      Spaces & Projects
                    </p>
                  </div>
                  <div className="space-y-3">
                    {(spaces || []).map((space: any) => (
                      <SpaceSection
                        key={space.id}
                        space={space}
                        pathname={pathname}
                        tasks={tasks}
                      />
                    ))}
                    {(spaces || []).length === 0 && (
                      <p className="px-2 text-[11px] text-[#4A5A82] italic">
                        Loading workspace spaces...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}

        {/* Drawer re-open tab (when collapsed) */}
        {!drawerOpen && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="absolute left-[52px] top-1/2 -translate-y-1/2 w-4 h-8 bg-bg-secondary border border-white/10 rounded-r-md flex items-center justify-center text-[#8A9CC8] hover:text-white hover:bg-white/10 transition-all cursor-pointer z-10"
            title="Expand sidebar drawer"
          >
            <ChevronRight size={10} />
          </button>
        )}
      </aside>
    </>
  );
}
