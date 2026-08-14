'use client';

import React, { useState, useEffect } from 'react';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useFilteredTasks } from '@/shared/hooks/useFilteredTasks';
import { useFilters } from '@/shared/context/FilterContext';
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
  Loader2,
  CalendarDays,
  CalendarRange,
  Layers,
  History,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { SetupScreen } from '@/shared/components/ui/SetupScreen';
import { MetricTasksModal } from '@/shared/components/modals/MetricTasksModal';
import { ExportModal } from '@/shared/components/modals/ExportModal';
import { generateStyledReport } from '@/shared/utils/excelReport';
import { Button } from '@/shared/components/ui/button';

type Tab = 'weekly' | 'monthly' | 'quarterly' | 'all';

export default function Home() {
  const { members, isLoading, error, isConfigured } = useClickUp();
  const tasks = useFilteredTasks();
  const { filters, setFilters } = useFilters();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [offset, setOffset] = useState(0); 
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<{ title: string; tasks: any[] } | null>(null);

  const updatePeriodRange = (tab: Tab, currentOffset: number) => {
    if (tab === 'all') {
      setFilters(prev => ({ ...prev, startDate: null, endDate: null }));
      return;
    }
    const now = new Date();
    let startStr: string | null = null;
    let endStr: string | null = null;
    
    if (tab === 'weekly') {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(d.setDate(diff + (currentOffset * 7)));
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      startStr = start.toISOString();
      endStr = end.toISOString();
    } else if (tab === 'monthly') {
      const start = new Date(now.getFullYear(), now.getMonth() + currentOffset, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + currentOffset + 1, 0, 23, 59, 59, 999);
      startStr = start.toISOString();
      endStr = end.toISOString();
    } else if (tab === 'quarterly') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const qStartMonth = (currentQuarter + currentOffset) * 3;
      const start = new Date(now.getFullYear(), qStartMonth, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), qStartMonth + 3, 0, 23, 59, 59, 999);
      startStr = start.toISOString();
      endStr = end.toISOString();
    }

    setFilters(prev => ({ ...prev, startDate: startStr, endDate: endStr }));
  };

  const handleTabChange = (newTab: Tab) => {
    setActiveTab(newTab);
    setOffset(0);
    updatePeriodRange(newTab, 0);
  };

  const handleOffsetChange = (updater: number | ((prev: number) => number)) => {
    const newOffset = typeof updater === 'function' ? updater(offset) : updater;
    setOffset(newOffset);
    updatePeriodRange(activeTab, newOffset);
  };

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
  
  const inProgressTasks = tasks.filter(t => t.status.toLowerCase().includes('progress'));
  const inProgress = inProgressTasks.length;
  
  const blockedTasks = tasks.filter(t => t.flags.isBlocked);
  const blocked = blockedTasks.length;
  
  const overdueTasks = tasks.filter(t => t.flags.isOverdue);
  const overdue = overdueTasks.length;
  
  const spilloversTasks = tasks.filter(t => t.flags.isSpillover);
  const spillovers = spilloversTasks.length;
  
  const completedThisWeekTasks = tasks.filter(t => {
    const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
    if (!isDone || !t.date_closed) return false;
    const closedDate = new Date(parseInt(t.date_closed));
    return closedDate >= weekAgo;
  });
  const completedThisWeek = completedThisWeekTasks.length;

  const completedThisMonthTasks = tasks.filter(t => {
    const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
    if (!isDone || !t.date_closed) return false;
    const closedDate = new Date(parseInt(t.date_closed));
    return closedDate >= monthAgo;
  });
  const completedThisMonth = completedThisMonthTasks.length;

  const highPriorityTasks = tasks.filter(t => {
    const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
    return !isDone && (t.priority === 1 || t.priority === 2);
  });
  const highPriorityPending = highPriorityTasks.length;

  const activeProjectsTasks = tasks.filter(t => {
    const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
    return !isDone;
  });
  const activeProjectsCount = new Set(activeProjectsTasks.map(t => t.project)).size;

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
  const teamWorkloadData = members.map((m: any) => {
    const memberId = m.id || m.user?.id;
    const memberName = m.full_name || m.user?.username || m.email?.split('@')[0] || 'Unknown';
    const openTasks = tasks.filter((t: any) => {
      const isDone = t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed');
      return !isDone && t.assignees?.some((a: any) => a.id === memberId);
    }).length;
    return { name: memberName, tasks: openTasks };
  }).sort((a: any, b: any) => b.tasks - a.tasks).slice(0, 8);

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
      {/* ── Unified Period & Export Control Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-xl border border-slate-700/20 shadow-sm">
        {/* Period Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Tasks', icon: History },
            { id: 'weekly', label: 'Weekly', icon: CalendarDays },
            { id: 'monthly', label: 'Monthly', icon: CalendarRange },
            { id: 'quarterly', label: 'Quarterly', icon: Layers },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id as Tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/30' 
                  : 'text-secondary hover:text-primary hover:bg-white/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Offset Controls & Export Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {activeTab !== 'all' && (
            <div className="flex items-center bg-elevated border border-slate-700/20 rounded-lg overflow-hidden shadow-sm">
              <button 
                onClick={() => handleOffsetChange(o => o - 1)}
                className="p-1.5 hover:bg-white/10 text-secondary hover:text-primary transition-colors cursor-pointer"
                title="Previous period"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-3 py-1 text-xs font-bold text-primary min-w-[120px] text-center">
                {activeTab === 'weekly' && filters.startDate ? `Week of ${new Date(filters.startDate).toLocaleDateString()}` :
                 activeTab === 'monthly' && filters.startDate ? new Date(filters.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                 activeTab === 'quarterly' && filters.startDate ? `Q${Math.floor(new Date(filters.startDate).getMonth() / 3) + 1} ${new Date(filters.startDate).getFullYear()}` :
                 'Period View'}
              </div>
              <button 
                onClick={() => handleOffsetChange(o => o + 1)}
                className="p-1.5 hover:bg-white/10 text-secondary hover:text-primary transition-colors cursor-pointer"
                title="Next period"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <Button 
            variant="primary" 
            className="gap-2 bg-brand-pink hover:bg-brand-pink/90 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-pink/20 cursor-pointer" 
            onClick={() => setIsExportModalOpen(true)}
          >
            <FileSpreadsheet size={15} />
            Download Report
          </Button>
        </div>
      </div>

      {/* KPI Grid - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Tasks" value={totalTasks} color="kpi-blue" icon={FileText} onClick={() => setSelectedMetric({ title: 'Total Tasks', tasks })} />
        <MetricCard label="Completed (Week)" value={completedThisWeek} color="kpi-green" icon={CheckCircle2} onClick={() => setSelectedMetric({ title: 'Completed This Week', tasks: completedThisWeekTasks })} />
        <MetricCard label="Completed (Month)" value={completedThisMonth} color="kpi-teal" icon={Zap} onClick={() => setSelectedMetric({ title: 'Completed This Month', tasks: completedThisMonthTasks })} />
        <MetricCard label="In Progress" value={inProgress} color="kpi-amber" icon={Clock} onClick={() => setSelectedMetric({ title: 'In Progress Tasks', tasks: inProgressTasks })} />
      </div>

      {/* KPI Grid - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Blocked" value={blocked} color="kpi-red" icon={Ban} onClick={() => setSelectedMetric({ title: 'Blocked Tasks', tasks: blockedTasks })} />
        <MetricCard label="Spillovers" value={spillovers} color="kpi-orange" icon={AlertCircle} onClick={() => setSelectedMetric({ title: 'Spillover Tasks', tasks: spilloversTasks })} />
        <MetricCard label="High Priority" value={highPriorityPending} color="kpi-purple" icon={TrendingUp} onClick={() => setSelectedMetric({ title: 'High Priority Tasks', tasks: highPriorityTasks })} />
        <MetricCard label="Active Projects" value={activeProjectsCount} color="kpi-indigo" icon={Users} onClick={() => setSelectedMetric({ title: 'Active Projects (Pending Tasks)', tasks: activeProjectsTasks })} />
      </div>

      {/* ClickUp Workflow Breakdown */}
      <div className="space-y-4">
        <h3 className="text-label font-bold text-muted uppercase tracking-widest px-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-pink" />
          Workflow Status Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setSelectedMetric({ title: 'Backlog / Open Tasks', tasks: tasks.filter(t => t.status.toLowerCase().includes('backlog') || t.status.toLowerCase().includes('todo') || t.status.toLowerCase().includes('open')) })} 
            className="bg-card p-5 rounded-xl border border-slate-700/20 shadow-sm relative overflow-hidden group cursor-pointer hover:bg-elevated hover:border-slate-700/40 transition-all duration-150"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-500" />
            <div className="text-caption font-bold text-muted uppercase tracking-wider mb-1">Backlog</div>
            <div className="text-h2 font-bold text-primary">{tasks.filter(t => t.status.toLowerCase().includes('backlog') || t.status.toLowerCase().includes('todo') || t.status.toLowerCase().includes('open')).length}</div>
          </div>
          <div 
            onClick={() => setSelectedMetric({ title: 'In Progress Tasks', tasks: tasks.filter(t => t.status.toLowerCase().includes('progress') || t.status.toLowerCase().includes('active')) })} 
            className="bg-card p-5 rounded-xl border border-slate-700/20 shadow-sm relative overflow-hidden group cursor-pointer hover:bg-elevated hover:border-slate-700/40 transition-all duration-150"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-status-in-progress" />
            <div className="text-caption font-bold text-status-in-progress uppercase tracking-wider mb-1">In Progress</div>
            <div className="text-h2 font-bold text-primary">{tasks.filter(t => t.status.toLowerCase().includes('progress') || t.status.toLowerCase().includes('active')).length}</div>
          </div>
          <div 
            onClick={() => setSelectedMetric({ title: 'In Review Tasks', tasks: tasks.filter(t => t.status.toLowerCase().includes('review')) })} 
            className="bg-card p-5 rounded-xl border border-slate-700/20 shadow-sm relative overflow-hidden group cursor-pointer hover:bg-elevated hover:border-slate-700/40 transition-all duration-150"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-status-review" />
            <div className="text-caption font-bold text-status-review uppercase tracking-wider mb-1">In Review</div>
            <div className="text-h2 font-bold text-primary">{tasks.filter(t => t.status.toLowerCase().includes('review')).length}</div>
          </div>
          <div 
            onClick={() => setSelectedMetric({ title: 'Completed Tasks', tasks: tasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed')) })} 
            className="bg-card p-5 rounded-xl border border-slate-700/20 shadow-sm relative overflow-hidden group cursor-pointer hover:bg-elevated hover:border-slate-700/40 transition-all duration-150"
          >
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

      {/* Metric Tasks List Modal */}
      {selectedMetric && (
        <MetricTasksModal
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
          title={selectedMetric.title}
          tasks={selectedMetric.tasks}
        />
      )}

      {/* Report Export Modal */}
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        onExport={(type, showAssignee) => {
          const startObj = filters.startDate ? new Date(filters.startDate) : new Date(0);
          const endObj = filters.endDate ? new Date(filters.endDate) : new Date();
          const periodLabel = activeTab === 'all' ? 'All Workspace Data' : `Report (${activeTab})`;
          generateStyledReport(tasks, type, periodLabel, startObj, endObj, showAssignee);
          setIsExportModalOpen(false);
        }}
        currentPeriod={activeTab === 'all' ? 'All Workspace Data' : 'Current Period'}
      />
    </div>
  );
}