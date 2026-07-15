import express from 'express';
import { getOrders, createOrder, updateOrderStatus, deleteOrder, updateOrder } from '../controllers/orderController';

const router = express.Router();

router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.put('/orders/:id', updateOrder);
router.patch('/orders/:id/status', updateOrderStatus); 
router.delete('/orders/:id', deleteOrder);

export default router;