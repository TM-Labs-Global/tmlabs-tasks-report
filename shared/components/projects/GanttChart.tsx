'use client';

import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';

interface GanttTask {
  id: string;
  name: string;
  start_date: number | null;
  due_date_raw: number | null;
  status: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  // Only show tasks with at least a due date
  const validTasks = tasks.filter(t => t.due_date_raw).sort((a, b) => {
    const aDate = a.start_date || a.due_date_raw!;
    const bDate = b.start_date || b.due_date_raw!;
    return aDate - bDate;
  });

  if (validTasks.length === 0) {
    return (
      <div className="py-12 text-center bg-secondary/20 rounded-xl border border-dashed border-slate-700/20">
        <p className="text-caption text-muted italic">No timeline data available for this project.</p>
      </div>
    );
  }

  const minDate = Math.min(...validTasks.map(t => t.start_date || t.due_date_raw!));
  const maxDate = Math.max(...validTasks.map(t => t.due_date_raw!));
  const totalDuration = maxDate - minDate;

  // Ensure we have at least some duration
  const range = totalDuration || 86400000; // Default to 1 day if everything is same

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex justify-between text-[10px] font-bold text-muted uppercase tracking-widest px-1">
        <span>{new Date(minDate).toLocaleDateString()}</span>
        <span>Timeline</span>
        <span>{new Date(maxDate).toLocaleDateString()}</span>
      </div>

      <div className="space-y-3 relative">
        {/* Timeline Grid Lines */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-5">
          <div className="w-px bg-white h-full" />
          <div className="w-px bg-white h-full" />
          <div className="w-px bg-white h-full" />
          <div className="w-px bg-white h-full" />
        </div>

        {validTasks.slice(0, 15).map((task) => {
          const start = task.start_date || task.due_date_raw!;
          const end = task.due_date_raw!;
          const duration = end - start;
          
          const leftPct = ((start - minDate) / range) * 100;
          const widthPct = Math.max(((duration) / range) * 100, 2); // Min 2% width
          
          const isDone = task.status.toLowerCase().includes('complete') || task.status.toLowerCase().includes('done') || task.status.toLowerCase().includes('closed');

          return (
            <div key={task.id} className="group space-y-1">
              <div className="flex justify-between items-center text-[11px] px-1">
                <span className="text-secondary truncate max-w-[200px] group-hover:text-primary transition-colors">{task.name}</span>
                <span className="text-muted opacity-0 group-hover:opacity-100 transition-opacity">{task.status}</span>
              </div>
              <div className="h-4 w-full bg-elevated rounded-full overflow-hidden relative border border-slate-700/10">
                <div 
                  className={`absolute h-full transition-all duration-500 rounded-full shadow-lg ${isDone ? 'bg-status-complete' : 'bg-gradient-to-r from-brand-pink to-brand-purple'}`}
                  style={{ 
                    left: `${leftPct}%`, 
                    width: `${widthPct}%` 
                  }}
                />
              </div>
            </div>
          );
        })}
        {validTasks.length > 15 && (
          <p className="text-center text-caption text-muted pt-2 italic">Showing first 15 tasks of timeline...</p>
        )}
      </div>
    </div>
  );
}
