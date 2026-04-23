interface Props {
  secondsLeft: number;
  onRefresh: () => void;
}

export default function QuoteTimer({ secondsLeft, onRefresh }: Props) {
  const pct = (secondsLeft / 15) * 100;
  const urgent = secondsLeft <= 5;

  return (
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-red-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`tabular-nums font-medium ${urgent ? 'text-red-500' : 'text-gray-500'}`}>
        {secondsLeft}s
      </span>
      <button
        onClick={onRefresh}
        className="text-indigo-600 hover:text-indigo-800 underline text-xs"
        aria-label="Refresh quote now"
      >
        Refresh
      </button>
    </div>
  );
}
