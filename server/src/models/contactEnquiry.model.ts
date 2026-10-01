import mongoose, { Schema, Document } from 'mongoose';
import { ContactStatus } from '../types';

export interface IContactEnquiryDocument extends Document {
  fullName: string;
  email: string;
  phone?: string;
  enquiryType: string;
  orderNumber?: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ContactEnquirySchema = new Schema<IContactEnquiryDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    enquiryType: { type: String, required: true, trim: true },
    orderNumber: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['new', 'resolved'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ContactEnquiryModel =
  mongoose.models.ContactEnquiry ||
  mongoose.model<IContactEnquiryDocument>('ContactEnquiry', ContactEnquirySchema);
