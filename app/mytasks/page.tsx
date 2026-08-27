'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { useAuth } from '@/shared/context/AuthContext';
import { Sheet } from '@/components/ui/sheet';
import { TaskDetailPanel } from '@/features/tasks/TaskDetailPanel';
import {
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  MoreHorizontal,
  Flag,
  Plus,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

// ─── Priority config (matching ListView) ─────────────────────────────────────
const PRIORITY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  '1': { label: 'Urgent', color: '#EF4444', bgColor: 'rgba(239,68,68,0.12)' },
  '2': { label: 'High',   color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)' },
  '3': { label: 'Normal', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)' },
  '4': { label: 'Low',    color: '#9B9CA1', bgColor: 'rgba(155,156,161,0.12)' },
};

function getPriorityConfig(priority: number | string | null) {
  if (priority == null) return null;
  return PRIORITY_CONFIG[String(priority)] ?? null;
}

// ─── Mini Avatar chip ─────────────────────────────────────────────────────────
function AvatarChip({ name, src, size = 22 }: { name: string; src?: string; size?: number }) {
  const initials = (name || '?').charAt(0).toUpperCase();
  const colors = ['#6633FF', '#FF3396', '#F59E0B', '#3B82F6', '#22C55E', '#8B5CF6', '#14B8A6'];
  const bg = colors[(name.charCodeAt(0) || 0) % colors.length];
  return src ? (
    <img src={src} alt={name} title={name} style={{ width: size, height: size }} className="rounded-full object-cover ring-1 ring-white/10 flex-shrink-0" />
  ) : (
    <div title={name} style={{ width: size, height: size, background: bg, fontSize: size * 0.42 }} className="rounded-full flex items-center justify-center text-white font-bold ring-1 ring-white/10 flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Task Row (My Tasks view) ─────────────────────────────────────────────────
function MyTaskRow({
  task,
  allStatuses,
  onTaskClick,
  onUpdateStatus,
}: {
  task: any;
  allStatuses: any[];
  onTaskClick: (id: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => void;
}) {
  const isOverdue = task.flags?.isOverdue;
  const priority = getPriorityConfig(task.priority);
  const dueDateText = task.due_date ? format(new Date(task.due_date), 'MMM d') : null;
  const dotColor = allStatuses.find((s) => s.name === task.status)?.color || '#9B9CA1';

  return (
    <div
      className={`mytask-row${isOverdue ? ' mytask-row--overdue' : ''}`}
      onClick={() => onTaskClick(task.id)}
    >
      {/* Col 1: Status dot + Name */}
      <div className="mytask-col mytask-col--name">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="mytask-status-btn"
              title="Change status"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="mytask-status-dot" style={{ backgroundColor: dotColor }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mytask-status-menu" onClick={(e) => e.stopPropagation()}>
            {allStatuses.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => onUpdateStatus(task.id, s.id)}
                className="mytask-status-item"
              >
                <span className="mytask-status-dot-sm" style={{ backgroundColor: s.color }} />
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="mytask-name" title={task.name}>
          {task.name}
        </span>

        {task.project && (
          <span className="mytask-project-badge">{task.project}</span>
        )}
      </div>

      {/* Col 2: Assignees */}
      <div className="mytask-col mytask-col--assignees">
        {task.assignees && task.assignees.length > 0 ? (
          <div className="mytask-avatar-stack">
            {task.assignees.slice(0, 3).map((a: any, i: number) => (
              <div key={i} style={{ marginLeft: i > 0 ? '-6px' : 0 }}>
                <AvatarChip name={a.username || a.email || '?'} src={a.profilePicture} size={22} />
              </div>
            ))}
          </div>
        ) : (
          <User size={14} className="text-[#55565C]" />
        )}
      </div>

      {/* Col 3: Due date */}
      <div className="mytask-col mytask-col--due">
        {dueDateText ? (
          <span className={`mytask-due${isOverdue ? ' mytask-due--overdue' : ''}`}>
            <CalendarIcon size={11} />
            {dueDateText}
          </span>
        ) : (
          <CalendarIcon size={14} className="text-[#55565C]" />
        )}
      </div>

      {/* Col 4: Priority */}
      <div className="mytask-col mytask-col--priority">
        {priority ? (
          <span className="mytask-priority-chip" style={{ color: priority.color, background: priority.bgColor }}>
            <Flag size={10} style={{ color: priority.color }} />
            {priority.label}
          </span>
        ) : (
          <Flag size={14} className="text-[#55565C]" />
        )}
      </div>

      {/* Col 5: Row actions */}
      <div className="mytask-col mytask-col--actions">
        <button className="mytask-action-btn" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Status Section (collapsible, same as ListView) ───────────────────────────
function MyTaskStatusSection({
  status,
  tasks,
  allStatuses,
  onTaskClick,
  onUpdateStatus,
}: {
  status: { id: string; name: string; color: string };
  tasks: any[];
  allStatuses: any[];
  onTaskClick: (id: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (tasks.length === 0) return null;

  return (
    <div className="mytask-section">
      {/* Section header */}
      <div className="mytask-section-header">
        <button
          className="mytask-section-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed
            ? <ChevronRight size={13} className="text-[#9B9CA1]" />
            : <ChevronDown size={13} className="text-[#9B9CA1]" />}
        </button>

        <span
          className="mytask-section-pill"
          style={{ background: `${status.color}20`, color: status.color, borderColor: `${status.color}40` }}
        >
          <span className="mytask-pill-dot" style={{ background: status.color }} />
          {status.name.toUpperCase()}
        </span>

        <span className="mytask-section-count">{tasks.length}</span>
      </div>

      {!collapsed && (
        <>
          {/* Column header */}
          <div className="mytask-col-header-row">
            <div className="mytask-col-header mytask-col--name">Name</div>
            <div className="mytask-col-header mytask-col--assignees">Assignee</div>
            <div className="mytask-col-header mytask-col--due">Due date</div>
            <div className="mytask-col-header mytask-col--priority">Priority</div>
            <div className="mytask-col-header mytask-col--actions" />
          </div>

          {tasks.map((task) => (
            <MyTaskRow
              key={task.id}
              task={task}
              allStatuses={allStatuses}
              onTaskClick={onTaskClick}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </>
      )}
    </div>
  );
}

// ─── My Tasks Page ────────────────────────────────────────────────────────────
export default function MyTasksPage() {
  const { tasks, refreshData, members, spaces, isLoading } = useWorkspace();
  const { user } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'board'>('list');
  const [showClosed, setShowClosed] = useState(false);

  // Find this user's profile
  const myProfile = members.find((m) => m.email?.toLowerCase() === user?.email?.toLowerCase());
  const myUserId = myProfile?.id;

  // Filter to tasks assigned to current user
  const rawMyTasks = tasks.filter((task: any) =>
    task.assignees?.some((a: any) => a.id === myUserId || a.email?.toLowerCase() === user?.email?.toLowerCase()) ||
    task.assignee_ids?.includes(myUserId)
  );

  // Filter out closed tasks unless showClosed is toggled ON
  const myTasks = showClosed
    ? rawMyTasks
    : rawMyTasks.filter((t: any) => t.status_type !== 'closed' && !['done', 'completed', 'closed'].includes(t.status?.toLowerCase()));

  // Collect all unique statuses across user's tasks
  const backlogKeywords = ['backlog', 'archived', 'archive', 'done', 'closed'];
  const statusMap = new Map<string, { id: string; name: string; color: string }>();
  for (const task of rawMyTasks) {
    const key = task.status;
    if (!statusMap.has(key)) {
      statusMap.set(key, {
        id: task.status_id || task.status,
        name: task.status,
        color: task.status_color || '#94A3B8',
      });
    }
  }

  let orderedStatuses = Array.from(statusMap.values());
  if (orderedStatuses.length === 0) {
    orderedStatuses = [
      { id: 'todo', name: 'To Do', color: '#8A9CC8' },
      { id: 'in_progress', name: 'In Progress', color: '#F59E0B' },
      { id: 'done', name: 'Done', color: '#22C55E' },
    ];
  } else {
    orderedStatuses = orderedStatuses.sort((a, b) => {
      const aIsBack = backlogKeywords.some((k) => a.name.toLowerCase().includes(k));
      const bIsBack = backlogKeywords.some((k) => b.name.toLowerCase().includes(k));
      if (aIsBack && !bIsBack) return 1;
      if (!aIsBack && bIsBack) return -1;
      return 0;
    });
  }

  const handleUpdateStatus = async (taskId: string, statusId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: statusId }),
      });
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (taskId: string, fields: Record<string, any>) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-7 h-7 text-brand-pink animate-spin" />
        <p className="text-[13px] text-muted animate-pulse">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-[22px] font-bold text-primary tracking-tight leading-tight">My Tasks</h1>
          <p className="text-[12px] text-muted">
            Your personal dashboard of all assigned items across spaces ({myTasks.length} task{myTasks.length !== 1 ? 's' : ''})
          </p>
        </div>
      </div>

      {/* ── VIEW SWITCHER & CLOSED TOGGLE ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-brand-pink/20 text-white border border-brand-pink/40 shadow-sm'
                : 'text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            List
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'board'
                ? 'bg-brand-pink/20 text-white border border-brand-pink/40 shadow-sm'
                : 'text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            Board
          </button>
        </div>

        <button
          onClick={() => setShowClosed(!showClosed)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            showClosed
              ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/40'
              : 'bg-white/5 text-muted hover:text-white'
          }`}
        >
          {showClosed ? '✓ Show Closed' : 'Show Closed'}
        </button>
      </div>

      {/* ── Task Canvas ── */}
      {myTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-white/8 rounded-2xl">
          <p className="text-[14px] font-semibold text-muted">No assigned tasks found</p>
          <p className="text-[12px] text-muted/70">
            {showClosed ? 'You have no tasks assigned.' : 'Toggle "Show Closed" to view completed tasks or ask your PM for new assignments.'}
          </p>
        </div>
      ) : (
        <div className="mytask-container">
          {orderedStatuses.map((status) => {
            const statusTasks = myTasks.filter((t: any) => t.status === status.name);
            return (
              <MyTaskStatusSection
                key={status.id}
                status={status}
                tasks={statusTasks}
                allStatuses={orderedStatuses}
                onTaskClick={setSelectedTaskId}
                onUpdateStatus={handleUpdateStatus}
              />
            );
          })}
        </div>
      )}

      {/* ── Task Detail Sheet ── */}
      <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
        {selectedTaskId && (
          <TaskDetailPanel
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            onRefresh={refreshData}
          />
        )}
      </Sheet>

      {/* ── Scoped Styles ── */}
      <style>{`
        /* Container */
        .mytask-container {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          overflow: hidden;
          background: var(--bg-card, #1A2440);
        }

        /* Status section */
        .mytask-section {
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mytask-section:last-child { border-bottom: none; }

        /* Section header */
        .mytask-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 8px;
          background: var(--bg-elevated, #202C4A);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          user-select: none;
        }
        .mytask-section-toggle {
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          padding: 2px; border-radius: 4px;
          transition: background 0.15s;
        }
        .mytask-section-toggle:hover { background: rgba(255,255,255,0.06); }

        .mytask-section-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 2px 10px 2px 6px;
          border-radius: 100px; border: 1px solid;
          font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
        }
        .mytask-pill-dot {
          width: 7px; height: 7px; border-radius: 50%;
        }
        .mytask-section-count {
          font-size: 11px; font-weight: 600;
          color: #8A9CC8;
        }

        /* Column header row */
        .mytask-col-header-row {
          display: grid;
          grid-template-columns: 1fr 100px 110px 100px 40px;
          padding: 0 12px;
          background: var(--bg-card, #1A2440);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .mytask-col-header {
          padding: 5px 4px;
          font-size: 11px; font-weight: 600;
          color: #8A9CC8; text-transform: capitalize;
          white-space: nowrap;
        }
        .mytask-col--name { padding-left: 28px; }

        /* Task row */
        .mytask-row {
          display: grid;
          grid-template-columns: 1fr 100px 110px 100px 40px;
          align-items: center;
          padding: 0 12px;
          min-height: 38px;
          background: var(--bg-card, #1A2440);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: background 0.12s;
        }
        .mytask-row:hover { background: var(--bg-elevated, #202C4A); }
        .mytask-row:last-child { border-bottom: none; }
        .mytask-row--overdue { border-left: 2px solid #EF4444; }

        /* Task row columns */
        .mytask-col {
          display: flex; align-items: center; gap: 6px;
          padding: 4px;
          overflow: hidden;
        }
        .mytask-col--name { gap: 8px; }
        .mytask-col--assignees { justify-content: flex-start; }
        .mytask-col--due { }
        .mytask-col--priority { }
        .mytask-col--actions { justify-content: flex-end; }

        /* Status dot button */
        .mytask-status-btn {
          display: flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border-radius: 50%;
          border: none; background: transparent;
          cursor: pointer; flex-shrink: 0;
          transition: transform 0.15s;
        }
        .mytask-status-btn:hover { transform: scale(1.15); }
        .mytask-status-dot {
          display: block; width: 12px; height: 12px; border-radius: 50%;
        }
        .mytask-status-dot-sm {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0;
        }

        /* Task name */
        .mytask-name {
          font-size: 13px; font-weight: 500;
          color: var(--text-primary, #F0F4FF);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          flex: 1;
        }
        .mytask-project-badge {
          font-size: 10px; font-weight: 700;
          color: #FF3396;
          white-space: nowrap; flex-shrink: 0;
          text-transform: uppercase; letter-spacing: 0.04em;
        }

        /* Avatar stack */
        .mytask-avatar-stack {
          display: flex; align-items: center;
        }

        /* Due date */
        .mytask-due {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 500;
          color: var(--text-secondary, #8A9CC8);
          white-space: nowrap;
        }
        .mytask-due--overdue { color: #EF4444 !important; }

        /* Priority chip */
        .mytask-priority-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 7px; border-radius: 4px;
          font-size: 11px; font-weight: 600; white-space: nowrap;
        }

        /* Status dropdown */
        .mytask-status-menu {
          background: var(--bg-card, #1A2440);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          min-width: 150px;
          padding: 4px;
        }
        .mytask-status-item {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 10px;
          font-size: 12px; font-weight: 500;
          color: var(--text-primary, #F0F4FF);
          border-radius: 6px; cursor: pointer;
        }
        .mytask-status-item:hover { background: var(--bg-elevated, #202C4A); }

        /* Row action button */
        .mytask-action-btn {
          display: flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; border-radius: 4px;
          border: none; background: transparent;
          color: #8A9CC8; cursor: pointer;
          opacity: 0; transition: opacity 0.15s, background 0.15s;
        }
        .mytask-row:hover .mytask-action-btn { opacity: 1; }
        .mytask-action-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
      `}</style>
    </div>
  );
}

// Need to import CheckSquare for the empty state
function CheckSquare({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
