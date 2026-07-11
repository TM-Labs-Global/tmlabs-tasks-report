'use client';

import React from 'react';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useFilteredTasks } from '@/shared/hooks/useFilteredTasks';
import {
  FolderKanban,
  Loader2,
  ArrowLeft,
  FileSpreadsheet,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { SetupScreen } from '@/shared/components/ui/SetupScreen';
import { useFilters } from '@/shared/context/FilterContext';
import { TaskTable } from '@/shared/components/tables/TaskTable';
import { ProjectDetail } from '@/shared/components/projects/ProjectDetail';
import { generateStyledReport } from '@/shared/utils/excelReport';
import { useAuth } from '@/shared/context/AuthContext';

export default function ProjectHealth() {
  const { user } = useAuth();
  const role = user?.role || 'staff';

  // Only Product Managers can access project health
  if (role !== 'product_manager') {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <XCircle className="mx-auto text-brand-pink w-12 h-12" />
        <h3 className="text-h3 font-bold text-primary">Access Restricted</h3>
        <p className="text-body text-secondary">Only Product Managers can access Project Health. Please navigate to an allowed section.</p>
      </div>
    );
  }

  const { isLoading, error, isConfigured } = useClickUp();
  const tasks = useFilteredTasks();
  const { filters, setFilters, resetFilters } = useFilters();

  if (!isConfigured && !isLoading) return <SetupScreen />;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
      <p className="text-body text-secondary animate-pulse">Loading project data...</p>
    </div>
  );
  if (error) return <div className="text-red-500 p-8 text-center">{error}</div>;

  const handleProjectClick = (projectName: string) => {
    setFilters(prev => ({ ...prev, project: [projectName] }));
  };

  const isSingleProjectSelected = filters.project.length === 1;

  const handleExport = () => {
    const start = filters.startDate ? new Date(filters.startDate) : new Date();
    const end = filters.endDate ? new Date(filters.endDate) : new Date();
    const label = filters.startDate && filters.endDate 
      ? `Project Workload (${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()})`
      : 'Project Workload Report';
    
    generateStyledReport(tasks, 'monthly', label, start, end, true, 'project');
  };

  if (isSingleProjectSelected) {
    return (
      <div className="space-y-6 pb-12">
        <button 
          onClick={resetFilters}
          className="flex items-center gap-2 text-caption font-bold text-brand-pink hover:text-white transition-all uppercase tracking-widest group"
        >
          <div className="w-8 h-8 rounded-full bg-brand-pink/10 flex items-center justify-center group-hover:bg-brand-pink group-hover:text-white transition-all">
            <ArrowLeft size={16} />
          </div>
          Back to Project Overview
        </button>
        <ProjectDetail projectName={filters.project[0]} tasks={tasks} />
      </div>
    );
  }

  // Group by project (list name)
  const projectNames = Array.from(new Set(tasks.map(t => t.project))).sort();
  const projects = projectNames.map(name => {
    const projectTasks = tasks.filter(t => t.project === name);
    const total = projectTasks.length;
    const done = projectTasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed')).length;
    const overdue = projectTasks.filter(t => t.flags.isOverdue).length;
    const spillovers = projectTasks.filter(t => t.flags.isSpillover).length;
    const pct = Math.round((done / total) * 100) || 0;

    let health = { label: 'On Track', color: 'text-green-500', bg: 'bg-green-500' };
    if (overdue + spillovers > 0.1 * total) health = { label: 'At Risk', color: 'text-amber-500', bg: 'bg-amber-500' };
    if (overdue + spillovers > 0.3 * total) health = { label: 'Delayed', color: 'text-red-500', bg: 'bg-red-500' };

    return { name, total, done, overdue: overdue + spillovers, pct, health };
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-h1 font-bold text-primary">Project Health</h1>
          <p className="text-body text-secondary">Delivery status across active lists</p>
        </div>
        <button 
          onClick={handleExport}
          className="gap-2 px-4 py-2.5 bg-brand-navy border border-slate-700/30 rounded-xl text-caption font-bold text-primary hover:bg-slate-700/40 transition-colors shadow-lg shadow-brand-navy/10 flex items-center"
        >
          <FileSpreadsheet size={18} className="text-brand-pink" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          return (
            <div 
              key={project.name} 
              onClick={() => handleProjectClick(project.name)}
              className="bg-card p-6 rounded-xl border border-slate-700/20 transition-all cursor-pointer group space-y-6 hover:border-brand-pink hover:shadow-xl hover:shadow-brand-pink/5"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-h3 font-semibold transition-colors text-primary group-hover:text-brand-pink">{project.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${project.health.bg}`} />
                    <span className={`text-caption font-medium ${project.health.color}`}>{project.health.label}</span>
                  </div>
                </div>
                <FolderKanban className="text-secondary opacity-50 group-hover:text-brand-pink group-hover:opacity-100 transition-all" size={24} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-caption font-medium">
                  <span className="text-secondary">Progress</span>
                  <span className="text-primary">{project.pct}%</span>
                </div>
                <div className="h-2 w-full bg-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500 bg-gradient-to-r from-brand-pink to-brand-purple" 
                    style={{ width: `${project.pct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-700/10 pt-4">
                <div>
                  <div className="text-body font-bold text-primary">{project.total}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Tasks</div>
                </div>
                <div>
                  <div className="text-body font-bold text-green-500">{project.done}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Done</div>
                </div>
                <div>
                  <div className="text-body font-bold text-red-500">{project.overdue}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Late</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
