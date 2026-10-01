import { Router } from 'express';
import { createOrder, getOrderByNumber } from '../controllers/orderController';
import { submissionLimiter } from '../middleware/security';

const router = Router();

router.post('/orders', submissionLimiter, createOrder);
router.get('/orders/:orderNumber', getOrderByNumber);

export default router;
