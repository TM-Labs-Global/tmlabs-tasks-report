'use client';

import React, { useState } from 'react';
import { GanttChart } from './GanttChart';
import { TaskTable } from '../tables/TaskTable';
import { StatusBadge } from '../ui/StatusBadge';
import { ChevronRight, ChevronDown, ListTree, CalendarDays, Activity } from 'lucide-react';

interface ProjectDetailProps {
  projectName: string;
  tasks: any[];
}

export function ProjectDetail({ projectName, tasks }: ProjectDetailProps) {
  const projectTasks = tasks.filter(t => t.project === projectName);
  
  // Organize hierarchy
  const parentTasks = projectTasks.filter(t => !t.parent);
  const subTasks = projectTasks.filter(t => t.parent);

  const doneCount = projectTasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed')).length;
  const inProgressCount = projectTasks.filter(t => t.status.toLowerCase().includes('progress') || t.status.toLowerCase().includes('active')).length;
  const pct = Math.round((doneCount / projectTasks.length) * 100) || 0;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <div className="bg-card p-8 rounded-3xl border border-slate-700/20 shadow-2xl shadow-slate-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-pink font-bold text-caption uppercase tracking-widest">
              <ListTree size={14} />
              Project View
            </div>
            <h2 className="text-h2 font-bold text-primary">{projectName}</h2>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-h2 font-bold text-primary">{projectTasks.length}</div>
              <div className="text-caption text-muted uppercase tracking-widest font-bold">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-h2 font-bold text-brand-pink">{pct}%</div>
              <div className="text-caption text-muted uppercase tracking-widest font-bold">Progress</div>
            </div>
          </div>
        </div>

        <div className="mt-8 h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-pink to-brand-purple transition-all duration-1000 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Timeline Chart */}
        <div className="xl:col-span-1 bg-card p-6 rounded-3xl border border-slate-700/20 shadow-xl shadow-slate-950/10">
          <h3 className="text-h3 font-bold text-primary mb-6 flex items-center gap-2">
            <CalendarDays size={20} className="text-brand-pink" />
            Project Timeline
          </h3>
          <GanttChart tasks={projectTasks} />
        </div>

        {/* Task Breakdown */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-slate-700/20 shadow-xl shadow-slate-950/10">
            <h3 className="text-h3 font-bold text-primary mb-6 flex items-center gap-2">
              <Activity size={20} className="text-brand-pink" />
              Task Breakdown
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-status-in-progress/5 border border-status-in-progress/20">
                <div className="text-caption font-bold text-status-in-progress uppercase tracking-widest mb-1">In Progress</div>
                <div className="text-h2 font-bold text-primary">{inProgressCount}</div>
              </div>
              <div className="p-4 rounded-2xl bg-status-complete/5 border border-status-complete/20">
                <div className="text-caption font-bold text-status-complete uppercase tracking-widest mb-1">Done</div>
                <div className="text-h2 font-bold text-primary">{doneCount}</div>
              </div>
            </div>

            <div className="space-y-4">
               <p className="text-label font-bold text-muted uppercase tracking-widest px-1">Hierarchical View</p>
               <div className="space-y-2">
                 {parentTasks.slice(0, 10).map(task => (
                   <div key={task.id} className="space-y-2">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-slate-700/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-secondary">
                            <ChevronRight size={16} />
                          </div>
                          <span className="text-body font-medium text-primary">{task.name}</span>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                      
                      {/* Subtasks */}
                      {subTasks.filter(st => st.parent === task.id).map(st => (
                        <div key={st.id} className="ml-12 flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-slate-700/5">
                           <span className="text-caption text-secondary">{st.name}</span>
                           <StatusBadge status={st.status} />
                        </div>
                      ))}
                   </div>
                 ))}
                 {parentTasks.length > 10 && <p className="text-center text-caption text-muted italic">And {parentTasks.length - 10} more tasks...</p>}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
