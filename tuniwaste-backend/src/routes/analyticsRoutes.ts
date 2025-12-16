import express from 'express';
import { getKPIs, getImpactMetrics, getDiversionTrend } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/kpis', authenticateToken, getKPIs);
router.get('/impact', authenticateToken, getImpactMetrics);
router.get('/diversion-trend', authenticateToken, getDiversionTrend);

export default router;

