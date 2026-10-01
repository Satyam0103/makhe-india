import { Router } from 'express';
import { submitContactEnquiry } from '../controllers/contact.controller';
import { validateContactEnquiry, sanitizeBody } from '../middleware/validate';
import { submissionLimiter } from '../middleware/security';

const router = Router();

router.post('/contact', submissionLimiter, sanitizeBody, validateContactEnquiry, submitContactEnquiry);

export default router;
