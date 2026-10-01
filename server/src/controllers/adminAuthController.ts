import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AdminModel } from '../models/Admin';
import { OrderModel } from '../models/Order';
import { getJwtSecret } from '../middleware/adminAuth';
import { inMemoryOrdersStore } from './orderController';

/**
 * In-memory fallback admin store for testing when MongoDB is offline.
 */
const inMemoryAdminsMap = new Map<string, { email: string; passwordHash: string; role: 'admin' }>();

export async function findFallbackAdmin(email: string): Promise<{ email: string; passwordHash: string; role: 'admin' } | null> {
  const normalized = email.toLowerCase().trim();

  // If already initialized for this email, return it
  if (inMemoryAdminsMap.has(normalized)) {
    return inMemoryAdminsMap.get(normalized)!;
  }

  const configuredEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const configuredPass = process.env.ADMIN_PASSWORD?.trim();

  if (configuredEmail && configuredPass && normalized === configuredEmail) {
    const hash = await bcrypt.hash(configuredPass, 10);
    const adminObj = { email: configuredEmail, passwordHash: hash, role: 'admin' as const };
    inMemoryAdminsMap.set(configuredEmail, adminObj);
    return adminObj;
  }

  // Also support default development credentials
  if (normalized === 'admin@makheindia.com') {
    const defaultPass = configuredPass || 'MakheAdmin2026!';
    const hash = await bcrypt.hash(defaultPass, 10);
    const adminObj = { email: 'admin@makheindia.com', passwordHash: hash, role: 'admin' as const };
    inMemoryAdminsMap.set('admin@makheindia.com', adminObj);
    return adminObj;
  }

  return null;
}

/**
 * POST /api/admin/login
 * Validates admin credentials and generates a signed JWT.
 */
export async function adminLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let adminRecord: any = null;

    if (mongoose.connection.readyState === 1) {
      adminRecord = await AdminModel.findOne({ email: normalizedEmail });
    } else {
      // In-memory fallback
      const fallback = await findFallbackAdmin(normalizedEmail);
      if (fallback) {
        adminRecord = {
          _id: 'in_memory_admin_id',
          email: fallback.email,
          passwordHash: fallback.passwordHash,
          role: 'admin',
        };
      }
    }

    if (!adminRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, adminRecord.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        id: adminRecord._id ? adminRecord._id.toString() : 'admin_default',
        email: adminRecord.email,
        role: 'admin',
      },
      secret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: adminRecord._id ? adminRecord._id.toString() : 'admin_default',
        email: adminRecord.email,
        role: 'admin',
      },
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * GET /api/admin/orders
 * Protected admin endpoint to list all orders (newest first) with optional filtering.
 */
export async function getAdminOrders(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { orderStatus, paymentMethod, paymentStatus } = req.query;

    const filter: Record<string, any> = {};
    if (orderStatus && typeof orderStatus === 'string') {
      filter.orderStatus = orderStatus.trim();
    }
    if (paymentMethod && typeof paymentMethod === 'string') {
      filter.paymentMethod = paymentMethod.trim();
    }
    if (paymentStatus && typeof paymentStatus === 'string') {
      filter.paymentStatus = paymentStatus.trim();
    }

    if (mongoose.connection.readyState === 1) {
      const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    }

    // In-memory fallback
    const all = Array.from(inMemoryOrdersStore.values());
    const filtered = all
      .filter((o) => {
        if (filter.orderStatus && o.orderStatus !== filter.orderStatus) return false;
        if (filter.paymentMethod && o.paymentMethod !== filter.paymentMethod) return false;
        if (filter.paymentStatus && o.paymentStatus !== filter.paymentStatus) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      success: true,
      count: filtered.length,
      orders: filtered,
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * GET /api/admin/orders/:id
 * Protected admin endpoint to fetch a single order by ID or orderNumber.
 */
export async function getAdminOrderById(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID or order number is required.',
      });
    }

    let order: any = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await OrderModel.findById(id).lean();
      }
      if (!order) {
        order = await OrderModel.findOne({ orderNumber: id.trim() }).lean();
      }
    } else {
      order = inMemoryOrdersStore.get(id.trim());
      if (!order) {
        for (const item of inMemoryOrdersStore.values()) {
          if (item._id === id.trim() || item.orderNumber === id.trim()) {
            order = item;
            break;
          }
        }
      }
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * PATCH /api/admin/orders/:id/status
 * Protected admin endpoint to update order status.
 * Allowed: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
 */
export async function updateAdminOrderStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!orderStatus || !allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid orderStatus. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    let updated: any = null;

    if (mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { _id: id }
        : { orderNumber: id.trim() };

      updated = await OrderModel.findOneAndUpdate(
        query,
        { $set: { orderStatus } },
        { new: true }
      ).lean();
    } else {
      let targetOrder = inMemoryOrdersStore.get(id.trim());
      if (!targetOrder) {
        for (const item of inMemoryOrdersStore.values()) {
          if (item._id === id.trim() || item.orderNumber === id.trim()) {
            targetOrder = item;
            break;
          }
        }
      }
      if (targetOrder) {
        targetOrder.orderStatus = orderStatus;
        targetOrder.updatedAt = new Date();
        updated = targetOrder;
      }
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${orderStatus}'.`,
      order: updated,
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * PATCH /api/admin/orders/:id/payment-status
 * Protected admin endpoint to update payment status.
 * Allowed: 'pending' | 'verification_pending' | 'verified' | 'failed'
 */
export async function updateAdminOrderPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const allowedStatuses = ['pending', 'verification_pending', 'verified', 'paid', 'failed'];
    if (!paymentStatus || !allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid paymentStatus. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    let updated: any = null;

    if (mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { _id: id }
        : { orderNumber: id.trim() };

      updated = await OrderModel.findOneAndUpdate(
        query,
        { $set: { paymentStatus } },
        { new: true }
      ).lean();
    } else {
      let targetOrder = inMemoryOrdersStore.get(id.trim());
      if (!targetOrder) {
        for (const item of inMemoryOrdersStore.values()) {
          if (item._id === id.trim() || item.orderNumber === id.trim()) {
            targetOrder = item;
            break;
          }
        }
      }
      if (targetOrder) {
        targetOrder.paymentStatus = paymentStatus;
        targetOrder.updatedAt = new Date();
        updated = targetOrder;
      }
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Payment status updated to '${paymentStatus}'.`,
      order: updated,
    });
  } catch (error: any) {
    next(error);
  }
}
