import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: Record<string, string | number>[];
  bars: { key: string; color?: string; label?: string }[];
  xKey: string;
  title?: string;
  height?: number;
}

export default function BarChart({ data, bars, xKey, title, height = 300 }: BarChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {bars.map(b => (
            <Bar key={b.key} dataKey={b.key} name={b.label ?? b.key} fill={b.color ?? '#6366f1'} radius={[4, 4, 0, 0]} />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
