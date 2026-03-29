import React from 'react';
import {
  Area,
  AreaChart as ReAreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartContainer from './ChartContainer';

export interface ForecastDatum {
  label: string;
  confirmed: number;
  forecast: number;
}

interface ForecastChartProps {
  title?: string;
  description?: string;
  data: ForecastDatum[];
  className?: string;
}

const ForecastChart: React.FC<ForecastChartProps> = ({
  title,
  description,
  data,
  className,
}) => {
  return (
    <ChartContainer title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <ReAreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="forecast-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="forecast" stroke="#0ea5e9" fill="url(#forecast-fill)" strokeWidth={2} name="Forecast" />
          <Line type="monotone" dataKey="confirmed" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 3 }} name="Recurring bookings" />
        </ReAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ForecastChart;
