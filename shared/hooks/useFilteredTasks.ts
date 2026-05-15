'use client';

import { useMemo } from 'react';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useFilters } from '@/shared/context/FilterContext';

export function useFilteredTasks() {
  const { tasks } = useClickUp();
  const { filters } = useFilters();

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Status Filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      // Priority Filter
      if (filters.priority.length > 0 && !filters.priority.includes(String(task.priority))) {
        return false;
      }

      // Project Filter
      if (filters.project.length > 0 && !filters.project.includes(task.project)) {
        return false;
      }

      // Member Filter
      if (filters.member.length > 0) {
        const taskMemberIds = task.assignees?.map((a: any) => String(a.id)) || [];
        if (!filters.member.some(id => taskMemberIds.includes(String(id)))) {
          return false;
        }
      }

      // Date Range Filter
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate).getTime();
        const end = new Date(filters.endDate).getTime();
        
        const taskDate = task.date_closed ? parseInt(task.date_closed) : (task.dueDate ? new Date(task.dueDate).getTime() : null);
        
        if (taskDate) {
          if (taskDate < start || taskDate > end) {
            return false;
          }
        } else {
          // If no date at all, it shouldn't show in a date-filtered view unless it's a very broad search
          return false;
        }
      }

      // Search Filter
      if (filters.search !== '') {
        const search = filters.search.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(search);
        const matchesProject = task.project.toLowerCase().includes(search);
        const matchesAssignee = task.assignee?.name?.toLowerCase().includes(search);
        const matchesDesc = task.text_content?.toLowerCase().includes(search);
        if (!matchesName && !matchesProject && !matchesAssignee && !matchesDesc) {
          return false;
        }
      }


      return true;
    });
  }, [tasks, filters]);

  return filteredTasks;
}
