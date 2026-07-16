import express from 'express';
import {
  triggerTraining,
  getPredictions,
  getTopProducts,
  getMLStatus,
  exportPredictionsCSV
} from '../controllers/mlController';

const router = express.Router();

// POST /api/ml/train - Trigger ML model training
router.post('/train', triggerTraining);

// GET /api/ml/predictions/:period - Get all predictions for a period
router.get('/predictions/:period', getPredictions);

// GET /api/ml/top-products/:period - Get top N predicted products
router.get('/top-products/:period', getTopProducts);

// GET /api/ml/status - Get ML service status
router.get('/status', getMLStatus);

// GET /api/ml/export/:period - Export predictions as CSV
router.get('/export/:period', exportPredictionsCSV);

export default router;