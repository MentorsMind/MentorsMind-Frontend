import type { AxiosError } from "axios";
import api from "./api.client";

export interface ExportDownloadResult {
  ok: true;
  blob: Blob;
  filename: string;
  instanceHeader: string | null;
}

export interface ExportDownloadError {
  ok: false;
  status: number;
  message: string;
  /** Present when the server returned X-Export-Instance — suggests retrying may hit the right instance */
  instanceHeader: string | null;
  /** True when the error is a 500 that may be instance-routing related */
  maySucceedOnRetry: boolean;
}

export type ExportDownloadOutcome = ExportDownloadResult | ExportDownloadError;

/**
 * Download an export file for a given jobId.
 * GET /export/:jobId/download
 *
 * Handles 500 gracefully: returns an error object instead of throwing,
 * so the caller can show a specific message and a "Request New Export" button.
 * Does NOT retry on 500 — the api.client retries are bypassed via validateStatus.
 */
export async function downloadExport(jobId: string): Promise<ExportDownloadOutcome> {
  let instanceHeader: string | null = null;

  try {
    const response = await api.get<Blob>(`/export/${jobId}/download`, {
      responseType: "blob",
      // Prevent the api.client interceptor from retrying 5xx for this endpoint
      validateStatus: (status) => status < 500,
    });

    instanceHeader = response.headers?.["x-export-instance"] ?? null;

    if (response.status !== 200) {
      return {
        ok: false,
        status: response.status,
        message: "Download failed. The export file may no longer be available. Please request a new export.",
        instanceHeader,
        maySucceedOnRetry: false,
      };
    }

    const disposition = response.headers?.["content-disposition"] ?? "";
    const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'";\n]+)\1/);
    const filename = match?.[2] ?? `export-${jobId}.zip`;

    return { ok: true, blob: response.data, filename, instanceHeader };
  } catch (err) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status ?? 0;
    instanceHeader = (axiosErr.response?.headers as Record<string, string>)?.["x-export-instance"] ?? null;

    // 500 — file not found on this instance (multi-instance deployment issue)
    if (status === 500) {
      console.error("[exportService] 500 on download", { jobId, instanceHeader });

      return {
        ok: false,
        status: 500,
        message: "Download failed. The export file may no longer be available. Please request a new export.",
        instanceHeader,
        maySucceedOnRetry: instanceHeader !== null,
      };
    }

    return {
      ok: false,
      status,
      message: "Download failed. Please try again.",
      instanceHeader,
      maySucceedOnRetry: false,
    };
  }
}
