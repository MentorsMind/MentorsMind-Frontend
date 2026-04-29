import type { Request, Response } from 'express';
import { z } from 'zod';
import { ResponseUtil } from '../utils/response.utils.js';
import { RevenueReportService } from '../services/revenue-report.service.js';

/**
 * Accept full ISO 8601 timestamps.
 * The frontend sends:
 *   from = "2025-01-01T00:00:00.000Z"  (start of day UTC)
 *   to   = "2025-01-31T23:59:59.999Z"  (end of day UTC)
 */
const ISO_8601_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const querySchema = z
  .object({
    from: z
      .string()
      .regex(ISO_8601_RE, 'from must be a full ISO 8601 UTC timestamp (e.g. 2025-01-01T00:00:00.000Z)'),
    to: z
      .string()
      .regex(ISO_8601_RE, 'to must be a full ISO 8601 UTC timestamp (e.g. 2025-01-31T23:59:59.999Z)'),
    status: z.enum(['completed', 'pending', 'failed']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  })
  .refine((d) => new Date(d.from) < new Date(d.to), {
    message: 'Start date must be before end date',
    path: ['from'],
  });

const service = new RevenueReportService();

export class RevenueReportController {
  static async getTransactions(req: Request, res: Response): Promise<Response> {
    const parsed = querySchema.safeParse(req.query);

    if (!parsed.success) {
      // Return the first human-readable message so the frontend can show it inline.
      const firstError = parsed.error.errors[0];
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: firstError.message,
          details: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      });
    }

    try {
      const { from, to, status, page, limit } = parsed.data;
      const data = await service.getTransactions({ from, to, status, page, limit });
      return ResponseUtil.success(res, data);
    } catch (error) {
      console.error('[RevenueReportController] getTransactions error:', error);
      return ResponseUtil.internalError(res, 'Failed to fetch transactions', error as Error);
    }
  }
}
