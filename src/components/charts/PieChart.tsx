import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface PieChartProps {
  data: { name?: string; label?: string; value: number; color?: string }[];
  title?: string;
  description?: string;
  height?: number;
}

export default function PieChart({ data, title, description, height = 300 }: PieChartProps) {
  const chartData = data.map(d => ({
    name: d.name || d.label || 'Unknown',
    value: d.value,
    color: d.color
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>}
      {description && <p className="text-xs text-gray-500 mb-4">{description}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <RePieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}
