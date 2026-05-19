'use client';

import React from 'react';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useFilteredTasks } from '@/shared/hooks/useFilteredTasks';
import { MetricCard } from '@/shared/components/cards/MetricCard';
import { TaskTable } from '@/shared/components/tables/TaskTable';
import { BarChart } from '@/shared/components/charts/BarChart';
import { DonutChart } from '@/shared/components/charts/DonutChart';
import { TrendLineChart } from '@/shared/components/charts/TrendLineChart';
import { TeamWorkloadChart } from '@/shared/components/charts/TeamWorkloadChart';
import { ProgressByProject } from '@/shared/components/charts/ProgressByProject';
import { 
  FileText, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Ban, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Loader2 
} from 'lucide-react';
import { SetupScreen } from '@/shared/components/ui/SetupScreen';

export default function Home() {
  const { members, isLoading, error, isConfigured } = useClickUp();
  const tasks = useFilteredTasks();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
        <p className="text-body text-secondary animate-pulse">Fetching workspace data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4 text-red-500">
        <Ban size={48} />
        <p className="text-h2 font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brand-pink text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all">
          Try Again
        </button>
      </div>
    );
  }

  if (!isConfigured) return <SetupScreen />;

  // --- Metrics Calculation ---
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status.toLowerCase().includes('progress')).length;
  const blocked = tasks.filter(t => t.flags.isBlocked).length;
  const overdue = tasks.filter(t => t.flags.isOverdue).length;
  const spillovers = tasks.filter(t => t.flags.isSpillover).length;
  
  const completedThisWeek = tasks.filter(t => {
    const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
    if (!isDone || !t.date_closed) return false;
    const closedDate = new Date(parseInt(t.date_closed));
    return closedDate >= weekAgo;
  }).length;

  const completedThisMonth = tasks.filter(t => {
    const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
    if (!isDone || !t.date_closed) return false;
    const closedDate = new Date(parseInt(t.date_closed));
    return closedDate >= monthAgo;
  }).length;

  const highPriorityPending = tasks.filter(t => {
    const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
    return !isDone && (t.priority === 1 || t.priority === 2);
  }).length;

  const activeProjectsCount = new Set(tasks.filter(t => {
    const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
    return !isDone;
  }).map(t => t.project)).size;

  // --- Chart Data Preparation ---
  
  // 1. Status Distribution
  const statusCounts = tasks.reduce((acc: any, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 6);

  // 2. Priority Distribution
  const priorityMap: any = { 1: 'Urgent', 2: 'High', 3: 'Normal', 4: 'Low' };
  const priorityColors: any = { 1: '#EF4444', 2: '#F97316', 3: '#3B82F6', 4: '#94A3B8' };
  const priorityCounts = tasks.reduce((acc: any, t) => {
    if (t.priority) acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});
  const priorityData = Object.entries(priorityCounts).map(([id, value]) => ({ 
    name: priorityMap[id] || 'None', 
    value: value as number,
    color: priorityColors[id] || '#475569'
  }));

  // 3. Weekly Completion Trend (Last 8 weeks)
  const weeklyTrendData = Array.from({ length: 8 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 * (7 - i)));
    const start = new Date(d);
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const count = tasks.filter(t => {
      if (!t.date_closed) return false;
      const closed = new Date(parseInt(t.date_closed));
      return closed >= start && closed < end;
    }).length;

    return { label: `W${i+1}`, value: count };
  });

  // 4. Team Workload
  const teamWorkloadData = members.map(m => {
    const openTasks = tasks.filter(t => {
      const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
      return !isDone && t.assignees?.some((a: any) => a.id === m.user.id);
    }).length;
    return { name: m.user.username, tasks: openTasks };
  }).sort((a, b) => b.tasks - a.tasks).slice(0, 8);

  // 5. Progress by Project
  const projectList = Array.from(new Set(tasks.map(t => t.project)));
  const progressByProjectData = projectList.map(name => {
    const pTasks = tasks.filter(t => t.project === name);
    const total = pTasks.length;
    const done = pTasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed')).length;
    return { name, total, completed: done, pct: Math.round((done / total) * 100) || 0 };
  }).sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <div className="space-y-8 pb-12">
      {/* KPI Grid - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Tasks" value={totalTasks} color="kpi-blue" icon={FileText} />
        <MetricCard label="Completed (Week)" value={completedThisWeek} color="kpi-green" icon={CheckCircle2} />
        <MetricCard label="Completed (Month)" value={completedThisMonth} color="kpi-teal" icon={Zap} />
        <MetricCard label="In Progress" value={inProgress} color="kpi-amber" icon={Clock} />
      </div>

      {/* KPI Grid - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Blocked" value={blocked} color="kpi-red" icon={Ban} />
        <MetricCard label="Spillovers" value={spillovers} color="kpi-orange" icon={AlertCircle} />
        <MetricCard label="High Priority" value={highPriorityPending} color="kpi-purple" icon={TrendingUp} />
        <MetricCard label="Active Projects" value={activeProjectsCount} color="kpi-indigo" icon={Users} />
      </div>

      {/* ClickUp Workflow Breakdown */}
      <div className="space-y-4">
        <h3 className="text-label font-bold text-muted uppercase tracking-widest px-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-pink" />
          Workflow Status Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card p-5 rounded-xl border border-slate-700/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-500" />
            <div className="text-caption font-bold text-muted uppercase tracking-wider mb-1">Backlog</div>
            <div className="text-h2 font-bold text-primary">{tasks.filter(t => t.status.toLowerCase().includes('backlog') || t.status.toLowerCase().includes('todo') || t.status.toLowerCase().includes('open')).length}</div>
          </div>
          <div className="bg-card p-5 rounded-xl border border-slate-700/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-status-in-progress" />
            <div className="text-caption font-bold text-status-in-progress uppercase tracking-wider mb-1">In Progress</div>
            <div className="text-h2 font-bold text-primary">{tasks.filter(t => t.status.toLowerCase().includes('progress') || t.status.toLowerCase().includes('active')).length}</div>
          </div>
          <div className="bg-card p-5 rounded-xl border border-slate-700/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-status-review" />
            <div className="text-caption font-bold text-status-review uppercase tracking-wider mb-1">In Review</div>
            <div className="text-h2 font-bold text-primary">{tasks.filter(t => t.status.toLowerCase().includes('review')).length}</div>
          </div>
          <div className="bg-card p-5 rounded-xl border border-slate-700/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-status-complete" />
            <div className="text-caption font-bold text-status-complete uppercase tracking-wider mb-1">Completed</div>
            <div className="text-h2 font-bold text-primary">{tasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed')).length}</div>
          </div>
        </div>
      </div>


      {/* Charts Section - Primary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border border-slate-700/20">
          <h3 className="text-h3 font-semibold text-primary mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-brand-pink rounded-full" />
            Tasks by Status
          </h3>
          <BarChart data={statusData} xKey="name" yKey="value" color="#FF3396" />
        </div>
        <div className="bg-card p-6 rounded-xl border border-slate-700/20">
          <h3 className="text-h3 font-semibold text-primary mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-brand-purple rounded-full" />
            Priority Distribution
          </h3>
          <DonutChart data={priorityData} />
        </div>
      </div>

      {/* Charts Section - Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border border-slate-700/20">
          <h3 className="text-h3 font-semibold text-primary mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-kpi-teal rounded-full" />
            Weekly Completion Trend
          </h3>
          <TrendLineChart data={weeklyTrendData} color="#14B8A6" />
        </div>
        <div className="bg-card p-6 rounded-xl border border-slate-700/20">
          <h3 className="text-h3 font-semibold text-primary mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-kpi-blue rounded-full" />
            Team Workload (Open Tasks)
          </h3>
          <TeamWorkloadChart data={teamWorkloadData} />
        </div>
      </div>

      {/* Charts Section - Progress Row */}
      <div className="bg-card p-6 rounded-xl border border-slate-700/20">
        <h3 className="text-h3 font-semibold text-primary mb-6 flex items-center gap-2">
          <div className="w-1 h-4 bg-brand-pink rounded-full" />
          Progress by Project
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <ProgressByProject projects={progressByProjectData.slice(0, 5)} />
          <ProgressByProject projects={progressByProjectData.slice(5, 10)} />
        </div>
      </div>

      {/* Task Table Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-h3 font-semibold text-primary">Live Workspace Tasks</h3>
          <div className="flex items-center gap-4">
             <p className="text-caption text-secondary">{tasks.length} total tasks</p>
          </div>
        </div>
        <TaskTable tasks={tasks} />
      </section>
    </div>
  );
}