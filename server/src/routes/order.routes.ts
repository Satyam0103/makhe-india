import { Router } from 'express';
import { createOrder, getOrderByNumber } from '../controllers/order.controller';
import { validateCreateOrder, sanitizeBody } from '../middleware/validate';
import { submissionLimiter } from '../middleware/security';

const router = Router();

router.post('/orders', submissionLimiter, sanitizeBody, validateCreateOrder, createOrder);
router.get('/orders/:orderNumber', getOrderByNumber);

export default router;
