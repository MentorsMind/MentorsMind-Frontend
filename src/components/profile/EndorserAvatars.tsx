import React from 'react';
import type { Endorser } from '../../hooks/useEndorsements';

interface EndorserAvatarsProps {
  endorsers: Endorser[];
  maxVisible?: number;
}

export function EndorserAvatars({ endorsers, maxVisible = 5 }: EndorserAvatarsProps) {
  const visibleEndorsers = endorsers.slice(0, maxVisible);
  const overflow = Math.max(0, endorsers.length - maxVisible);

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleEndorsers.map((endorser) => (
          <img
            key={endorser.id}
            src={endorser.avatarUrl}
            alt={endorser.name}
            className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
          />
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-2 inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-semibold text-gray-700">
          +{overflow}
        </span>
      )}
    </div>
  );
}
