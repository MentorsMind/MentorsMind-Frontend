import React from 'react';
import ChartContainer from './ChartContainer';

export interface GeoMapPoint {
  label: string;
  value: number;
  x: number;
  y: number;
  detail?: string;
}

interface GeoDistributionMapProps {
  title?: string;
  description?: string;
  data: GeoMapPoint[];
  className?: string;
}

const REGIONS = [
  { id: 'na', x: 10, y: 18, width: 22, height: 22, fill: '#dbeafe' },
  { id: 'sa', x: 24, y: 50, width: 14, height: 22, fill: '#e0f2fe' },
  { id: 'eu', x: 44, y: 18, width: 12, height: 12, fill: '#ede9fe' },
  { id: 'af', x: 46, y: 34, width: 14, height: 24, fill: '#fef3c7' },
  { id: 'asia', x: 60, y: 18, width: 24, height: 24, fill: '#dcfce7' },
  { id: 'oceania', x: 80, y: 56, width: 10, height: 10, fill: '#fee2e2' },
];

const GeoDistributionMap: React.FC<GeoDistributionMapProps> = ({
  title,
  description,
  data,
  className,
}) => {
  const maxValue = Math.max(...data.map((point) => point.value), 1);

  return (
    <ChartContainer title={title} description={description} className={className}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <div className="rounded-[2rem] bg-slate-50 p-4">
          <svg viewBox="0 0 100 78" className="h-[280px] w-full" role="img" aria-label="Geographic distribution map">
            {REGIONS.map((region) => (
              <rect
                key={region.id}
                x={region.x}
                y={region.y}
                width={region.width}
                height={region.height}
                rx="6"
                fill={region.fill}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            ))}
            {data.map((point) => {
              const radius = 3 + (point.value / maxValue) * 4;
              return (
                <g key={point.label}>
                  <circle cx={point.x} cy={point.y} r={radius + 1.5} fill="rgba(15, 23, 42, 0.12)" />
                  <circle cx={point.x} cy={point.y} r={radius} fill="#2563eb" />
                  <text x={point.x} y={point.y - radius - 2} textAnchor="middle" fontSize="3" fill="#0f172a">
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-3">
          {data.map((point) => (
            <div key={point.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{point.label}</p>
                  {point.detail && <p className="text-xs text-slate-500">{point.detail}</p>}
                </div>
                <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">{point.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
};

export default GeoDistributionMap;
