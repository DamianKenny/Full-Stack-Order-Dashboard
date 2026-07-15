import express from 'express';
import {
  getRevenueAnalytics,
  getVolumeAnalytics,
  getCustomerSegmentAnalytics,
} from '../controllers/analyticsController';

const router = express.Router();

router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/volume', getVolumeAnalytics);
router.get('/analytics/customers/segments', getCustomerSegmentAnalytics);

export default router;
