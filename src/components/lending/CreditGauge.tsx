import React, { useEffect, useState } from 'react';

interface CreditGaugeProps {
  score: number; // 300–850
}

// Maps score (300–850) → colour stop on red→yellow→green
function scoreToColor(score: number): string {
  const pct = (score - 300) / (850 - 300); // 0..1
  if (pct < 0.4) return '#ef4444';         // red
  if (pct < 0.6) return '#f59e0b';         // yellow
  if (pct < 0.75) return '#84cc16';        // lime
  return '#22c55e';                         // green
}

function scoreLabel(score: number): string {
  if (score < 580) return 'Poor';
  if (score < 670) return 'Fair';
  if (score < 740) return 'Good';
  if (score < 800) return 'Very Good';
  return 'Exceptional';
}

const CreditGauge: React.FC<CreditGaugeProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(300);

  // Animate score fill on mount
  useEffect(() => {
    const start = 300;
    const end = score;
    const duration = 1200;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [score]);

  // SVG arc params
  const cx = 120;
  const cy = 120;
  const r = 90;
  const strokeWidth = 16;

  // Arc spans 220° (from 160° to 380° / -160° to 20° clock)
  const startAngle = -200;
  const totalAngle = 220;

  const pct = (animatedScore - 300) / (850 - 300);
  const sweepAngle = totalAngle * pct;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (startDeg: number, sweep: number) => {
    const endDeg = startDeg + sweep;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const color = scoreToColor(animatedScore);

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="180" viewBox="0 0 240 180" aria-label={`Credit score: ${score}`}>
        {/* Track */}
        <path
          d={arcPath(startAngle, totalAngle)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        {sweepAngle > 0 && (
          <path
            d={arcPath(startAngle, sweepAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        )}
        {/* Score text */}
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          fontSize="36"
          fontWeight="800"
          fill={color}
          fontFamily="'Georgia', serif"
        >
          {animatedScore}
        </text>
        {/* Label */}
        <text
          x={cx}
          y={cy + 30}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#6b7280"
          fontFamily="system-ui"
        >
          {scoreLabel(animatedScore)}
        </text>
        {/* Min label */}
        <text x="20" y="165" fontSize="10" fill="#9ca3af" textAnchor="middle">300</text>
        {/* Max label */}
        <text x="220" y="165" fontSize="10" fill="#9ca3af" textAnchor="middle">850</text>
      </svg>
    </div>
  );
};

export default CreditGauge;