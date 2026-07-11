'use client';

import React, { useState } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Flag,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useAuth } from '@/shared/context/AuthContext';

interface ListViewProps {
  listId: string;
  tasks: any[];
  statuses: any[];
  members: any[];
  onTaskClick: (taskId: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAddTask: (taskName: string, statusId?: string) => Promise<void>;
}

// ─── Priority helpers (ClickUp standard colors) ────────────────────────────
const PRIORITY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  '1': { label: 'Urgent', color: '#EF4444', bgColor: 'rgba(239,68,68,0.12)' },
  '2': { label: 'High',   color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)' },
  '3': { label: 'Normal', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)' },
  '4': { label: 'Low',    color: '#94A3B8', bgColor: 'rgba(148,163,184,0.12)' },
};

function getPriorityConfig(priority: number | string | null) {
  if (priority == null) return null;
  return PRIORITY_CONFIG[String(priority)] ?? null;
}

// ─── Avatar chip ────────────────────────────────────────────────────────────
function AvatarChip({ name, src, size = 22 }: { name: string; src?: string; size?: number }) {
  const initials = (name || '?').charAt(0).toUpperCase();
  const colors = [
    '#6633FF', '#FF3396', '#F59E0B', '#3B82F6',
    '#22C55E', '#8B5CF6', '#EC4899', '#14B8A6',
  ];
  const colorIdx = (name.charCodeAt(0) || 0) % colors.length;
  const bg = colors[colorIdx];

  return src ? (
    <img
      src={src}
      alt={name}
      title={name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
    />
  ) : (
    <div
      title={name}
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.42 }}
      className="rounded-full flex items-center justify-center text-white font-bold ring-1 ring-white/10 flex-shrink-0"
    >
      {initials}
    </div>
  );
}

// ─── Inline "Add Task" row ──────────────────────────────────────────────────
function AddTaskRow({
  statusId,
  onAdd,
}: {
  statusId: string;
  onAdd: (name: string, statusId: string) => Promise<void>;
}) {
  const [active, setActive] = useState(false);
  const [name, setName] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd(name.trim(), statusId);
    setName('');
    setActive(false);
  };

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="cl-add-row"
      >
        <Plus size={13} className="cl-add-row-icon" />
        <span>Add Task</span>
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="cl-add-row-form">
      <input
        autoFocus
        placeholder="Task name..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && setActive(false)}
        className="cl-add-row-input"
      />
      <button type="submit" className="cl-add-row-save">Save</button>
      <button type="button" onClick={() => setActive(false)} className="cl-add-row-cancel">
        Cancel
      </button>
    </form>
  );
}

