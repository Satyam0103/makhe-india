import mongoose, { Schema, Document } from 'mongoose';

export interface IProductDocument extends Document {
  productId: string;
  slug: string;
  name: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    productId: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    weight: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const ProductModel = mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
