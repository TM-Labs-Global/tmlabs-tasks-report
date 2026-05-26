'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CalendarPickerProps {
  currentStart: string | null;
  currentEnd: string | null;
  currentPreset?: string;
  onRangeSelect: (start: string | null, end: string | null, preset?: string) => void;
}

export function CalendarPicker({ onRangeSelect, currentStart, currentEnd, currentPreset }: CalendarPickerProps) {
  const [viewDate, setViewDate] = useState(currentStart ? new Date(currentStart) : new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

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

  // --- 15 Preset Range Calculators ---

  const getToday = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getYesterday = () => {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getThisWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.getFullYear(), today.getMonth(), diff, 0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start: monday, end };
  };

  const getLastWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const thisMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday, 0, 0, 0, 0);
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(lastMonday.getDate() - 7);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastSunday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);
    return { start: lastMonday, end: lastSunday };
  };

  const getLast2Weeks = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const thisMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday, 0, 0, 0, 0);
    const start = new Date(thisMonday);
    start.setDate(start.getDate() - 14);
    const end = new Date(thisMonday);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getThisMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getLastMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  };

  const getLast30Days = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getLast60Days = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 59);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getLast90Days = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 89);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getLast6Months = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate(), 0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getLast12Months = () => {
    const today = new Date();
    const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getThisYear = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getLastYear = () => {
    const today = new Date();
    const start = new Date(today.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
    const end = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    return { start, end };
  };

  const getAllTime = () => {
    return { start: null, end: null };
  };

  // Preset configuration list
  const presetsList = [
    { label: 'Today', fn: getToday },
    { label: 'Yesterday', fn: getYesterday },
    { label: 'This Week (Mon – today)', fn: getThisWeek },
    { label: 'Last Week', fn: getLastWeek },
    { label: 'Last 2 Weeks', fn: getLast2Weeks },
    { label: 'This Month', fn: getThisMonth },
    { label: 'Last Month', fn: getLastMonth },
    { label: 'Last 30 Days', fn: getLast30Days },
    { label: 'Last 60 Days', fn: getLast60Days },
    { label: 'Last 90 Days', fn: getLast90Days },
    { label: 'Last 6 Months', fn: getLast6Months },
    { label: 'Last 12 Months', fn: getLast12Months },
    { label: 'This Year', fn: getThisYear },
    { label: 'Last Year', fn: getLastYear },
    { label: 'All Time', fn: getAllTime }
  ];

  const applyPreset = (preset: typeof presetsList[0]) => {
    const { start, end } = preset.fn();
    if (start === null && end === null) {
      onRangeSelect(null, null, 'All Time');
    } else {
      onRangeSelect(start.toISOString(), end.toISOString(), preset.label);
    }
    setIsOpen(false);
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 0, 0, 0);
    
    if (!currentStart || (currentStart && currentEnd)) {
      // First click: select start date
      onRangeSelect(clickedDate.toISOString(), null, 'Custom Range');
    } else {
      // Second click: select end date
      const start = new Date(currentStart);
      if (clickedDate < start) {
        // If clicked date is before start date, set it as new start date
        onRangeSelect(clickedDate.toISOString(), null, 'Custom Range');
      } else {
        // Set end date to 23:59:59 of the clicked day
        const end = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 23, 59, 59, 999);
        onRangeSelect(currentStart, end.toISOString(), 'Custom Range');
        setIsOpen(false);
      }
    }
  };

  const isSameDayDate = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const checkDayState = (day: number | null) => {
    if (!day) return { isSelected: false, isStart: false, isEnd: false, isInRange: false };
    
    const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    
    const start = currentStart ? new Date(currentStart) : null;
    const end = currentEnd ? new Date(currentEnd) : null;
    
    const isStart = start ? isSameDayDate(cellDate, start) : false;
    const isEnd = end ? isSameDayDate(cellDate, end) : false;
    const isSelected = isStart || isEnd;
    
    let isInRange = false;
    if (start && end) {
      isInRange = cellDate > start && cellDate < end;
    } else if (start && hoverDate && !end) {
      isInRange = cellDate > start && cellDate <= hoverDate;
    }
    
    return { isSelected, isStart, isEnd, isInRange };
  };

  const getButtonText = () => {
    if (!currentStart && !currentEnd) {
      return "All Time — Full Workspace";
    }

    const start = new Date(currentStart!);
    const end = currentEnd ? new Date(currentEnd) : null;

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (!end) {
      // Single date selected so far
      return `${currentPreset || 'Custom Range'}: ${startStr} – Picking...`;
    }

    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const yearSuffix = start.getFullYear() === end.getFullYear() ? `, ${start.getFullYear()}` : '';

    const label = currentPreset || 'Custom Range';
    
    const dateRangeStr = start.getFullYear() === end.getFullYear()
      ? `${startStr} – ${endStr}${yearSuffix}`
      : `${startStr}, ${start.getFullYear()} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return `${label}: ${dateRangeStr}`;
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = [];
  const startOffset = firstDayOfMonth(year, month);
  const totalDays = daysInMonth(year, month);

  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-secondary border border-slate-700/30 rounded-xl px-4 py-2 text-caption text-primary focus:outline-none focus:border-brand-pink/50 transition-all cursor-pointer shadow-inner min-w-[240px] max-w-[340px]"
      >
        <CalendarIcon size={14} className="text-brand-pink shrink-0" />
        <span className="truncate">{getButtonText()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-card border border-slate-700/30 rounded-2xl p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row gap-6 min-w-[320px] md:min-w-[580px]">
          {/* Presets Sidebar - Scrollable for the extended presets */}
          <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-700/20 pb-4 md:pb-0 md:pr-6 shrink-0 w-full md:w-44 max-h-[350px] overflow-y-auto no-scrollbar">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 hidden md:block">Presets</span>
            <div className="grid grid-cols-2 md:flex md:flex-col gap-1.5 w-full">
              {presetsList.map((preset) => {
                const isActive = currentPreset === preset.label || (!currentStart && !currentEnd && preset.label === 'All Time');
                return (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`text-left px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                      isActive 
                        ? 'bg-brand-pink/20 text-brand-pink border-brand-pink/30' 
                        : 'text-secondary hover:bg-brand-pink/10 hover:text-brand-pink border-transparent'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Picker Panel */}
          <div className="flex-1">
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
                <h4 className="text-h3 font-serif italic text-primary">{monthNames[month]}</h4>
                <p className="text-caption font-bold text-muted tracking-[0.2em]">{year}</p>
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

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 mb-2 text-center font-medium">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-[10px] font-bold text-muted py-2">{d}</div>
              ))}
              {days.map((day, idx) => {
                const { isSelected, isStart, isEnd, isInRange } = checkDayState(day);
                return (
                  <div 
                    key={idx}
                    onClick={() => day && handleDayClick(day)}
                    onMouseEnter={() => day && setHoverDate(new Date(year, month, day))}
                    onMouseLeave={() => setHoverDate(null)}
                    className={`
                      text-center py-2 text-caption cursor-pointer transition-all relative flex items-center justify-center h-8 w-full
                      ${!day ? 'invisible pointer-events-none' : 'hover:bg-brand-pink/20 hover:text-brand-pink'}
                      ${isStart ? 'bg-brand-pink text-white font-bold rounded-l-lg z-10' : ''}
                      ${isEnd ? 'bg-brand-pink text-white font-bold rounded-r-lg z-10' : ''}
                      ${isStart && isEnd ? 'rounded-lg' : ''}
                      ${isInRange ? 'bg-brand-pink/10 text-brand-pink rounded-none' : 'rounded-lg'}
                      ${!isSelected && !isInRange ? 'text-secondary' : ''}
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/10 text-[10px] text-muted">
              <span>Click start then end date to select range.</span>
              <button 
                onClick={() => { onRangeSelect(null, null, 'All Time'); setIsOpen(false); }}
                className="text-brand-pink font-bold uppercase hover:underline"
              >
                Clear Range (All Time)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
