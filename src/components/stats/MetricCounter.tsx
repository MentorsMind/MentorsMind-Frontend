import React, { useEffect, useState } from 'react';

interface MetricCounterProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const MetricCounter: React.FC<MetricCounterProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const duration = 900;
    const startedAt = performance.now();

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      setDisplayValue(value * progress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <div className={`rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-4 text-4xl font-black tracking-tight text-slate-950">
        {prefix}
        {displayValue.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </p>
    </div>
  );
};

export default MetricCounter;
