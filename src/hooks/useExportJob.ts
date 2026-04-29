import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api.client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ExportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportJobState {
  jobId: string | null;
  /** Normalised status — unknown values are coerced to 'pending' */
  status: ExportJobStatus;
  error_message: string | null;
  expiresAt: string | null;
  /** Set to true when a completed download returns 410 Gone */
  downloadExpired: boolean;
  loading: boolean;
}

const POLL_INTERVAL_MS = 2000;

// ── Status normaliser ─────────────────────────────────────────────────────────

/**
 * Coerces any unknown status string to a known ExportJobStatus.
 * Per the AC: unexpected values are treated as 'pending' so polling continues.
 */
function normaliseStatus(raw: unknown): ExportJobStatus {
  if (
    raw === 'pending' ||
    raw === 'processing' ||
    raw === 'completed' ||
    raw === 'failed'
  ) {
    return raw;
  }
  return 'pending';
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useExportJob() {
  const [state, setState] = useState<ExportJobState>({
    jobId: null,
    status: 'pending',
    error_message: null,
    expiresAt: null,
    downloadExpired: false,
    loading: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track the jobId in a ref so the interval closure always sees the latest value
  const jobIdRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  const pollStatus = useCallback(async (jobId: string) => {
    try {
      const { data: envelope } = await api.get(`/export/${jobId}/status`);
      const payload = (envelope?.data ?? {}) as Record<string, unknown>;
      const status = normaliseStatus(payload?.status);

      setState((prev: ExportJobState) => ({
        ...prev,
        status,
        error_message: status === 'failed' ? ((payload?.error_message as string) ?? 'Export failed.') : null,
        expiresAt: (payload?.expiresAt as string) ?? null,
      }));

      // Terminal states — stop the loop
      if (status === 'completed' || status === 'failed') {
        stopPolling();
      }
    } catch {
      // Network hiccup — keep polling; don't surface transient errors
    }
  }, [stopPolling]);

  /**
   * Kick off a new export job.
   * Resets all state, creates the job, then starts polling.
   */
  const startExport = useCallback(async () => {
    stopPolling();

    setState({
      jobId: null,
      status: 'pending',
      error_message: null,
      expiresAt: null,
      downloadExpired: false,
      loading: true,
    });

    try {
      const { data: envelope } = await api.post('/export');
      const jobId: string = (envelope?.data as { jobId: string })?.jobId;

      if (!jobId) throw new Error('Server did not return a jobId');

      jobIdRef.current = jobId;

      setState((prev: ExportJobState) => ({ ...prev, jobId, loading: false }));

      // Immediate first poll, then on interval
      await pollStatus(jobId);

      intervalRef.current = setInterval(() => {
        if (jobIdRef.current) pollStatus(jobIdRef.current);
      }, POLL_INTERVAL_MS);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start export';
      setState((prev: ExportJobState) => ({
        ...prev,
        loading: false,
        status: 'failed',
        error_message: message,
      }));
    }
  }, [pollStatus, stopPolling]);

  /**
   * Trigger the file download for a completed job.
   * Handles 410 Gone by setting downloadExpired = true.
   */
  const downloadExport = useCallback(async () => {
    const { jobId } = state;
    if (!jobId) return;

    try {
      const response = await api.get(`/export/${jobId}/download`, {
        responseType: 'blob',
        // Don't let the axios interceptor auto-retry on 410
        validateStatus: (s: number) => s < 500,
      });

      if (response.status === 410) {
        setState((prev: ExportJobState) => ({ ...prev, downloadExpired: true }));
        return;
      }

      // Trigger browser download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export_${jobId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setState((prev: ExportJobState) => ({ ...prev, downloadExpired: true }));
    }
  }, [state]);

  return {
    ...state,
    startExport,
    downloadExport,
  };
}
