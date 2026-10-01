import mongoose from 'mongoose';
import crypto from 'crypto';
import { OrderModel, IOrderDocument } from '../models/order.model';
import { productService } from './product.service';
import { shippingService } from './shipping.service';
import { generateOrderNumber } from '../utils/orderNumber';
import { ICustomer, IShippingAddress, IOrderItem, IProductItem } from '../types';
import { logger } from '../utils/logger';

// In-memory fallback map for environments where MongoDB is offline during local testing
const inMemoryOrders = new Map<string, any>();

export interface CreateOrderParams {
  customer: ICustomer;
  shippingAddress: IShippingAddress;
  items: IProductItem[];
}

export const orderService = {
  /**
   * Securely create a pending order.
   * SERVER IS THE SOLE AUTHORITY FOR PRICES.
   * Generates a unique orderAccessToken for secure guest session receipt access.
   */
  async createPendingOrder(params: CreateOrderParams) {
    const { customer, shippingAddress, items } = params;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Order items list cannot be empty.');
    }

    const calculatedItems: IOrderItem[] = [];
    let subtotal = 0;

    // Fetch trusted products and calculate prices strictly server-side
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string') {
        throw new Error('Invalid product identifier provided.');
      }

      const quantity = Math.floor(Number(item.quantity));
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Quantity for product ${item.productId} must be a positive integer.`);
      }

      // Read CURRENT PRICE from database
      const trustedProduct = await productService.getActiveProduct(item.productId);
      if (!trustedProduct) {
        throw new Error(`Product ${item.productId} is not available or inactive.`);
      }

      const lineTotal = trustedProduct.price * quantity;
      subtotal += lineTotal;

      calculatedItems.push({
        productId: trustedProduct.productId,
        productName: trustedProduct.name,
        weight: trustedProduct.weight,
        quantity,
        unitPrice: trustedProduct.price,
        lineTotal,
      });
    }

    // Determine shippingAmount
    const shippingAmount = shippingService.calculateShipping({
      items: calculatedItems,
      subtotal,
      shippingAddress,
    });

    const total = subtotal + shippingAmount;
    const orderNumber = generateOrderNumber();
    const orderAccessToken = crypto.randomBytes(24).toString('hex');

    const orderData = {
      orderNumber,
      orderAccessToken,
      customer: {
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
      },
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: shippingAddress.addressLine2?.trim() || '',
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
        country: shippingAddress.country || 'India',
      },
      items: calculatedItems,
      subtotal,
      shippingAmount,
      total,
      payment: {
        provider: 'razorpay',
        status: 'pending' as const,
      },
      orderStatus: 'pending' as const,
    };

    if (mongoose.connection.readyState === 1) {
      const orderDoc = await OrderModel.create(orderData);
      logger.info(`[Order] Created pending order #${orderNumber} in MongoDB for total ₹${total}`);
      return orderDoc.toObject();
    }

    // In-memory fallback
    inMemoryOrders.set(orderNumber, {
      ...orderData,
      _id: `mock_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    logger.info(`[Order] Created pending order #${orderNumber} (in-memory) for total ₹${total}`);
    return inMemoryOrders.get(orderNumber);
  },

  /**
   * Find order by order number
   */
  async findOrderByNumber(orderNumber: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      const doc = await OrderModel.findOne({ orderNumber }).lean<IOrderDocument>();
      return doc || null;
    }
    return inMemoryOrders.get(orderNumber) || null;
  },

  /**
   * Update payment and order status
   */
  async updateOrderPaymentStatus(
    orderNumber: string,
    paymentStatus: 'pending' | 'paid' | 'failed',
    orderStatus: 'pending' | 'confirmed' | 'cancelled',
    razorpayOrderId?: string,
    razorpayPaymentId?: string
  ) {
    if (mongoose.connection.readyState === 1) {
      return OrderModel.findOneAndUpdate(
        { orderNumber },
        {
          $set: {
            'payment.status': paymentStatus,
            'payment.razorpayOrderId': razorpayOrderId,
            'payment.razorpayPaymentId': razorpayPaymentId,
            orderStatus,
          },
        },
        { new: true }
      ).lean();
    }

    const order = inMemoryOrders.get(orderNumber);
    if (order) {
      order.payment.status = paymentStatus;
      if (razorpayOrderId) order.payment.razorpayOrderId = razorpayOrderId;
      if (razorpayPaymentId) order.payment.razorpayPaymentId = razorpayPaymentId;
      order.orderStatus = orderStatus;
      order.updatedAt = new Date();
      inMemoryOrders.set(orderNumber, order);
      return order;
    }
    return null;
  },
};
