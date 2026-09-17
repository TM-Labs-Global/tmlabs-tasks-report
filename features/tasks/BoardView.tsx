'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Eye,
  EyeOff,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/shared/context/AuthContext';

interface BoardViewProps {
  tasks: any[];
  statuses: any[];
  onTaskClick: (taskId: string) => void;
  onUpdateStatus: (taskId: string, statusId: string) => Promise<void>;
  onAddTaskInStatus?: (statusId: string) => void;
}

export function BoardView({
  tasks,
  statuses,
  onTaskClick,
  onUpdateStatus,
  onAddTaskInStatus
}: BoardViewProps) {
  const { user } = useAuth();
  const role = user?.role || 'staff';
  const [showClosed, setShowClosed] = useState(false);
  const [hideEmptyColumns, setHideEmptyColumns] = useState(true);

  const isClosedTask = (t: any) => {
    const sName = (t.status || '').toLowerCase();
    return t.status_type === 'closed' || sName === 'complete' || sName === 'closed' || sName === 'done';
  };

  const visibleTasks = showClosed ? tasks : tasks.filter(t => !isClosedTask(t));

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const newStatusId = destination.droppableId;
    await onUpdateStatus(draggableId, newStatusId);
  };

  const getPriorityBorder = (priority: number | null) => {
    if (priority === 1) return 'border-l-4 border-l-red-500';
    if (priority === 2) return 'border-l-4 border-l-orange-500';
    if (priority === 3) return 'border-l-4 border-l-blue-500';
    return 'border-l-4 border-l-slate-700/50';
  };

  const getPriorityLabel = (priority: number | null) => {
    if (priority === 1) return 'Urgent';
    if (priority === 2) return 'High';
    if (priority === 3) return 'Normal';
    if (priority === 4) return 'Low';
    return 'No Priority';
  };

  const getPriorityTooltip = (priority: number | null) => {
    if (priority === 1) return 'Urgent Priority';
    if (priority === 2) return 'High Priority';
    if (priority === 3) return 'Normal Priority';
    return 'Low Priority / No Priority';
  };

  const getPriorityBadgeClass = (priority: number | null) => {
    if (priority === 1) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (priority === 2) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    if (priority === 3) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-700/20';
  };

  const activeStatuses = hideEmptyColumns
    ? statuses.filter(s => visibleTasks.some(t => t.status_id === s.id || t.status === s.name))
    : statuses;

  return (
    <div className="space-y-3">
      {/* Board toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setHideEmptyColumns(!hideEmptyColumns)}
          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            hideEmptyColumns
              ? 'bg-white/10 text-primary border-white/10'
              : 'bg-transparent text-secondary border-white/8 hover:bg-white/5 hover:text-primary'
          }`}
          title={hideEmptyColumns ? 'Show all columns including empty ones' : 'Hide columns with no tasks'}
        >
          {hideEmptyColumns ? <EyeOff size={12} /> : <Eye size={12} />}
          {hideEmptyColumns ? 'Hide Empty Columns' : 'Show Empty Columns'}
        </button>

        <button
          onClick={() => setShowClosed(!showClosed)}
          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            showClosed
              ? 'bg-brand-pink/20 text-brand-pink border-brand-pink/40'
              : 'bg-transparent text-secondary border-white/8 hover:bg-white/5 hover:text-primary'
          }`}
          title={showClosed ? 'Hide completed tasks' : 'Show completed/archived tasks'}
        >
          <CheckCircle2 size={12} />
          {showClosed ? '✓ Show Archive' : 'Show Archive'}
        </button>
      </div>

    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 select-none min-h-[60vh] items-start">
        {activeStatuses.map(status => {
          const statusTasks = visibleTasks.filter(t => t.status_id === status.id || t.status === status.name);
          
          return (
            <div 
              key={status.id}
              className="flex-shrink-0 w-80 bg-elevated/20 border border-slate-700/10 rounded-2xl p-4 space-y-4 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
                  <h3 className="font-bold text-caption text-primary tracking-tight">{status.name}</h3>
                  <span className="text-[10px] font-bold text-muted bg-elevated px-2 py-0.5 rounded-full">
                    {statusTasks.length}
                  </span>
                </div>
                {role === 'product_manager' && onAddTaskInStatus && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onAddTaskInStatus(status.id)}
                    className="h-7 w-7 rounded-lg text-secondary hover:text-primary hover:bg-elevated cursor-pointer"
                  >
                    <Plus size={14} />
                  </Button>
                )}
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto space-y-3 pr-1 min-h-[150px] transition-colors rounded-xl p-1 ${
                      snapshot.isDraggingOver ? 'bg-brand-pink/[0.01] border border-dashed border-brand-pink/10' : ''
                    }`}
                  >
                    {statusTasks.map((task, index) => {
                      const isOverdue = task.flags?.isOverdue;
                      
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onTaskClick(task.id)}
                              className={`bg-card p-4 rounded-xl border border-slate-700/20 shadow-sm hover:border-slate-700/40 hover:scale-[1.01] hover:shadow-md transition-all cursor-pointer space-y-3 ${
                                snapshot.isDragging ? 'border-brand-pink shadow-lg shadow-brand-pink/5 scale-[1.02]' : ''
                              } ${getPriorityBorder(task.priority)}`}
                            >
                              {/* Title */}
                              <h4 className="text-body font-semibold text-primary leading-snug line-clamp-2">
                                {task.name}
                              </h4>

                              {/* Tags */}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.map((t: any, idx: number) => (
                                    <span 
                                      key={idx} 
                                      className="text-[9px] px-1.5 py-0.5 rounded-md font-medium border"
                                      style={{ backgroundColor: `${t.color}10`, color: t.color, borderColor: `${t.color}25` }}
                                    >
                                      {t.name}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Footer details */}
                              <div className="flex items-center justify-between pt-1 text-secondary">
                                <div className="flex items-center gap-2">
                                  {/* Priority badge */}
                                  {task.priority && (
                                    <Badge variant="outline" title={getPriorityTooltip(task.priority)} className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold cursor-pointer ${getPriorityBadgeClass(task.priority)}`}>
                                      {getPriorityLabel(task.priority)}
                                    </Badge>
                                  )}

                                  {/* Due Date */}
                                  {task.due_date && (
                                    <div className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue ? 'text-brand-pink' : 'text-secondary'}`}>
                                      <CalendarIcon size={11} />
                                      {format(new Date(task.due_date), 'MMM d')}
                                    </div>
                                  )}
                                </div>

                                {/* Assignee avatar */}
                                <div className="flex -space-x-1.5">
                                  {task.assignees && task.assignees.length > 0 ? (
                                    task.assignees.slice(0, 2).map((assignee: any, idx: number) => (
                                      assignee.profilePicture ? (
                                        <img 
                                          key={idx}
                                          src={assignee.profilePicture} 
                                          alt={assignee.username} 
                                          className="h-5 w-5 rounded-full ring-2 ring-card object-cover" 
                                        />
                                      ) : (
                                        <div 
                                          key={idx}
                                          className="h-5 w-5 rounded-full ring-2 ring-card bg-elevated text-primary font-bold text-[9px] flex items-center justify-center"
                                        >
                                          {assignee.username.charAt(0).toUpperCase()}
                                        </div>
                                      )
                                    ))
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
    </div>
  );
}
