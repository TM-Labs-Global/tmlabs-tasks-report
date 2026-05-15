'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface TrendLineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  areaFill?: boolean;
}

const chartTheme = {
  gridColor: '#263347',
  labelColor: '#94A3B8',
  tooltipBg: '#1E293B',
  tooltipBorder: '#334155',
  tooltipText: '#F1F5F9',
};

export function TrendLineChart({ data, color = '#FF3396', areaFill = true }: TrendLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] w-full flex items-center justify-center">
        <p className="text-secondary text-sm">No trend data available yet.</p>
      </div>
    );
  }

  if (areaFill) {
    return (
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.labelColor, fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.labelColor, fontSize: 11 }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartTheme.tooltipBg,
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                color: chartTheme.tooltipText,
                fontSize: '12px',
              }}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill="url(#trendGrad)"
              dot={{ fill: color, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: color, stroke: '#1E293B', strokeWidth: 2 }}
              name="Completed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: chartTheme.labelColor, fontSize: 11 }} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: chartTheme.labelColor, fontSize: 11 }} width={30} />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: '8px',
              color: chartTheme.tooltipText,
            }}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ fill: color, r: 4 }} name="Tasks" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
