'use client';

import React from 'react';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useFilteredTasks } from '@/shared/hooks/useFilteredTasks';
import { MetricCard } from '@/shared/components/cards/MetricCard';
import { TaskTable } from '@/shared/components/tables/TaskTable';
import { 
  Users, 
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { SetupScreen } from '@/shared/components/ui/SetupScreen';
import { useFilters } from '@/shared/context/FilterContext';
import { TeamWorkloadChart } from '@/shared/components/charts/TeamWorkloadChart';
import { generateStyledReport } from '@/shared/utils/excelReport';

export default function TeamPerformance() {
  const { members, isLoading, error, isConfigured } = useClickUp();
  const tasks = useFilteredTasks();
  const { filters, setFilters } = useFilters();

  if (!isConfigured && !isLoading) return <SetupScreen />;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
      <p className="text-body text-secondary animate-pulse">Loading team data...</p>
    </div>
  );
  if (error) return <div className="text-red-500 p-8 text-center">{error}</div>;

  const handleMemberClick = (memberId: string) => {
    setFilters(prev => {
      const current = prev.member;
      if (current.includes(memberId)) {
        return { ...prev, member: current.filter(id => id !== memberId) };
      }
      return { ...prev, member: [...current, memberId] };
    });
  };

  // Group tasks by member
  const memberStats = members.map(m => {
    const user = m.user;
    const memberTasks = tasks.filter(t => t.assignees?.some((a: any) => a.id === user.id));
    return {
      user,
      taskCount: memberTasks.length,
      completed: memberTasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed')).length,
      overdue: memberTasks.filter(t => t.flags.isOverdue).length,
    };
  }).sort((a, b) => b.taskCount - a.taskCount);

  const chartData = memberStats.map(s => ({ name: s.user.username, tasks: s.taskCount }));

  const handleExport = () => {
    const start = filters.startDate ? new Date(filters.startDate) : new Date();
    const end = filters.endDate ? new Date(filters.endDate) : new Date();
    const label = filters.startDate && filters.endDate 
      ? `Team Workload (${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()})`
      : 'Team Workload Report';
    
    generateStyledReport(tasks, 'monthly', label, start, end, true, 'assignee');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-h1 font-bold text-primary">Team Performance</h1>
          <p className="text-body text-secondary">Workload and output per team member</p>
        </div>
        <button 
          onClick={handleExport}
          className="gap-2 px-4 py-2.5 bg-brand-navy border border-slate-700/30 rounded-xl text-caption font-bold text-primary hover:bg-slate-700/40 transition-colors shadow-lg shadow-brand-navy/10 flex items-center"
        >
          <FileSpreadsheet size={18} className="text-brand-pink" />
          Export Report
        </button>
      </div>

      {/* Comparison Chart */}
      <div className="bg-card p-6 rounded-xl border border-slate-700/20">
        <h3 className="text-h3 font-semibold text-primary mb-6 flex items-center gap-2">
          <div className="w-1 h-4 bg-brand-pink rounded-full" />
          Member Workload Comparison
        </h3>
        <TeamWorkloadChart data={chartData} />
      </div>

      {/* Member Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {memberStats.map(stat => {
          const isActive = filters.member.includes(stat.user.id);
          return (
            <div 
              key={stat.user.id} 
              onClick={() => handleMemberClick(stat.user.id)}
              className={`bg-card p-5 rounded-xl border transition-all cursor-pointer group ${isActive ? 'border-brand-pink ring-1 ring-brand-pink/20 bg-brand-pink/[0.02]' : 'border-slate-700/20 hover:border-brand-pink/30'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                {stat.user.profilePicture ? (
                  <img src={stat.user.profilePicture} alt={stat.user.username} className="w-10 h-10 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-primary font-bold">
                    {(stat.user.username || 'U').charAt(0)}
                  </div>
                )}
                <div>
                  <div className={`text-body font-semibold transition-colors ${isActive ? 'text-brand-pink' : 'text-primary group-hover:text-brand-pink'}`}>
                    {stat.user.username || 'Unknown User'}
                  </div>
                  <div className="text-caption text-secondary">{stat.user.initials || 'Member'}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/10">
                <div className="text-center">
                  <div className="text-h3 font-bold text-primary">{stat.taskCount}</div>
                  <div className="text-caption text-muted">Open</div>
                </div>
                <div className="text-center border-x border-slate-700/10">
                  <div className="text-h3 font-bold text-green-500">{stat.completed}</div>
                  <div className="text-caption text-muted">Done</div>
                </div>
                <div className="text-center">
                  <div className="text-h3 font-bold text-red-500">{stat.overdue}</div>
                  <div className="text-caption text-muted">Late</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="space-y-4">
        <h3 className="text-h3 font-semibold text-primary">
          {filters.member.length > 0 ? 'Filtered Task List' : 'High Workload Tasks'}
        </h3>
        <TaskTable tasks={filters.member.length > 0 ? tasks : tasks.filter(t => (t.priority === 1 || t.priority === 2) && !t.status.toLowerCase().includes('complete')).slice(0, 50)} />
      </section>
    </div>
  );
}

