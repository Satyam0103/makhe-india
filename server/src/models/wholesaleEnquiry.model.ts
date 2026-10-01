import mongoose, { Schema, Document } from 'mongoose';
import { WholesaleStatus } from '../types';

export interface IWholesaleEnquiryDocument extends Document {
  fullName: string;
  businessName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  businessType: string;
  productInterest: string[];
  estimatedRequirement?: string;
  message?: string;
  status: WholesaleStatus;
  createdAt: Date;
  updatedAt: Date;
}

const WholesaleEnquirySchema = new Schema<IWholesaleEnquiryDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    businessType: { type: String, required: true, trim: true },
    productInterest: { type: [String], required: true },
    estimatedRequirement: { type: String, trim: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const WholesaleEnquiryModel =
  mongoose.models.WholesaleEnquiry ||
  mongoose.model<IWholesaleEnquiryDocument>('WholesaleEnquiry', WholesaleEnquirySchema);
