'use client';

import React from 'react';
import { useFilters } from '@/shared/context/FilterContext';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { Filter, X, Search } from 'lucide-react';

import { CalendarPicker } from './CalendarPicker';

export function FilterBar() {
  const { filters, setFilters, resetFilters, isFiltered } = useFilters();
  const { tasks, members } = useClickUp();

  // Extract unique projects and statuses from tasks
  const projects = Array.from(new Set(tasks.map(t => t.project))).sort();
  const statuses = Array.from(new Set(tasks.map(t => t.status))).sort();
  const priorities = [
    { id: '1', name: 'Urgent' },
    { id: '2', name: 'High' },
    { id: '3', name: 'Normal' },
    { id: '4', name: 'Low' },
  ];

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  return (
    <div className="bg-card border-b border-slate-700/20 px-4 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 animate-in slide-in-from-top-1 duration-300 shadow-lg shadow-slate-950/10 overflow-x-auto lg:overflow-x-visible">
      <div className="flex items-center justify-between lg:justify-start gap-2 text-primary shrink-0">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-brand-pink" />
          <span className="text-label font-bold uppercase tracking-widest hidden sm:inline-block">Dashboard Filters</span>
          <span className="text-label font-bold uppercase tracking-widest sm:hidden">Filters</span>
        </div>
        
        {/* Reset (Mobile Only) */}
        {isFiltered && (
          <button 
            onClick={resetFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-pink/10 text-[10px] font-bold text-brand-pink border border-brand-pink/20"
          >
            <X size={12} />
            Reset
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

        {/* Date Filter (Custom Calendar) - MOVED UP for prominence */}
        <div className="flex flex-col gap-1.5 order-first sm:order-none">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Period</span>
          <CalendarPicker 
            currentStart={filters.startDate}
            onRangeSelect={(start, end) => setFilters(prev => ({ ...prev, startDate: start, endDate: end }))}
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
            {members.map(m => (
              <option key={m.user.id} value={m.user.id}>{m.user.username}</option>
            ))}
          </select>
        </div>

        {/* Reset (Desktop Only) */}
        {isFiltered && (
          <button 
            onClick={resetFilters}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-pink/10 text-caption font-bold text-brand-pink hover:bg-brand-pink hover:text-white transition-all border border-brand-pink/20 mt-auto mb-0.5"
          >
            <X size={14} />
            Reset All
          </button>
        )}
      </div>

      {/* Active Filter Chips (Scroll on Mobile) */}
      <div className="flex flex-wrap gap-2 lg:ml-auto mt-2 lg:mt-auto mb-0.5 max-h-20 overflow-y-auto">
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
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand-pink/10 border border-brand-pink/20 text-[10px] font-bold text-brand-pink uppercase tracking-tight">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors">
        <X size={10} />
      </button>
    </div>
  );
}
