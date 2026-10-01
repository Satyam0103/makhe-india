import { Router } from 'express';
import { handleRazorpayWebhook } from '../controllers/webhook.controller';

const router = Router();

// Official webhook endpoint for Razorpay notifications
router.post('/webhooks/razorpay', handleRazorpayWebhook);

export default router;
