'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
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
  Lock,
  Loader2,
  ExternalLink,
  Upload,
  FileText
} from 'lucide-react';
import { SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/shared/context/AuthContext';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { DatePicker } from './DatePicker';
import { TaskCreateModal } from './TaskCreateModal';

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

  const getPriorityLabel = (priority: any) => {
    const val = String(priority).toLowerCase();
    if (val === '1' || val === 'urgent') return 'URGENT';
    if (val === '2' || val === 'high') return 'HIGH';
    if (val === '3' || val === 'normal') return 'NORMAL';
    if (val === '4' || val === 'low') return 'LOW';
    return 'NO PRIORITY';
  };

  const getPriorityTooltip = (priority: any) => {
    const val = String(priority).toLowerCase();
    if (val === '1' || val === 'urgent') return 'Urgent Priority';
    if (val === '2' || val === 'high') return 'High Priority';
    if (val === '3' || val === 'normal') return 'Normal Priority';
    return 'Low Priority / No Priority';
  };

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<{ code: number; message: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // Subtask modal & upload state
  const [subtaskModalOpen, setSubtaskModalOpen] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch full task details
  const fetchTaskDetails = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data);
      } else {
        const errBody = await res.json().catch(() => ({}));
        setErrorState({ code: res.status, message: errBody.message || errBody.error || 'Unknown error' });
      }
    } catch (err) {
      console.error(err);
      setErrorState({ code: 500, message: 'A network error occurred.' });
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

  if (errorState) {
    const is403 = errorState.code === 403;
    return (
      <SheetContent showCloseButton={false} className="bg-card border-l border-slate-700/20 w-full sm:max-w-2xl p-6 text-primary flex items-center justify-center">
        <div className="text-center space-y-3 max-w-xs">
          {is403 ? (
            <Lock className="mx-auto text-amber-400 w-10 h-10" />
          ) : (
            <AlertTriangle className="mx-auto text-brand-pink w-10 h-10" />
          )}
          <h3 className="font-bold text-lg">{is403 ? 'Access Restricted' : 'Task Not Found'}</h3>
          <p className="text-caption text-secondary">
            {is403
              ? 'You are not assigned to this task and cannot view its details.'
              : 'This task could not be loaded or may have been deleted.'}
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-4 py-2 bg-elevated hover:bg-elevated/80 rounded-xl text-caption font-semibold text-primary transition-colors cursor-pointer"
          >
            Close
          </button>
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
          <p className="text-caption text-secondary">This task could not be loaded or you don&apos;t have permission to view it.</p>
        </div>
      </SheetContent>
    );
  }

  const isPM = role === 'product_manager';
  const myProfile = members.find(m => m.email === user?.email);
  const isAssigned = task.assignees?.some((a: any) => a.profile?.id === myProfile?.id);
  const canEditAll = isPM;
  const canEditStatus = isPM || isAssigned;
  const canUpload = isPM || isAssigned || role === 'staff' || role === 'product_manager';

  const handleFieldUpdate = async (fields: Record<string, any>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const error = await res.json();
        console.error('Task update failed:', error);
        alert(`Error updating task: ${error.error || 'Unknown error'}`);
        return;
      }
      const updatedTask = await res.json();
      setTask((prev: any) => ({ ...prev, ...updatedTask }));
      if (onRefresh) onRefresh();
      refreshData();
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task. Please try again.');
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

  // Subtask creation using the modal
  const handleCreateSubtask = async (data: {
    name: string;
    statusId: string;
    assigneeId?: string;
    dueDate?: string;
    priority?: string;
    description?: string;
    parent_task_id?: string | null;
  }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list_id: task.list_id,
          parent_task_id: taskId,
          name: data.name,
          status_id: data.statusId,
          assignee_ids: data.assigneeId ? [data.assigneeId] : [],
          due_date: data.dueDate,
          priority: data.priority,
          description: data.description,
        }),
      });

      if (res.ok) {
        setSubtaskModalOpen(false);
        fetchTaskDetails();
        if (onRefresh) onRefresh();
        refreshData();
      }
    } catch (err) {
      console.error('Failed to create subtask:', err);
    }
  };

  // Attachment upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingAttachment(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await fetch(`/api/tasks/${taskId}/attachments`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          alert(`Failed to upload ${files[i].name}: ${err.error || 'Server error'}`);
        }
      }
      fetchTaskDetails();
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error uploading attachment.');
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId }),
      });

      if (res.ok) {
        setTask((prev: any) => ({
          ...prev,
          attachments: (prev.attachments || []).filter((a: any) => a.id !== attachmentId)
        }));
      }
    } catch (err) {
      console.error('Error deleting attachment:', err);
    }
  };

  // Assignee helpers
  const currentAssigneeIds: string[] = (task.assignees || [])
    .map((a: any) => a.profile?.id)
    .filter(Boolean);

  const handleToggleAssignee = async (profileId: string) => {
    const isCurrentlyAssigned = currentAssigneeIds.includes(profileId);
    const newIds = isCurrentlyAssigned
      ? currentAssigneeIds.filter((id) => id !== profileId)
      : [...currentAssigneeIds, profileId];
    await handleFieldUpdate({ assignee_ids: newIds });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SheetContent showCloseButton={false} className="bg-card border-l border-slate-700/20 w-full sm:max-w-2xl p-0 text-primary flex flex-col h-full shadow-2xl overflow-hidden">
      {/* Top action header */}
      <div className="p-4 border-b border-slate-700/20 flex items-center justify-between bg-elevated/20 shrink-0">
        <span className="text-caption font-bold text-muted uppercase tracking-wider">
          {task.list?.space?.name} &gt; {task.list?.name}
        </span>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8.5 w-8.5 rounded-xl hover:bg-elevated cursor-pointer">
            <X size={18} className="text-secondary" />
          </Button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-elevated/10 p-4 border border-slate-700/10 rounded-2xl">
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
                  <Button variant="outline" title={getPriorityTooltip ? getPriorityTooltip(task.priority) : 'Priority'} className="w-full justify-start h-9 rounded-xl border-slate-700/50 bg-secondary/30 text-caption font-semibold cursor-pointer">
                    {getPriorityLabel(task.priority)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border border-slate-700/30 text-primary rounded-xl w-48">
                  {['urgent', 'high', 'normal', 'low'].map(p => (
                    <DropdownMenuItem 
                      key={p} 
                      onClick={() => handleFieldUpdate({ priority: p })}
                      className="cursor-pointer text-caption font-medium hover:bg-elevated"
                      title={p === 'urgent' ? 'Urgent Priority' : p === 'high' ? 'High Priority' : p === 'normal' ? 'Normal Priority' : 'Low Priority / No Priority'}
                    >
                      {p.toUpperCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div title={getPriorityTooltip ? getPriorityTooltip(task.priority) : 'Priority'} className="flex items-center h-9 px-3 bg-secondary/30 border border-slate-700/10 rounded-xl text-caption font-semibold cursor-pointer">
                {getPriorityLabel(task.priority)}
              </div>
            )}
          </div>

          {/* Due Date with Calendar DatePicker */}
          <div className="space-y-1.5">
            <label className="text-caption font-bold text-secondary uppercase tracking-wide">Due Date</label>
            {canEditAll ? (
              <DatePicker
                value={task.due_date}
                onChange={d => handleFieldUpdate({ due_date: d || null })}
                placeholder="Set due date"
                className="w-full"
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

        {/* Assignees */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-caption font-bold text-secondary uppercase tracking-wide">Assignees</label>
            {canEditAll && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-brand-pink hover:text-brand-pink/80 rounded-lg cursor-pointer h-7 text-[11px] font-bold"
                  >
                    <Plus size={12} /> Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border border-slate-700/30 text-primary rounded-xl w-52 max-h-60 overflow-y-auto">
                  {members.length === 0 ? (
                    <DropdownMenuItem disabled className="text-caption text-muted">
                      No members found
                    </DropdownMenuItem>
                  ) : (
                    members.map((member: any) => {
                      const isAssigned = currentAssigneeIds.includes(member.id);
                      return (
                        <DropdownMenuItem
                          key={member.id}
                          onClick={() => handleToggleAssignee(member.id)}
                          className="gap-2 cursor-pointer text-caption font-medium hover:bg-elevated"
                        >
                          <div className="w-6 h-6 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center font-bold text-[10px] flex-shrink-0 uppercase">
                            {(member.full_name || member.email || '?').charAt(0)}
                          </div>
                          <span className="flex-1 truncate">{member.full_name || member.email}</span>
                          {isAssigned && <CheckCircle size={14} className="text-brand-pink flex-shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {task.assignees && task.assignees.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {task.assignees.map((a: any) => {
                const name = a.profile?.full_name || a.profile?.email || 'Unknown';
                const initial = name.charAt(0).toUpperCase();
                return (
                  <div
                    key={a.profile?.id}
                    className="flex items-center gap-1.5 px-2 py-1 bg-secondary/30 border border-slate-700/20 rounded-full text-[11px] font-semibold text-primary"
                  >
                    <div className="w-5 h-5 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center font-bold text-[9px] uppercase flex-shrink-0">
                      {initial}
                    </div>
                    <span className="truncate max-w-[120px]">{name}</span>
                    {canEditAll && (
                      <button
                        onClick={() => handleToggleAssignee(a.profile?.id)}
                        className="text-muted hover:text-red-400 transition-colors ml-0.5 flex-shrink-0 cursor-pointer"
                        title={`Remove ${name}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-caption text-muted text-center py-2 border border-dashed border-slate-700/10 rounded-xl">
              No assignees yet.
            </div>
          )}
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

        {/* Media & Attachments Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip size={14} className="text-secondary" />
              <label className="text-caption font-bold text-secondary uppercase tracking-wide">
                Attachments & Feedback Media ({task.attachments?.length || 0})
              </label>
            </div>
            {canUpload && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={uploadingAttachment}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-brand-pink/15 text-brand-pink hover:bg-brand-pink/25 border-brand-pink/30 rounded-lg cursor-pointer h-8 text-xs font-bold gap-1.5"
                >
                  {uploadingAttachment ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={13} /> Upload Media
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Attachment list & media viewer */}
          {task.attachments && task.attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {task.attachments.map((att: any) => {
                const isVid = att.category === 'video' || att.type?.startsWith('video/');
                const isImg = att.category === 'image' || att.type?.startsWith('image/');

                return (
                  <div key={att.id} className="relative group bg-secondary/30 border border-slate-700/30 rounded-xl overflow-hidden flex flex-col justify-between">
                    {/* Media Preview */}
                    <div className="bg-black/40 flex items-center justify-center relative min-h-[120px] max-h-[160px] overflow-hidden">
                      {isImg && (
                        <img 
                          src={att.url} 
                          alt={att.name} 
                          className="w-full h-full object-cover max-h-[160px]" 
                        />
                      )}
                      {isVid && (
                        <video 
                          src={att.url} 
                          controls 
                          className="w-full max-h-[160px] bg-black"
                          preload="metadata"
                        />
                      )}
                      {!isImg && !isVid && (
                        <FileText size={36} className="text-secondary" />
                      )}
                    </div>

                    {/* Meta & Actions */}
                    <div className="p-2.5 flex items-center justify-between gap-2 bg-secondary/20">
                      <div className="flex-1 min-w-0">
                        <p className="text-caption font-bold text-primary truncate" title={att.name}>
                          {att.name}
                        </p>
                        <p className="text-[10px] text-muted">
                          {formatFileSize(att.size)} {att.created_at && `• ${formatDistanceToNow(new Date(att.created_at), { addSuffix: true })}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <a 
                          href={att.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          download={att.name}
                          className="p-1 rounded hover:bg-elevated text-secondary hover:text-primary transition-colors"
                          title="Open / Download"
                        >
                          <ExternalLink size={13} />
                        </a>
                        {canEditAll && (
                          <button
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="p-1 rounded hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div 
              onClick={() => canUpload && fileInputRef.current?.click()}
              className={`text-caption text-slate-300 text-center py-5 border border-dashed border-slate-700/60 bg-slate-900/30 rounded-xl transition-all ${canUpload ? 'hover:border-brand-pink/60 hover:bg-brand-pink/5 cursor-pointer' : ''}`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Upload size={20} className="text-brand-pink" />
                <span className="font-semibold text-slate-200 text-xs">No media attached yet.</span>
                {canUpload && <span className="text-[11px] text-brand-pink font-semibold">Click to upload photos, screenshots, or video feedback</span>}
              </div>
            </div>
          )}
        </div>

        {/* Subtasks Section with Full Create Modal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-caption font-bold text-secondary uppercase tracking-wide">
              Subtasks ({task.subtasks?.length || 0})
            </label>
            {canEditAll && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSubtaskModalOpen(true)}
                className="text-brand-pink hover:text-brand-pink/80 rounded-lg cursor-pointer h-7 text-[11px] font-bold gap-1"
              >
                <Plus size={12} /> Add Subtask
              </Button>
            )}
          </div>

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

        {/* Dependencies Section */}
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

      {/* Footer Comments Thread */}
      <div className="p-4 border-t border-slate-700/20 bg-elevated/40 flex flex-col max-h-72 shrink-0">
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

      {/* Subtask Full Creation Modal */}
      {subtaskModalOpen && (
        <TaskCreateModal
          open={subtaskModalOpen}
          onOpenChange={setSubtaskModalOpen}
          statuses={task.list?.statuses || []}
          members={members}
          defaultStatusId={task.status_id}
          parentTaskId={taskId}
          parentTaskName={task.name}
          onCreateTask={handleCreateSubtask}
        />
      )}
    </SheetContent>
  );
}
