import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * Reusable Razorpay Gateway Service
 * Manages official Razorpay Node SDK instance, order creation in paise,
 * and server-side HMAC SHA-256 signature verifications.
 * 
 * Safe under missing credentials: does not crash server startup;
 * returns structured errors when payment endpoints are called.
 */
class RazorpayService {
  private instance: Razorpay | null = null;
  private keyId: string = '';
  private keySecret: string = '';

  constructor() {
    this.refreshConfig();
  }

  /**
   * Refreshes credentials from environment (supports dynamic injection).
   */
  public refreshConfig(): boolean {
    const envKeyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
    const envKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

    if (envKeyId && envKeySecret) {
      if (this.keyId !== envKeyId || this.keySecret !== envKeySecret || !this.instance) {
        this.keyId = envKeyId;
        this.keySecret = envKeySecret;
        try {
          this.instance = new Razorpay({
            key_id: this.keyId,
            key_secret: this.keySecret,
          });
          const isTestMode = this.keyId.startsWith('rzp_test_');
          logger.info(
            `[Razorpay] Reusable SDK initialized in ${isTestMode ? 'TEST MODE' : 'LIVE MODE'} (${this.keyId.slice(0, 10)}...)`
          );
        } catch (err: any) {
          logger.error('[Razorpay] Initialization failure:', err.message);
          this.instance = null;
        }
      }
      return true;
    }

    this.instance = null;
    this.keyId = '';
    this.keySecret = '';
    return false;
  }

  public isConfigured(): boolean {
    this.refreshConfig();
    return !!this.instance && !!this.keyId && !!this.keySecret;
  }

  public getPublicKey(): string {
    this.refreshConfig();
    return this.keyId;
  }

  /**
   * Create Razorpay order with trusted amount in paise (1 INR = 100 paise).
   */
  public async createRazorpayOrder(options: {
    amountInPaise: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<{ id: string; amount: number; currency: string }> {
    if (!this.isConfigured() || !this.instance) {
      throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
    }

    const order = await this.instance.orders.create({
      amount: options.amountInPaise,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      notes: options.notes || {},
    });

    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency || 'INR',
    };
  }

  /**
   * Cryptographic server-side HMAC SHA-256 verification of Razorpay payment signature.
   * Compares timingSafeEqual to avoid timing leak attacks.
   */
  public verifyPaymentSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    if (!this.isConfigured()) {
      throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature.length !== razorpaySignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(razorpaySignature, 'utf-8')
    );
  }

  /**
   * Webhook HMAC SHA-256 signature verification using RAZORPAY_WEBHOOK_SECRET.
   */
  public verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      throw new Error('WEBHOOK_SECRET_NOT_CONFIGURED');
    }

    if (!rawBody || !signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature.length !== signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  }
}

export const razorpayService = new RazorpayService();
