import { useState, useEffect } from 'react';
import { Trash2, ShieldOff, Plus, Loader2 } from 'lucide-react';
import apiClient from '../../services/api.client';
import toast from 'react-hot-toast';

interface BlocklistRule {
  id: string;
  ipRange: string;
  reason: string;
  createdAt: string;
}

// Validates CIDR notation: e.g. 192.168.1.0/24 or 10.0.0.1/32
const CIDR_RE = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
// Plain IP (no prefix): e.g. 10.0.0.1
const IP_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

function normalizeCIDR(value: string): string {
  const trimmed = value.trim();
  if (IP_RE.test(trimmed)) return `${trimmed}/32`;
  return trimmed;
}

function cidrAddressCount(cidr: string): number {
  const prefix = parseInt(cidr.split('/')[1], 10);
  return Math.pow(2, 32 - prefix);
}

function cidrPreview(cidr: string): string {
  const count = cidrAddressCount(cidr);
  return `This will block ${cidr} (${count.toLocaleString()} address${count === 1 ? '' : 'es'})`;
}

export default function IpBlocklistManager() {
  const [rules, setRules] = useState<BlocklistRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [ipInput, setIpInput] = useState('');
  const [reason, setReason] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlocklistRule | null>(null);
  const [deleting, setDeleting] = useState(false);

  const normalizedCIDR = normalizeCIDR(ipInput);
  const cidrValid = CIDR_RE.test(normalizedCIDR);
  const canSubmit = cidrValid && reason.trim().length > 0 && !adding;

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/security/blocklist');
      // Backend returns only block rules with context === "global"
      setRules(res.data ?? []);
    } catch {
      toast.error('Failed to load blocklist');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setAdding(true);
    try {
      const res = await apiClient.post('/admin/security/blocklist', {
        ipRange: normalizedCIDR,
        reason: reason.trim(),
      });
      // Prepend the new rule without a full refetch
      setRules(prev => [res.data, ...prev]);
      setIpInput('');
      setReason('');
      toast.success(`Blocked ${normalizedCIDR}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add rule');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/admin/security/blocklist/${deleteTarget.id}`);
      // DELETE returns null data — remove by ID from local state
      setRules(prev => prev.filter(r => r.id !== deleteTarget.id));
      toast.success(`Removed block for ${deleteTarget.ipRange}`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete rule');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldOff className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-bold text-gray-900">IP Blocklist</h2>
      </div>

      {/* Add rule form */}
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Add Block Rule</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              IP Address or CIDR Range
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={e => setIpInput(e.target.value)}
              placeholder="192.168.1.0/24 or 10.0.0.1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
            />
            {ipInput && !cidrValid && (
              <p className="mt-1 text-xs text-red-500">Invalid CIDR format (e.g. 192.168.1.0/24)</p>
            )}
            {ipInput && cidrValid && (
              <p className="mt-1 text-xs text-gray-500">{cidrPreview(normalizedCIDR)}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Reason <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Repeated abuse, spam"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Block Rule
          </button>
        </div>
      </form>

      {/* Rules table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        ) : rules.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No block rules configured.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">IP Range</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">{rule.ipRange}</td>
                  <td className="px-4 py-3 text-gray-600">{rule.reason}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(rule.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(rule)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Remove block for ${rule.ipRange}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">Remove block rule?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Remove block for <span className="font-mono font-semibold">{deleteTarget.ipRange}</span>?
              This will allow traffic from this range again.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
