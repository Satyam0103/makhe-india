import mongoose from 'mongoose';
import { ProductModel, IProductDocument } from '../models/product.model';
import { TRUSTED_SERVER_PRODUCTS } from '../config/db';

export const productService = {
  /**
   * Fetch active product by productId.
   * SERVER IS THE SOLE AUTHORITY FOR PRODUCT DETAILS & PRICES.
   */
  async getActiveProduct(productId: string): Promise<{
    productId: string;
    name: string;
    weight: string;
    price: number;
    mrp: number;
    image: string;
    isActive: boolean;
  } | null> {
    if (mongoose.connection.readyState === 1) {
      const doc = await ProductModel.findOne({ productId, isActive: true }).lean<IProductDocument>();
      return doc || null;
    }

    // In-memory fallback if database connection is pending or in offline dev
    const found = TRUSTED_SERVER_PRODUCTS.find((p) => p.productId === productId && p.isActive);
    return found || null;
  },

  /**
   * Fetch all active products
   */
  async getAllActiveProducts() {
    if (mongoose.connection.readyState === 1) {
      return ProductModel.find({ isActive: true }).lean();
    }
    return TRUSTED_SERVER_PRODUCTS.filter((p) => p.isActive);
  },
};
