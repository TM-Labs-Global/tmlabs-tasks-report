'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { useAuth } from '@/shared/context/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Inbox,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet } from '@/components/ui/sheet';

import { TaskDetailPanel } from '@/features/tasks/TaskDetailPanel';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday 
} from 'date-fns';

export default function CalendarPage() {
  const { tasks, refreshData, members } = useWorkspace();
  const { user } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const myProfile = members.find(m => m.email === user?.email);
  const myUserId = myProfile?.id;
  const role = user?.role || 'staff';

  // Filter tasks based on role: Staff gets only assigned tasks, PM gets everything
  const calendarTasks = tasks.filter((task: any) => 
    role === 'product_manager' || task.assignees?.some((a: any) => a.id === myUserId)
  );

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Build dates array for monthly grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getPriorityColorClass = (priority: number | null) => {
    if (priority === 1) return 'bg-red-500/10 text-red-500 border border-red-500/20';
    if (priority === 2) return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
    if (priority === 3) return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    return 'bg-slate-500/10 text-slate-500 border border-slate-700/20';
  };

  // Get tasks that have a due date but fall on a specific day
  const getTasksForDay = (day: Date) => {
    return calendarTasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day));
  };

  // Unscheduled tasks (tasks with no due date)
  const unscheduledTasks = calendarTasks.filter(t => !t.due_date && t.status_type !== 'closed');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-left">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Calendar Card */}
        <Card className="flex-1 bg-card border border-slate-700/20 rounded-2xl shadow-md overflow-hidden">
          <CardHeader className="p-5 flex flex-row items-center justify-between border-b border-slate-700/10 bg-elevated/10">
            <div className="space-y-1">
              <span className="text-caption font-bold text-brand-pink uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} className="animate-pulse" /> Team Calendar
              </span>
              <CardTitle className="text-body font-bold text-primary">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8.5 w-8.5 rounded-xl hover:bg-elevated cursor-pointer">
                <ChevronLeft size={18} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8.5 rounded-xl hover:bg-elevated text-caption font-semibold cursor-pointer">
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8.5 w-8.5 rounded-xl hover:bg-elevated cursor-pointer">
                <ChevronRight size={18} />
              </Button>
            </div>
          </CardHeader>

          {/* Calendar Grid */}
          <div className="p-4 bg-card">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center pb-2 border-b border-slate-700/10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-caption font-bold text-secondary py-1 uppercase tracking-wider text-[10px]">{d}</div>
              ))}
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 grid-rows-6 border-l border-t border-slate-700/10 min-h-[500px]">
              {days.map((day, idx) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <div 
                    key={idx}
                    className={`p-1.5 border-r border-b border-slate-700/10 flex flex-col space-y-1 min-h-[85px] transition-all hover:bg-elevated/10 ${
                      !isCurrentMonth ? 'opacity-40 bg-secondary/5' : ''
                    } ${isTodayDate ? 'bg-brand-pink/[0.02]' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center ${
                        isTodayDate ? 'bg-brand-pink text-white shadow-sm' : 'text-primary'
                      }`}>
                        {format(day, 'd')}
                      </span>
                    </div>

                    {/* Day Task List */}
                    <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
                      {dayTasks.slice(0, 3).map(task => (
                        <div 
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`p-1 text-[10px] font-semibold rounded-md truncate cursor-pointer hover:opacity-95 ${getPriorityColorClass(task.priority)}`}
                          title={task.name}
                        >
                          {task.name}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[9px] font-bold text-muted text-center">
                          + {dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Unscheduled Sidebar Panel */}
        <Card className="w-full lg:w-80 bg-card border border-slate-700/20 rounded-2xl shadow-md overflow-hidden flex flex-col max-h-[600px]">
          <CardHeader className="p-4 border-b border-slate-700/10 bg-elevated/10 flex flex-row items-center gap-2">
            <Inbox size={16} className="text-secondary" />
            <CardTitle className="text-body font-bold text-primary">Unscheduled Tasks</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
            {unscheduledTasks.length === 0 ? (
              <div className="text-center py-12 text-caption text-muted">
                All active tasks have scheduled due dates!
              </div>
            ) : (
              unscheduledTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-3 bg-secondary/20 border border-slate-700/10 rounded-xl hover:border-slate-700/30 cursor-pointer transition-all space-y-2`}
                >
                  <h4 className="text-caption font-semibold text-primary leading-tight line-clamp-2">{task.name}</h4>
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>{task.project}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-secondary border-slate-700/40 text-secondary">
                      Unscheduled
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
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
