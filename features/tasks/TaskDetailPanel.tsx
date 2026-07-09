'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  User, 
  Tag, 
  Clock, 
  Paperclip, 
  MessageSquare,
  ChevronDown,
  Trash2,
  Maximize2,
  CheckCircle,
  Plus,
  Send,
  PlusCircle,
  AlertTriangle,
  History,
  Lock
} from 'lucide-react';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/shared/context/AuthContext';
import { useWorkspace } from '@/shared/context/WorkspaceContext';

interface TaskDetailPanelProps {
  taskId: string;
  onClose: () => void;
  onRefresh?: () => void;
}

export function TaskDetailPanel({
  taskId,
  onClose,
  onRefresh
}: TaskDetailPanelProps) {
  const { user } = useAuth();
  const { members, refreshData } = useWorkspace();
  const role = user?.role || 'staff';

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  // Fetch full task details
  const fetchTaskDetails = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  if (loading) {
    return (
      <SheetContent showCloseButton={false} className="bg-card border-l border-slate-700/20 w-full sm:max-w-2xl p-6 text-primary flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-6 bg-elevated rounded w-3/4"></div>
          <div className="h-4 bg-elevated rounded w-1/2"></div>
          <div className="h-20 bg-elevated rounded w-full"></div>
          <div className="h-40 bg-elevated rounded w-full"></div>
        </div>
      </SheetContent>
    );
  }

  if (!task) {
    return (
      <SheetContent showCloseButton={false} className="bg-card border-l border-slate-700/20 w-full sm:max-w-2xl p-6 text-primary flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertTriangle className="mx-auto text-brand-pink w-10 h-10" />
          <h3 className="font-bold text-lg">Task Not Found</h3>
          <p className="text-caption text-secondary">This task could not be loaded or you don't have permission to view it.</p>
        </div>
      </SheetContent>
    );
  }

  const isPM = role === 'product_manager';
  const myProfile = members.find(m => m.email === user?.email);
  const isAssigned = task.assignees?.some((a: any) => a.profile?.id === myProfile?.id);
  const canEditAll = isPM;
  const canEditStatus = isPM || isAssigned;

  const handleFieldUpdate = async (fields: Record<string, any>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        fetchTaskDetails();
        if (onRefresh) onRefresh();
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          content: commentText.trim()
        }),
      });

      if (res.ok) {
        setCommentText('');
        fetchTaskDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskName.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list_id: task.list_id,
          parent_task_id: taskId,
          name: newSubtaskName.trim(),
          status_id: task.status_id
        }),
      });

      if (res.ok) {
        setNewSubtaskName('');
        setAddingSubtask(false);
        fetchTaskDetails();
        if (onRefresh) onRefresh();
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityLabel = (priority: string | null) => {
    if (priority === 'urgent') return 'Urgent';
    if (priority === 'high') return 'High';
    if (priority === 'normal') return 'Normal';
    if (priority === 'low') return 'Low';
    return 'No Priority';
  };

  return (
    <SheetContent showCloseButton={false} className="bg-card border-l border-slate-700/20 w-full sm:max-w-2xl p-0 text-primary flex flex-col h-full shadow-2xl">
      {/* Top action header */}
      <div className="p-4 border-b border-slate-700/20 flex items-center justify-between bg-elevated/20">
        <span className="text-caption font-bold text-muted uppercase tracking-wider">
          {task.list?.space?.name} &gt; {task.list?.name}
        </span>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8.5 w-8.5 rounded-xl hover:bg-elevated cursor-pointer">
            <X size={18} className="text-secondary" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Title Area */}
          <div className="space-y-2">
            {canEditAll ? (
              <Input 
                value={task.name}
                onChange={e => handleFieldUpdate({ name: e.target.value })}
                className="text-lg font-bold text-primary bg-transparent border-transparent hover:border-slate-700/40 focus:border-brand-pink focus:bg-secondary/40 p-1.5 rounded-xl h-auto w-full transition-all"
              />
            ) : (
              <h2 className="text-lg font-bold text-primary px-1.5">{task.name}</h2>
            )}
          </div>

          {/* Core Properties Grid */}
          <div className="grid grid-cols-2 gap-4 bg-elevated/10 p-4 border border-slate-700/10 rounded-2xl">
            {/* Status Field */}
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-secondary uppercase tracking-wide">Status</label>
              {canEditStatus ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-9 rounded-xl border-slate-700/50 bg-secondary/30 text-caption font-semibold cursor-pointer">
                      <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: task.status?.color || '#94a3b8' }} />
                      {task.status?.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card border border-slate-700/30 text-primary rounded-xl w-48">
                    {task.list?.statuses?.map((s: any) => (
                      <DropdownMenuItem 
                        key={s.id} 
                        onClick={() => handleFieldUpdate({ status_id: s.id })}
                        className="gap-2 cursor-pointer text-caption font-medium hover:bg-elevated"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center h-9 px-3 bg-secondary/30 border border-slate-700/10 rounded-xl text-caption font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: task.status?.color || '#94a3b8' }} />
                  {task.status?.name}
                </div>
              )}
            </div>

            {/* Priority Field */}
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-secondary uppercase tracking-wide">Priority</label>
              {canEditAll ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-9 rounded-xl border-slate-700/50 bg-secondary/30 text-caption font-semibold cursor-pointer">
                      {getPriorityLabel(task.priority)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card border border-slate-700/30 text-primary rounded-xl w-48">
                    {['urgent', 'high', 'normal', 'low'].map(p => (
                      <DropdownMenuItem 
                        key={p} 
                        onClick={() => handleFieldUpdate({ priority: p })}
                        className="cursor-pointer text-caption font-medium hover:bg-elevated"
                      >
                        {p.toUpperCase()}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center h-9 px-3 bg-secondary/30 border border-slate-700/10 rounded-xl text-caption font-semibold">
                  {getPriorityLabel(task.priority)}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-secondary uppercase tracking-wide">Due Date</label>
              {canEditAll ? (
                <Input 
                  type="date"
                  value={task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : ''}
                  onChange={e => handleFieldUpdate({ due_date: e.target.value || null })}
                  className="bg-secondary/30 border-slate-700/50 text-primary rounded-xl focus:border-brand-pink"
                />
              ) : (
                <div className="flex items-center h-9 px-3 bg-secondary/30 border border-slate-700/10 rounded-xl text-caption font-semibold">
                  {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No Due Date'}
                </div>
              )}
            </div>

            {/* Time Estimate */}
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-secondary uppercase tracking-wide">Estimate (Hours)</label>
              {canEditAll ? (
                <Input 
                  type="number"
                  placeholder="e.g. 8"
                  value={task.time_estimate ? task.time_estimate / (3600 * 1000) : ''}
                  onChange={e => handleFieldUpdate({ time_estimate: e.target.value ? parseFloat(e.target.value) * 3600 * 1000 : null })}
                  className="bg-secondary/30 border-slate-700/50 text-primary rounded-xl focus:border-brand-pink"
                />
              ) : (
                <div className="flex items-center h-9 px-3 bg-secondary/30 border border-slate-700/10 rounded-xl text-caption font-semibold">
                  {task.time_estimate ? `${task.time_estimate / (3600 * 1000)}h` : 'No Estimate'}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-caption font-bold text-secondary uppercase tracking-wide">Description</label>
            {canEditAll ? (
              <Textarea 
                value={task.description || ''}
                onChange={e => handleFieldUpdate({ description: e.target.value })}
                placeholder="Add details about this task..."
                className="bg-secondary/20 border-slate-700/50 text-primary rounded-xl min-h-[100px] focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
              />
            ) : (
              <p className="bg-secondary/10 border border-slate-700/10 p-3 rounded-xl text-body text-secondary min-h-[60px] whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Subtasks Collapsible Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-caption font-bold text-secondary uppercase tracking-wide">Subtasks</label>
              {canEditAll && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAddingSubtask(!addingSubtask)}
                  className="text-brand-pink hover:text-brand-pink/80 rounded-lg cursor-pointer h-7 text-[11px] font-bold"
                >
                  <Plus size={12} /> Add Subtask
                </Button>
              )}
            </div>

            {addingSubtask && (
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <Input 
                  placeholder="Subtask name..." 
                  value={newSubtaskName}
                  onChange={e => setNewSubtaskName(e.target.value)}
                  className="bg-secondary border-slate-700/50 text-primary rounded-xl flex-1 focus:border-brand-pink"
                />
                <Button type="submit" size="sm" className="bg-brand-pink text-white rounded-xl">Save</Button>
              </form>
            )}

            <div className="space-y-2">
              {task.subtasks && task.subtasks.length > 0 ? (
                task.subtasks.map((sub: any) => (
                  <div key={sub.id} className="flex items-center justify-between p-2.5 bg-secondary/20 border border-slate-700/10 rounded-xl hover:bg-secondary/40 transition-all">
                    <span className="text-caption font-semibold text-primary">{sub.name}</span>
                    <Badge variant="outline" className="text-[10px] font-bold" style={{ borderColor: `${sub.status?.color}40`, color: sub.status?.color }}>
                      {sub.status?.name}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-caption text-muted text-center py-2 border border-dashed border-slate-700/10 rounded-xl">
                  No subtasks.
                </div>
              )}
            </div>
          </div>

          {/* Dependencies Collapsible Section */}
          <div className="space-y-3">
            <label className="text-caption font-bold text-secondary uppercase tracking-wide">Dependencies</label>
            <div className="space-y-2">
              {task.blocking && task.blocking.length > 0 ? (
                task.blocking.map((dep: any) => (
                  <div key={dep.id} className="flex items-center gap-2 p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                    <span className="text-caption text-primary font-semibold flex-1 truncate">
                      Blocks: {dep.depends_on?.name}
                    </span>
                    <Badge className="bg-red-500/20 text-red-500 border border-red-500/30 text-[9px] font-bold">
                      {dep.depends_on?.status?.name}
                    </Badge>
                  </div>
                ))
              ) : null}

              {task.dependencies && task.dependencies.length > 0 ? (
                task.dependencies.map((dep: any) => (
                  <div key={dep.id} className="flex items-center gap-2 p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <Lock size={14} className="text-amber-500 flex-shrink-0" />
                    <span className="text-caption text-primary font-semibold flex-1 truncate">
                      Waiting on: {dep.task?.name}
                    </span>
                    <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[9px] font-bold">
                      {dep.task?.status?.name}
                    </Badge>
                  </div>
                ))
              ) : null}

              {(!task.blocking || task.blocking.length === 0) && (!task.dependencies || task.dependencies.length === 0) && (
                <div className="text-caption text-muted text-center py-2 border border-dashed border-slate-700/10 rounded-xl">
                  No task dependencies.
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Comments Thread */}
      <div className="p-4 border-t border-slate-700/20 bg-elevated/40 flex flex-col max-h-72">
        <span className="text-caption font-bold text-secondary uppercase tracking-wide mb-2">Comments</span>
        
        {/* Comment Thread List */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
          {task.comments && task.comments.length > 0 ? (
            task.comments.map((comment: any) => (
              <div key={comment.id} className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-caption font-bold text-primary">{comment.author?.full_name}</span>
                  <span className="text-[10px] text-muted">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-caption text-secondary pl-2 border-l border-slate-700/30 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-caption text-muted">No comments yet.</div>
          )}
        </div>

        {/* Comment Entry */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <Input 
            placeholder="Add a comment..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="bg-secondary border-slate-700/50 text-primary rounded-xl flex-1 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20 text-caption h-9"
          />
          <Button type="submit" size="icon" className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl h-9 w-9 cursor-pointer flex-shrink-0">
            <Send size={14} />
          </Button>
        </form>
      </div>
    </SheetContent>
  );
}
