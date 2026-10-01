import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { OrderModel, IOrderItem } from '../models/Order';
import { generateOrderNumber } from '../utils/generateOrderNumber';
import { SERVER_PRODUCT_CATALOG } from '../config/db';
import { logger } from '../utils/logger';

// In-memory order map for test resilience when MongoDB is offline
export const inMemoryOrdersStore = new Map<string, any>();

/**
 * Validates email format with standard regex
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates Indian 10-digit phone number or international standard
 */
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

/**
 * POST /api/orders
 * Secure order creation endpoint.
 * Pricing is strictly calculated on the SERVER based on SERVER_PRODUCT_CATALOG.
 */
export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { customer, shippingAddress, items, paymentMethod, upiTransactionId } = req.body;

    // 1. Validate Customer Information
    if (!customer || typeof customer !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Customer information is required.',
      });
    }

    const fullName = customer.fullName?.trim();
    const email = customer.email?.trim().toLowerCase();
    const phone = customer.phone?.trim();

    if (!fullName || fullName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Customer full name is required (minimum 2 characters).',
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'A valid 10-digit mobile number is required.',
      });
    }

    // 2. Validate Shipping Address
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required.',
      });
    }

    const addressLine1 = shippingAddress.addressLine1?.trim();
    const addressLine2 = shippingAddress.addressLine2?.trim() || '';
    const city = shippingAddress.city?.trim();
    const state = shippingAddress.state?.trim();
    const pincode = shippingAddress.pincode?.trim();
    const country = shippingAddress.country?.trim() || 'India';

    if (!addressLine1) {
      return res.status(400).json({
        success: false,
        message: 'Shipping addressLine1 is required.',
      });
    }

    if (!city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Shipping city and state are required.',
      });
    }

    if (!pincode || !/^\d{6}$/.test(pincode.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'A valid 6-digit postal code (PIN code) is required.',
      });
    }

    // 3. Validate Cart Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items cannot be empty.',
      });
    }

    // 4. Validate Payment Method
    const allowedPaymentMethods = ['cod', 'upi'];
    const chosenPaymentMethod = (paymentMethod || 'cod').toLowerCase().trim();
    if (!allowedPaymentMethods.includes(chosenPaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid paymentMethod. Allowed options: ${allowedPaymentMethods.join(', ')}`,
      });
    }

    // 5. Calculate Server-Side Pricing (DO NOT TRUST CLIENT TOTALS)
    const calculatedItems: IOrderItem[] = [];
    let serverSubtotal = 0;

    for (const rawItem of items) {
      const pid = rawItem.productId?.trim();
      const quantity = Math.floor(Number(rawItem.quantity));

      if (!pid) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a valid productId.',
        });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Quantity for product "${pid}" must be a positive integer greater than zero.`,
        });
      }

      // Look up authentic price from server catalog (never trust client prices)
      const catalogProduct = SERVER_PRODUCT_CATALOG.find(
        (p) =>
          p.productId === pid ||
          p.slug === pid ||
          (pid === 'product-listing-250gm' && p.productId === 'makhe-250g') ||
          (pid === 'product-listing-100gm' && p.productId === 'makhe-100g') ||
          (pid === 'product-listing-og-9kg' && p.productId === 'makhe-9kg-og') ||
          (pid === 'product-listing-ashoka-9kg' && p.productId === 'makhe-9kg-ashoka')
      );
      if (!catalogProduct) {
        return res.status(400).json({
          success: false,
          message: `Product "${pid}" does not exist in the official store catalog.`,
        });
      }

      const itemTotal = catalogProduct.price * quantity;
      serverSubtotal += itemTotal;

      calculatedItems.push({
        productId: catalogProduct.productId,
        name: catalogProduct.name,
        weight: catalogProduct.weight,
        image: catalogProduct.image,
        quantity,
        price: catalogProduct.price,
      });
    }

    // Standard store rule: Free shipping on orders
    const shippingAmount = 0;
    const serverTotal = serverSubtotal + shippingAmount;

    // Validate UPI Transaction ID if UPI was selected
    if (chosenPaymentMethod === 'upi') {
      if (!upiTransactionId || typeof upiTransactionId !== 'string' || upiTransactionId.trim().length < 4) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid UPI Transaction ID / UTR number for verification.',
        });
      }
    }

    // 6. Generate Human-Readable Order Number & Access Token
    const orderNumber = generateOrderNumber();
    const orderAccessToken = crypto.randomBytes(24).toString('hex');

    const newOrderData: Record<string, any> = {
      orderNumber,
      orderAccessToken,
      customer: {
        fullName,
        email: email || '',
        phone,
      },
      shippingAddress: {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country,
      },
      items: calculatedItems,
      subtotal: serverSubtotal,
      shippingAmount,
      total: serverTotal,
      paymentMethod: chosenPaymentMethod,
      paymentStatus: chosenPaymentMethod === 'cod' ? 'pending' : 'verification_pending',
      upiTransactionId: chosenPaymentMethod === 'upi' ? upiTransactionId.trim() : undefined,
      orderStatus: 'confirmed' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 7. Save Order strictly in MongoDB (In-memory fallback disabled for production orders)
    let savedOrder: any = null;

    if (mongoose.connection.readyState === 1) {
      const orderDoc = await OrderModel.create(newOrderData);
      savedOrder = orderDoc.toObject();
      logger.info(`[Order] Successfully saved order #${orderNumber} in MongoDB for ₹${serverTotal}`);
    } else {
      logger.error(`[Order] Failed to save order #${orderNumber}: Database connection is offline.`);
      return res.status(503).json({
        success: false,
        message: 'Order could not be processed because the database is offline. Please try again.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: {
        orderNumber: savedOrder.orderNumber,
        orderAccessToken: savedOrder.orderAccessToken,
        customer: savedOrder.customer,
        shippingAddress: savedOrder.shippingAddress,
        items: savedOrder.items,
        subtotal: savedOrder.subtotal,
        shippingAmount: savedOrder.shippingAmount,
        total: savedOrder.total,
        paymentMethod: savedOrder.paymentMethod,
        paymentStatus: savedOrder.paymentStatus,
        upiTransactionId: savedOrder.upiTransactionId,
        orderStatus: savedOrder.orderStatus,
        createdAt: savedOrder.createdAt,
      },
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * GET /api/orders/:orderNumber
 * Order lookup endpoint for confirmation and customer tracking.
 * Safe design: returns full order only if access token / authorization is provided,
 * otherwise returns non-PII tracking information to prevent public enumeration.
 */
export async function getOrderByNumber(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { orderNumber } = req.params;
    const providedToken = (req.query.token as string) || (req.headers['x-order-token'] as string);

    if (!orderNumber || typeof orderNumber !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid order number is required.',
      });
    }

    const cleanOrderNumber = orderNumber.trim();
    let order: any = null;

    if (mongoose.connection.readyState === 1) {
      order = await OrderModel.findOne({ orderNumber: cleanOrderNumber }).lean();
    } else {
      order = inMemoryOrdersStore.get(cleanOrderNumber);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Check token authentication for full receipt view
    const isAuthorized = Boolean(
      providedToken &&
      order.orderAccessToken &&
      providedToken.trim() === order.orderAccessToken
    );

    if (isAuthorized) {
      // Full view with customer details
      return res.status(200).json({
        success: true,
        isAuthorized: true,
        order: {
          orderNumber: order.orderNumber,
          customer: order.customer,
          shippingAddress: order.shippingAddress,
          items: order.items,
          subtotal: order.subtotal,
          shippingAmount: order.shippingAmount,
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          upiTransactionId: order.upiTransactionId,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
        },
      });
    }

    // Public tracking view (protects PII from unauthenticated guessers)
    return res.status(200).json({
      success: true,
      isAuthorized: false,
      order: {
        orderNumber: order.orderNumber,
        itemsCount: order.items?.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || 0,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        shippingCity: order.shippingAddress?.city,
        shippingState: order.shippingAddress?.state,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    next(error);
  }
}
