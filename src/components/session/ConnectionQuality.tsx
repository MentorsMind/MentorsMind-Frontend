import React from 'react';
import type { ConnectionQualityLabel } from '../../hooks/useWebRTC';

interface ConnectionQualityProps {
  quality: ConnectionQualityLabel;
  rttMs: number | null;
}

const QUALITY_STYLES: Record<ConnectionQualityLabel, string> = {
  Excellent: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
  Good: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  Poor: 'border-rose-400/40 bg-rose-500/10 text-rose-100',
};

const ConnectionQuality: React.FC<ConnectionQualityProps> = ({ quality, rttMs }) => {
  const activeBars = quality === 'Excellent' ? 3 : quality === 'Good' ? 2 : 1;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold ${QUALITY_STYLES[quality]}`}
      aria-label={`Connection quality ${quality}${rttMs !== null ? ` at ${rttMs} milliseconds RTT` : ''}`}
    >
      <div className="flex items-end gap-1">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-1.5 rounded-full ${bar <= activeBars ? 'bg-current' : 'bg-white/20'}`}
            style={{ height: `${bar * 5 + 4}px` }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span>{quality}</span>
        <span className="text-xs font-medium text-white/70">{rttMs !== null ? `${rttMs} ms RTT` : 'Measuring...'}</span>
      </div>
    </div>
  );
};

export default ConnectionQuality;
