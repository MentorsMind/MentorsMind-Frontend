import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  data: Record<string, string | number>[];
  lines: { key: string; color?: string; label?: string }[];
  xKey: string;
  title?: string;
  height?: number;
}

export default function LineChart({ data, lines, xKey, title, height = 300 }: LineChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {lines.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.label ?? l.key}
              stroke={l.color ?? '#6366f1'} strokeWidth={2} dot={false} />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
