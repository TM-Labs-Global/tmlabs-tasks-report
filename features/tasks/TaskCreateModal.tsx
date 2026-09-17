'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, User, Flag, Layers, Plus, X, Loader2, ArrowRight } from 'lucide-react';
import { DatePicker } from './DatePicker';

interface TaskCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statuses: any[];
  members: any[];
  defaultStatusId?: string;
  parentTaskId?: string | null;
  parentTaskName?: string | null;
  onCreateTask: (data: {
    name: string;
    statusId: string;
    assigneeId?: string;
    dueDate?: string;
    priority?: string;
    description?: string;
    parent_task_id?: string | null;
    attachments?: any[];
  }) => Promise<void>;
}

export function TaskCreateModal({
  open,
  onOpenChange,
  statuses,
  members,
  defaultStatusId,
  parentTaskId,
  parentTaskName,
  onCreateTask,
}: TaskCreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState(defaultStatusId || statuses[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState('3'); // 3 = Normal
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string; isVideo: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStatusId(defaultStatusId || statuses[0]?.id || '');
    }
  }, [open, defaultStatusId, statuses]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isVideo: file.type.startsWith('video/')
      }));
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreateTask({
        name: name.trim(),
        description: description.trim() || undefined,
        statusId: statusId || defaultStatusId || statuses[0]?.id || '',
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        priority,
        parent_task_id: parentTaskId || undefined,
      });

      // Reset form
      setName('');
      setDescription('');
      setAssigneeId('');
      setDueDate(null);
      setPriority('3');
      setSelectedFiles([]);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-bg-card text-primary border border-border-default rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border-default">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            {parentTaskId ? (
              <ArrowRight className="w-5 h-5 text-brand-purple" />
            ) : (
              <Plus className="w-5 h-5 text-brand-pink" />
            )}
            {parentTaskId ? 'Create Subtask' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        {/* Parent Task Context Banner */}
        {parentTaskId && parentTaskName && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-brand-purple/10 border border-brand-purple/20 text-xs text-brand-purple">
            <span className="font-semibold">Subtask of:</span>
            <span className="text-primary font-medium truncate">{parentTaskName}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Task Name (Required) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">
              {parentTaskId ? 'Subtask Title' : 'Task Title'} <span className="text-brand-pink">*</span>
            </label>
            <input
              type="text"
              autoFocus
              required
              placeholder={parentTaskId ? 'e.g. Design responsive layout' : 'e.g. Implement card authentication API endpoint'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm bg-bg-elevated border border-border-default text-primary placeholder:text-secondary/60 focus:outline-none focus:border-brand-pink transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">
              Description & Context
            </label>
            <textarea
              rows={2}
              placeholder="Add extra context, feedback details, or specifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg text-xs bg-bg-elevated border border-border-default text-primary placeholder:text-secondary/60 focus:outline-none focus:border-brand-pink transition-colors resize-none"
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
                <option value="1">🚨 Urgent (Red)</option>
                <option value="2">🟧 High (Orange)</option>
                <option value="3">🟦 Normal (Blue)</option>
                <option value="4">⬜ Low (Grey)</option>
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

            {/* Interactive Popup Date Picker */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-pink" /> Due Date
              </label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="Pick a due date"
                className="w-full"
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
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {parentTaskId ? 'Create Subtask' : 'Create Task'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
