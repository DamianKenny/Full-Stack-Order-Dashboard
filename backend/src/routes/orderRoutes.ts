import express from 'express';
import { getOrders, createOrder, updateOrderStatus } from '../controllers/orderController';

const router = express.Router();

router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus); 

export default router;