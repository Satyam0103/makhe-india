import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  productId: string;
  userName: string;
  location?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: String, required: true, trim: true, index: true },
    userName: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    verifiedPurchase: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const ReviewModel =
  mongoose.models.ProductReview ||
  mongoose.model<IReviewDocument>('ProductReview', ReviewSchema);
