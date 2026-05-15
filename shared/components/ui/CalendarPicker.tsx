'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CalendarPickerProps {
  onRangeSelect: (start: string | null, end: string | null) => void;
  currentStart: string | null;
}

export function CalendarPicker({ onRangeSelect, currentStart }: CalendarPickerProps) {
  const [viewDate, setViewDate] = useState(currentStart ? new Date(currentStart) : new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'days' | 'months'>('days');

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  const selectMonth = (monthIdx?: number) => {
    const targetMonth = monthIdx !== undefined ? monthIdx : viewDate.getMonth();
    const start = new Date(viewDate.getFullYear(), targetMonth, 1).toISOString();
    const end = new Date(viewDate.getFullYear(), targetMonth + 1, 0, 23, 59, 59).toISOString();
    
    if (monthIdx !== undefined) {
      setViewDate(new Date(viewDate.getFullYear(), monthIdx, 1));
      setMode('days');
    } else {
      onRangeSelect(start, end);
      setIsOpen(false);
    }
  };

  const selectDay = (day: number) => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 0, 0, 0).toISOString();
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 23, 59, 59).toISOString();
    onRangeSelect(start, end);
    setIsOpen(false);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = [];
  const startOffset = firstDayOfMonth(year, month);
  const totalDays = daysInMonth(year, month);

  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const isSelected = (day: number | null) => {
    if (!day || !currentStart) return false;
    const d = new Date(currentStart);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  };

  const isMonthSelected = (idx: number) => {
    if (!currentStart) return false;
    const d = new Date(currentStart);
    return d.getFullYear() === year && d.getMonth() === idx;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-secondary border border-slate-700/30 rounded-xl px-4 py-2 text-caption text-primary focus:outline-none focus:border-brand-pink/50 transition-all cursor-pointer shadow-inner min-w-[160px]"
      >
        <CalendarIcon size={14} className="text-brand-pink" />
        {currentStart ? new Date(currentStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Period'}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-card border border-slate-700/30 rounded-2xl p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 min-w-[320px]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-1">
              <button onClick={handlePrevYear} className="p-1 hover:bg-secondary rounded-full text-muted hover:text-primary transition-all">
                <ChevronsLeft size={16} />
              </button>
              <button onClick={handlePrevMonth} className="p-1 hover:bg-secondary rounded-full text-secondary hover:text-primary transition-all">
                <ChevronLeft size={18} />
              </button>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setMode(mode === 'days' ? 'months' : 'days')}
                className="hover:text-brand-pink transition-colors group"
              >
                <h4 className="text-h3 font-serif italic text-primary group-hover:text-brand-pink">{monthNames[month]}</h4>
                <p className="text-caption font-bold text-muted tracking-[0.2em]">{year}</p>
              </button>
            </div>

            <div className="flex gap-1">
              <button onClick={handleNextMonth} className="p-1 hover:bg-secondary rounded-full text-secondary hover:text-primary transition-all">
                <ChevronRight size={18} />
              </button>
              <button onClick={handleNextYear} className="p-1 hover:bg-secondary rounded-full text-muted hover:text-primary transition-all">
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>

          {mode === 'days' ? (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-muted py-2">{d}</div>
                ))}
                {days.map((day, idx) => (
                  <div 
                    key={idx}
                    onClick={() => day && selectDay(day)}
                    className={`
                      text-center py-2 text-caption rounded-lg cursor-pointer transition-all
                      ${!day ? 'invisible' : 'hover:bg-brand-pink/10 hover:text-brand-pink'}
                      ${isSelected(day) ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' : 'text-secondary'}
                    `}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => selectMonth()}
                className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-pink border border-brand-pink/20 rounded-xl hover:bg-brand-pink hover:text-white transition-all"
              >
                Select Full Month
              </button>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-2 py-4">
              {monthNames.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => selectMonth(idx)}
                  className={`
                    py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all
                    ${isMonthSelected(idx) ? 'bg-brand-pink text-white' : 'bg-secondary/40 text-secondary hover:bg-secondary hover:text-primary'}
                  `}
                >
                  {m.substring(0, 3)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
