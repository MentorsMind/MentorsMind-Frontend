import React from 'react';
import type { EarningsBySession } from '../../types';

interface EarningsBreakdownProps {
  sessions: EarningsBySession[];
  platformFeeRate: number;
  onExport: () => void;
}

const EarningsBreakdown: React.FC<EarningsBreakdownProps> = ({ sessions, platformFeeRate, onExport }) => {
  const totalGross = sessions.reduce((s, e) => s + e.grossAmount, 0);
  const totalFees = sessions.reduce((s, e) => s + e.platformFee, 0);
  const totalNet = sessions.reduce((s, e) => s + e.netAmount, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Earnings by Session</h3>
          <p className="text-xs text-gray-400 mt-0.5">Platform fee: {(platformFeeRate * 100).toFixed(0)}% per session</p>
        </div>
        <button
          onClick={onExport}
          aria-label="Export earnings as CSV"
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors font-medium"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Session earnings breakdown">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 font-semibold">Session</th>
              <th className="pb-3 font-semibold">Student</th>
              <th className="pb-3 font-semibold text-right">Gross</th>
              <th className="pb-3 font-semibold text-right">Fee</th>
              <th className="pb-3 font-semibold text-right">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.map(s => (
              <tr key={s.sessionId} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 pr-4">
                  <p className="font-medium text-gray-900 truncate max-w-[160px]">{s.topic}</p>
                  <p className="text-xs text-gray-400">{s.date} · {s.duration}min</p>
                </td>
                <td className="py-3 pr-4 text-gray-600">{s.studentName}</td>
                <td className="py-3 text-right font-medium text-gray-900 tabular-nums">
                  {s.grossAmount} {s.asset}
                </td>
                <td className="py-3 text-right text-red-400 tabular-nums text-xs">
                  -{s.platformFee} {s.asset}
                </td>
                <td className="py-3 text-right font-bold text-stellar tabular-nums">
                  {s.netAmount} {s.asset}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-100">
            <tr>
              <td colSpan={2} className="pt-3 text-xs font-bold text-gray-500 uppercase">Total</td>
              <td className="pt-3 text-right font-bold text-gray-900 tabular-nums">${totalGross.toFixed(2)}</td>
              <td className="pt-3 text-right text-red-400 tabular-nums text-xs">-${totalFees.toFixed(2)}</td>
              <td className="pt-3 text-right font-bold text-stellar tabular-nums">${totalNet.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default EarningsBreakdown;
