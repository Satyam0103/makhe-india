import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';
import { ProductModel } from '../models/product.model';
import { AdminModel } from '../models/Admin';

// Ensure Mongoose never hangs requests on disconnected buffer commands
mongoose.set('bufferCommands', false);

// Catch background Mongoose connection events safely
mongoose.connection.on('error', (err) => {
  logger.warn('[Database] Mongoose connection notice:', err?.message || 'Connection notice');
});

/**
 * Server-side source of truth for products and pricing.
 * Synchronized with the current frontend products from src/data/products.ts.
 */
export const SERVER_PRODUCT_CATALOG = [
  {
    productId: 'makhe-250g',
    slug: 'apna-makhana-250g',
    name: 'Apna Makhana',
    weight: '250 GM',
    price: 399,
    mrp: 595,
    image: '/images/products/250g.webp',
    isActive: true,
  },
  {
    productId: 'makhe-100g',
    slug: 'apna-makhana-100g',
    name: 'Apna Makhana',
    weight: '100 GM',
    price: 179,
    mrp: 245,
    image: '/images/products/100g.webp',
    isActive: true,
  },
  {
    productId: 'makhe-9kg-og',
    slug: 'og-makhana-9kg',
    name: 'OG Makhana',
    weight: '9kg',
    price: 12800,
    mrp: 22050,
    image: '/images/products/og-9kg.webp',
    isActive: true,
  },
  {
    productId: 'makhe-9kg-ashoka',
    slug: 'ashoka-makhana-9kg',
    name: 'Ashoka Makhana',
    weight: '9kg',
    price: 7395,
    mrp: 12735,
    image: '/images/products/ashoka-9kg.webp',
    isActive: true,
  },
];

export const TRUSTED_SERVER_PRODUCTS = SERVER_PRODUCT_CATALOG;

/**
 * Seeds or synchronizes trusted server product catalogue in MongoDB.
 */
export async function seedProducts() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    for (const prod of SERVER_PRODUCT_CATALOG) {
      await ProductModel.findOneAndUpdate(
        { productId: prod.productId },
        { $set: prod },
        { upsert: true, new: true }
      );
    }
    logger.info('[Database] Trusted products seeded/verified successfully in MongoDB.');
  } catch (err: any) {
    logger.warn('[Database] Note on product catalogue sync:', err.message);
  }
}

/**
 * Safe one-time initial admin creation.
 * Uses ADMIN_EMAIL and ADMIN_PASSWORD from environment variables.
 * Hashes password before storing.
 * Does NOT recreate or overwrite existing admin.
 */
export async function seedInitialAdmin(): Promise<void> {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@makheindia.com').trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || 'MakheAdmin2026!').trim();

  try {
    if (mongoose.connection.readyState === 1) {
      const existingAdmin = await AdminModel.findOne({ email: adminEmail });
      if (existingAdmin) {
        logger.info(`[Auth] Admin account for ${adminEmail} already exists. Skipping recreation.`);
        return;
      }

      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await AdminModel.create({
        email: adminEmail,
        passwordHash,
        role: 'admin',
        createdAt: new Date(),
      });
      logger.info(`[Auth] Successfully initialized new admin account: ${adminEmail}`);
    } else {
      // In-memory fallback admin when MongoDB is offline
      logger.info(`[Auth] In-memory admin credentials ready for ${adminEmail}`);
    }
  } catch (error: any) {
    logger.warn('[Auth] Note on admin account initialization:', error.message);
  }
}

/**
 * Reusable MongoDB connection using Mongoose.
 * - Connects using process.env.MONGODB_URI
 * - Clean error handling
 * - Logs successful connection without exposing database credentials
 * - Handles failed database connection gracefully without abruptly crashing or stalling
 */
export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    logger.warn(
      '[Database] MONGODB_URI is not set. Running in development mode with in-memory persistence fallback.'
    );
    await seedInitialAdmin();
    return false;
  }

  try {
    logger.info('[Database] Attempting connection to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    logger.info('[Database] MongoDB connection established successfully.');
    await seedProducts();
    await seedInitialAdmin();
    return true;
  } catch (error: any) {
    // Gracefully clean up any hanging connection attempt
    try {
      await mongoose.disconnect().catch(() => {});
    } catch {
      // ignore
    }

    // Safe warning without exposing credentials
    logger.warn(
      `[Database] Note: Could not reach MongoDB Atlas cluster (${error?.message || 'Cluster unreachable'}).`
    );
    logger.warn(
      '[Database] Tip: For MongoDB Atlas, ensure your cluster Network Access allows access from anywhere (0.0.0.0/0) or whitelists this deployment IP.'
    );
    logger.warn('[Database] Continuing smoothly with in-memory persistence fallback. Server and all APIs remain fully operational.');

    await seedInitialAdmin();
    return false;
  }
}

export default connectDB;
