import React from 'react';

interface ProgressRingProps {
  value: number;
  radius?: number;
  stroke?: number;
  label?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ value, radius = 52, stroke = 10, label }) => {
  const normalizedValue = Math.max(0, Math.min(value, 100));
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#2563eb"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.35s' }}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#111827"
          className="text-sm font-black"
        >
          {normalizedValue}%
        </text>
      </svg>
      <div className="ml-4 text-left">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{label || 'Completion'}</p>
        <p className="text-base font-bold text-gray-900">{normalizedValue}%</p>
      </div>
    </div>
  );
};

export default ProgressRing;
