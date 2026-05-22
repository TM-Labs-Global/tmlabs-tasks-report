'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  CalendarRange, 
  History, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Ban,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { SetupScreen } from '@/shared/components/ui/SetupScreen';
import { generateStyledReport } from '@/shared/utils/excelReport';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { useFilteredTasks } from '@/shared/hooks/useFilteredTasks';
import { useFilters } from '@/shared/context/FilterContext';
import { MetricCard } from '@/shared/components/cards/MetricCard';
import { TaskTable } from '@/shared/components/tables/TaskTable';
import { ExportModal } from '@/shared/components/modals/ExportModal';
import { MetricTasksModal } from '@/shared/components/modals/MetricTasksModal';

type Tab = 'weekly' | 'monthly' | 'quarterly' | 'all';

export default function ReportingCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('weekly');
  const [offset, setOffset] = useState(0); 
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<{ title: string; tasks: any[] } | null>(null);
  
  const { isLoading, error, isConfigured } = useClickUp();
  const tasks = useFilteredTasks();
  const { filters, setFilters } = useFilters();

  // Sync helper function to set global filters
  const updatePeriodRange = (tab: Tab, currentOffset: number) => {
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

    setFilters(prev => ({
      ...prev,
      startDate: startStr,
      endDate: endStr
    }));
  };

  // Sync the date range on mount
  useEffect(() => {
    updatePeriodRange('weekly', 0);
  }, []);

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

  if (!isConfigured && !isLoading) return <SetupScreen />;

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

  // Period label derivation
  const startObj = filters.startDate ? new Date(filters.startDate) : null;
  const endObj = filters.endDate ? new Date(filters.endDate) : null;

  let periodLabel = 'All Workspace Data';
  if (activeTab === 'weekly' && startObj) {
    periodLabel = `Week of ${startObj.toLocaleDateString()}`;
  } else if (activeTab === 'monthly' && startObj) {
    periodLabel = startObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (activeTab === 'quarterly' && startObj) {
    const q = Math.floor(startObj.getMonth() / 3) + 1;
    periodLabel = `Q${q} ${startObj.getFullYear()}`;
  }

  // --- Metrics Calculation ---
  const completedTasks = tasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed'));
  const completed = completedTasks.length;

  const blockedTasks = tasks.filter(t => t.flags.isBlocked);
  const blocked = blockedTasks.length;

  const overdueTasks = tasks.filter(t => t.flags.isOverdue);
  const spilloversTasks = tasks.filter(t => t.flags.isSpillover);
  const delayedTasks = tasks.filter(t => t.flags.isOverdue || t.flags.isSpillover);
  const delayed = delayedTasks.length;

  const handleExport = (type: 'weekly' | 'monthly' | 'quarterly', showAssignee: boolean) => {
    generateStyledReport(tasks, type, periodLabel, startObj || new Date(0), endObj || new Date(), showAssignee);
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-h1 font-bold text-primary">Reporting Center</h1>
          <p className="text-body text-secondary">Premium operations and delivery reporting</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab !== 'all' && (
            <div className="flex items-center bg-card border border-slate-700/20 rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => handleOffsetChange(o => o - 1)}
                className="p-2 hover:bg-elevated text-secondary hover:text-primary transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="px-4 py-2 text-caption font-bold text-primary border-x border-slate-700/10 min-w-[140px] text-center">
                {periodLabel}
              </div>
              <button 
                onClick={() => handleOffsetChange(o => o + 1)}
                className="p-2 hover:bg-elevated text-secondary hover:text-primary transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          <Button 
            variant="primary" 
            className="gap-2 flex-1 md:flex-initial bg-brand-navy shadow-lg shadow-brand-navy/20" 
            onClick={() => setIsExportModalOpen(true)}
          >
            <FileSpreadsheet size={18} />
            Download Report
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-700/20 gap-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'weekly', label: 'Weekly', icon: CalendarDays },
          { id: 'monthly', label: 'Monthly', icon: CalendarRange },
          { id: 'quarterly', label: 'Quarterly', icon: Layers },
          { id: 'all', label: 'All Tasks', icon: History }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => handleTabChange(tab.id as Tab)}
            className={`pb-4 text-body font-medium transition-colors relative group whitespace-nowrap ${activeTab === tab.id ? 'text-brand-pink' : 'text-secondary hover:text-primary'}`}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total in Period" value={tasks.length} color="kpi-blue" icon={CalendarDays} onClick={() => setSelectedMetric({ title: 'Total tasks in Period', tasks })} />
          <MetricCard label="Completed" value={completed} color="kpi-green" icon={CheckCircle2} onClick={() => setSelectedMetric({ title: 'Completed Tasks', tasks: completedTasks })} />
          <MetricCard label="Blockers" value={blocked} color="kpi-red" icon={Ban} onClick={() => setSelectedMetric({ title: 'Blocked Tasks', tasks: blockedTasks })} />
          <MetricCard label="Delayed/Spilled" value={delayed} color="kpi-orange" icon={AlertCircle} onClick={() => setSelectedMetric({ title: 'Delayed / Spillover Tasks', tasks: delayedTasks })} />
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-h3 font-semibold text-primary">
              {activeTab === 'all' ? 'Full Workspace Inventory' : `${periodLabel} - Dashboard View`}
            </h3>
            <span className="text-caption text-secondary">{tasks.length} tasks matching current view</span>
          </div>
          <TaskTable tasks={tasks} />
        </section>
      </div>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        currentPeriod={periodLabel}
      />

      {/* Metric Tasks List Modal */}
      {selectedMetric && (
        <MetricTasksModal
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
          title={selectedMetric.title}
          tasks={selectedMetric.tasks}
        />
      )}
    </div>
  );
}
