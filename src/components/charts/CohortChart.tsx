import React from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartContainer from './ChartContainer';

export interface CohortDatum {
  label: string;
  retention: number;
  learners: number;
}

interface CohortChartProps {
  title?: string;
  description?: string;
  data: CohortDatum[];
  className?: string;
}

const CohortChart: React.FC<CohortChartProps> = ({
  title,
  description,
  data,
  className,
}) => {
  return (
    <ChartContainer title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <ReBarChart data={data} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
            formatter={(value: number, _name, payload) => [`${value}%`, `${payload.payload.learners} learners`]}
            contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="retention" fill="#2563eb" radius={[16, 16, 0, 0]}>
            <LabelList dataKey="retention" position="top" formatter={(value: number) => `${value}%`} />
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default CohortChart;
