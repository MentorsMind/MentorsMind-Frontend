import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestExport, getExportStatus, getExportDownloadUrl, ExportJobStatus } from '../../services/export.service';

const POLL_INTERVAL = 3000;
const POLL_TIMEOUT = 5 * 60 * 1000; // 5 minutes

type ExportState =
  | { phase: 'idle' }
  | { phase: 'requesting' }
  | { phase: 'polling'; jobId: string; status: ExportJobStatus['status'] }
  | { phase: 'completed'; jobId: string; expiresAt: string }
  | { phase: 'failed'; errorMessage: string | null }
  | { phase: 'expired' }
  | { phase: 'timeout' };

const DataExportSettings: React.FC = () => {
  const [state, setState] = useState<ExportState>({ phase: 'idle' });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  useEffect(() => () => stopPolling(), []);

  const startPolling = (jobId: string) => {
    stopPolling();

    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setState({ phase: 'timeout' });
    }, POLL_TIMEOUT);

    pollRef.current = setInterval(async () => {
      try {
        const data = await getExportStatus(jobId);

        if (data.status === 'completed') {
          stopPolling();
          const expired = new Date(data.expires_at) < new Date();
          if (expired) {
            setState({ phase: 'expired' });
          } else {
            setState({ phase: 'completed', jobId, expiresAt: data.expires_at });
            window.location.href = getExportDownloadUrl(jobId);
          }
        } else if (data.status === 'failed') {
          stopPolling();
          setState({ phase: 'failed', errorMessage: data.error_message });
        } else {
          setState({ phase: 'polling', jobId, status: data.status });
        }
      } catch (err: any) {
        if (err?.response?.status === 410) {
          stopPolling();
          setState({ phase: 'expired' });
        }
      }
    }, POLL_INTERVAL);
  };

  const handleExport = async () => {
    setState({ phase: 'requesting' });
    try {
      const { jobId } = await requestExport();
      setState({ phase: 'polling', jobId, status: 'pending' });
      startPolling(jobId);
    } catch {
      setState({ phase: 'idle' });
      toast.error('Failed to start export. Please try again.');
    }
  };

  const reset = () => { stopPolling(); setState({ phase: 'idle' }); };

  const isPolling = state.phase === 'polling' || state.phase === 'requesting';

  return (
    <div className="p-5 border border-border rounded-2xl space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text">Export My Data</p>
          <p className="text-xs text-muted-foreground">Download a copy of all your account data</p>
        </div>
      </div>

      {state.phase === 'idle' && (
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Export My Data
        </button>
      )}

      {isPolling && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>
            Preparing your data
            {state.phase === 'polling' ? ` (${state.status})` : ''}…
          </span>
        </div>
      )}

      {state.phase === 'completed' && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span>Download started!</span>
          <button onClick={reset} className="ml-auto text-xs text-muted-foreground hover:underline">
            New export
          </button>
        </div>
      )}

      {state.phase === 'failed' && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{state.errorMessage ?? 'Export failed.'}</span>
          </div>
          <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Try again
          </button>
        </div>
      )}

      {(state.phase === 'expired' || state.phase === 'timeout') && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {state.phase === 'expired'
                ? 'Download link has expired. Please request a new export.'
                : 'Export is taking too long. Please try again.'}
            </span>
          </div>
          <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Request new export
          </button>
        </div>
      )}
    </div>
  );
};

export default DataExportSettings;
