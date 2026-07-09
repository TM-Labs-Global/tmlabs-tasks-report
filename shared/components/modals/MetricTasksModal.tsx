'use client';
import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Sheet } from '@/components/ui/sheet';
import { TaskDetailPanel } from '@/features/tasks/TaskDetailPanel';
import { Calendar, User, Search, Folder, ClipboardList } from 'lucide-react';

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

interface MetricTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tasks: Task[];
}

export function MetricTasksModal({ isOpen, onClose, title, tasks }: MetricTasksModalProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const term = searchTerm.toLowerCase();
    return tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.project.toLowerCase().includes(term) ||
        (t.assignee?.name && t.assignee.name.toLowerCase().includes(term)) ||
        t.status.toLowerCase().includes(term)
    );
  }, [tasks, searchTerm]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidthClass="max-w-4xl">
        <div className="space-y-6">
          {/* Header Metric Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-secondary/30 rounded-xl border border-slate-700/10">
            <div>
              <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Contributing Items</span>
              <div className="text-body font-bold text-primary">
                {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} in this segment
              </div>
            </div>

            {/* In-Modal Search bar */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search segment tasks..."
                className="w-full pl-9 pr-4 py-2 text-caption bg-elevated/40 border border-slate-700/20 rounded-xl text-primary placeholder-muted focus:outline-none focus:border-brand-pink/50 focus:ring-1 focus:ring-brand-pink/20 transition-all"
              />
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto border border-slate-700/10 rounded-xl bg-elevated/10">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-700/15 bg-elevated/20">
                  <th className="px-5 py-3.5 text-label font-bold text-muted uppercase tracking-wider">Task Title</th>
                  <th className="px-5 py-3.5 text-label font-bold text-muted uppercase tracking-wider">Project</th>
                  <th className="px-5 py-3.5 text-label font-bold text-muted uppercase tracking-wider">Assignee</th>
                  <th className="px-5 py-3.5 text-label font-bold text-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-label font-bold text-muted uppercase tracking-wider text-center">Priority</th>
                  <th className="px-5 py-3.5 text-label font-bold text-muted uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="hover:bg-slate-700/10 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="px-5 py-4">
                        <div className="text-body font-medium text-primary group-hover:text-brand-pink transition-colors line-clamp-1 max-w-[240px]">
                          {task.name}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-caption text-secondary">
                          <Folder size={12} className="text-muted" />
                          <span className="truncate max-w-[120px]">{task.project}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-700/50">
                            {task.assignee?.avatar ? (
                              <img
                                src={task.assignee.avatar}
                                alt={task.assignee.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={10} className="text-muted" />
                            )}
                          </div>
                          <span className="text-caption text-secondary truncate max-w-[100px]">
                            {task.assignee?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex justify-center">
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-caption">
                          <Calendar size={12} className="text-muted" />
                          <span
                            className={
                              task.flags.isOverdue
                                ? 'text-red-500 font-bold'
                                : 'text-secondary'
                            }
                          >
                            {task.dueDate || 'No date set'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted">
                        <ClipboardList size={36} className="stroke-[1.5] text-slate-600" />
                        <p className="text-caption italic">
                          {searchTerm ? 'No matches found in this segment' : 'No tasks in this segment'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/10">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-elevated border border-slate-700/20 text-caption font-bold text-primary hover:bg-slate-700/40 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Task Detail Side Panel */}
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
