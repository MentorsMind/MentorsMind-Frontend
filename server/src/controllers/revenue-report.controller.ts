import type { Request, Response } from 'express';
import { z } from 'zod';
import { ResponseUtil } from '../utils/response.utils.js';
import { RevenueReportService } from '../services/revenue-report.service.js';

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD'),
  status: z.enum(['completed', 'pending', 'failed']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const service = new RevenueReportService();

export class RevenueReportController {
  static async getTransactions(req: Request, res: Response): Promise<Response> {
    const parsed = querySchema.safeParse(req.query);

    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return ResponseUtil.validationError(res, details);
    }

    try {
      const { from, to, status, page, limit } = parsed.data;
      const data = await service.getTransactions({ from, to, status, page, limit });
      return ResponseUtil.success(res, data);
    } catch (error) {
      console.error('[RevenueReportController] getTransactions error:', error);
      return ResponseUtil.internalError(res, 'Failed to fetch transactions', error);
    }
  }
}
