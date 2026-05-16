import React from 'react';
import { Modal } from '../ui/Modal';
import { FileSpreadsheet, CalendarDays, CalendarRange, Layers, UserCheck, UserX } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (type: 'weekly' | 'monthly' | 'quarterly', showAssignee: boolean) => void;
  currentPeriod: string;
}

export function ExportModal({ isOpen, onClose, onExport, currentPeriod }: ExportModalProps) {
  const [selectedType, setSelectedType] = React.useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [showAssignee, setShowAssignee] = React.useState(true);

  const options = [
    { id: 'weekly', label: 'Weekly Tracker', icon: CalendarDays, desc: 'W1-W4 breakdown + Mon-Fri grid.' },
    { id: 'monthly', label: 'Monthly Report', icon: CalendarRange, desc: 'Month-at-a-glance delivery metrics.' },
    { id: 'quarterly', label: 'Quarterly Summary', icon: Layers, desc: 'Strategic rollup of Q performance.' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Premium Report">
      <div className="max-w-md mx-auto space-y-6">
        <div className="p-4 bg-secondary/30 rounded-xl border border-slate-700/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-muted uppercase font-bold tracking-widest">Active Period</div>
            <div className="text-body font-bold text-primary">{currentPeriod}</div>
          </div>
          <div className="p-2 rounded-lg bg-brand-pink/10 text-brand-pink">
            <FileSpreadsheet size={20} />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-caption font-bold text-muted uppercase tracking-widest">Select Format</p>
          <div className="grid grid-cols-1 gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedType(opt.id as any)}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left group ${
                  selectedType === opt.id 
                    ? 'bg-brand-pink/5 border-brand-pink ring-1 ring-brand-pink/20' 
                    : 'bg-elevated/40 border-slate-700/10 hover:border-slate-700/30'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  selectedType === opt.id ? 'bg-brand-pink text-white' : 'bg-secondary text-secondary group-hover:text-primary'
                }`}>
                  <opt.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-caption font-bold text-primary">{opt.label}</div>
                  <div className="text-[11px] text-muted truncate">{opt.desc}</div>
                </div>
                {selectedType === opt.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-pink shadow-lg shadow-brand-pink/50" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-secondary/20 border border-slate-700/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-elevated text-secondary">
              {showAssignee ? <UserCheck size={16} /> : <UserX size={16} />}
            </div>
            <span className="text-caption font-bold text-primary uppercase tracking-wider">Include Assignees</span>
          </div>
          <button 
            onClick={() => setShowAssignee(!showAssignee)}
            className={`w-10 h-5 rounded-full transition-all relative ${showAssignee ? 'bg-brand-pink shadow-lg shadow-brand-pink/20' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-md ${showAssignee ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-700/10">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-elevated border border-slate-700/20 text-caption font-bold text-primary hover:bg-slate-700/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onExport(selectedType, showAssignee)}
            className="flex-[1.5] py-3 rounded-xl bg-brand-pink text-white text-caption font-bold hover:bg-opacity-90 shadow-xl shadow-brand-pink/20 flex items-center justify-center gap-2"
          >
            Download XLSX
          </button>
        </div>
      </div>
    </Modal>
  );
}
