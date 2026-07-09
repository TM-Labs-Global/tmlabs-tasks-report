'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon,
  User, 
  Tag, 
  ChevronDown, 
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useAuth } from '@/shared/context/AuthContext';

interface ListViewProps {
  listId: string;
  tasks: any[];
  statuses: any[];
  members: any[];
  onTaskClick: (taskId: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAddTask: (taskName: string) => Promise<void>;
}

export function ListView({
  listId,
  tasks,
  statuses,
  members,
  onTaskClick,
  onUpdateStatus,
  onDeleteTask,
  onAddTask
}: ListViewProps) {
  const { user } = useAuth();
  const role = user?.role || 'staff';
  
  const [search, setSearch] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredTasks = tasks.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    await onAddTask(newTaskName.trim());
    setNewTaskName('');
    setIsAdding(false);
  };

  const getPriorityColor = (priority: number | null) => {
    if (priority === 1) return 'bg-red-500/10 text-red-500 border-red-500/20'; // urgent
    if (priority === 2) return 'bg-orange-500/10 text-orange-500 border-orange-500/20'; // high
    if (priority === 3) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'; // normal
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20'; // low
  };

  const getPriorityLabel = (priority: number | null) => {
    if (priority === 1) return 'Urgent';
    if (priority === 2) return 'High';
    if (priority === 3) return 'Normal';
    if (priority === 4) return 'Low';
    return 'No Priority';
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-secondary" />
          <Input 
            placeholder="Search tasks..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-slate-700/50 text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
          />
        </div>

        {role === 'product_manager' && (
          <Button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl shadow-lg shadow-brand-pink/20 gap-2 cursor-pointer font-semibold ml-auto"
          >
            <Plus size={16} /> Quick Add Task
          </Button>
        )}
      </div>

      {/* Inline Quick Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="flex gap-2 p-3 bg-elevated/40 border border-slate-700/10 rounded-xl animate-in slide-in-from-top-2 duration-150">
          <Input 
            placeholder="What needs to be done? Press Enter to save..." 
            value={newTaskName}
            onChange={e => setNewTaskName(e.target.value)}
            className="bg-secondary border-slate-700/50 text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20 flex-1"
            autoFocus
          />
          <Button type="submit" className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl cursor-pointer">
            Add
          </Button>
          <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl border-slate-700/50 text-secondary hover:text-primary cursor-pointer">
            Cancel
          </Button>
        </form>
      )}

      {/* Tasks Table */}
      <div className="bg-card border border-slate-700/20 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-elevated/40">
            <TableRow className="border-b border-slate-700/20 hover:bg-transparent">
              <TableHead className="text-caption text-secondary font-bold h-11">Task Name</TableHead>
              <TableHead className="text-caption text-secondary font-bold h-11 w-40">Status</TableHead>
              <TableHead className="text-caption text-secondary font-bold h-11 w-32">Priority</TableHead>
              <TableHead className="text-caption text-secondary font-bold h-11 w-44">Assignees</TableHead>
              <TableHead className="text-caption text-secondary font-bold h-11 w-32">Due Date</TableHead>
              <TableHead className="text-caption text-secondary font-bold h-11 w-16 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="text-center py-12 text-caption text-muted">
                  No tasks found in this list.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map(task => {
                const isOverdue = task.flags?.isOverdue;
                const isBlocked = task.flags?.isBlocked;
                
                return (
                  <TableRow 
                    key={task.id}
                    className={`border-b border-slate-700/10 hover:bg-elevated/20 transition-all ${isBlocked ? 'border-l-2 border-l-status-blocked' : isOverdue ? 'border-l-2 border-l-brand-pink' : ''}`}
                  >
                    {/* Name */}
                    <TableCell className="py-3.5 font-medium text-primary">
                      <div className="flex flex-col gap-1">
                        <span 
                          onClick={() => onTaskClick(task.id)}
                          className="hover:text-brand-pink transition-colors cursor-pointer text-body font-semibold"
                        >
                          {task.name}
                        </span>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((t: any, idx: number) => (
                              <span 
                                key={idx} 
                                className="text-[10px] px-1.5 py-0.5 rounded-md font-medium border"
                                style={{ backgroundColor: `${t.color}15`, color: t.color, borderColor: `${t.color}30` }}
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status badge dropdown */}
                    <TableCell className="py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 rounded-lg border-slate-700/50 bg-secondary/50 text-caption text-primary hover:bg-elevated hover:text-primary gap-1.5 font-semibold cursor-pointer"
                          >
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: statuses.find(s => s.name === task.status)?.color || '#94a3b8' }}
                            />
                            {task.status}
                            <ChevronDown size={12} className="text-secondary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-card border border-slate-700/30 text-primary rounded-xl">
                          {statuses.map(s => (
                            <DropdownMenuItem 
                              key={s.id} 
                              onClick={() => onUpdateStatus(task.id, s.id)}
                              className="gap-2 cursor-pointer text-caption font-medium hover:bg-elevated"
                            >
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Priority badge */}
                    <TableCell className="py-3.5">
                      <Badge variant="outline" className={`rounded-lg py-0.5 font-semibold text-caption border ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </TableCell>

                    {/* Assignees */}
                    <TableCell className="py-3.5">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {task.assignees && task.assignees.length > 0 ? (
                          task.assignees.map((assignee: any, idx: number) => (
                            assignee.profilePicture ? (
                              <img 
                                key={idx}
                                src={assignee.profilePicture} 
                                alt={assignee.username} 
                                className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-card object-cover shrink-0" 
                                title={assignee.username}
                              />
                            ) : (
                              <div 
                                key={idx}
                                className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-card bg-elevated text-primary font-bold text-[10px] shrink-0"
                                title={assignee.username}
                              >
                                {assignee.username.charAt(0).toUpperCase()}
                              </div>
                            )
                          ))
                        ) : (
                          <span className="text-[11px] text-muted font-medium">Unassigned</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Due Date */}
                    <TableCell className="py-3.5">
                      {task.due_date ? (
                        <div className={`flex items-center gap-1.5 text-caption font-semibold ${isOverdue ? 'text-brand-pink' : 'text-secondary'}`}>
                          <CalendarIcon size={13} />
                          {format(new Date(task.due_date), 'MMM d')}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted font-medium">—</span>
                      )}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-elevated cursor-pointer">
                            <MoreHorizontal size={16} className="text-secondary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-slate-700/30 text-primary rounded-xl">
                          <DropdownMenuItem onClick={() => onTaskClick(task.id)} className="gap-2 cursor-pointer hover:bg-elevated text-caption font-medium">
                            <ExternalLink size={14} /> Open Details
                          </DropdownMenuItem>
                          {role === 'product_manager' && (
                            <DropdownMenuItem 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this task?')) {
                                  onDeleteTask(task.id);
                                }
                              }} 
                              className="gap-2 cursor-pointer hover:bg-red-500/10 text-red-500 text-caption font-medium"
                            >
                              <Trash2 size={14} /> Delete Task
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
