import { Router } from 'express';
import healthRoutes from './health.routes';
import orderRoutes from './orderRoutes';
import adminRoutes from './adminRoutes';
import paymentRoutes from './payment.routes';
import wholesaleRoutes from './wholesale.routes';
import contactRoutes from './contact.routes';
import webhookRoutes from './webhook.routes';
import bannerRoutes from './banner.routes';
import reviewRoutes from './review.routes';
import assetRoutes from './asset.routes';

const router = Router();

router.use(healthRoutes);
router.use(orderRoutes);
router.use(adminRoutes);
router.use(assetRoutes);
router.use(paymentRoutes);
router.use(wholesaleRoutes);
router.use(contactRoutes);
router.use(webhookRoutes);
router.use(bannerRoutes);
router.use(reviewRoutes);

export default router;
