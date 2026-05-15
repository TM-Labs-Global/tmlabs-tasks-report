'use client';

import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  horizontal?: boolean;
}

const chartTheme = {
  gridColor: '#263347',
  labelColor: '#94A3B8',
  tooltipBg: '#1E293B',
  tooltipBorder: '#263347',
  tooltipText: '#F1F5F9',
};

export function BarChart({ data, xKey, yKey, color = '#FF3396', horizontal = false }: BarChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={data} 
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
          {horizontal ? (
            <>
              <XAxis type="number" hide />
              <YAxis 
                dataKey={xKey} 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: chartTheme.labelColor, fontSize: 12 }}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey={xKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: chartTheme.labelColor, fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: chartTheme.labelColor, fontSize: 12 }}
              />
            </>
          )}
          <Tooltip 
            contentStyle={{ 
              backgroundColor: chartTheme.tooltipBg, 
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: '8px',
              color: chartTheme.tooltipText
            }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar 
            dataKey={yKey} 
            fill={color} 
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            barSize={horizontal ? 20 : 30}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
