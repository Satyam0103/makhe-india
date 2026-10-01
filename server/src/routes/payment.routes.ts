import { Router } from 'express';
import { createPaymentSession, verifyPayment, getPaymentConfig } from '../controllers/payment.controller';
import { sanitizeBody } from '../middleware/validate';
import { submissionLimiter } from '../middleware/security';

const router = Router();

router.get('/payments/config', getPaymentConfig);
router.post('/payments/create', submissionLimiter, sanitizeBody, createPaymentSession);
router.post('/payments/verify', sanitizeBody, verifyPayment);

export default router;
