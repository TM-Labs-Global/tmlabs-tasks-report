import React, { useState } from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { TaskDetailModal } from '../modals/TaskDetailModal';
import { Ban, Timer, AlertTriangle } from 'lucide-react';

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
    onRowClick?.(task);
  };

  // Pagination logic
  const totalPages = Math.ceil(tasks.length / pageSize);
  const paginatedTasks = tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="flex flex-wrap items-center gap-6 mb-4 px-2 py-3 bg-secondary/20 rounded-xl border border-slate-700/10">
        <div className="text-label font-bold text-muted uppercase tracking-widest mr-2">Legend:</div>
        <div className="flex items-center gap-2">
          <Ban size={14} className="text-status-blocked" />
          <span className="text-caption text-secondary">Blocked / Delayed</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-priority-high" />
          <span className="text-caption text-secondary">Spillover (Carried over)</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-priority-urgent" />
          <span className="text-caption text-secondary">Overdue</span>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-slate-700/20 bg-card shadow-lg shadow-slate-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-secondary border-b border-slate-700/20">
              <tr>
                <th className="px-6 py-4 text-label font-bold text-muted uppercase tracking-widest">Task Title</th>
                <th className="px-6 py-4 text-label font-bold text-muted uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-label font-bold text-muted uppercase tracking-widest">Assignee</th>
                <th className="px-6 py-4 text-label font-bold text-muted uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-label font-bold text-muted uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-label font-bold text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-label font-bold text-muted uppercase tracking-widest text-center">Flags</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/10">
              {paginatedTasks.map((task) => (
                <tr 
                  key={task.id}
                  onClick={() => handleRowClick(task)}
                  className="hover:bg-elevated cursor-pointer transition-colors duration-150 h-12"
                >
                  <td className="px-6 py-3 text-body font-medium text-primary max-w-md truncate">{task.name}</td>
                  <td className="px-6 py-3 text-body text-secondary">{task.project}</td>
                  <td className="px-6 py-3 text-body text-secondary">
                    {task.assignee?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className={`px-6 py-3 text-body ${task.flags.isOverdue ? 'text-red-500 font-semibold' : 'text-secondary'}`}>
                    {task.dueDate || '—'}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {task.flags.isBlocked && (
                        <div title="Blocked">
                          <Ban size={16} className="text-status-blocked" />
                        </div>
                      )}
                      {task.flags.isSpillover && (
                        <div title="Spillover">
                          <Timer size={16} className="text-priority-high" />
                        </div>
                      )}
                      {task.flags.isOverdue && (
                        <div title="Overdue">
                          <AlertTriangle size={16} className="text-priority-urgent" />
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
          <div className="px-6 py-3 border-t border-slate-700/20 flex flex-col sm:flex-row items-center justify-between bg-secondary/30 gap-3">
            <div className="text-caption text-secondary text-center sm:text-left">
              Showing <span className="text-primary font-medium">{((currentPage - 1) * pageSize) + 1}</span> to <span className="text-primary font-medium">{Math.min(currentPage * pageSize, tasks.length)}</span> of <span className="text-primary font-medium">{tasks.length}</span> tasks
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                disabled={currentPage === 1}
                className="px-4 py-2 sm:px-3 sm:py-1 rounded bg-elevated border border-slate-700/30 text-caption text-primary disabled:opacity-50 hover:bg-slate-700/40 transition-colors flex-1 sm:flex-none text-center"
              >
                Previous
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                disabled={currentPage === totalPages}
                className="px-4 py-2 sm:px-3 sm:py-1 rounded bg-elevated border border-slate-700/30 text-caption text-primary disabled:opacity-50 hover:bg-slate-700/40 transition-colors flex-1 sm:flex-none text-center"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <TaskDetailModal 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
    </>
  );
}

