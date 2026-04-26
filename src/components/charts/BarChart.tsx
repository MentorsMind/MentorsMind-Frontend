import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: Record<string, string | number>[];
  bars?: { key: string; color?: string; label?: string }[];
  series?: { key: string; color?: string; name?: string }[];
  xKey?: string;
  xAxisKey?: string;
  title?: string;
  description?: string;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

export default function BarChart({ data, bars, series, xKey, xAxisKey, title, description, height = 300, valuePrefix = '', valueSuffix = '' }: BarChartProps) {
  const chartBars = bars || series?.map(s => ({ key: s.key, color: s.color, label: s.name })) || [];
  const actualXKey = xKey || xAxisKey || Object.keys(data[0] || {})[0] || 'name';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>}
      {description && <p className="text-xs text-gray-500 mb-4">{description}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={actualXKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${valuePrefix}${value}${valueSuffix}`} />
          <Tooltip formatter={(value: any) => `${valuePrefix}${value}${valueSuffix}`} />
          <Legend />
          {chartBars.map(b => (
            <Bar key={b.key} dataKey={b.key} name={b.label ?? b.key} fill={b.color ?? '#6366f1'} radius={[4, 4, 0, 0]} />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
