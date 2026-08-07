'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, User, Flag, Layers, X, Plus } from 'lucide-react';

interface TaskCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statuses: any[];
  members: any[];
  defaultStatusId?: string;
  onCreateTask: (data: {
    name: string;
    statusId: string;
    assigneeId?: string;
    dueDate?: string;
    priority?: string;
  }) => Promise<void>;
}

export function TaskCreateModal({
  open,
  onOpenChange,
  statuses,
  members,
  defaultStatusId,
  onCreateTask,
}: TaskCreateModalProps) {
  const [name, setName] = useState('');
  const [statusId, setStatusId] = useState(defaultStatusId || statuses[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('3'); // 3 = Normal
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreateTask({
        name: name.trim(),
        statusId: statusId || defaultStatusId || statuses[0]?.id || '',
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        priority,
      });
      // Reset form
      setName('');
      setAssigneeId('');
      setDueDate('');
      setPriority('3');
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-bg-card text-primary border border-border-default rounded-xl shadow-2xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border-default">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-pink" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Task Name (Required) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">
              Task Title <span className="text-brand-pink">*</span>
            </label>
            <input
              type="text"
              autoFocus
              required
              placeholder="e.g. Implement card authentication API endpoint"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm bg-bg-elevated border border-border-default text-primary placeholder:text-secondary/60 focus:outline-none focus:border-brand-pink transition-colors"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-brand-pink" /> Status
              </label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-xs bg-bg-elevated border border-border-default text-primary focus:outline-none focus:border-brand-pink transition-colors cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-amber-500" /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-xs bg-bg-elevated border border-border-default text-primary focus:outline-none focus:border-brand-pink transition-colors cursor-pointer"
              >
                <option value="1">🚨 Urgent</option>
                <option value="2">🟧 High</option>
                <option value="3">🟦 Normal</option>
                <option value="4">⬜ Low</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Assignee Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-purple" /> Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-xs bg-bg-elevated border border-border-default text-primary focus:outline-none focus:border-brand-pink transition-colors cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || m.username || m.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-pink" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-xs bg-bg-elevated border border-border-default text-primary focus:outline-none focus:border-brand-pink transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-secondary hover:bg-bg-elevated transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-brand-pink text-white hover:bg-brand-pink/90 disabled:opacity-50 transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
