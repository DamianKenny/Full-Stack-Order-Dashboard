import express from 'express';
import { getProducts, getTopProducts } from '../controllers/productController';

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/top', getTopProducts);

export default router;