/**
 * ExportService — manages async export jobs.
 *
 * In production this would be backed by a database + a real queue worker.
 * Here we use an in-memory Map and simulate processing with setTimeout.
 */

export type ExportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportJob {
  jobId: string;
  status: ExportJobStatus;
  /** ISO timestamp when the job was created */
  createdAt: string;
  /** ISO timestamp when the download URL expires (completed jobs only) */
  expiresAt?: string;
  /** Human-readable error when status === 'failed' */
  error_message?: string;
  /** Opaque download token — only present when status === 'completed' */
  downloadToken?: string;
}

// TTL for completed jobs: 15 minutes
const DOWNLOAD_TTL_MS = 15 * 60 * 1000;

// Simulated processing time range (ms)
const PROCESSING_DELAY_MS = 4000;

const jobs = new Map<string, ExportJob>();

function generateId(): string {
  return `export_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export class ExportService {
  /**
   * Create a new export job and kick off async processing.
   * Returns immediately with a jobId the client can poll.
   */
  createJob(): ExportJob {
    const jobId = generateId();
    const job: ExportJob = {
      jobId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    jobs.set(jobId, job);

    // Simulate async pipeline: pending → processing → completed|failed
    setTimeout(() => {
      const j = jobs.get(jobId);
      if (!j) return;
      j.status = 'processing';
      jobs.set(jobId, { ...j });

      setTimeout(() => {
        const j2 = jobs.get(jobId);
        if (!j2) return;

        // Simulate ~10% failure rate for realism
        const failed = Math.random() < 0.1;
        if (failed) {
          jobs.set(jobId, {
            ...j2,
            status: 'failed',
            error_message: 'Export pipeline encountered an error. Please try again.',
          });
        } else {
          const expiresAt = new Date(Date.now() + DOWNLOAD_TTL_MS).toISOString();
          jobs.set(jobId, {
            ...j2,
            status: 'completed',
            expiresAt,
            downloadToken: generateId(),
          });
        }
      }, PROCESSING_DELAY_MS);
    }, 1500);

    return job;
  }

  /**
   * Returns the current job snapshot, or null if not found.
   */
  getJob(jobId: string): ExportJob | null {
    return jobs.get(jobId) ?? null;
  }

  /**
   * Validates that a completed job's download is still within its TTL.
   * Returns the job if valid, null if not found, or throws 'EXPIRED' if past TTL.
   */
  getDownload(jobId: string): { job: ExportJob } | { expired: true } | null {
    const job = jobs.get(jobId);
    if (!job) return null;

    if (job.status !== 'completed') {
      return null;
    }

    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return { expired: true };
    }

    return { job };
  }
}
