import React from 'react';
import type { ExportJobStatus } from '../../hooks/useExportJob';

interface ExportStatusPanelProps {
  jobId: string | null;
  status: ExportJobStatus;
  error_message: string | null;
  downloadExpired: boolean;
  loading: boolean;
  onStartExport: () => void;
  onDownload: () => void;
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

// ── Progress bar (indeterminate) ──────────────────────────────────────────────

function ProgressBar() {
  return (
    <div
      className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"
      role="progressbar"
      aria-label="Export progress"
      aria-valuetext="Processing"
    >
      <div className="h-full bg-stellar rounded-full animate-[progress_1.4s_ease-in-out_infinite]" />
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

const ExportStatusPanel: React.FC<ExportStatusPanelProps> = ({
  jobId,
  status,
  error_message,
  downloadExpired,
  loading,
  onStartExport,
  onDownload,
}) => {
  // ── Download expired (overrides completed state) ──────────────────────────
  if (downloadExpired) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 px-4 text-center">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700">
          This download has expired. Please request a new export.
        </p>
        <button
          onClick={onStartExport}
          className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-stellar text-white hover:bg-stellar-dark transition-all"
        >
          Request new export
        </button>
      </div>
    );
  }

  // ── Initial / no job yet ──────────────────────────────────────────────────
  if (!jobId && !loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 px-4 text-center">
        <p className="text-sm text-gray-500">Export your transaction data as a CSV file.</p>
        <button
          onClick={onStartExport}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-stellar text-white shadow-lg shadow-stellar/20 hover:bg-stellar-dark transition-all"
        >
          Start export
        </button>
      </div>
    );
  }

  // ── Creating job (POST in-flight) ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4 px-4">
        <Spinner className="w-4 h-4 text-stellar flex-shrink-0" />
        <span className="text-sm text-gray-500">Starting export…</span>
      </div>
    );
  }

  // ── pending ───────────────────────────────────────────────────────────────
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-3 py-4 px-4" role="status" aria-live="polite">
        <Spinner className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-500">Queued — waiting to start…</span>
      </div>
    );
  }

  // ── processing ────────────────────────────────────────────────────────────
  if (status === 'processing') {
    return (
      <div className="flex flex-col gap-2 py-4 px-4" role="status" aria-live="polite">
        <div className="flex items-center gap-3">
          <Spinner className="w-4 h-4 text-stellar flex-shrink-0" />
          <span className="text-sm text-gray-600 font-medium">Preparing your data…</span>
        </div>
        <ProgressBar />
      </div>
    );
  }

  // ── completed ─────────────────────────────────────────────────────────────
  if (status === 'completed') {
    return (
      <div className="flex items-center justify-between gap-4 py-4 px-4" role="status" aria-live="polite">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Ready to download</span>
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download
        </button>
      </div>
    );
  }

  // ── failed ────────────────────────────────────────────────────────────────
  return (
    <div className="flex items-start justify-between gap-4 py-4 px-4" role="alert">
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span className="text-sm text-red-600">
          {error_message ?? 'Export failed. Please try again.'}
        </span>
      </div>
      <button
        onClick={onStartExport}
        className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-all"
      >
        Try again
      </button>
    </div>
  );
};

export default ExportStatusPanel;
