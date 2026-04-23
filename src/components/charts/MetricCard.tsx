import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage
  icon?: ReactNode;
  prefix?: string;
  suffix?: string;
}

export default function MetricCard({ title, value, change, icon, prefix, suffix }: MetricCardProps) {
  const positive = change !== undefined && change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {prefix}{value}{suffix}
      </p>
      {change !== undefined && (
        <p className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ? '↑' : '↓'} {Math.abs(change)}% vs last month
        </p>
      )}
    </div>
  );
}
