'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { useAuth } from '@/shared/context/AuthContext';
import { ListView } from '@/features/tasks/ListView';
import { Sheet } from '@/components/ui/sheet';
import { TaskDetailPanel } from '@/features/tasks/TaskDetailPanel';
import { 
  AlertTriangle, 
  Clock, 
  Calendar as CalendarIcon, 
  Inbox,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { format, isToday, isThisWeek, parseISO, isPast } from 'date-fns';

export default function MyTasksPage() {
  const { tasks, refreshData, members } = useWorkspace();
  const { user } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const myProfile = members.find(m => m.email === user?.email);
  const myUserId = myProfile?.id;

  // Filter tasks to only those assigned to me
  const myTasks = tasks.filter((task: any) => 
    task.assignees?.some((a: any) => a.id === myUserId)
  );

  const getTaskGroup = (task: any) => {
    if (!task.due_date) return 'upcoming';
    const dueDate = new Date(task.due_date);
    const isClosed = task.status_type === 'closed';

    if (isClosed) return 'completed';

    if (isPast(dueDate) && !isToday(dueDate)) {
      return 'overdue';
    }
    if (isToday(dueDate)) {
      return 'today';
    }
    if (isThisWeek(dueDate)) {
      return 'thisWeek';
    }
    return 'upcoming';
  };

  const overdueTasks = myTasks.filter(t => getTaskGroup(t) === 'overdue');
  const todayTasks = myTasks.filter(t => getTaskGroup(t) === 'today');
  const thisWeekTasks = myTasks.filter(t => getTaskGroup(t) === 'thisWeek');
  const upcomingTasks = myTasks.filter(t => getTaskGroup(t) === 'upcoming');

  const handleUpdateStatus = async (taskId: string, statusId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: statusId }),
      });
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTaskSection = (title: string, icon: React.ReactNode, taskList: any[], headerClass: string) => {
    return (
      <div className="space-y-3">
        <div className={`flex items-center gap-2 p-3 bg-secondary/35 border-b border-slate-700/15 rounded-xl ${headerClass}`}>
          {icon}
          <h3 className="font-bold text-caption text-primary tracking-tight">{title}</h3>
          <span className="text-[10px] font-bold text-muted bg-elevated px-2 py-0.5 rounded-full ml-auto">
            {taskList.length}
          </span>
        </div>

        {taskList.length === 0 ? (
          <div className="text-center py-6 text-caption text-muted bg-elevated/10 border border-dashed border-slate-700/5 rounded-xl">
            No tasks in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {taskList.map(task => {
              const overdue = task.flags?.isOverdue;
              return (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-card border border-slate-700/20 rounded-xl hover:border-slate-700/40 cursor-pointer hover:scale-[1.005] hover:shadow-md transition-all ${overdue ? 'border-l-2 border-l-brand-pink' : ''}`}
                >
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">
                      {task.project || 'Project'}
                    </span>
                    <h4 className="font-semibold text-body text-primary">{task.name}</h4>
                  </div>
                  <div className="flex items-center gap-3 ml-auto sm:ml-0">
                    {task.due_date && (
                      <span className={`text-[11px] font-bold ${overdue ? 'text-brand-pink' : 'text-secondary'}`}>
                        Due {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                    <span 
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                      style={{ 
                        backgroundColor: `${task.status_color || '#8A9CC8'}15`, 
                        color: task.status_color || '#8A9CC8', 
                        borderColor: `${task.status_color || '#8A9CC8'}30` 
                      }}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-1 text-left">
        <h1 className="text-h1 font-bold text-primary tracking-tight">My Tasks</h1>
        <p className="text-body text-secondary">Your personal dashboard of all assigned items across spaces.</p>
      </div>

      <div className="space-y-8 pt-4">
        {renderTaskSection('Overdue Tasks', <AlertTriangle className="text-brand-pink w-4.5 h-4.5" />, overdueTasks, 'border-l-2 border-l-brand-pink')}
        {renderTaskSection('Due Today', <Clock className="text-amber-500 w-4.5 h-4.5" />, todayTasks, 'border-l-2 border-l-amber-500')}
        {renderTaskSection('Due This Week', <CalendarIcon className="text-brand-purple w-4.5 h-4.5" />, thisWeekTasks, 'border-l-2 border-l-brand-purple')}
        {renderTaskSection('Upcoming', <Inbox className="text-secondary w-4.5 h-4.5" />, upcomingTasks, 'border-l-2 border-l-slate-700/50')}
      </div>

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
