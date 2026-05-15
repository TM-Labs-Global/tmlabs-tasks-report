import React from 'react';

// Status colors map based on TM Labs Design System
// Status colors map based on TM Labs Design System
const statusColorMap: Record<string, string> = {
  'complete': 'bg-status-complete text-status-complete',
  'done': 'bg-status-complete text-status-complete',
  'closed': 'bg-status-complete text-status-complete',
  'in progress': 'bg-status-in-progress text-status-in-progress',
  'active': 'bg-status-in-progress text-status-in-progress',
  'on hold': 'bg-status-blocked text-status-blocked',
  'review': 'bg-status-review text-status-review',
  'in review': 'bg-status-review text-status-review',
  'blocked': 'bg-status-blocked text-status-blocked',
  'todo': 'bg-status-todo text-status-todo',
  'open': 'bg-status-todo text-status-todo',
  'backlog': 'bg-slate-500 text-slate-500',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase().trim() || 'todo';
  
  // Find a match or use a partial match for custom ClickUp statuses
  let colorClass = 'bg-slate-400 text-white';
  for (const [key, value] of Object.entries(statusColorMap)) {
    if (normalizedStatus.includes(key)) {
      // Extract color class and replace text-color with white for better contrast on solid badges
      const baseColor = value.split(' ')[0];
      colorClass = `${baseColor} text-white`;
      break;
    }
  }

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-tight shadow-sm ${colorClass}`}>
      {status}
    </span>
  );
}


