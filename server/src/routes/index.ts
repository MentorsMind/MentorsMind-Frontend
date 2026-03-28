import { Router } from 'express';
import healthRoutes from './health.routes.js';
import paymentRoutes from './payments.routes.js';
import { apiConfig } from '../config/api.config.js';

const router = Router();

// API version prefix
const apiVersion = apiConfig.apiVersion;

// Health check routes (no version prefix)
router.use('/health', healthRoutes);

// Versioned API routes
router.use(`/${apiVersion}/health`, healthRoutes);
router.use(`/${apiVersion}/payments`, paymentRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'MentorMinds API',
      version: apiVersion,
      description: 'Backend API for MentorMinds Platform',
      endpoints: {
        health: '/health',
        api: `/${apiVersion}`,
      },
    },
  });
});

export default router;
