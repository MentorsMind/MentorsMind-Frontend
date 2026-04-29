import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import apiClient from '../../services/api.client';

interface ServiceHealth {
  status: boolean | 'healthy' | 'degraded' | 'down';
  latency?: number;
}

interface QueueMetric {
  depth: number;
  maxDepth?: number;
  name: string;
}

interface SystemHealthResponse {
  database?: ServiceHealth | boolean;
  redis?: ServiceHealth | boolean;
  stellar?: ServiceHealth | boolean;
  queues?: Record<string, QueueMetric | number>;
  [key: string]: unknown;
}

interface NormalizedService {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
}

const QUEUE_WARNING_THRESHOLD = 0.7; // 70% of max depth

function normalizeStatus(raw: ServiceHealth | boolean | undefined): 'healthy' | 'degraded' | 'down' {
  if (raw === undefined || raw === null) return 'down';
  if (typeof raw === 'boolean') return raw ? 'healthy' : 'down';
  if (typeof raw === 'object') {
    const s = raw.status;
    if (s === 'healthy' || s === true) return 'healthy';
    if (s === 'degraded') return 'degraded';
    return 'down';
  }
  return 'down';
}

const StatusDot: React.FC<{ status: 'healthy' | 'degraded' | 'down' }> = ({ status }) => {
  if (status === 'healthy') return <CheckCircle className="w-5 h-5 text-green-500" />;
  if (status === 'degraded') return <MinusCircle className="w-5 h-5 text-yellow-500" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
};

const statusLabel: Record<string, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
};

const statusBadge: Record<string, string> = {
  healthy: 'bg-green-100 text-green-800',
  degraded: 'bg-yellow-100 text-yellow-800',
  down: 'bg-red-100 text-red-800',
};

const AdminSystemHealth: React.FC = () => {
  const [services, setServices] = useState<NormalizedService[]>([]);
  const [queues, setQueues] = useState<{ name: string; depth: number; max: number }[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasDegradation, setHasDegradation] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<SystemHealthResponse>('/admin/system/health');
      const data = response.data;

      const normalized: NormalizedService[] = [
        { name: 'Database', status: normalizeStatus(data.database as ServiceHealth | boolean), latency: typeof data.database === 'object' ? (data.database as ServiceHealth).latency : undefined },
        { name: 'Redis', status: normalizeStatus(data.redis as ServiceHealth | boolean), latency: typeof data.redis === 'object' ? (data.redis as ServiceHealth).latency : undefined },
        { name: 'Stellar', status: normalizeStatus(data.stellar as ServiceHealth | boolean), latency: typeof data.stellar === 'object' ? (data.stellar as ServiceHealth).latency : undefined },
      ];

      const queueList: { name: string; depth: number; max: number }[] = [];
      if (data.queues && typeof data.queues === 'object') {
        for (const [key, val] of Object.entries(data.queues)) {
          if (typeof val === 'number') {
            queueList.push({ name: key, depth: val, max: 100 });
          } else if (val && typeof val === 'object') {
            const q = val as QueueMetric;
            queueList.push({ name: q.name ?? key, depth: q.depth, max: q.maxDepth ?? 100 });
          }
        }
      }

      setServices(normalized);
      setQueues(queueList);
      setHasDegradation(normalized.some(s => s.status !== 'healthy'));
      setLastChecked(new Date());
    } catch (err) {
      console.error('[SystemHealth] fetch error:', err);
      setServices([
        { name: 'Database', status: 'down' },
        { name: 'Redis', status: 'down' },
        { name: 'Stellar', status: 'down' },
      ]);
      setHasDegradation(true);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Degradation banner */}
      {hasDegradation && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm shadow">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          System degradation detected
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          {lastChecked && (
            <p className="text-sm text-gray-500 mt-0.5">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Services */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Services</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {loading && services.length === 0
            ? [1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between px-6 py-4 animate-pulse">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                </div>
              ))
            : services.map(svc => (
                <div key={svc.name} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <StatusDot status={svc.status} />
                    <span className="text-sm font-medium text-gray-900">{svc.name}</span>
                    {svc.latency !== undefined && (
                      <span className="text-xs text-gray-400">{svc.latency}ms</span>
                    )}
                  </div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge[svc.status]}`}>
                    {statusLabel[svc.status]}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {/* Queue depths */}
      {queues.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Queue Depths</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {queues.map(q => {
              const pct = Math.min((q.depth / q.max) * 100, 100);
              const isWarning = pct >= QUEUE_WARNING_THRESHOLD * 100;
              return (
                <div key={q.name} className="px-6 py-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{q.name}</span>
                    <span className={`font-semibold ${isWarning ? 'text-yellow-600' : 'text-gray-600'}`}>
                      {q.depth} / {q.max}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isWarning ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {isWarning && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Queue depth above warning threshold
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystemHealth;
