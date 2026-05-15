'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TeamWorkloadChartProps {
  data: { name: string; tasks: number }[];
}

const chartTheme = {
  gridColor: '#263347',
  labelColor: '#94A3B8',
  tooltipBg: '#1E293B',
  tooltipBorder: '#334155',
  tooltipText: '#F1F5F9',
};

const MEMBER_COLORS = [
  '#FF3396', '#6633FF', '#3B82F6', '#22C55E',
  '#F59E0B', '#F97316', '#A855F7', '#14B8A6',
];

export function TeamWorkloadChart({ data }: TeamWorkloadChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] w-full flex items-center justify-center">
        <p className="text-secondary text-sm">No member data available.</p>
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 8, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.labelColor, fontSize: 11 }}
          />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.labelColor, fontSize: 12 }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: '8px',
              color: chartTheme.tooltipText,
              fontSize: '12px',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            formatter={(val: any) => [`${val} tasks`, 'Open Tasks']}
          />
          <Bar dataKey="tasks" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={MEMBER_COLORS[index % MEMBER_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
