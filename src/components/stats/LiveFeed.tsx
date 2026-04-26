import React from 'react';

export interface LiveFeedItem {
  id: string;
  learnerAlias: string;
  mentorAlias: string;
  skill: string;
  amountUsd: number;
  timestamp: string;
}

interface LiveFeedProps {
  items: LiveFeedItem[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ items }) => {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Live Session Feed</h2>
          <p className="text-sm text-slate-500">Recent anonymized bookings confirmed on-chain.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Live
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {item.learnerAlias} booked {item.skill} with {item.mentorAlias}
                </p>
                <p className="text-xs text-slate-500">{item.timestamp}</p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                ${item.amountUsd.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;
