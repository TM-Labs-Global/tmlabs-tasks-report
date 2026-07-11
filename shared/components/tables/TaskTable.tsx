'use client';
import React, { useState } from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Ban, Timer, AlertTriangle } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { TaskDetailPanel } from '@/features/tasks/TaskDetailPanel';

interface Task {
  id: string;
  name: string;
  project: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  status: string;
  priority: 1 | 2 | 3 | 4 | null;
  dueDate: string | null;
  text_content?: string;
  url?: string;
  tags?: any[];
  flags: {
    isBlocked: boolean;
    isSpillover: boolean;
    isOverdue: boolean;
  };
}

interface TaskTableProps {
  tasks: Task[];
  onRowClick?: (task: Task) => void;
}

export function TaskTable({ tasks, onRowClick }: TaskTableProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const handleRowClick = (task: Task) => {
    setSelectedTaskId(task.id);
    onRowClick?.(task);
  };

  // Pagination logic
  const totalPages = Math.ceil(tasks.length / pageSize);
  const paginatedTasks = tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-6 mb-4 px-2 sm:px-4 py-2 sm:py-3 bg-secondary/20 rounded-xl border border-slate-700/10">
        <div className="text-xs sm:text-label font-bold text-muted uppercase tracking-widest mr-0 sm:mr-2">Legend:</div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Ban size={12} className="sm:w-3.5 sm:h-3.5 text-status-blocked" />
          <span className="text-[10px] sm:text-caption text-secondary">Blocked</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Timer size={12} className="sm:w-3.5 sm:h-3.5 text-priority-high" />
          <span className="text-[10px] sm:text-caption text-secondary">Spillover</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <AlertTriangle size={12} className="sm:w-3.5 sm:h-3.5 text-priority-urgent" />
          <span className="text-[10px] sm:text-caption text-secondary">Overdue</span>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-slate-700/20 bg-card shadow-lg shadow-slate-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max md:min-w-full">
            <thead className="bg-secondary border-b border-slate-700/20 sticky top-0">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-label font-bold text-muted uppercase tracking-widest whitespace-nowrap">Task Title</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-label font-bold text-muted uppercase tracking-widest whitespace-nowrap">Project</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-label font-bold text-muted uppercase tracking-widest whitespace-nowrap">Assignee</th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-label font-bold text-muted uppercase tracking-widest whitespace-nowrap">Priority</th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-label font-bold text-muted uppercase tracking-widest whitespace-nowrap">Due Date</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-label font-bold text-muted uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-label font-bold text-muted uppercase tracking-widest text-center whitespace-nowrap">Flags</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/10">
              {paginatedTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => handleRowClick(task)}
                  className="hover:bg-elevated cursor-pointer transition-colors duration-150 h-auto md:h-12"
                >
                  <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-body font-medium text-primary truncate max-w-[120px] sm:max-w-md">{task.name}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-body text-secondary truncate max-w-[80px] sm:max-w-none">{task.project}</td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-body text-secondary truncate">
                    {task.assignee?.name || 'Unassigned'}
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className={`hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-body ${task.flags.isOverdue ? 'text-red-500 font-semibold' : 'text-secondary'}`}>
                    {task.dueDate || '—'}
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-3 text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      {task.flags.isBlocked && (
                        <div title="Blocked">
                          <Ban size={14} className="sm:w-4 sm:h-4 text-status-blocked" />
                        </div>
                      )}
                      {task.flags.isSpillover && (
                        <div title="Spillover">
                          <Timer size={14} className="sm:w-4 sm:h-4 text-priority-high" />
                        </div>
                      )}
                      {task.flags.isOverdue && (
                        <div title="Overdue">
                          <AlertTriangle size={14} className="sm:w-4 sm:h-4 text-priority-urgent" />
                        </div>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-secondary">
                    No tasks found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-slate-700/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 bg-secondary/30">
            <div className="text-xs sm:text-caption text-secondary text-center sm:text-left">
              Showing <span className="text-primary font-medium">{((currentPage - 1) * pageSize) + 1}</span> to <span className="text-primary font-medium">{Math.min(currentPage * pageSize, tasks.length)}</span> of <span className="text-primary font-medium">{tasks.length}</span> tasks
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 rounded text-xs sm:text-caption bg-elevated border border-slate-700/30 text-primary disabled:opacity-50 hover:bg-slate-700/40 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs sm:text-caption text-secondary px-2 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 rounded text-xs sm:text-caption bg-elevated border border-slate-700/30 text-primary disabled:opacity-50 hover:bg-slate-700/40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Side Panel — replaces the old ClickUp modal */}
      <Sheet open={!!selectedTaskId} onOpenChange={(open) => { if (!open) setSelectedTaskId(null); }}>
        {selectedTaskId && (
          <TaskDetailPanel
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </Sheet>
    </>
  );
}
