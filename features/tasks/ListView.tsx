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
  Eye,
  EyeOff
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useAuth } from '@/shared/context/AuthContext';
import { DatePicker } from './DatePicker';
import { TaskCreateModal } from './TaskCreateModal';

interface ListViewProps {
  listId: string;
  tasks: any[];
  statuses: any[];
  members: any[];
  onTaskClick: (taskId: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAddTask: (taskName: string, statusId?: string, fields?: Record<string, any>) => Promise<void>;
  onUpdateTask?: (taskId: string, fields: Record<string, any>) => Promise<void>;
}

// ─── Priority helpers (ClickUp standard colors & explicit tooltips) ──────────
const PRIORITY_CONFIG: Record<string, { label: string; color: string; bgColor: string; tooltip: string }> = {
  '1': { label: 'Urgent', color: '#EF4444', bgColor: 'rgba(239,68,68,0.15)', tooltip: 'Red = Urgent Priority' },
  '2': { label: 'High',   color: '#F59E0B', bgColor: 'rgba(245,158,11,0.15)', tooltip: 'Orange/Yellow = High Priority' },
  '3': { label: 'Normal', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.15)', tooltip: 'Blue = Normal Priority' },
  '4': { label: 'Low',    color: '#94A3B8', bgColor: 'rgba(148,163,184,0.15)', tooltip: 'Grey = Low Priority' },
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

function TaskRow({
  task,
  statuses,
  members,
  role,
  onTaskClick,
  onUpdateStatus,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
}: {
  task: any;
  statuses: any[];
  members?: any[];
  role: string;
  onTaskClick: (id: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUpdateTask?: (taskId: string, fields: Record<string, any>) => Promise<void>;
  onAddSubtask?: (task: any) => void;
}) {
  const isOverdue = task.flags?.isOverdue;
  const isBlocked = task.flags?.isBlocked;
  const priority = getPriorityConfig(task.priority);

  // ── Inline name edit state ───────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(task.name);

  const startEditing = () => {
    if (role !== 'product_manager' || !onUpdateTask) return;
    setDraftName(task.name);
    setEditingName(true);
  };

  const commitEdit = async () => {
    const trimmed = draftName.trim();
    setEditingName(false);
    if (trimmed && trimmed !== task.name && onUpdateTask) {
      await onUpdateTask(task.id, { name: trimmed });
    }
  };

  const cancelEdit = () => {
    setDraftName(task.name);
    setEditingName(false);
  };

  return (
    <div
      className={`cl-task-row group${isBlocked ? ' cl-task-row--blocked' : ''}${isOverdue ? ' cl-task-row--overdue' : ''}`}
    >
      {/* ── Col 1: Status circle + Task name + Add Subtask '+' button ── */}
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
                style={{
                  backgroundColor: task.status?.toLowerCase().includes('progress')
                    ? '#645BFF'
                    : (statuses.find(s => s.name === task.status || s.id === task.status_id)?.color || '#94A3B8')
                }}
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

        {editingName ? (
          <input
            autoFocus
            className="cl-task-name-edit"
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
          />
        ) : (
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <span
              className={`cl-task-name truncate${role === 'product_manager' ? ' cl-task-name--editable' : ''}`}
              onClick={() => onTaskClick(task.id)}
              onDoubleClick={startEditing}
              title={role === 'product_manager' ? 'Double-click to edit name' : task.name}
            >
              {task.name}
            </span>

            {/* Subtasks Count Badge */}
            {(task.subtasks?.length > 0 || task.subtasks_count > 0) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A9CC8] bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0" title="Subtasks">
                ↳ {task.subtasks?.length || task.subtasks_count}
              </span>
            )}

            {/* Quick '+' Add Subtask Button directly on row hover */}
            {role === 'product_manager' && onAddSubtask && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubtask(task);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-secondary hover:text-brand-pink hover:bg-white/5 rounded text-[11px] flex items-center gap-0.5 cursor-pointer shrink-0"
                title={`Add subtask to "${task.name}"`}
              >
                <Plus size={12} />
                <span className="text-[10px] hidden sm:inline">Subtask</span>
              </button>
            )}
          </div>
        )}

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

      {/* ── Col 2: Assignees (Inline Editable) ── */}
      <div className="cl-task-col cl-task-col--assignees">
        {role === 'product_manager' && onUpdateTask && members && members.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center hover:opacity-80 transition-opacity cursor-pointer" title="Assign member">
                {task.assignees && task.assignees.length > 0 ? (
                  <div className="cl-avatar-stack">
                    {task.assignees.slice(0, 3).map((a: any, i: number) => (
                      <div key={i} className="cl-avatar-wrap">
                        <AvatarChip name={a.full_name || a.username || a.email || a.profile?.full_name || '?'} src={a.profilePicture || a.profile?.profilePicture} size={22} />
                      </div>
                    ))}
                    {task.assignees.length > 3 && (
                      <div className="cl-avatar-overflow">+{task.assignees.length - 3}</div>
                    )}
                  </div>
                ) : (
                  <User size={14} className="cl-unassigned-icon" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="cl-status-menu">
              <DropdownMenuItem
                onClick={() => onUpdateTask(task.id, { assignee_ids: [] })}
                className="cl-status-menu-item text-slate-400"
              >
                Unassigned
              </DropdownMenuItem>
              {members.map((m: any) => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => onUpdateTask(task.id, { assignee_ids: [m.id] })}
                  className="cl-status-menu-item"
                >
                  <AvatarChip name={m.full_name || m.username || m.email} size={18} />
                  <span>{m.full_name || m.username || m.email}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          task.assignees && task.assignees.length > 0 ? (
            <div className="cl-avatar-stack">
              {task.assignees.slice(0, 3).map((a: any, i: number) => (
                <div key={i} className="cl-avatar-wrap">
                  <AvatarChip name={a.full_name || a.username || a.email || a.profile?.full_name || '?'} src={a.profilePicture} size={22} />
                </div>
              ))}
            </div>
          ) : (
            <User size={14} className="cl-unassigned-icon" />
          )
        )}
      </div>

      {/* ── Col 3: Due Date (Interactive Calendar DatePicker) ── */}
      <div className="cl-task-col cl-task-col--due">
        {role === 'product_manager' && onUpdateTask ? (
          <DatePicker
            value={task.due_date}
            onChange={(d) => onUpdateTask(task.id, { due_date: d || null })}
            placeholder="Due date"
            className="scale-90 -ml-2"
          />
        ) : task.due_date ? (
          <span className={`cl-due-date${isOverdue ? ' cl-due-date--overdue' : ''}`}>
            <CalendarIcon size={12} />
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        ) : (
          <CalendarIcon size={14} className="cl-unassigned-icon" />
        )}
      </div>

      {/* ── Col 4: Priority (Inline Dropdown Editable) ── */}
      <div className="cl-task-col cl-task-col--priority">
        {role === 'product_manager' && onUpdateTask ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer focus:outline-none" title={priority?.tooltip || 'Set Priority'}>
                {priority ? (
                  <span
                    className="cl-priority-chip"
                    style={{ color: priority.color, backgroundColor: priority.bgColor }}
                  >
                    <Flag size={10} style={{ color: priority.color }} />
                    {priority.label}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                    <Flag size={14} className="cl-unassigned-icon" />
                    Low
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="cl-status-menu">
              <DropdownMenuItem onClick={() => onUpdateTask(task.id, { priority: '1' })} className="cl-status-menu-item" title="Red = Urgent Priority">
                <Flag size={12} className="text-red-500" /> Urgent (Red)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateTask(task.id, { priority: '2' })} className="cl-status-menu-item" title="Orange/Yellow = High Priority">
                <Flag size={12} className="text-amber-500" /> High (Orange)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateTask(task.id, { priority: '3' })} className="cl-status-menu-item" title="Blue = Normal Priority">
                <Flag size={12} className="text-blue-500" /> Normal (Blue)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateTask(task.id, { priority: '4' })} className="cl-status-menu-item" title="Grey = Low Priority">
                <Flag size={12} className="text-slate-400" /> Low (Grey)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : priority ? (
          <span
            className="cl-priority-chip cursor-pointer"
            title={priority.tooltip}
            style={{ color: priority.color, backgroundColor: priority.bgColor }}
          >
            <Flag size={10} style={{ color: priority.color }} />
            {priority.label}
          </span>
        ) : (
          <span title="Grey = Low Priority" className="cursor-pointer inline-flex items-center">
            <Flag size={14} className="cl-unassigned-icon" />
          </span>
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
            {role === 'product_manager' && onAddSubtask && (
              <DropdownMenuItem
                onClick={() => onAddSubtask(task)}
                className="cl-status-menu-item"
              >
                <Plus size={13} /> Add Subtask
              </DropdownMenuItem>
            )}
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

// ─── Inline "Add Task" row ──────────────────────────────────────────────────
function AddTaskRow({
  statusId,
  members = [],
  onAdd,
}: {
  statusId: string;
  members?: any[];
  onAdd: (name: string, statusId: string, fields?: Record<string, any>) => Promise<void>;
}) {
  const [active, setActive] = useState(false);
  const [name, setName] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState('3'); // Normal

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    const taskName = name.trim();
    setName('');
    await onAdd(taskName, statusId, {
      assigneeId: assigneeId || undefined,
      due_date: dueDate || undefined,
      priority,
    });
    setActive(true);
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
    <form onSubmit={submit} className="cl-add-row-form flex-wrap lg:flex-nowrap gap-2 items-center">
      <div className="w-4 h-4 rounded-full border border-dashed border-[#8A9CC8] flex-shrink-0" />
      <input
        autoFocus
        placeholder="Task name..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit(e);
          if (e.key === 'Escape') setActive(false);
        }}
        className="cl-add-row-input flex-1 min-w-[200px]"
      />

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Assignee Trigger */}
        <select
          value={assigneeId}
          onChange={e => setAssigneeId(e.target.value)}
          className="h-7 px-2 rounded text-[11px] bg-bg-elevated border border-border-default text-primary cursor-pointer focus:outline-none focus:border-brand-pink"
          title="Assignee"
        >
          <option value="">👤 Assignee</option>
          {members.map((m: any) => (
            <option key={m.id} value={m.id}>
              {m.full_name || m.username || m.email}
            </option>
          ))}
        </select>

        {/* DatePicker for Due Date */}
        <DatePicker
          value={dueDate}
          onChange={d => setDueDate(d || null)}
          placeholder="Due date"
          className="scale-90"
        />

        {/* Priority Selector */}
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="h-7 px-1.5 rounded text-[11px] bg-bg-elevated border border-border-default text-primary cursor-pointer focus:outline-none focus:border-brand-pink"
          title="Priority"
        >
          <option value="1">🚨 Urgent</option>
          <option value="2">🟧 High</option>
          <option value="3">🟦 Normal</option>
          <option value="4">⬜ Low</option>
        </select>

        {/* Save / Cancel */}
        <button type="submit" className="cl-add-row-save flex items-center gap-1">
          Save ↵
        </button>
        <button type="button" onClick={() => setActive(false)} className="cl-add-row-cancel">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Status section (collapsible) ──────────────────────────────────────────
function StatusSection({
  status,
  tasks,
  allStatuses,
  members,
  role,
  onTaskClick,
  onUpdateStatus,
  onDeleteTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
}: {
  status: any;
  tasks: any[];
  allStatuses: any[];
  members: any[];
  role: string;
  onTaskClick: (id: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAddTask: (name: string, statusId: string, fields?: Record<string, any>) => Promise<void>;
  onUpdateTask?: (taskId: string, fields: Record<string, any>) => Promise<void>;
  onAddSubtask?: (task: any) => void;
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
        {(() => {
          const pillColor = status.name.toLowerCase().includes('progress') ? '#645BFF' : (status.color || '#94A3B8');
          return (
            <span
              className="cl-section-pill"
              style={{ backgroundColor: `${pillColor}22`, color: pillColor, borderColor: `${pillColor}44` }}
            >
              <span className="cl-section-pill-dot" style={{ backgroundColor: pillColor }} />
              {status.name.toUpperCase()}
            </span>
          );
        })()}

        <span className="cl-section-count">{tasks.length}</span>
      </div>

      {/* ── Column header row ── */}
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
                members={members}
                role={role}
                onTaskClick={onTaskClick}
                onUpdateStatus={onUpdateStatus}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onAddSubtask={onAddSubtask}
              />
            ))
          ) : (
            <div className="cl-empty-section">No tasks in this status.</div>
          )}

          {/* Add task inline row */}
          {role === 'product_manager' && (
            <AddTaskRow statusId={status.id} members={members} onAdd={onAddTask} />
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
  onUpdateTask,
}: ListViewProps) {
  const { user } = useAuth();
  const role = user?.role || 'staff';

  const [search, setSearch] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const [hideEmptyStatuses, setHideEmptyStatuses] = useState(true);
  
  // Subtask modal state for list view
  const [subtaskParent, setSubtaskParent] = useState<{ id: string; name: string } | null>(null);

  // Filter tasks: exclude closed/completed tasks by default
  const isClosedTask = (t: any) => {
    const sName = (t.status || '').toLowerCase();
    return t.status_type === 'closed' || sName === 'complete' || sName === 'closed' || sName === 'done';
  };

  const visibleTasks = showClosed
    ? tasks
    : tasks.filter(t => !isClosedTask(t));

  const filteredTasks = search
    ? visibleTasks.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : visibleTasks;

  // Determine ordered status list
  let orderedStatuses = statuses.length > 0
    ? [...statuses]
    : Array.from(new Map(filteredTasks.map(t => [t.status, { id: t.status_id || t.status, name: t.status, color: '#94A3B8' }])).values());

  // Reorder: Move Backlog/Archive statuses to the end
  const backlogKeywords = ['backlog', 'archived', 'archive', 'done', 'closed', 'complete'];
  orderedStatuses = orderedStatuses.sort((a, b) => {
    const aIsBacklog = backlogKeywords.some(k => a.name.toLowerCase().includes(k));
    const bIsBacklog = backlogKeywords.some(k => b.name.toLowerCase().includes(k));
    if (aIsBacklog && !bIsBacklog) return 1;
    if (!aIsBacklog && bIsBacklog) return -1;
    return 0;
  });

  // Filter out empty status groups to eliminate visual noise (per user requirement)
  const activeStatuses = hideEmptyStatuses
    ? orderedStatuses.filter(status => {
        const count = filteredTasks.filter(t => t.status === status.name || t.status_id === status.id).length;
        return count > 0;
      })
    : orderedStatuses;

  const handleAddTask = async (name: string, statusId?: string, fields?: Record<string, any>) => {
    await onAddTask(name, statusId, fields);
  };

  const handleCreateSubtask = async (data: {
    name: string;
    statusId: string;
    assigneeId?: string;
    dueDate?: string;
    priority?: string;
    description?: string;
    parent_task_id?: string | null;
  }) => {
    if (!subtaskParent) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list_id: listId,
          parent_task_id: subtaskParent.id,
          name: data.name,
          status_id: data.statusId,
          assignee_ids: data.assigneeId ? [data.assigneeId] : [],
          due_date: data.dueDate,
          priority: data.priority,
          description: data.description,
        }),
      });

      if (res.ok) {
        setSubtaskParent(null);
        if (onAddTask) {
          // Trigger refresh through parent
          await onAddTask('', undefined, { refreshOnly: true });
        }
      }
    } catch (err) {
      console.error('Failed to create subtask:', err);
    }
  };

  return (
    <div className="cl-list-view">
      {/* ── Toolbar ── */}
      <div className="cl-toolbar flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
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

          {/* Toggle to Hide/Show Empty Statuses */}
          <button
            onClick={() => setHideEmptyStatuses(!hideEmptyStatuses)}
            className={`cl-archive-toggle flex items-center gap-1.5 transition-colors cursor-pointer ${
              hideEmptyStatuses ? 'text-primary bg-white/10' : 'text-muted'
            }`}
            title={hideEmptyStatuses ? 'Showing only active status groups. Click to show all.' : 'Showing all status groups. Click to hide empty ones.'}
          >
            {hideEmptyStatuses ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{hideEmptyStatuses ? 'Hide Empty Groups' : 'Show Empty Groups'}</span>
          </button>
        </div>

        {/* Toggle to Show/Hide Archived Completed Tasks */}
        <button
          onClick={() => setShowClosed(!showClosed)}
          className={`cl-archive-toggle transition-colors cursor-pointer ${
            showClosed ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/40' : ''
          }`}
          title={showClosed ? 'Hide completed tasks' : 'Show completed/archived tasks'}
        >
          {showClosed ? '✓ Show Archive (Completed)' : 'Show Archive'}
        </button>
      </div>

      {/* ── Status sections ── */}
      <div className="cl-sections">
        {activeStatuses.map(status => {
          const statusTasks = filteredTasks.filter(t => t.status === status.name || t.status_id === status.id);
          return (
            <StatusSection
              key={status.id}
              status={status}
              tasks={statusTasks}
              allStatuses={statuses}
              members={members}
              role={role}
              onTaskClick={onTaskClick}
              onUpdateStatus={onUpdateStatus}
              onDeleteTask={onDeleteTask}
              onAddTask={handleAddTask}
              onUpdateTask={onUpdateTask}
              onAddSubtask={(task) => setSubtaskParent({ id: task.id, name: task.name })}
            />
          );
        })}

        {activeStatuses.length === 0 && (
          <div className="cl-empty-state text-center py-8 text-secondary">
            {hideEmptyStatuses 
              ? 'No active tasks in this list. Click "Show Empty Groups" or "+ Add Task" to create one.'
              : 'No tasks or statuses configured for this list.'}
          </div>
        )}
      </div>

      {/* Full Subtask Creation Modal */}
      {subtaskParent && (
        <TaskCreateModal
          open={!!subtaskParent}
          onOpenChange={(open) => !open && setSubtaskParent(null)}
          statuses={statuses}
          members={members}
          defaultStatusId={statuses[0]?.id}
          parentTaskId={subtaskParent.id}
          parentTaskName={subtaskParent.name}
          onCreateTask={handleCreateSubtask}
        />
      )}

      {/* ── Scoped styles ── */}
      <style>{`
        /* === CONTAINER === */
        .cl-list-view {
          width: 100%;
          font-family: inherit;
        }

        /* === TOOLBAR === */
        .cl-toolbar {
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
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 0 10px 0 32px;
          color: var(--color-text-primary);
          font-size: 12px;
          outline: none;
          transition: border-color 0.15s;
        }
        .cl-search-input:focus {
          border-color: #FF3396;
        }
        .cl-search-input::placeholder {
          color: var(--color-text-muted);
        }
        .cl-archive-toggle {
          display: inline-flex;
          align-items: center;
          height: 32px;
          padding: 0 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-secondary);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .cl-archive-toggle:hover {
          background: rgba(255,255,255,0.08);
          color: var(--color-text-primary);
        }

        /* === STATUS SECTION === */
        .cl-sections {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cl-status-section {
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
        }
        .cl-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          user-select: none;
        }
        .cl-section-toggle {
          background: none;
          border: none;
          padding: 2px;
          color: var(--color-text-muted);
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .cl-section-toggle:hover {
          color: var(--color-text-primary);
        }
        .cl-section-chevron {
          display: block;
        }
        .cl-section-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
        }
        .cl-section-pill-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
        .cl-section-count {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-muted);
          margin-left: 2px;
        }

        /* === COLUMN HEADERS === */
        .cl-col-header-row {
          display: grid;
          grid-template-columns: 1fr 140px 110px 100px 40px;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(255,255,255,0.01);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .cl-col-header {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-text-muted);
        }

        /* === TASK ROW === */
        .cl-task-row {
          display: grid;
          grid-template-columns: 1fr 140px 110px 100px 40px;
          gap: 8px;
          align-items: center;
          padding: 7px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: background 0.12s;
        }
        .cl-task-row:last-child {
          border-bottom: none;
        }
        .cl-task-row:hover {
          background: rgba(255,255,255,0.035);
        }
        .cl-task-row--blocked {
          background: rgba(239, 68, 68, 0.03);
        }
        .cl-task-row--overdue {
          background: rgba(245, 158, 11, 0.03);
        }

        /* Column contents */
        .cl-task-col {
          display: flex;
          align-items: center;
          min-width: 0;
        }
        .cl-task-col--name {
          gap: 8px;
          overflow: hidden;
        }
        .cl-status-dot-btn {
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .cl-status-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          display: block;
          transition: transform 0.15s;
        }
        .cl-status-dot-btn:hover .cl-status-dot {
          transform: scale(1.3);
        }
        .cl-task-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
        }
        .cl-task-name--editable {
          cursor: text;
        }
        .cl-task-name:hover {
          color: #FF3396;
        }
        .cl-task-name-edit {
          flex: 1;
          height: 24px;
          background: rgba(255,255,255,0.08);
          border: 1px solid #FF3396;
          border-radius: 4px;
          padding: 0 6px;
          color: var(--color-text-primary);
          font-size: 13px;
          outline: none;
        }
        .cl-tag-row {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .cl-tag {
          font-size: 9px;
          font-weight: 600;
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid;
          white-space: nowrap;
        }

        /* Assignees */
        .cl-task-col--assignees {
          gap: 4px;
        }
        .cl-avatar-stack {
          display: flex;
          align-items: center;
        }
        .cl-avatar-wrap {
          margin-left: -4px;
        }
        .cl-avatar-wrap:first-child {
          margin-left: 0;
        }
        .cl-avatar-overflow {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          color: var(--color-text-muted);
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: -4px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .cl-unassigned-icon {
          color: rgba(255,255,255,0.15);
        }

        /* Due date */
        .cl-task-col--due {
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        .cl-due-date {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        .cl-due-date--overdue {
          color: #EF4444;
          font-weight: 600;
        }

        /* Priority */
        .cl-task-col--priority {
          font-size: 11px;
        }
        .cl-priority-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        /* Actions */
        .cl-task-col--actions {
          justify-content: flex-end;
        }
        .cl-row-action-btn {
          background: none;
          border: none;
          padding: 4px;
          color: var(--color-text-muted);
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s, background 0.15s;
        }
        .cl-row-action-btn:hover {
          color: var(--color-text-primary);
          background: rgba(255,255,255,0.06);
        }

        /* === ADD TASK ROW === */
        .cl-add-row {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          padding: 8px 14px;
          background: none;
          border: none;
          border-top: 1px solid rgba(255,255,255,0.03);
          color: var(--color-text-muted);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
        }
        .cl-add-row:hover {
          color: #FF3396;
          background: rgba(255,255,255,0.02);
        }
        .cl-add-row-icon {
          color: inherit;
        }
        .cl-add-row-form {
          display: flex;
          align-items: center;
          padding: 6px 14px;
          border-top: 1px solid rgba(255,255,255,0.04);
          background: rgba(255,255,255,0.02);
        }
        .cl-add-row-input {
          height: 28px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 0 8px;
          color: var(--color-text-primary);
          font-size: 12px;
          outline: none;
        }
        .cl-add-row-input:focus {
          border-color: #FF3396;
        }
        .cl-add-row-save {
          height: 28px;
          padding: 0 10px;
          background: #FF3396;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .cl-add-row-cancel {
          height: 28px;
          padding: 0 8px;
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--color-text-muted);
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
        }
        .cl-empty-section {
          padding: 12px 14px;
          font-size: 12px;
          color: var(--color-text-muted);
          font-style: italic;
        }

        /* === STATUS MENU === */
        .cl-status-menu {
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 4px;
          min-width: 140px;
          z-index: 50;
        }
        .cl-status-menu-item {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 8px;
          font-size: 12px;
          color: #e2e8f0;
          border-radius: 5px;
          cursor: pointer;
        }
        .cl-status-menu-item:hover {
          background: rgba(255,255,255,0.08);
        }
        .cl-status-menu-item--danger {
          color: #ef4444;
        }
        .cl-status-menu-item--danger:hover {
          background: rgba(239,68,68,0.12);
        }
        .cl-status-menu-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .cl-col-header-row,
          .cl-task-row {
            grid-template-columns: 1fr 90px 40px;
          }
          .cl-col--due,
          .cl-col--priority,
          .cl-task-col--due,
          .cl-task-col--priority {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
