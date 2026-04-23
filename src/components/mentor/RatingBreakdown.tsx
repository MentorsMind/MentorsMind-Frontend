interface RatingBreakdownProps {
  ratingSummary?: {
    average: number;
    total: number;
    breakdown: Array<{ stars: number; count: number }>;
  };
}

const defaultRatingSummary = {
  average: 4.9,
  total: 87,
  breakdown: [
    { stars: 5, count: 42 },
    { stars: 4, count: 18 },
    { stars: 3, count: 6 },
    { stars: 2, count: 2 },
    { stars: 1, count: 1 },
  ],
};

export default function RatingBreakdown({ ratingSummary = defaultRatingSummary }: RatingBreakdownProps) {
  const { average, total, breakdown } = ratingSummary;
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Ratings</h2>

      <div className="flex items-center gap-8">
        {/* Average score */}
        <div className="flex flex-col items-center min-w-[72px]">
          <span className="text-5xl font-black text-gray-900">{average.toFixed(1)}</span>
          <span className="text-yellow-400 text-lg mt-1">{'★'.repeat(Math.round(average))}</span>
          <span className="text-xs text-gray-400 mt-1">{total} reviews</span>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-2">
          {breakdown.map((r) => {
            const pct = total > 0 ? (r.count / total) * 100 : 0;
            return (
              <div key={r.stars} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 w-6 text-right">{r.stars}★</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6">{r.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
