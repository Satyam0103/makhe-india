import { Router } from 'express';
import { getReviews, createReview } from '../controllers/review.controller';
import { sanitizeBody } from '../middleware/validate';
import { submissionLimiter } from '../middleware/security';

const router = Router();

router.get('/reviews', getReviews);
router.post('/reviews', submissionLimiter, sanitizeBody, createReview);

export default router;
