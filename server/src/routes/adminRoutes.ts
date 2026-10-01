import { Router } from 'express';
import {
  adminLogin,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  updateAdminOrderPaymentStatus,
} from '../controllers/adminAuthController';
import { adminAuth } from '../middleware/adminAuth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Login rate limiter: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

// Admin authentication route
router.post('/admin/login', loginLimiter, adminLogin);

// Protected admin order management routes
router.get('/admin/orders', adminAuth, getAdminOrders);
router.get('/admin/orders/:id', adminAuth, getAdminOrderById);
router.patch('/admin/orders/:id/status', adminAuth, updateAdminOrderStatus);
router.patch('/admin/orders/:id/payment-status', adminAuth, updateAdminOrderPaymentStatus);

export default router;
