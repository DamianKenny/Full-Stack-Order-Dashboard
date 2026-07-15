import express from 'express';
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  updateOrder,
  bulkUpdateOrderStatus,
  bulkDeleteOrders,
} from '../controllers/orderController';

const router = express.Router();

router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.put('/orders/:id', updateOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/bulk/status', bulkUpdateOrderStatus);
router.delete('/orders/bulk', bulkDeleteOrders);
router.delete('/orders/:id', deleteOrder);

export default router;