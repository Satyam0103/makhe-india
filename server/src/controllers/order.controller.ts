import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { customer, shippingAddress, items } = req.body;

    const order = await orderService.createPendingOrder({
      customer,
      shippingAddress,
      items,
    });

    return sendSuccess(
      res,
      {
        orderNumber: order.orderNumber,
        orderAccessToken: order.orderAccessToken,
        items: order.items,
        subtotal: order.subtotal,
        shippingAmount: order.shippingAmount,
        total: order.total,
        orderStatus: order.orderStatus,
        paymentStatus: order.payment?.status,
      },
      'Order created successfully.',
      201
    );
  } catch (error: any) {
    next(error);
  }
}

/**
 * GET /api/orders/:orderNumber
 * Secure order retrieval endpoint.
 * Requires token query parameter or x-order-token header for full order access.
 * Otherwise returns only safe, sanitized tracking data to prevent public enumeration of PII.
 */
export async function getOrderByNumber(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderNumber } = req.params;
    const providedToken = (req.query.token as string) || (req.headers['x-order-token'] as string);

    if (!orderNumber || typeof orderNumber !== 'string') {
      return sendError(res, 'Valid order number is required.', 400);
    }

    const order = await orderService.findOrderByNumber(orderNumber.trim());
    if (!order) {
      return sendError(res, 'Order not found.', 404);
    }

    // Check token authentication for guest order confirmation
    const isAuthorized = Boolean(
      providedToken &&
      order.orderAccessToken &&
      providedToken.trim() === order.orderAccessToken
    );

    if (isAuthorized) {
      // Full order view for authorized session/token
      return sendSuccess(res, {
        orderNumber: order.orderNumber,
        orderAccessToken: order.orderAccessToken,
        items: order.items,
        subtotal: order.subtotal,
        shippingAmount: order.shippingAmount,
        total: order.total,
        shippingAddress: {
          fullName: order.shippingAddress?.fullName,
          addressLine1: order.shippingAddress?.addressLine1,
          addressLine2: order.shippingAddress?.addressLine2,
          city: order.shippingAddress?.city,
          state: order.shippingAddress?.state,
          pincode: order.shippingAddress?.pincode,
          country: order.shippingAddress?.country,
        },
        customer: {
          email: order.customer?.email,
          phone: order.customer?.phone,
        },
        payment: {
          provider: order.payment?.provider,
          status: order.payment?.status,
          razorpayOrderId: order.payment?.razorpayOrderId,
          razorpayPaymentId: order.payment?.razorpayPaymentId,
        },
        paymentStatus: order.payment?.status,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        isAuthorized: true,
      });
    }

    // Unauthenticated/public tracking view (prevents PII leakage to arbitrary order guessers)
    return sendSuccess(res, {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.payment?.status,
      itemsCount: order.items?.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || 0,
      total: order.total,
      shippingCity: order.shippingAddress?.city,
      shippingState: order.shippingAddress?.state,
      createdAt: order.createdAt,
      isAuthorized: false,
    });
  } catch (error: any) {
    next(error);
  }
}
