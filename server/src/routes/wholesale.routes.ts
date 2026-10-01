import { Router } from 'express';
import { submitWholesaleEnquiry } from '../controllers/wholesale.controller';
import { validateWholesaleEnquiry, sanitizeBody } from '../middleware/validate';
import { submissionLimiter } from '../middleware/security';

const router = Router();

router.post('/wholesale-enquiry', submissionLimiter, sanitizeBody, validateWholesaleEnquiry, submitWholesaleEnquiry);

export default router;
