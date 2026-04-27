import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartSeries, GroupBy } from '../../types/earnings.types';

interface EarningsChartProps {
  series: ChartSeries[];
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  currency: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-indigo-600 font-semibold">
        {payload[0].value.toFixed(2)} {currency}
      </p>
    </div>
  );
};

const GROUP_BY_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const EarningsChart: React.FC<EarningsChartProps> = ({ series, groupBy, onGroupByChange, currency }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Day / Week / Month toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Net Earnings</h3>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {GROUP_BY_OPTIONS.map((option, index) => (
            <button
              key={option.value}
              onClick={() => onGroupByChange(option.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                groupBy === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } ${index > 0 ? 'border-l border-gray-200' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            label={{ value: currency, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#6b7280' } }}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Bar dataKey="netPayout" fill="#6366f1" radius={[4, 4, 0, 0]} minPointSize={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EarningsChart;

