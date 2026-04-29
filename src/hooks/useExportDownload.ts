import { useState, useCallback } from "react";
import { downloadExport } from "../services/export.service";

export type DownloadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string; maySucceedOnRetry: boolean; instanceHeader: string | null };

/**
 * Hook for downloading an export file by jobId.
 *
 * Handles 500 gracefully — does NOT auto-retry on 500.
 * Exposes `maySucceedOnRetry` so the UI can suggest trying again
 * when X-Export-Instance header is present (round-robin routing).
 */
export function useExportDownload() {
  const [state, setState] = useState<DownloadState>({ status: "idle" });

  const download = useCallback(async (jobId: string) => {
    setState({ status: "loading" });

    const result = await downloadExport(jobId);

    if (!result.ok) {
      setState({
        status: "error",
        message: result.message,
        maySucceedOnRetry: result.maySucceedOnRetry,
        instanceHeader: result.instanceHeader,
      });
      return;
    }

    // Trigger browser download
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);

    setState({ status: "success" });
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, download, reset };
}
