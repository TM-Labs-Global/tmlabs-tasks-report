'use client';

import React from 'react';
import { useFilters } from '@/shared/context/FilterContext';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { Filter, X, Search } from 'lucide-react';

import { CalendarPicker } from './CalendarPicker';

export function FilterBar() {
  const { filters, setFilters, resetFilters, isFiltered } = useFilters();
  const { tasks, members } = useClickUp();

  // Cascading Filter logic: calculate available options based on other categories
  const getFilteredTasksExcept = (excludeKey?: 'project' | 'status' | 'member' | 'search' | 'date') => {
    return tasks.filter(task => {
      // Status Filter
      if (excludeKey !== 'status' && filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      // Project Filter
      if (excludeKey !== 'project' && filters.project.length > 0 && !filters.project.includes(task.project)) {
        return false;
      }

      // Member Filter
      if (excludeKey !== 'member' && filters.member.length > 0) {
        const taskMemberIds = task.assignees?.map((a: any) => String(a.id)) || [];
        if (!filters.member.some(id => taskMemberIds.includes(String(id)))) {
          return false;
        }
      }

      // Search Filter
      if (excludeKey !== 'search' && filters.search !== '') {
        const search = filters.search.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(search);
        const matchesProject = task.project.toLowerCase().includes(search);
        const matchesAssignee = task.assignee?.name?.toLowerCase().includes(search);
        const matchesDesc = task.text_content?.toLowerCase().includes(search);
        if (!matchesName && !matchesProject && !matchesAssignee && !matchesDesc) {
          return false;
        }
      }

      // Date Range Filter
      if (excludeKey !== 'date' && filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate).getTime();
        const end = new Date(filters.endDate).getTime();
        
        const taskDueDate = task.dueDate ? new Date(task.dueDate).getTime() : (task.due_date_raw ? new Date(task.due_date_raw).getTime() : null);
        const taskClosedDate = task.date_closed ? parseInt(task.date_closed) : null;
        
        const dueInRange = taskDueDate && taskDueDate >= start && taskDueDate <= end;
        const closedInRange = taskClosedDate && taskClosedDate >= start && taskClosedDate <= end;
        
        if (!dueInRange && !closedInRange) {
          return false;
        }
      }

      return true;
    });
  };

  // Extract cascading projects, statuses and members
  const projects = Array.from(new Set(getFilteredTasksExcept('project').map(t => t.project))).sort();
  const statuses = Array.from(new Set(getFilteredTasksExcept('status').map(t => t.status))).sort();
  
  const tasksForMemberSelect = getFilteredTasksExcept('member');
  const activeMemberIds = new Set(
    tasksForMemberSelect.flatMap(t => t.assignees?.map((a: any) => String(a.id)) || [])
  );
  const availableMembers = members.filter(m => activeMemberIds.has(String(m.user.id)));

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  const getFormatDateStr = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-card border-b border-slate-700/20 px-4 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 animate-in slide-in-from-top-1 duration-300 shadow-lg shadow-slate-950/10 overflow-x-auto lg:overflow-x-visible">
      <div className="flex items-center justify-between lg:justify-start gap-2 text-primary shrink-0">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-brand-pink" />
          <span className="text-label font-bold uppercase tracking-widest hidden sm:inline-block">Dashboard Filters</span>
          <span className="text-label font-bold uppercase tracking-widest sm:hidden">Filters</span>
        </div>
        
        {/* Clear All Filters (Mobile Only) */}
        {isFiltered && (
          <button 
            onClick={resetFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-pink/10 text-[10px] font-bold text-brand-pink border border-brand-pink/20"
          >
            <X size={12} />
            Clear All
          </button>
        )}
      </div>

      <div className="h-6 w-px bg-slate-700/30 hidden lg:block" />

      {/* Responsive Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:items-center gap-4 lg:gap-6 w-full">
        {/* Search */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Keywords</span>
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand-pink transition-colors" />
            <input 
              type="text" 
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="bg-secondary border border-slate-700/30 rounded-xl pl-9 pr-3 py-2 text-caption text-primary focus:outline-none focus:border-brand-pink/50 transition-all w-full xl:w-56 xl:focus:w-72 shadow-inner"
            />
          </div>
        </div>

        {/* Date Filter (Custom Calendar Picker with start and end dates) */}
        <div className="flex flex-col gap-1.5 order-first sm:order-none">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Period</span>
          <CalendarPicker 
            currentStart={filters.startDate}
            currentEnd={filters.endDate}
            currentPreset={filters.preset}
            onRangeSelect={(start, end, preset) => setFilters(prev => ({ ...prev, startDate: start, endDate: end, preset: preset || 'Custom Range' }))}
          />
        </div>

        {/* Project Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Project</span>
          <select 
            className="bg-secondary border border-slate-700/30 rounded-xl px-4 py-2 text-caption text-primary focus:outline-none focus:border-brand-pink/50 transition-all cursor-pointer shadow-inner w-full xl:min-w-[140px]"
            onChange={(e) => e.target.value && handleFilterChange('project', e.target.value)}
            value=""
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Status</span>
          <select 
            className="bg-secondary border border-slate-700/30 rounded-xl px-4 py-2 text-caption text-primary focus:outline-none focus:border-brand-pink/50 transition-all cursor-pointer shadow-inner w-full xl:min-w-[120px]"
            onChange={(e) => e.target.value && handleFilterChange('status', e.target.value)}
            value=""
          >
            <option value="">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Member Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Assignee</span>
          <select 
            className="bg-secondary border border-slate-700/30 rounded-xl px-4 py-2 text-caption text-primary focus:outline-none focus:border-brand-pink/50 transition-all cursor-pointer shadow-inner w-full xl:min-w-[140px]"
            onChange={(e) => e.target.value && handleFilterChange('member', e.target.value)}
            value=""
          >
            <option value="">All Team</option>
            {availableMembers.map(m => (
              <option key={m.user.id} value={m.user.id}>{m.user.username}</option>
            ))}
          </select>
        </div>

        {/* Clear All Filters (Desktop Only) */}
        {isFiltered && (
          <button 
            onClick={resetFilters}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-pink/10 text-caption font-bold text-brand-pink hover:bg-brand-pink hover:text-white transition-all border border-brand-pink/20 mt-auto mb-0.5"
          >
            <X size={14} />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      <div className="flex flex-wrap gap-2 lg:ml-auto mt-2 lg:mt-auto mb-0.5 max-h-20 overflow-y-auto shrink-0">
        {filters.startDate && filters.endDate && (
          <Chip 
            label={`${filters.preset || 'Custom'}: ${getFormatDateStr(filters.startDate)} – ${getFormatDateStr(filters.endDate)}`} 
            onRemove={() => setFilters(prev => ({ ...prev, startDate: null, endDate: null, preset: 'All Time' }))} 
          />
        )}
        {filters.search && (
          <Chip 
            label={`Search: "${filters.search}"`} 
            onRemove={() => setFilters(prev => ({ ...prev, search: '' }))} 
          />
        )}
        {filters.project.map(p => (
          <Chip key={p} label={p} onRemove={() => handleFilterChange('project', p)} />
        ))}
        {filters.status.map(s => (
          <Chip key={s} label={s} onRemove={() => handleFilterChange('status', s)} />
        ))}
        {filters.member.map(id => {
          const m = members.find(m => m.user.id === id);
          return <Chip key={id} label={m?.user.username || id} onRemove={() => handleFilterChange('member', id)} />;
        })}
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string, onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand-pink/10 border border-brand-pink/20 text-[10px] font-bold text-brand-pink uppercase tracking-tight shrink-0">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors cursor-pointer">
        <X size={10} />
      </button>
    </div>
  );
}
