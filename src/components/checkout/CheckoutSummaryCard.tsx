import type { StellarAssetCode } from '../../types/payment.types';
import type { QuoteData, FeeEstimate } from '../../hooks/useCheckoutQuote';

interface Props {
  mentorName: string;
  sessionTopic: string;
  durationMinutes: number;
  asset: StellarAssetCode;
  quote: QuoteData | null;
  fees: FeeEstimate | null;
  loading: boolean;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function Skeleton() {
  return <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />;
}

export default function CheckoutSummaryCard({
  mentorName, sessionTopic, durationMinutes, asset, quote, fees, loading,
}: Props) {
  const fmt = (n: number) => `${n.toFixed(4)} ${asset}`;
  const total = quote && fees ? quote.basePrice + fees.platformFee + fees.networkFee : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Session info */}
      <div>
        <h2 className="font-semibold text-gray-900 text-base">{sessionTopic}</h2>
        <p className="text-sm text-gray-500 mt-0.5">with {mentorName} · {durationMinutes} min</p>
      </div>

      <hr className="border-gray-100" />

      {/* Price breakdown */}
      <div className="space-y-2">
        <Row
          label="Base price"
          value={loading ? '' : quote ? fmt(quote.basePrice) : '—'}
        />
        {loading && <Skeleton />}

        <Row
          label="Platform fee"
          value={loading ? '' : fees ? fmt(fees.platformFee) : '—'}
        />
        {loading && <Skeleton />}

        <Row
          label="Network fee"
          value={loading ? '' : fees ? fmt(fees.networkFee) : '—'}
        />
        {loading && <Skeleton />}
      </div>

      <hr className="border-gray-100" />

      <Row
        label="Total"
        value={loading ? '' : total !== null ? fmt(total) : '—'}
        bold
      />
      {loading && <Skeleton />}
    </div>
  );
}
