import type { MentorPayoutSession, SortKey } from '../../types/earnings.types';
import { formatAmount } from '../../utils/earnings.utils';
import PayoutStatusChip from './PayoutStatusChip';
import StellarTxLink from './StellarTxLink';

interface SessionTableProps {
  sessions: MentorPayoutSession[];
  allSessions: MentorPayoutSession[];
  totalSessions: number;
  page: number;
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
  onPageChange: (page: number) => void;
  onExport: () => void;
}

const SORTABLE_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'sessionDate', label: 'Date' },
  { key: 'grossAmount', label: 'Gross Amount' },
  { key: 'netPayout', label: 'Net Payout' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SortIndicator({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return null;
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>;
}

export default function SessionTable({
  sessions,
  totalSessions,
  page,
  sortKey,
  sortDir,
  onSort,
  onPageChange,
  onExport,
}: SessionTableProps) {
  const totalPages = Math.ceil(totalSessions / 20);
  const exportDisabled = totalSessions === 0;

  const columns: { label: string; sortable: boolean; key?: SortKey }[] = [
    { label: 'Date', sortable: true, key: 'sessionDate' },
    { label: 'Mentee Name', sortable: false },
    { label: 'Duration (min)', sortable: false },
    { label: 'Gross Amount', sortable: true, key: 'grossAmount' },
    { label: 'Platform Fee', sortable: false },
    { label: 'Net Payout', sortable: true, key: 'netPayout' },
    { label: 'Payout Status', sortable: false },
    { label: 'Transaction Hash', sortable: false },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={exportDisabled ? undefined : onExport}
          disabled={exportDisabled}
          title={exportDisabled ? 'No data to export' : undefined}
          className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.label}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''
                  }`}
                  onClick={col.sortable && col.key ? () => onSort(col.key!) : undefined}
                >
                  {col.label}
                  {col.sortable && col.key && (
                    <SortIndicator
                      active={sortKey === col.key}
                      dir={sortDir}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sessions.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-400 text-sm"
                >
                  No sessions to display.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.sessionId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {formatDate(session.sessionDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {session.menteeName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-right tabular-nums">
                    {session.durationMinutes}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 tabular-nums">
                    {formatAmount(session.grossAmount, session.asset)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 tabular-nums">
                    {formatAmount(session.platformFee, session.asset)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 tabular-nums">
                    {formatAmount(session.netPayout, session.asset)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PayoutStatusChip
                      status={session.payoutStatus}
                      estimatedReleaseDate={session.estimatedReleaseDate}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StellarTxLink txHash={session.txHash} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
