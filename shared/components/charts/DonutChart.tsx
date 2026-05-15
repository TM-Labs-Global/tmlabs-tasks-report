'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
}

export function DonutChart({ data }: DonutChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1E293B', 
              border: '1px solid #263347',
              borderRadius: '8px',
              color: '#F1F5F9'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#94A3B8' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
