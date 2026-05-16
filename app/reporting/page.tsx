'use client';

import { useState } from 'react';
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
import { MetricCard } from '@/shared/components/cards/MetricCard';
import { TaskTable } from '@/shared/components/tables/TaskTable';
import { ExportModal } from '@/shared/components/modals/ExportModal';

type Tab = 'weekly' | 'monthly' | 'quarterly' | 'all';

export default function ReportingCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('weekly');
  const [offset, setOffset] = useState(0); 
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const { isLoading, error, token } = useClickUp();
  const tasks = useFilteredTasks();

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
  let startDate = new Date(0); 
  let endDate = new Date(8640000000000000); 
  let periodLabel = 'All Workspace Data';

  if (activeTab === 'weekly') {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    startDate = new Date(d.setDate(diff + (offset * 7)));
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    periodLabel = `Week of ${startDate.toLocaleDateString()}`;
  } else if (activeTab === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    periodLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (activeTab === 'quarterly') {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const qStartMonth = (currentQuarter + offset) * 3;
    startDate = new Date(now.getFullYear(), qStartMonth, 1);
    endDate = new Date(now.getFullYear(), qStartMonth + 3, 0);
    periodLabel = `Q${((currentQuarter + offset) % 4) + 1} ${startDate.getFullYear()}`;
  }

  const periodTasks = tasks.filter(t => {
    if (activeTab === 'all') return true;
    if (!t.dueDate && !t.due_date_raw) return false;
    const taskDate = t.due_date_raw ? new Date(t.due_date_raw) : new Date(t.dueDate!);
    return taskDate >= startDate && taskDate <= endDate;
  });

  const completed = periodTasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done')).length;
  const blocked = periodTasks.filter(t => t.flags.isBlocked).length;
  const overdue = periodTasks.filter(t => t.flags.isOverdue).length;
  const spillovers = periodTasks.filter(t => t.flags.isSpillover).length;

  const handleExport = (type: 'weekly' | 'monthly' | 'quarterly', showAssignee: boolean) => {
    generateStyledReport(periodTasks, type, periodLabel, startDate, endDate, showAssignee);
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
            onClick={() => { setActiveTab(tab.id as Tab); setOffset(0); }}
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
          <MetricCard label="Total in Period" value={periodTasks.length} color="kpi-blue" icon={CalendarDays} />
          <MetricCard label="Completed" value={completed} color="kpi-green" icon={CheckCircle2} />
          <MetricCard label="Blockers" value={blocked} color="kpi-red" icon={Ban} />
          <MetricCard label="Delayed/Spilled" value={overdue + spillovers} color="kpi-orange" icon={AlertCircle} />
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-h3 font-semibold text-primary">
              {activeTab === 'all' ? 'Full Workspace Inventory' : `${periodLabel} - Dashboard View`}
            </h3>
            <span className="text-caption text-secondary">{periodTasks.length} tasks matching current view</span>
          </div>
          <TaskTable tasks={periodTasks} />
        </section>
      </div>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        currentPeriod={periodLabel}
      />
    </div>
  );
}
