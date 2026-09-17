'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { ListView } from '@/features/tasks/ListView';
import { BoardView } from '@/features/tasks/BoardView';
import { TaskDetailPanel } from '@/features/tasks/TaskDetailPanel';
import { Sheet } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Loader2,
  ArrowLeft,
  Folder,
  List as ListIcon,
  Kanban,
  Clock,
  Table as TableIcon,
  BarChart2,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Users,
  Search,
  CheckCircle2,
  Layers,
  Columns as ColumnsIcon,
} from 'lucide-react';
import Link from 'next/link';
import { TaskCreateModal } from '@/features/tasks/TaskCreateModal';

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.listId as string;
  const { spaces, tasks, refreshData, isLoading, members } = useWorkspace();

  const [activeTab, setActiveTab] = useState('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClosed, setShowClosed] = useState(false);

  // Restore active view type tab from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`list_view_tab_${listId}`);
    if (saved) setActiveTab(saved);
  }, [listId]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    localStorage.setItem(`list_view_tab_${listId}`, val);
  };

  // Find the list object and its custom statuses from workspace context
  let currentList: any = null;
  let spaceName = 'IN HOUSE PROJECTS';
  let folderName: string | null = null;
  let spaceColor = '#6633FF';

  for (const space of spaces) {
    // Check space lists
    const foundList = space.folderlessLists?.find((l: any) => l.id === listId);
    if (foundList) {
      currentList = foundList;
      spaceName = space.name;
      spaceColor = space.color || '#6633FF';
      break;
    }
    // Check folder lists
    for (const folder of space.folders || []) {
      const foundFolderList = folder.lists?.find((l: any) => l.id === listId);
      if (foundFolderList) {
        currentList = foundFolderList;
        spaceName = space.name;
        folderName = folder.name;
        spaceColor = space.color || '#6633FF';
        break;
      }
    }
  }

  const rawTasks = tasks.filter((t) => t.list_id === listId);
  const listTasks = searchQuery
    ? rawTasks.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : rawTasks;
  const statuses = currentList?.statuses || [];

  const handleUpdateStatus = async (taskId: string, statusId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: statusId }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (
    taskName: string,
    statusId?: string,
    fields?: Record<string, any>
  ) => {
    const defaultStatusId = statusId || statuses[0]?.id;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list_id: listId,
          name: taskName,
          status_id: defaultStatusId,
          priority: fields?.priority || '3',
          due_date: fields?.dueDate || fields?.due_date || null,
          assignee_ids: fields?.assigneeId ? [fields.assigneeId] : fields?.assignee_ids || [],
        }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (taskId: string, fields: Record<string, any>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
        <p className="text-body text-secondary animate-pulse">Loading workspace canvas...</p>
      </div>
    );
  }

  if (!currentList) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <h3 className="text-h3 font-bold text-primary">Workspace list not found</h3>
        <p className="text-body text-secondary">
          The requested list does not exist or you do not have permission to view it.
        </p>
        <Link href="/workspace" className="text-brand-pink font-semibold hover:underline">
          Return to Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* ── SECTION 2: TOP BREADCRUMB BAR & LOCATION TRAIL ── */}
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A9CC8] uppercase tracking-wider overflow-hidden">
          <Folder size={14} className="text-brand-pink flex-shrink-0" />
          <span className="truncate">{spaceName}</span>
          <span>/</span>
          {folderName && (
            <>
              <span className="truncate">{folderName}</span>
              <span>/</span>
            </>
          )}
          <span className="text-white font-bold truncate">{currentList.name}</span>
        </div>

        <Link
          href="/workspace"
          className="flex items-center gap-1.5 text-xs font-bold text-[#8A9CC8] hover:text-brand-pink transition-colors cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={13} /> Back to Workspace
        </Link>
      </div>

      {/* ── VIEW SWITCHER TABS BAR (Clean & Uncluttered) ── */}
      <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleTabChange('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-brand-pink/20 text-white border border-brand-pink/40 shadow-sm'
                : 'text-[#8A9CC8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <ListIcon size={14} className={activeTab === 'list' ? 'text-brand-pink' : ''} />
            List
          </button>

          <button
            onClick={() => handleTabChange('board')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'board'
                ? 'bg-brand-pink/20 text-white border border-brand-pink/40 shadow-sm'
                : 'text-[#8A9CC8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Kanban size={14} className={activeTab === 'board' ? 'text-brand-pink' : ''} />
            Board
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8A9CC8] hover:bg-white/5 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10"
              >
                <Plus size={13} />
                View
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-slate-900 border border-slate-800 text-white p-1 shadow-xl">
              <DropdownMenuItem
                onClick={() => handleTabChange('timeline')}
                className={`flex items-center gap-2 text-xs font-medium py-2 cursor-pointer hover:bg-white/8 ${
                  activeTab === 'timeline' ? 'text-brand-pink' : 'text-slate-300'
                }`}
              >
                <Clock size={14} /> Timeline
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTabChange('table')}
                className={`flex items-center gap-2 text-xs font-medium py-2 cursor-pointer hover:bg-white/8 ${
                  activeTab === 'table' ? 'text-brand-pink' : 'text-slate-300'
                }`}
              >
                <TableIcon size={14} /> Table
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTabChange('workload')}
                className={`flex items-center gap-2 text-xs font-medium py-2 cursor-pointer hover:bg-white/8 ${
                  activeTab === 'workload' ? 'text-brand-pink' : 'text-slate-300'
                }`}
              >
                <BarChart2 size={14} /> Workload
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTabChange('calendar')}
                className={`flex items-center gap-2 text-xs font-medium py-2 cursor-pointer hover:bg-white/8 ${
                  activeTab === 'calendar' ? 'text-brand-pink' : 'text-slate-300'
                }`}
              >
                <CalendarIcon size={14} /> Calendar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── ACTION BAR (Group: Status, Subtasks, Columns, Filter, Closed, Search, + Add Task) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/40 p-2.5 rounded-xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Group Status Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-purple/20 text-white border border-brand-purple/40">
            <Layers size={13} className="text-brand-pink" />
            Group: Status
          </span>

          {/* Subtasks Toggle */}
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 text-[#8A9CC8] hover:text-white transition-colors cursor-pointer">
            Subtasks
          </button>

          {/* Columns */}
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 text-[#8A9CC8] hover:text-white transition-colors cursor-pointer">
            <ColumnsIcon size={13} />
            Columns
          </button>

          {/* Filter */}
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 text-[#8A9CC8] hover:text-white transition-colors cursor-pointer">
            <Filter size={13} />
            Filter
          </button>

          {/* Closed Tasks Filter Toggle */}
          <button
            onClick={() => setShowClosed(!showClosed)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              showClosed
                ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/40'
                : 'bg-white/5 text-[#8A9CC8] hover:text-white'
            }`}
          >
            <CheckCircle2 size={13} />
            Closed
          </button>

          {/* Assignee Filter */}
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 text-[#8A9CC8] hover:text-white transition-colors cursor-pointer">
            <Users size={13} />
            Assignee
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4A5A82]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg text-xs bg-bg-card border border-white/8 text-white placeholder-[#4A5A82] focus:outline-none focus:border-brand-pink w-44"
            />
          </div>

          {/* Prominent + Add Task Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-pink text-white hover:bg-brand-pink/90 transition-all shadow-md cursor-pointer flex-shrink-0"
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>
      </div>

      {/* ── EXPANDED CANVAS WORKSPACE CONTENT ── */}
      <div className="pt-2">
        {activeTab === 'list' ? (
          <ListView
            listId={listId}
            tasks={listTasks}
            statuses={statuses}
            members={members}
            onTaskClick={setSelectedTaskId}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
          />
        ) : activeTab === 'board' ? (
          <BoardView
            tasks={listTasks}
            statuses={statuses}
            onTaskClick={setSelectedTaskId}
            onUpdateStatus={handleUpdateStatus}
            onAddTaskInStatus={(statusId) => {
              handleAddTask('New Task', statusId);
            }}
          />
        ) : activeTab === 'table' ? (
          // Table view – flat spreadsheet-style list
          <div className="space-y-3">
            <p className="text-xs text-secondary px-1">Showing all tasks in a flat table. Click any row to open details.</p>
            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-elevated/40 border-b border-white/8 text-secondary uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-bold">Task</th>
                    <th className="text-left px-4 py-3 font-bold">Status</th>
                    <th className="text-left px-4 py-3 font-bold">Priority</th>
                    <th className="text-left px-4 py-3 font-bold">Assignee</th>
                    <th className="text-left px-4 py-3 font-bold">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {listTasks.map((task: any) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="border-b border-white/4 hover:bg-white/4 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium text-primary max-w-[280px] truncate">{task.name}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statuses.find((s: any) => s.id === task.status_id || s.name === task.status)?.color || '#94a3b8' }} />
                          <span className="text-secondary">{task.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-secondary">
                        {task.priority === '1' || task.priority === 1 ? '🔴 Urgent' :
                         task.priority === '2' || task.priority === 2 ? '🟠 High' :
                         task.priority === '3' || task.priority === 3 ? '🔵 Normal' :
                         task.priority === '4' || task.priority === 4 ? '⬜ Low' : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-secondary">
                        {task.assignees?.length > 0
                          ? task.assignees.map((a: any) => a.full_name || a.username || a.email || a.profile?.full_name || '?').join(', ')
                          : <span className="text-muted">Unassigned</span>}
                      </td>
                      <td className="px-4 py-2.5 text-secondary">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {listTasks.length === 0 && (
                <div className="py-12 text-center text-secondary text-sm">No tasks in this list.</div>
              )}
            </div>
          </div>
        ) : activeTab === 'calendar' ? (
          // Calendar embed – link to /calendar filtered by this list
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-secondary">
            <CalendarIcon size={36} className="text-brand-pink/60" />
            <div className="text-center">
              <h3 className="font-bold text-primary text-base mb-1">Calendar View</h3>
              <p className="text-sm text-secondary max-w-sm">View all tasks with due dates on a calendar. The full calendar is available at the global level.</p>
            </div>
            <Link href="/calendar" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-pink text-white text-sm font-bold hover:bg-brand-pink/90 transition-colors">
              <CalendarIcon size={14} /> Open Calendar
            </Link>
          </div>
        ) : activeTab === 'timeline' ? (
          // Timeline – sorted Gantt-style list
          <div className="space-y-2">
            <p className="text-xs text-secondary px-1">Tasks sorted by due date (earliest first).</p>
            {[...listTasks]
              .filter(t => t.due_date)
              .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
              .map((task: any) => {
                const daysLeft = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000);
                const isOverdue = daysLeft < 0;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="flex items-center gap-4 p-3 rounded-xl bg-elevated/20 border border-white/6 hover:bg-elevated/40 cursor-pointer transition-colors"
                  >
                    <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: statuses.find((s: any) => s.id === task.status_id || s.name === task.status)?.color || '#94a3b8' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary text-sm truncate">{task.name}</p>
                      <p className="text-xs text-secondary">{task.status}</p>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      isOverdue ? 'bg-red-500/15 text-red-400' :
                      daysLeft === 0 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-white/6 text-secondary'
                    }`}>
                      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                    </div>
                    <div className="text-xs text-secondary shrink-0">
                      {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            {listTasks.filter(t => t.due_date).length === 0 && (
              <div className="py-12 text-center text-secondary text-sm">No tasks with due dates in this list.</div>
            )}
          </div>
        ) : activeTab === 'workload' ? (
          // Workload – tasks grouped by assignee
          <div className="space-y-4">
            <p className="text-xs text-secondary px-1">Tasks grouped by team member.</p>
            {(() => {
              const assigneeMap = new Map<string, { name: string; tasks: any[] }>();
              listTasks.forEach((task: any) => {
                if (task.assignees && task.assignees.length > 0) {
                  task.assignees.forEach((a: any) => {
                    const name = a.full_name || a.username || a.email || a.profile?.full_name || 'Unknown';
                    const id = a.id || a.profile?.id || name;
                    if (!assigneeMap.has(id)) assigneeMap.set(id, { name, tasks: [] });
                    assigneeMap.get(id)!.tasks.push(task);
                  });
                } else {
                  if (!assigneeMap.has('__unassigned__')) assigneeMap.set('__unassigned__', { name: 'Unassigned', tasks: [] });
                  assigneeMap.get('__unassigned__')!.tasks.push(task);
                }
              });
              return Array.from(assigneeMap.entries()).map(([id, { name, tasks: memberTasks }]) => (
                <div key={id} className="rounded-xl border border-white/8 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-elevated/30 border-b border-white/6">
                    <div className="w-7 h-7 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center font-bold text-xs uppercase">
                      {name.charAt(0)}
                    </div>
                    <span className="font-bold text-sm text-primary">{name}</span>
                    <span className="ml-auto text-xs text-muted bg-white/6 px-2 py-0.5 rounded-full">{memberTasks.length} tasks</span>
                  </div>
                  <div className="divide-y divide-white/4">
                    {memberTasks.slice(0, 10).map((task: any) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/4 cursor-pointer transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statuses.find((s: any) => s.id === task.status_id || s.name === task.status)?.color || '#94a3b8' }} />
                        <span className="text-sm text-primary flex-1 truncate">{task.name}</span>
                        <span className="text-xs text-secondary shrink-0">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                        </span>
                      </div>
                    ))}
                    {memberTasks.length > 10 && (
                      <div className="px-4 py-2 text-xs text-muted">+{memberTasks.length - 10} more tasks</div>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : null}
      </div>

      {/* Task Create Modal */}
      <TaskCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        statuses={statuses}
        members={members}
        defaultStatusId={statuses[0]?.id}
        onCreateTask={async (data) => {
          await handleAddTask(data.name, data.statusId, {
            assigneeId: data.assigneeId,
            dueDate: data.dueDate,
            priority: data.priority,
          });
        }}
      />

      {/* Task Detail Slide-over Sheet */}
      <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
        {selectedTaskId && (
          <TaskDetailPanel
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            onRefresh={refreshData}
          />
        )}
      </Sheet>
    </div>
  );
}
