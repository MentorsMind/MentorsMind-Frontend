import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import { AdminDispute, AdminListResponse } from '../../types/admin.types';
import apiClient from '../../services/api.client';
import toast from 'react-hot-toast';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

type ResolutionType = 'full_refund' | 'partial_refund' | 'release';

interface ResolvePayload {
  resolution_type: ResolutionType;
  notes: string;
  splitPercentage?: number;
}

const RESOLUTION_OPTIONS: { value: ResolutionType; label: string }[] = [
  { value: 'full_refund', label: 'Full Refund to Learner' },
  { value: 'partial_refund', label: 'Partial Refund' },
  { value: 'release', label: 'Release to Mentor' },
];

// ─── Resolution Modal ─────────────────────────────────────────────────────────

interface ResolveModalProps {
  dispute: AdminDispute;
  onClose: () => void;
  onResolved: (id: string, resolutionType: ResolutionType) => void;
}

const ResolveModal: React.FC<ResolveModalProps> = ({ dispute, onClose, onResolved }) => {
  const [resolutionType, setResolutionType] = useState<ResolutionType>('release');
  const [notes, setNotes] = useState('');
  const [splitPercentage, setSplitPercentage] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = notes.trim().length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const payload: ResolvePayload = {
        resolution_type: resolutionType,
        notes: notes.trim(),
        ...(resolutionType === 'partial_refund' ? { splitPercentage } : {}),
      };

      // Use DisputesController endpoint — triggers actual escrow action
      await apiClient.post(`/disputes/${dispute.id}/resolve`, payload);

      const label = RESOLUTION_OPTIONS.find(o => o.value === resolutionType)?.label ?? resolutionType;
      toast.success(`Dispute resolved: ${label}`);
      onResolved(dispute.id, resolutionType);
      onClose();
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
      toast.error('Failed to resolve dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Resolve Dispute</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Admin-only override warning */}
        <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <strong>Note:</strong> This form uses <code className="font-mono bg-amber-100 px-1 rounded">POST /disputes/:id/resolve</code> which triggers the escrow action.
            For administrative status overrides without financial action, use <code className="font-mono bg-amber-100 px-1 rounded">POST /admin/disputes/:id/resolve</code> (status: resolved/dismissed).
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Dispute info */}
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium text-gray-900">Dispute ID:</span> {dispute.id}</p>
            <p><span className="font-medium text-gray-900">Amount:</span> {dispute.amount} {dispute.asset}</p>
            <p><span className="font-medium text-gray-900">Parties:</span> {dispute.mentorName} ↔ {dispute.learnerName}</p>
          </div>

          {/* Resolution type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Resolution Type</label>
            <select
              value={resolutionType}
              onChange={e => setResolutionType(e.target.value as ResolutionType)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
            >
              {RESOLUTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Partial refund percentage */}
          {resolutionType === 'partial_refund' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Refund Percentage: <span className="text-blue-600">{splitPercentage}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={splitPercentage}
                onChange={e => setSplitPercentage(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0% (none)</span>
                <span>100% (full)</span>
              </div>
            </div>
          )}

          {/* Notes (required) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Explain the resolution decision..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              required
            />
            {notes.trim().length === 0 && (
              <p className="text-xs text-red-500 mt-1">Notes are required to submit.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Resolving...' : 'Resolve Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDisputes: React.FC = () => {
  const [data, setData] = useState<AdminDispute[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: 50, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);

  const fetchDisputes = async (offset = 0, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AdminListResponse<AdminDispute>>(
        `/admin/disputes?limit=${limit}&offset=${offset}`
      );
      setData(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
      setError('Failed to load disputes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handlePageChange = (offset: number) => fetchDisputes(offset, meta.limit);
  const handleLimitChange = (limit: number) => fetchDisputes(0, limit);

  const handleResolved = (id: string, resolutionType: ResolutionType) => {
    const label = RESOLUTION_OPTIONS.find(o => o.value === resolutionType)?.label ?? resolutionType;
    setData(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, status: 'resolved', resolvedAt: new Date().toISOString() }
          : d
      )
    );
    // Show success info in console for debugging
    console.info(`[AdminDisputes] Dispute ${id} resolved with: ${label}`);
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'sessionId', label: 'Session ID', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'mentorName', label: 'Mentor', sortable: true },
    { key: 'learnerName', label: 'Learner', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: number, item: AdminDispute) => `${value} ${item.asset}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          open: 'bg-red-100 text-red-800',
          investigating: 'bg-yellow-100 text-yellow-800',
          resolved: 'bg-green-100 text-green-800',
          closed: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[value] ?? 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'resolvedAt',
      label: 'Resolved',
      sortable: true,
      render: (value?: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_: unknown, item: AdminDispute) =>
        item.status !== 'resolved' && item.status !== 'closed' ? (
          <button
            onClick={() => setSelectedDispute(item)}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Resolve
          </button>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
        <p className="text-gray-500">Manage session disputes and trigger escrow resolutions</p>
      </div>

      <AdminTable
        data={data}
        columns={columns}
        meta={meta}
        loading={loading}
        error={error}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        title="Disputes"
      />

      {selectedDispute && (
        <ResolveModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
};

export default AdminDisputes;
