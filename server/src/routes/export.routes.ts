import { Router } from 'express';
import { ExportController } from '../controllers/export.controller.js';

const router = Router();

// POST   /api/v1/export              — create a new export job
router.post('/', ExportController.createJob);

// GET    /api/v1/export/:jobId/status   — poll job status
router.get('/:jobId/status', ExportController.getExportStatus);

// GET    /api/v1/export/:jobId/download — download completed export (410 if expired)
router.get('/:jobId/download', ExportController.getDownload);

export default router;
