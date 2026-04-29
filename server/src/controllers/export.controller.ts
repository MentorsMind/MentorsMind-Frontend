import type { Request, Response } from 'express';
import { z } from 'zod';
import { ResponseUtil } from '../utils/response.utils.js';
import { ExportService } from '../services/export.service.js';

const jobIdSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
});

const service = new ExportService();

export class ExportController {
  /**
   * POST /export
   * Creates a new export job and returns the jobId immediately.
   */
  static createJob(req: Request, res: Response): Response {
    try {
      const job = service.createJob();
      return ResponseUtil.created(res, {
        jobId: job.jobId,
        status: job.status,
        createdAt: job.createdAt,
      });
    } catch (error) {
      console.error('[ExportController] createJob error:', error);
      return ResponseUtil.internalError(res, 'Failed to create export job', error as Error);
    }
  }

  /**
   * GET /export/:jobId/status
   * Returns the current status of an export job.
   * Status is one of: pending | processing | completed | failed
   */
  static getExportStatus(req: Request, res: Response): Response {
    const parsed = jobIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return ResponseUtil.badRequest(res, 'Invalid jobId');
    }

    const job = service.getJob(parsed.data.jobId);
    if (!job) {
      return ResponseUtil.notFound(res, 'Export job not found');
    }

    return ResponseUtil.success(res, {
      jobId: job.jobId,
      status: job.status,
      createdAt: job.createdAt,
      expiresAt: job.expiresAt,
      // Only expose error_message when failed — matches the AC exactly
      ...(job.status === 'failed' && { error_message: job.error_message }),
    });
  }

  /**
   * GET /export/:jobId/download
   * Streams (or redirects to) the export file.
   * Returns 410 Gone if the download has expired.
   */
  static getDownload(req: Request, res: Response): Response {
    const parsed = jobIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return ResponseUtil.badRequest(res, 'Invalid jobId');
    }

    const result = service.getDownload(parsed.data.jobId);

    if (result === null) {
      return ResponseUtil.notFound(res, 'Export job not found or not yet completed');
    }

    if ('expired' in result) {
      // 410 Gone — the resource existed but is no longer available
      return res.status(410).json({
        success: false,
        error: {
          code: 'DOWNLOAD_EXPIRED',
          message: 'This download has expired. Please request a new export.',
        },
      });
    }

    // In production: stream the file or redirect to a signed S3 URL.
    // Here we return a minimal CSV payload to demonstrate the flow.
    const csv = 'id,status,date\ntx1,completed,2026-03-20\ntx2,pending,2026-03-22\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="export_${result.job.jobId}.csv"`,
    );
    return res.status(200).send(csv);
  }
}
