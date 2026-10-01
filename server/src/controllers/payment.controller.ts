import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { razorpayService } from '../services/razorpay.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * GET /api/payments/config
 * Returns safe public gateway status and key ID (never key secret).
 */
export async function getPaymentConfig(_req: Request, res: Response) {
  const isConfigured = razorpayService.isConfigured();
  const keyId = razorpayService.getPublicKey();
  return sendSuccess(res, {
    isConfigured,
    keyId: isConfigured ? keyId : undefined,
    mode: keyId.startsWith('rzp_test_') ? 'test' : keyId.startsWith('rzp_live_') ? 'live' : 'unconfigured',
  });
}

/**
 * POST /api/payments/create
 * Creates a Razorpay order from the trusted internal order total in paise.
 */
export async function createPaymentSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderNumber } = req.body;

    if (!orderNumber || typeof orderNumber !== 'string') {
      return sendError(res, 'orderNumber is required.', 400);
    }

    try {
      const session = await paymentService.createPaymentSession(orderNumber.trim());
      return sendSuccess(res, session, 'Payment session created.');
    } catch (err: any) {
      if (err.message === 'PAYMENT_GATEWAY_NOT_CONFIGURED') {
        return sendError(
          res,
          'PAYMENT_GATEWAY_NOT_CONFIGURED: Razorpay credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured on this server.',
          503
        );
      }
      return sendError(res, err.message || 'Failed to create payment session.', 400);
    }
  } catch (error: any) {
    next(error);
  }
}

/**
 * POST /api/payments/verify
 * Cryptographic server HMAC SHA-256 verification of Razorpay payment signature.
 */
export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderNumber || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return sendError(
        res,
        'Missing required payment verification parameters (orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature).',
        400
      );
    }

    try {
      const result = await paymentService.verifyPayment({
        orderNumber: String(orderNumber).trim(),
        razorpayOrderId: String(razorpayOrderId).trim(),
        razorpayPaymentId: String(razorpayPaymentId).trim(),
        razorpaySignature: String(razorpaySignature).trim(),
      });

      return sendSuccess(res, result, 'Payment verified successfully.');
    } catch (err: any) {
      if (err.message === 'Payment signature verification failed.') {
        return sendError(
          res,
          'Payment signature verification failed. Transaction was not confirmed.',
          400
        );
      }
      if (err.message === 'PAYMENT_GATEWAY_NOT_CONFIGURED') {
        return sendError(
          res,
          'Payment gateway verification credentials are not configured on this server.',
          503
        );
      }
      return sendError(res, err.message || 'Payment verification failed.', 400);
    }
  } catch (error: any) {
    next(error);
  }
}