// ─── Single task row ────────────────────────────────────────────────────────
function TaskRow({
  task,
  statuses,
  role,
  onTaskClick,
  onUpdateStatus,
  onDeleteTask,
}: {
  task: any;
  statuses: any[];
  role: string;
  onTaskClick: (id: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}) {
  const isOverdue = task.flags?.isOverdue;
  const isBlocked = task.flags?.isBlocked;
  const priority = getPriorityConfig(task.priority);

  const dueDateText = task.due_date
    ? format(new Date(task.due_date), 'MMM d')
    : null;

  return (
    <div
      className={`cl-task-row${isBlocked ? ' cl-task-row--blocked' : ''}${isOverdue ? ' cl-task-row--overdue' : ''}`}
    >
      {/* ── Col 1: Status circle + Task name ── */}
      <div className="cl-task-col cl-task-col--name">
        {/* Mini status circle (clickable status switcher) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="cl-status-dot-btn"
              title="Change status"
            >
              <span
                className="cl-status-dot"
                style={{ backgroundColor: statuses.find(s => s.name === task.status)?.color || '#94A3B8' }}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="cl-status-menu">
            {statuses.map(s => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => onUpdateStatus(task.id, s.id)}
                className="cl-status-menu-item"
              >
                <span className="cl-status-menu-dot" style={{ backgroundColor: s.color }} />
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span
          className="cl-task-name"
          onClick={() => onTaskClick(task.id)}
          title={task.name}
        >
          {task.name}
        </span>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="cl-tag-row">
            {task.tags.map((t: any, i: number) => (
              <span
                key={i}
                className="cl-tag"
                style={{ backgroundColor: `${t.color}18`, color: t.color, borderColor: `${t.color}35` }}
              >
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Col 2: Assignees ── */}
      <div className="cl-task-col cl-task-col--assignees">
        {task.assignees && task.assignees.length > 0 ? (
          <div className="cl-avatar-stack">
            {task.assignees.slice(0, 3).map((a: any, i: number) => (
              <div key={i} className="cl-avatar-wrap">
                <AvatarChip name={a.username || a.email || '?'} src={a.profilePicture} size={22} />
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="cl-avatar-overflow">+{task.assignees.length - 3}</div>
            )}
          </div>
        ) : (
          <User size={14} className="cl-unassigned-icon" />
        )}
      </div>

      {/* ── Col 3: Due Date ── */}
      <div className="cl-task-col cl-task-col--due">
        {dueDateText ? (
          <span className={`cl-due-date${isOverdue ? ' cl-due-date--overdue' : ''}`}>
            <CalendarIcon size={12} />
            {dueDateText}
          </span>
        ) : (
          <CalendarIcon size={14} className="cl-unassigned-icon" />
        )}
      </div>

      {/* ── Col 4: Priority ── */}
      <div className="cl-task-col cl-task-col--priority">
        {priority ? (
          <span
            className="cl-priority-chip"
            style={{ color: priority.color, backgroundColor: priority.bgColor }}
          >
            <Flag size={10} style={{ color: priority.color }} />
            {priority.label}
          </span>
        ) : (
          <Flag size={14} className="cl-unassigned-icon" />
        )}
      </div>

      {/* ── Col 5: Row actions ── */}
      <div className="cl-task-col cl-task-col--actions">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cl-row-action-btn">
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="cl-status-menu">
            <DropdownMenuItem
              onClick={() => onTaskClick(task.id)}
              className="cl-status-menu-item"
            >
              <ExternalLink size={13} /> Open Details
            </DropdownMenuItem>
            {role === 'product_manager' && (
              <DropdownMenuItem
                onClick={() => {
                  if (confirm('Delete this task?')) onDeleteTask(task.id);
                }}
                className="cl-status-menu-item cl-status-menu-item--danger"
              >
                <Trash2 size={13} /> Delete Task
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── Status section (collapsible) ──────────────────────────────────────────
function StatusSection({
  status,
  tasks,
  allStatuses,
  role,
  onTaskClick,
  onUpdateStatus,
  onDeleteTask,
  onAddTask,
}: {
  status: any;
  tasks: any[];
  allStatuses: any[];
  role: string;
  onTaskClick: (id: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAddTask: (name: string, statusId: string) => Promise<void>;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="cl-status-section">
      {/* ── Section header ── */}
      <div className="cl-section-header">
        <button
          className="cl-section-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand section' : 'Collapse section'}
        >
          {collapsed
            ? <ChevronRight size={14} className="cl-section-chevron" />
            : <ChevronDown  size={14} className="cl-section-chevron" />}
        </button>

        {/* Colored status pill */}
        <span
          className="cl-section-pill"
          style={{ backgroundColor: `${status.color}22`, color: status.color, borderColor: `${status.color}44` }}
        >
          <span className="cl-section-pill-dot" style={{ backgroundColor: status.color }} />
          {status.name.toUpperCase()}
        </span>

        <span className="cl-section-count">{tasks.length}</span>
      </div>

      {/* ── Column header row (shown once per status group) ── */}
      {!collapsed && (
        <>
          <div className="cl-col-header-row">
            <div className="cl-col-header cl-col--name">Name</div>
            <div className="cl-col-header cl-col--assignees">Assignee</div>
            <div className="cl-col-header cl-col--due">Due date</div>
            <div className="cl-col-header cl-col--priority">Priority</div>
            <div className="cl-col-header cl-col--actions" />
          </div>

          {/* Task rows */}
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                statuses={allStatuses}
                role={role}
                onTaskClick={onTaskClick}
                onUpdateStatus={onUpdateStatus}
                onDeleteTask={onDeleteTask}
              />
            ))
          ) : (
            <div className="cl-empty-section">No tasks in this status.</div>
          )}

          {/* Add task inline row */}
          {role === 'product_manager' && (
            <AddTaskRow statusId={status.id} onAdd={onAddTask} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Root ListView export ───────────────────────────────────────────────────
export function ListView({
  listId,
  tasks,
  statuses,
  members,
  onTaskClick,
  onUpdateStatus,
  onDeleteTask,
  onAddTask,
}: ListViewProps) {
  const { user } = useAuth();
  const role = user?.role || 'staff';

  const [search, setSearch] = useState('');

  const filteredTasks = search
    ? tasks.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  // Determine ordered status list — use statuses array as the canonical order.
  // Fall back to collecting unique status names from tasks if statuses is empty.
  const orderedStatuses = statuses.length > 0
    ? statuses
    : Array.from(new Map(filteredTasks.map(t => [t.status, { id: t.status_id || t.status, name: t.status, color: '#94A3B8' }])).values());

  const handleAddTask = async (name: string, statusId?: string) => {
    await onAddTask(name, statusId);
  };

  return (
    <div className="cl-list-view">
      {/* ── Toolbar ── */}
      <div className="cl-toolbar">
        <div className="cl-search-wrap">
          <svg className="cl-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="cl-search-input"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Status sections ── */}
      <div className="cl-sections">
        {orderedStatuses.map(status => {
          const statusTasks = filteredTasks.filter(t => t.status === status.name);
          return (
            <StatusSection
              key={status.id}
              status={status}
              tasks={statusTasks}
              allStatuses={statuses}
              role={role}
              onTaskClick={onTaskClick}
              onUpdateStatus={onUpdateStatus}
              onDeleteTask={onDeleteTask}
              onAddTask={handleAddTask}
            />
          );
        })}

        {orderedStatuses.length === 0 && (
          <div className="cl-empty-state">
            No tasks or statuses configured for this list.
          </div>
        )}
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* === CONTAINER === */
        .cl-list-view {
          width: 100%;
          font-family: inherit;
        }

        /* === TOOLBAR === */
        .cl-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .cl-search-wrap {
          position: relative;
          width: 240px;
        }
        .cl-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          color: var(--color-text-muted);
          pointer-events: none;
        }
        .cl-search-input {
          width: 100%;
          height: 32px;
          padding: 0 10px 0 32px;
          background: var(--color-surface-1);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: var(--color-text-primary);
          font-size: 12.5px;
          outline: none;
          transition: border-color 0.15s;
        }
        .cl-search-input:focus {
          border-color: var(--color-brand-pink);
        }
        .cl-search-input::placeholder { color: var(--color-text-muted); }

        /* === SECTIONS WRAPPER === */
        .cl-sections {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          overflow: hidden;
          background: var(--color-surface-1);
        }

        /* === STATUS SECTION === */
        .cl-status-section {
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .cl-status-section:last-child { border-bottom: none; }

        /* === SECTION HEADER === */
        .cl-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px 7px 8px;
          background: var(--color-surface-2);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          user-select: none;
        }
        .cl-section-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          border-radius: 4px;
          color: var(--color-text-muted);
          transition: background 0.12s, color 0.12s;
        }
        .cl-section-toggle:hover {
          background: rgba(255,255,255,0.06);
          color: var(--color-text-primary);
        }
        .cl-section-chevron { flex-shrink: 0; }

        .cl-section-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 9px 2px 6px;
          border-radius: 20px;
          border: 1px solid transparent;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          line-height: 1;
        }
        .cl-section-pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .cl-section-count {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-text-muted);
          margin-left: 2px;
        }

        /* === COLUMN HEADER ROW === */
        .cl-col-header-row {
          display: grid;
          grid-template-columns: 1fr 120px 110px 110px 40px;
          align-items: center;
          padding: 4px 12px 4px 34px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: var(--color-surface-1);
        }
        .cl-col-header {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 0;
        }

        /* === TASK ROW === */
        .cl-task-row {
          display: grid;
          grid-template-columns: 1fr 120px 110px 110px 40px;
          align-items: center;
          padding: 0 12px 0 10px;
          min-height: 34px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          background: transparent;
          transition: background 0.1s;
          position: relative;
        }
        .cl-task-row:last-of-type { border-bottom: none; }
        .cl-task-row:hover { background: rgba(255,255,255,0.03); }
        .cl-task-row--blocked { border-left: 2px solid #EF4444; padding-left: 8px; }
        .cl-task-row--overdue  { border-left: 2px solid var(--color-brand-pink); padding-left: 8px; }

        /* === TASK COLUMNS === */
        .cl-task-col {
          display: flex;
          align-items: center;
          padding: 5px 6px;
          overflow: hidden;
        }
        .cl-task-col--name {
          gap: 7px;
          flex: 1;
          min-width: 0;
        }
        .cl-task-col--assignees { justify-content: flex-start; }
        .cl-task-col--due       { justify-content: flex-start; }
        .cl-task-col--priority  { justify-content: flex-start; }
        .cl-task-col--actions   { justify-content: flex-end; }

        /* === STATUS DOT BUTTON === */
        .cl-status-dot-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          border-radius: 50%;
          flex-shrink: 0;
          transition: opacity 0.12s;
        }
        .cl-status-dot-btn:hover { opacity: 0.7; }
        .cl-status-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          display: block;
          flex-shrink: 0;
          border: 1.5px solid rgba(255,255,255,0.15);
        }

        /* === TASK NAME === */
        .cl-task-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          flex: 1;
          min-width: 0;
          transition: color 0.12s;
        }
        .cl-task-name:hover { color: var(--color-brand-pink); }

        /* === TAGS === */
        .cl-tag-row {
          display: flex;
          flex-wrap: nowrap;
          gap: 3px;
          flex-shrink: 0;
        }
        .cl-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        /* === AVATAR STACK === */
        .cl-avatar-stack {
          display: flex;
          align-items: center;
        }
        .cl-avatar-wrap {
          margin-right: -5px;
          position: relative;
        }
        .cl-avatar-wrap:last-child { margin-right: 0; }
        .cl-avatar-overflow {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--color-surface-3);
          color: var(--color-text-secondary);
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
          margin-left: 3px;
        }
        .cl-unassigned-icon { color: var(--color-text-muted); flex-shrink: 0; }

        /* === DUE DATE === */
        .cl-due-date {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary);
          white-space: nowrap;
        }
        .cl-due-date--overdue { color: #F87171; }

        /* === PRIORITY CHIP === */
        .cl-priority-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 700;
          padding: 2px 7px 2px 5px;
          border-radius: 5px;
          white-space: nowrap;
        }

        /* === STATUS DROPDOWN MENU === */
        .cl-status-menu {
          background: var(--color-surface-1) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
          padding: 4px !important;
          min-width: 160px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.5) !important;
        }
        .cl-status-menu-item {
          display: flex !important;
          align-items: center !important;
          gap: 7px !important;
          padding: 6px 10px !important;
          font-size: 12.5px !important;
          font-weight: 500 !important;
          color: var(--color-text-primary) !important;
          border-radius: 6px !important;
          cursor: pointer !important;
        }
        .cl-status-menu-item:hover { background: var(--color-surface-3) !important; }
        .cl-status-menu-item--danger { color: #F87171 !important; }
        .cl-status-menu-item--danger:hover { background: rgba(239,68,68,0.1) !important; }
        .cl-status-menu-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* === ROW ACTION BUTTON === */
        .cl-row-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          border-radius: 6px;
          color: var(--color-text-muted);
          opacity: 0;
          transition: opacity 0.12s, background 0.12s;
        }
        .cl-task-row:hover .cl-row-action-btn { opacity: 1; }
        .cl-row-action-btn:hover {
          background: rgba(255,255,255,0.07);
          color: var(--color-text-primary);
        }

        /* === EMPTY SECTION === */
        .cl-empty-section {
          padding: 8px 34px;
          font-size: 12px;
          color: var(--color-text-muted);
          font-style: italic;
        }

        /* === ADD TASK ROW === */
        .cl-add-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px 6px 34px;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: color 0.12s, background 0.12s;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .cl-add-row:hover {
          color: var(--color-brand-pink);
          background: rgba(255, 51, 150, 0.04);
        }
        .cl-add-row-icon { flex-shrink: 0; }

        .cl-add-row-form {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 34px;
          border-top: 1px solid rgba(255,255,255,0.04);
          background: rgba(255,255,255,0.015);
        }
        .cl-add-row-input {
          flex: 1;
          height: 28px;
          padding: 0 10px;
          background: var(--color-surface-2);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          color: var(--color-text-primary);
          font-size: 12.5px;
          outline: none;
          transition: border-color 0.15s;
        }
        .cl-add-row-input:focus { border-color: var(--color-brand-pink); }
        .cl-add-row-input::placeholder { color: var(--color-text-muted); }
        .cl-add-row-save {
          height: 28px;
          padding: 0 12px;
          background: var(--color-brand-pink);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.12s;
        }
        .cl-add-row-save:hover { opacity: 0.88; }
        .cl-add-row-cancel {
          height: 28px;
          padding: 0 10px;
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: var(--color-text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.12s;
        }
        .cl-add-row-cancel:hover { background: rgba(255,255,255,0.06); }

        /* === EMPTY STATE === */
        .cl-empty-state {
          padding: 48px;
          text-align: center;
          font-size: 13px;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
