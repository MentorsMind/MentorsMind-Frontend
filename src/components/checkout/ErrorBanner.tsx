interface Props {
  error: string;
  onRetry?: () => void;
}

function getHint(error: string): string {
  const e = error.toLowerCase();
  if (e.includes('insufficient')) return 'Try selecting a different asset or topping up your wallet.';
  if (e.includes('expired') || e.includes('quote')) return 'The quote expired. Refresh to get a new price.';
  if (e.includes('network') || e.includes('fetch')) return 'Check your connection and try again.';
  return 'Please try again or contact support if the issue persists.';
}

export default function ErrorBanner({ error, onRetry }: Props) {
  return (
    <div role="alert" className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-sm text-red-800">
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none">❌</span>
        <div className="flex-1">
          <p className="font-semibold">{error}</p>
          <p className="mt-0.5 text-red-600">{getHint(error)}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 text-red-700 underline hover:text-red-900 whitespace-nowrap"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
