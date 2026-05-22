import React from 'react';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Ban, AlertTriangle, User, Calendar, ExternalLink } from 'lucide-react';

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

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Overview">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-h2 font-bold text-primary flex-1 mr-4">{task.name}</h2>
            <div className="flex gap-2">
              {task.flags.isBlocked && (
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500" title="Blocked">
                  <Ban size={20} />
                </div>
              )}
              {task.flags.isOverdue && (
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500" title="Overdue">
                  <AlertTriangle size={20} />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <div className="px-3 py-1 rounded-full bg-elevated border border-slate-700/30 text-caption font-medium text-secondary">
              {task.project}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-700/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-label text-muted uppercase tracking-wider">
              <User size={14} />
              Assignee
            </div>
            <div className="text-body font-medium text-primary">
              {task.assignee?.name || 'Unassigned'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-label text-muted uppercase tracking-wider">
              <Calendar size={14} />
              Due Date
            </div>
            <div className={`text-body font-medium ${task.flags.isOverdue ? 'text-red-500 font-bold' : 'text-primary'}`}>
              {task.dueDate || 'No date set'}
            </div>
          </div>
        </div>

        {task.text_content ? (
          <div className="space-y-2">
            <div className="text-label text-muted uppercase tracking-wider">Description</div>
            <div className="text-body text-secondary leading-relaxed bg-secondary/30 p-5 rounded-xl border border-slate-700/10 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {task.text_content}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-secondary/20 rounded-xl border border-dashed border-slate-700/20">
            <p className="text-caption text-muted italic">No description provided for this task.</p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          {task.url && (
            <a 
              href={task.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-pink text-white text-body font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-brand-pink/20"
            >
              <ExternalLink size={18} />
              View in ClickUp
            </a>
          )}
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-elevated border border-slate-700/30 text-body font-medium text-primary hover:bg-slate-700/40 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
