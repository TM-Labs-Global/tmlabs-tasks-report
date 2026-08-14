import React from 'react';

interface PriorityBadgeProps {
  priority: 1 | 2 | 3 | 4 | null;
}

const priorityMap = {
  1: { label: 'Urgent', colorClass: 'bg-priority-urgent text-priority-urgent', tooltip: 'Urgent Priority' },
  2: { label: 'High', colorClass: 'bg-priority-high text-priority-high', tooltip: 'High Priority' },
  3: { label: 'Normal', colorClass: 'bg-priority-normal text-priority-normal', tooltip: 'Normal Priority' },
  4: { label: 'Low', colorClass: 'bg-priority-low text-priority-low', tooltip: 'Low Priority / No Priority' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const badgeConfig = priority ? priorityMap[priority] : { label: 'None', colorClass: 'bg-priority-none text-priority-none', tooltip: 'Low Priority / No Priority' };

  return (
    <span 
      title={badgeConfig.tooltip}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label font-medium bg-opacity-15 cursor-pointer ${badgeConfig.colorClass}`}
    >
      {badgeConfig.label}
    </span>
  );
}
