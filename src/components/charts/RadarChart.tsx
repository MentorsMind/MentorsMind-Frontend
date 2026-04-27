import React from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as ReRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import ChartContainer from './ChartContainer';

export interface RadarDatum {
  label: string;
  score: number;
}

interface RadarChartProps {
  title?: string;
  description?: string;
  data: RadarDatum[];
  className?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({
  title,
  description,
  data,
  className,
}) => {
  return (
    <ChartContainer title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <ReRadarChart data={data}>
          <PolarGrid stroke="#cbd5e1" />
          <PolarAngleAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Radar dataKey="score" name="Progress" stroke="#2563eb" fill="#60a5fa" fillOpacity={0.35} strokeWidth={2} />
          <Tooltip formatter={(value: number) => `${value}%`} />
        </ReRadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default RadarChart;
