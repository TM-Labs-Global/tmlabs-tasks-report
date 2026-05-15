'use client';

import { useState } from 'react';
import { 
  CalendarDays, 
  CalendarRange, 
  History, 
  Download,
  Loader2,
  Ban,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { SetupScreen } from '@/shared/components/ui/SetupScreen';
import { exportToCSV } from '@/shared/utils/csvExport';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useFilteredTasks } from '@/shared/hooks/useFilteredTasks';
import { MetricCard } from '@/shared/components/cards/MetricCard';
import { TaskTable } from '@/shared/components/tables/TaskTable';

type Tab = 'weekly' | 'monthly' | 'historical';

export default function ReportingCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('weekly');
  const [offset, setOffset] = useState(0); // For week/month navigation
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['ID', 'Name', 'Project', 'Status', 'Priority', 'Assignee', 'DueDate', 'ClosedDate']);
  const [showAssignee, setShowAssignee] = useState(true);
  
  const { isLoading, error, token } = useClickUp();
  const tasks = useFilteredTasks();

  const allColumns = ['ID', 'Name', 'Project', 'Status', 'Priority', 'Assignee', 'DueDate', 'ClosedDate', 'IsBlocked', 'IsOverdue', 'IsSpillover'];

  if (!token) return <SetupScreen />;
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
      <p className="text-body text-secondary animate-pulse">Loading reports...</p>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4 text-red-500">
      <Ban size={48} />
      <p className="text-h2 font-bold">{error}</p>
    </div>
  );

  // --- Date Range Calculations ---
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let periodLabel = '';

  if (activeTab === 'weekly') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) + (offset * 7));
    startDate = new Date(d);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    periodLabel = `Week of ${startDate.toLocaleDateString()}`;
  } else if (activeTab === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    periodLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // --- Filtering ---
  const periodTasks = tasks.filter(t => {
    if (activeTab === 'historical') return true;
    if (!t.dueDate && !t.date_closed) return false;
    
    const taskDate = t.date_closed ? new Date(parseInt(t.date_closed)) : new Date(t.dueDate!);
    return taskDate >= startDate && taskDate <= endDate;
  });

  const completed = periodTasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed')).length;
  const blocked = periodTasks.filter(t => t.flags.isBlocked).length;
  const overdue = periodTasks.filter(t => t.flags.isOverdue).length;
  const spillovers = periodTasks.filter(t => t.flags.isSpillover).length;

  const handleExport = () => {
    const exportData = periodTasks.map(t => {
      const row: any = {};
      const colsToUse = showAssignee ? selectedColumns : selectedColumns.filter(c => c !== 'Assignee');
      
      if (colsToUse.includes('ID')) row.ID = t.id;
      if (colsToUse.includes('Name')) row.Name = t.name;
      if (colsToUse.includes('Project')) row.Project = t.project;
      if (colsToUse.includes('Status')) row.Status = t.status;
      if (colsToUse.includes('Priority')) row.Priority = t.priority;
      if (colsToUse.includes('Assignee')) row.Assignee = t.assignee?.name || 'Unassigned';
      if (colsToUse.includes('DueDate')) row.DueDate = t.dueDate || '—';
      if (colsToUse.includes('ClosedDate')) row.ClosedDate = t.date_closed ? new Date(parseInt(t.date_closed)).toLocaleDateString() : '—';
      if (colsToUse.includes('IsBlocked')) row.IsBlocked = t.flags.isBlocked;
      if (colsToUse.includes('IsOverdue')) row.IsOverdue = t.flags.isOverdue;
      if (colsToUse.includes('IsSpillover')) row.IsSpillover = t.flags.isSpillover;
      
      return row;
    });
    exportToCSV(exportData, `TM_Labs_Report_${activeTab}_${periodLabel.replace(/\s/g, '_')}`);
  };

  const toggleColumn = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-h1 font-bold text-primary">Reporting Center</h1>
          <p className="text-body text-secondary">Director-level operations and delivery reporting</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab !== 'historical' && (
            <div className="flex items-center bg-card border border-slate-700/20 rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setOffset(o => o - 1)}
                className="p-2 hover:bg-elevated text-secondary hover:text-primary transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="px-4 py-2 text-caption font-bold text-primary border-x border-slate-700/10 min-w-[140px] text-center">
                {periodLabel}
              </div>
              <button 
                onClick={() => setOffset(o => o + 1)}
                className="p-2 hover:bg-elevated text-secondary hover:text-primary transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          <Button variant="primary" className="gap-2 flex-1 md:flex-initial" onClick={handleExport}>
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Customization Panel */}
      <div className="bg-card p-6 rounded-xl border border-slate-700/20 space-y-6 shadow-xl shadow-slate-950/20">
        <div className="flex justify-between items-center border-b border-slate-700/10 pb-4">
          <h3 className="text-label font-bold text-muted uppercase tracking-widest">Report Customization</h3>
          <div className="flex items-center gap-2">
            <label className="text-caption text-secondary">Show Assignee in Reports</label>
            <button 
              onClick={() => setShowAssignee(!showAssignee)}
              className={`w-10 h-5 rounded-full transition-colors relative ${showAssignee ? 'bg-brand-pink' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showAssignee ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-caption font-semibold text-secondary">Export Columns:</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {allColumns.map(col => (
              <label key={col} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  className="w-4 h-4 rounded border-slate-700 bg-secondary text-brand-pink focus:ring-brand-pink"
                />
                <span className="text-caption text-secondary group-hover:text-primary transition-colors">{col}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-700/20 gap-8">
        {[
          { id: 'weekly', label: 'Weekly Report', icon: CalendarDays },
          { id: 'monthly', label: 'Monthly Report', icon: CalendarRange },
          { id: 'historical', label: 'Historical Data', icon: History }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as Tab); setOffset(0); }}
            className={`pb-4 text-body font-medium transition-colors relative group ${activeTab === tab.id ? 'text-brand-pink' : 'text-secondary hover:text-primary'}`}
          >
            <div className="flex items-center gap-2">
              <tab.icon size={18} />
              {tab.label}
            </div>
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total in Period" value={periodTasks.length} color="kpi-blue" icon={CalendarDays} />
          <MetricCard label="Completed" value={completed} color="kpi-green" icon={CheckCircle2} />
          <MetricCard label="Blockers" value={blocked} color="kpi-red" icon={Ban} />
          <MetricCard label="Overdue/Spillover" value={overdue + spillovers} color="kpi-orange" icon={AlertCircle} />
        </div>

        {activeTab === 'monthly' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-card p-6 rounded-xl border border-slate-700/20">
              <h3 className="text-label font-bold text-muted uppercase tracking-widest mb-6">Efficiency Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-caption text-secondary">Completion Rate</span>
                    <span className="text-caption font-bold text-primary">{Math.round((completed / periodTasks.length) * 100) || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-brand-pink" style={{ width: `${(completed / periodTasks.length) * 100 || 0}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/30 border border-slate-700/10">
                    <div className="text-[10px] text-muted uppercase font-bold mb-1">Blocked Rate</div>
                    <div className="text-h3 font-bold text-red-500">{Math.round((blocked / periodTasks.length) * 100) || 0}%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30 border border-slate-700/10">
                    <div className="text-[10px] text-muted uppercase font-bold mb-1">Delayed Rate</div>
                    <div className="text-h3 font-bold text-orange-500">{Math.round(((overdue + spillovers) / periodTasks.length) * 100) || 0}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-slate-700/20">
               <h3 className="text-label font-bold text-muted uppercase tracking-widest mb-6">Period Insights</h3>
               <div className="flex flex-col justify-center h-full pb-12 text-center text-secondary">
                 <TrendingUp size={32} className="mx-auto mb-4 opacity-20" />
                 <p className="text-body italic">"Trend analysis shows high completion rates in Week 2, with blockers peaking in Week 3 due to project dependencies."</p>
               </div>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-h3 font-semibold text-primary">
              {activeTab === 'historical' ? 'All Workspace Data' : `${periodLabel} - Detail`}
            </h3>
            <span className="text-caption text-secondary">{periodTasks.length} tasks matching period</span>
          </div>
          <TaskTable tasks={periodTasks} />
        </section>
      </div>
    </div>
  );
}


