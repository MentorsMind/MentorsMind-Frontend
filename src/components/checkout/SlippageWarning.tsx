interface Props {
  slippage: number;
}

export default function SlippageWarning({ slippage }: Props) {
  if (slippage <= 1) return null;

  return (
    <div role="alert" className="flex items-start gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg px-4 py-3 text-sm">
      <span className="text-lg leading-none">⚠️</span>
      <div>
        <span className="font-semibold">High slippage detected ({slippage.toFixed(2)}%)</span>
        <p className="mt-0.5 text-yellow-700">Price may change significantly before your transaction confirms.</p>
      </div>
    </div>
  );
}
