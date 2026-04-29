import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import apiClient from '../../services/api.client';

interface ComponentDetail {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTimeMs?: number;
}

interface SystemDetails {
  memory: { heapUsed: number; heapTotal: number; freeMem: number; totalMem: number };
  cpu: number[];
}

interface DetailedHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number; // seconds
  components: {
    db?: ComponentDetail;
    redis?: ComponentDetail;
    horizon?: ComponentDetail;
    system?: { status: string; details: SystemDetails };
  };
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d} days, ${h} hours, ${m} minutes`;
}

const MAX_LATENCY_MS = 2000;

const statusBadge: Record<string, string> = {
  healthy: 'bg-green-100 text-green-800',
  degraded: 'bg-yellow-100 text-yellow-800',
  unhealthy: 'bg-red-100 text-red-800',
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'healthy') return <CheckCircle className="w-5 h-5 text-green-500" />;
  if (status === 'degraded') return <MinusCircle className="w-5 h-5 text-yellow-500" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
};

const LatencyBar: React.FC<{ ms: number }> = ({ ms }) => {
  const pct = Math.min((ms / MAX_LATENCY_MS) * 100, 100);
  const color = ms < 300 ? 'bg-green-500' : ms < 800 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-14 text-right">{ms}ms</span>
    </div>
  );
};

const COMPONENTS: { key: 'db' | 'redis' | 'horizon'; label: string }[] = [
  { key: 'db', label: 'Database' },
  { key: 'redis', label: 'Redis' },
  { key: 'horizon', label: 'Horizon' },
];

const AdminSystemHealth: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DetailedHealthStatus | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<DetailedHealthStatus>('/health/detailed', {
        validateStatus: (s) => s < 500,
      });
      if (res.status === 401 || res.status === 403) {
        navigate('/login');
        return;
      }
      setData(res.data);
      setLastChecked(new Date());
    } catch {
      // network failure — keep stale data
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 30_000);
    return () => clearInterval(id);
  }, [fetchHealth]);

  const sys = data?.components?.system?.details;
  const memPct = sys ? Math.round((sys.memory.heapUsed / sys.memory.heapTotal) * 100) : null;
  const freeMemPct = sys ? Math.round((sys.memory.freeMem / sys.memory.totalMem) * 100) : null;
  const cpuLoad = sys?.cpu?.[0] ?? null;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">
              {data.version} · Uptime: {formatUptime(data.uptime)}
              {lastChecked && ` · Last checked: ${lastChecked.toLocaleTimeString()}`}
            </p>
          )}
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overall status banner */}
      {data && data.status !== 'healthy' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          System degradation detected
        </div>
      )}

      {/* Component latencies */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Components</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {loading && !data
            ? [1, 2, 3].map(i => (
                <div key={i} className="px-6 py-4 animate-pulse space-y-2">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-2 bg-gray-100 rounded-full" />
                </div>
              ))
            : COMPONENTS.map(({ key, label }) => {
                const c = data?.components?.[key];
                const status = c?.status ?? 'unhealthy';
                return (
                  <div key={key} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={status} />
                        <span className="text-sm font-medium text-gray-900">{label}</span>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge[status] ?? statusBadge.unhealthy}`}>
                        {status}
                      </span>
                    </div>
                    {c?.responseTimeMs !== undefined && <LatencyBar ms={c.responseTimeMs} />}
                  </div>
                );
              })}
        </div>
      </div>

      {/* System metrics */}
      {sys && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">System Metrics</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="px-6 py-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-900">Heap Usage</span>
                <span className="text-gray-500">{memPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${memPct! > 85 ? 'bg-red-500' : memPct! > 65 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${memPct}%` }}
                />
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-900">Free Memory</span>
                <span className="text-gray-500">{freeMemPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${freeMemPct! < 15 ? 'bg-red-500' : freeMemPct! < 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${freeMemPct}%` }}
                />
              </div>
            </div>
            <div className="px-6 py-4 flex justify-between text-sm">
              <span className="font-medium text-gray-900">CPU Load Avg (1m)</span>
              <span className="text-gray-500">{cpuLoad?.toFixed(2) ?? '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystemHealth;
