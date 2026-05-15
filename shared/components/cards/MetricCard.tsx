import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color: string; // Hex color or tailwind color name
  icon: LucideIcon;
  onClick?: () => void;
}

export function MetricCard({ label, value, subtext, color, icon: Icon, onClick }: MetricCardProps) {
  // Determine if color is a hex or a tailwind class
  const isHex = color.startsWith('#');
  
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden bg-card rounded-xl p-5 border border-slate-700/20
        transition-all duration-150 ease-out cursor-pointer
        hover:bg-elevated hover:border-slate-700/40 group
      `}
      style={{ 
        borderTop: `3px solid ${isHex ? color : `var(--color-${color})`}`
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div 
          className="p-2 rounded-lg bg-opacity-10"
          style={{ backgroundColor: isHex ? `${color}1A` : `rgba(var(--color-${color}-rgb), 0.1)` }}
        >
          <Icon 
            size={24} 
            className="group-hover:scale-110 transition-transform duration-200"
            style={{ color: isHex ? color : `var(--color-${color})` }}
          />
        </div>
        {subtext && (
          <span className="text-caption text-secondary font-medium">
            {subtext}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-display font-bold tabular-nums text-primary leading-none">
          {value}
        </div>
        <div className="text-label text-secondary font-medium uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  );
}
