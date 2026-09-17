'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';

interface DatePickerProps {
  value?: string | null; // ISO string 'YYYY-MM-DD' or full ISO
  onChange: (dateStr: string | null) => void;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
  showClear?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  align = 'left',
  showClear = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? (value.includes('T') ? parseISO(value) : new Date(value + 'T00:00:00')) : null;
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      setViewDate(selectedDate);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelectDate = (d: number) => {
    const dObj = new Date(year, month, d);
    const dateStr = format(dObj, 'yyyy-MM-dd');
    onChange(dateStr);
    setIsOpen(false);
  };

  const handlePreset = (daysFromToday: number) => {
    const target = addDays(new Date(), daysFromToday);
    onChange(format(target, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const formattedDisplay = selectedDate && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'MMM d, yyyy')
    : null;

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-bg-elevated border border-border-default text-primary hover:border-brand-pink/60 transition-all cursor-pointer w-full justify-between focus:outline-none focus:ring-1 focus:ring-brand-pink/50"
      >
        <div className="flex items-center gap-1.5 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-brand-pink flex-shrink-0" />
          <span className={formattedDisplay ? 'text-primary font-medium' : 'text-secondary/70'}>
            {formattedDisplay || placeholder}
          </span>
        </div>
        {showClear && value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="p-0.5 hover:text-red-400 text-secondary transition-colors"
            title="Clear date"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Popup Calendar Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-64 p-3 bg-bg-card border border-border-default rounded-xl shadow-2xl backdrop-blur-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ minWidth: '260px' }}
        >
          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-1 pb-2.5 mb-2.5 border-b border-border-default/60">
            <button
              type="button"
              onClick={() => handlePreset(0)}
              className="px-2 py-1 text-[11px] font-semibold rounded bg-white/5 hover:bg-brand-pink/20 hover:text-brand-pink text-secondary transition-colors text-center"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handlePreset(1)}
              className="px-2 py-1 text-[11px] font-semibold rounded bg-white/5 hover:bg-brand-pink/20 hover:text-brand-pink text-secondary transition-colors text-center"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handlePreset(7)}
              className="px-2 py-1 text-[11px] font-semibold rounded bg-white/5 hover:bg-brand-pink/20 hover:text-brand-pink text-secondary transition-colors text-center"
            >
              Next Week
            </button>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-primary">
              {format(viewDate, 'MMMM yyyy')}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded hover:bg-white/10 text-secondary hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded hover:bg-white/10 text-secondary hover:text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <span key={day} className="text-[10px] font-bold text-secondary/60">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for first day padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const isSelected = selectedDate && isSameDay(dateObj, selectedDate);
              const isToday = isSameDay(dateObj, new Date());

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDate(dayNum)}
                  className={`h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-pink text-white font-bold shadow-md shadow-brand-pink/30 scale-105'
                      : isToday
                      ? 'border border-brand-pink/60 text-brand-pink hover:bg-brand-pink/10'
                      : 'text-primary hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
