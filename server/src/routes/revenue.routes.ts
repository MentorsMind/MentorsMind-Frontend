import { Router } from 'express';
import { RevenueReportController } from '../controllers/revenue-report.controller.js';

const router = Router();

// GET /api/v1/revenue/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD[&status=completed|pending|failed][&page=1&limit=10]
router.get('/transactions', RevenueReportController.getTransactions);

export default router;
