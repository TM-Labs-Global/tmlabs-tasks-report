import React from 'react';

interface PriorityBadgeProps {
  priority: 1 | 2 | 3 | 4 | null;
}

const priorityMap = {
  1: { label: 'Urgent', colorClass: 'bg-priority-urgent text-priority-urgent' },
  2: { label: 'High', colorClass: 'bg-priority-high text-priority-high' },
  3: { label: 'Normal', colorClass: 'bg-priority-normal text-priority-normal' },
  4: { label: 'Low', colorClass: 'bg-priority-low text-priority-low' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const badgeConfig = priority ? priorityMap[priority] : { label: 'None', colorClass: 'bg-priority-none text-priority-none' };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label font-medium bg-opacity-15 ${badgeConfig.colorClass}`}>
      {badgeConfig.label}
    </span>
  );
}
