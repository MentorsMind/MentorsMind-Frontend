import type { Payment } from '../types';
import PaymentStatus from '../components/payment/PaymentStatus';

const MOCK: Payment[] = [
  { id: '1', sessionId: 's1', amount: 90, asset: 'USDC', status: 'completed', stellarTxHash: 'TXABC123', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '2', sessionId: 's2', amount: 60, asset: 'XLM',  status: 'pending',   createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', sessionId: 's3', amount: 120, asset: 'USDC', status: 'refunded', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

export default function PaymentHistory() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {MOCK.map(p => (
          <div key={p.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{p.amount} {p.asset}</p>
              <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
              {p.stellarTxHash && <p className="text-xs font-mono text-gray-400 mt-0.5">{p.stellarTxHash.slice(0, 16)}…</p>}
            </div>
            <PaymentStatus status={p.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
