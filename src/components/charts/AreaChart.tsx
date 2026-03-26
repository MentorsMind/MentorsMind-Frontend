import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartDatum } from '../../types/charts.types';

interface Props {
  data: ChartDatum[];
  height?: number;
  title: string;
  yLabel?: string;
}

export const AreaChartComponent: React.FC<Props> = ({
  data,
  height = 300,
  title,
  yLabel = 'Earnings ($)',
}) => {
  // Group by date and sum values by asset
  const groupedData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.date === item.date);
    if (existing) {
      existing.USDC = (existing.USDC || 0) + (item.asset === 'USDC' ? item.value : 0);
      existing.XLM = (existing.XLM || 0) + (item.asset === 'XLM' ? item.value : 0);
    } else {
      acc.push({
        date: item.date,
        USDC: item.asset === 'USDC' ? item.value : 0,
        XLM: item.asset === 'XLM' ? item.value : 0,
      });
    }
    return acc;
  }, [] as any[]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
          <XAxis 
            dataKey="date" 
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            height={60}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            label={{ 
              value: yLabel, 
              angle: -90, 
              position: 'insideLeft',
              fill: '#6B7280',
              fontSize: 12 
            }}
          />
          <Tooltip 
            contentStyle={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="USDC" 
            stackId="1"
            stroke="#3B82F6" 
            fill="#3B82F6"
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="XLM" 
            stackId="1"
            stroke="#10B981" 
            fill="#10B981"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

