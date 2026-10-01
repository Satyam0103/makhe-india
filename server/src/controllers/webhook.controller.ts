import { Request, Response } from 'express';
import { razorpayService } from '../services/razorpay.service';
import { orderService } from '../services/order.service';
import { logger } from '../utils/logger';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * POST /api/webhooks/razorpay
 * Official webhook receiver for Razorpay payment lifecycle events.
 * 
 * Security:
 * - Checks that RAZORPAY_WEBHOOK_SECRET is configured.
 * - Cryptographically verifies x-razorpay-signature against the raw body bytes.
 * - Idempotently updates order status (reconciles state if customer closed browser early).
 */
export async function handleRazorpayWebhook(req: Request, res: Response) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    logger.warn('[Webhook] Webhook received but RAZORPAY_WEBHOOK_SECRET is not configured on server.');
    return sendError(
      res,
      'RAZORPAY_WEBHOOK_SECRET_NOT_CONFIGURED: Webhook signature verification cannot be performed without a configured webhook secret in environment.',
      503
    );
  }

  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) {
    logger.warn('[Webhook] Webhook request missing x-razorpay-signature header.');
    return sendError(res, 'Missing x-razorpay-signature header.', 400);
  }

  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);

  if (!isValid) {
    logger.error('[Webhook] Invalid Razorpay webhook signature.');
    return sendError(res, 'Invalid webhook signature.', 400);
  }

  const event = req.body?.event;
  const payload = req.body?.payload;

  logger.info(`[Webhook] Verified Razorpay event received: ${event}`);

  try {
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload?.payment?.entity;
      const orderEntity = payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;
      const orderNumber = orderEntity?.receipt || paymentEntity?.notes?.orderNumber;

      if (orderNumber) {
        const order = await orderService.findOrderByNumber(orderNumber);
        if (order) {
          if (order.payment?.status !== 'paid' || order.orderStatus !== 'confirmed') {
            await orderService.updateOrderPaymentStatus(
              orderNumber,
              'paid',
              'confirmed',
              razorpayOrderId,
              razorpayPaymentId
            );
            logger.info(`[Webhook] Reconciled and marked order #${orderNumber} as PAID + CONFIRMED via webhook.`);
          } else {
            logger.info(`[Webhook] Order #${orderNumber} was already marked paid. Idempotent skip.`);
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const orderNumber = paymentEntity?.notes?.orderNumber;

      if (orderNumber) {
        const order = await orderService.findOrderByNumber(orderNumber);
        if (order && order.payment?.status !== 'paid') {
          await orderService.updateOrderPaymentStatus(
            orderNumber,
            'failed',
            'pending',
            razorpayOrderId,
            paymentEntity?.id
          );
          logger.info(`[Webhook] Recorded payment failure for order #${orderNumber}. Order kept pending.`);
        }
      }
    }

    return sendSuccess(res, { received: true, event }, 'Webhook processed successfully.');
  } catch (err: any) {
    logger.error('[Webhook] Error handling webhook event:', err.message);
    return sendError(res, 'Internal error processing webhook event.', 500);
  }
}
