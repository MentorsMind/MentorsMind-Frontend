import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { ChartDatum } from '../../types/charts.types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

interface Props {
  weeklySessions: ChartDatum[];
  topLearners: ChartDatum[];
  skillBreakdown: ChartDatum[];
  height?: number;
}

export const EarningsChart: React.FC<Props> = ({
  weeklySessions,
  topLearners,
  skillBreakdown,
  height = 350,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Weekly Sessions Bar Chart */}
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h4 className="text-lg font-bold text-gray-900 mb-4">Sessions per Week</h4>
      <ResponsiveContainer width="100%" height={height / 2}>
        <BarChart data={weeklySessions.slice(-7)} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={12} />
          <YAxis tickLine={false} axisLine={false} tickMargin={12} />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Top Learners Pie Chart */}
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h4 className="text-lg font-bold text-gray-900 mb-4">Top Learners by Revenue</h4>
      <ResponsiveContainer width="100%" height={height / 2}>
        <PieChart>
          <Pie
            data={topLearners}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            nameKey="date"
            label={({ name, percent }) => `${name.slice(0, 8)} ${(percent * 100).toFixed(0)}%`}
          >
            {topLearners.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Skills Breakdown (full width on mobile) */}
    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h4 className="text-lg font-bold text-gray-900 mb-4">Earnings by Skill/Topic</h4>
      <ResponsiveContainer width="100%" height={height / 2}>
        <BarChart data={skillBreakdown} layout="vertical" margin={{ top: 20, right: 40, bottom: 20, left: 80 }}>
          <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis dataKey="date" type="category" tickLine={false} axisLine={false} tickMargin={8} width={120} />
          <Tooltip />
          <Bar dataKey="value" fill="#10B981" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

