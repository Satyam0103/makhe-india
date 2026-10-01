import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ContactEnquiryModel } from '../models/contactEnquiry.model';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

const inMemoryContact: any[] = [];

export async function submitContactEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullName, email, phone, enquiryType, orderNumber, message } = req.body;

    const enquiryData = {
      fullName,
      email: String(email).toLowerCase(),
      phone: phone || '',
      enquiryType,
      orderNumber: orderNumber || '',
      message,
      status: 'new' as const,
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const doc = await ContactEnquiryModel.create(enquiryData);
      logger.info(`[Contact] Received contact message from ${fullName} (${email}) in MongoDB`);
      return sendSuccess(res, { id: doc._id }, 'Your enquiry has been received successfully.', 201);
    }

    // In-memory fallback
    const mockId = `ct_${Date.now()}`;
    inMemoryContact.push({ _id: mockId, ...enquiryData });
    logger.info(`[Contact] Received contact message from ${fullName} (${email}) (in-memory)`);

    return sendSuccess(res, { id: mockId }, 'Your enquiry has been received successfully.', 201);
  } catch (error: any) {
    next(error);
  }
}
