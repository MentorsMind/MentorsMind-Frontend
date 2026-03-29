import React from 'react';
import ChartContainer from './ChartContainer';

export interface HeatmapDatum {
  day: string;
  hour: number;
  value: number;
}

interface HeatmapChartProps {
  title?: string;
  description?: string;
  days: string[];
  hours: number[];
  data: HeatmapDatum[];
  className?: string;
}

const BASE_COLOR = [14, 165, 233];

function getCellColor(value: number, max: number) {
  if (max === 0 || value === 0) {
    return 'rgba(226, 232, 240, 0.55)';
  }

  const intensity = value / max;
  return `rgba(${BASE_COLOR[0]}, ${BASE_COLOR[1]}, ${BASE_COLOR[2]}, ${0.18 + intensity * 0.82})`;
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 || 12;
  return `${normalized}${suffix}`;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  title,
  description,
  days,
  hours,
  data,
  className,
}) => {
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  return (
    <ChartContainer title={title} description={description} className={className}>
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[640px] gap-2"
          style={{ gridTemplateColumns: `96px repeat(${hours.length}, minmax(0, 1fr))` }}
        >
          <div />
          {hours.map((hour) => (
            <div key={hour} className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              {formatHour(hour)}
            </div>
          ))}

          {days.map((day) => (
            <React.Fragment key={day}>
              <div className="flex items-center text-sm font-semibold text-gray-500">{day}</div>
              {hours.map((hour) => {
                const item = data.find((entry) => entry.day === day && entry.hour === hour);
                const value = item?.value ?? 0;

                return (
                  <div
                    key={`${day}-${hour}`}
                    className="group relative h-12 rounded-2xl border border-white/70 shadow-sm"
                    style={{ backgroundColor: getCellColor(value, maxValue) }}
                    aria-label={`${day} ${formatHour(hour)}: ${value} bookings`}
                    role="img"
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700/80">
                      {value || ''}
                    </span>
                    <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                      {day}, {formatHour(hour)}: {value}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
};

export default HeatmapChart;
