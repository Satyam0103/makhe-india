import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { WholesaleEnquiryModel } from '../models/wholesaleEnquiry.model';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

const inMemoryWholesale: any[] = [];

export async function submitWholesaleEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      fullName,
      businessName,
      phone,
      email,
      city,
      state,
      businessType,
      productInterest,
      estimatedRequirement,
      message,
    } = req.body;

    const enquiryData = {
      fullName,
      businessName,
      phone,
      email: String(email).toLowerCase(),
      city,
      state,
      businessType,
      productInterest: Array.isArray(productInterest) ? productInterest : [productInterest],
      estimatedRequirement: estimatedRequirement || '',
      message: message || '',
      status: 'new' as const,
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const doc = await WholesaleEnquiryModel.create(enquiryData);
      logger.info(`[Wholesale] Received new enquiry from ${businessName} (${email}) in MongoDB`);
      return sendSuccess(res, { id: doc._id }, 'Thanks for sharing your requirement. Your enquiry has been received.', 201);
    }

    // In-memory fallback
    const mockId = `wh_${Date.now()}`;
    inMemoryWholesale.push({ _id: mockId, ...enquiryData });
    logger.info(`[Wholesale] Received new enquiry from ${businessName} (${email}) (in-memory)`);

    return sendSuccess(
      res,
      { id: mockId },
      'Thanks for sharing your requirement. Your enquiry has been received.',
      201
    );
  } catch (error: any) {
    next(error);
  }
}
