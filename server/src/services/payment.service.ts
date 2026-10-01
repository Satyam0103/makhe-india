import { orderService } from './order.service';
import { razorpayService } from './razorpay.service';
import { logger } from '../utils/logger';

export interface CreatePaymentResult {
  orderNumber: string;
  razorpayOrderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
}

export const paymentService = {
  /**
   * Create Razorpay payment intent for a pending order.
   * SERVER IS THE SOLE AUTHORITY FOR PRICES & AMOUNT.
   * Converted strictly to paise (1 INR = 100 paise).
   */
  async createPaymentSession(orderNumber: string): Promise<CreatePaymentResult> {
    const order = await orderService.findOrderByNumber(orderNumber);
    if (!order) {
      throw new Error(`Order #${orderNumber} was not found.`);
    }

    // Check if order is already paid (idempotency check)
    if (order.payment?.status === 'paid' || order.orderStatus === 'confirmed') {
      throw new Error(`Order #${orderNumber} is already paid and confirmed.`);
    }

    if (!razorpayService.isConfigured()) {
      logger.warn(`[Payment] Razorpay credentials missing when attempting to create payment for #${orderNumber}`);
      throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
    }

    // Convert rupees to paise (e.g., ₹179 -> 17900 paise, ₹757 -> 75700 paise)
    const amountInPaise = Math.round(order.total * 100);

    // Create official order on Razorpay
    const rzpOrder = await razorpayService.createRazorpayOrder({
      amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderNumber: order.orderNumber,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
      },
    });

    // Save razorpayOrderId to the Makhé internal order
    await orderService.updateOrderPaymentStatus(
      order.orderNumber,
      'pending',
      'pending',
      rzpOrder.id
    );

    logger.info(`[Payment] Razorpay order ${rzpOrder.id} created for #${order.orderNumber} (amount: ${amountInPaise} paise)`);

    return {
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: razorpayService.getPublicKey(),
    };
  },

  /**
   * Cryptographic server-side HMAC SHA-256 verification.
   * Safe, idempotent, never marks order paid on invalid signature.
   */
  async verifyPayment(params: {
    orderNumber: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    const order = await orderService.findOrderByNumber(orderNumber);
    if (!order) {
      throw new Error(`Order #${orderNumber} was not found.`);
    }

    // Idempotency: If already paid, return confirmed without re-triggering side effects
    if (order.payment?.status === 'paid' && order.orderStatus === 'confirmed') {
      logger.info(`[Payment] Idempotent verify: Order #${orderNumber} is already paid.`);
      return {
        orderNumber: order.orderNumber,
        paymentStatus: 'paid' as const,
        orderStatus: 'confirmed' as const,
        alreadyProcessed: true,
      };
    }

    if (!razorpayService.isConfigured()) {
      logger.error('[Payment] Cannot verify payment: Gateway credentials unconfigured.');
      throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
    }

    const isValidSignature = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      logger.error(`[Payment] Signature verification failed for order #${orderNumber} (Razorpay order: ${razorpayOrderId})`);
      // Update payment status to failed, leave order as pending
      await orderService.updateOrderPaymentStatus(
        orderNumber,
        'failed',
        'pending',
        razorpayOrderId,
        razorpayPaymentId
      );
      throw new Error('Payment signature verification failed.');
    }

    // Valid signature: mark order as PAID + CONFIRMED
    const updated = await orderService.updateOrderPaymentStatus(
      orderNumber,
      'paid',
      'confirmed',
      razorpayOrderId,
      razorpayPaymentId
    );

    logger.info(`[Payment] Payment verified successfully. Order #${orderNumber} is now PAID + CONFIRMED.`);

    return {
      orderNumber: updated?.orderNumber || orderNumber,
      paymentStatus: 'paid' as const,
      orderStatus: 'confirmed' as const,
    };
  },
};
