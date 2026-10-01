/**
 * Makhé India - Frontend API Service Client
 * Connects UI workflows to production /api routes.
 * 
 * ============================================================================
 * SECURITY NOTICE:
 * - Never place payment gateway secrets (Razorpay Key Secret),
 *   database connection strings, or private API keys in frontend code.
 * - Server is the sole authority for prices and inventory.
 * ============================================================================
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface OrderCustomerPayload {
  fullName: string;
  email?: string;
  phone: string;
}

export interface OrderShippingAddressPayload {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customer: OrderCustomerPayload;
  shippingAddress: OrderShippingAddressPayload;
  items: OrderItemPayload[];
  paymentMethod?: 'cod' | 'upi';
  upiTransactionId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  order?: T;
  errors?: string[];
}

/**
 * Prepares canonical order payload.
 * SERVER MUST calculate prices from trusted product data before creating an order.
 */
export function prepareOrderPayload(
  customer: OrderCustomerPayload,
  shippingAddress: OrderShippingAddressPayload,
  items: OrderItemPayload[],
  paymentMethod: 'cod' | 'upi' = 'cod',
  upiTransactionId?: string
): CreateOrderPayload {
  return {
    customer: {
      fullName: customer.fullName.trim(),
      email: customer.email?.trim() || '',
      phone: customer.phone.trim(),
    },
    shippingAddress: {
      addressLine1: shippingAddress.addressLine1.trim(),
      addressLine2: shippingAddress.addressLine2?.trim() || undefined,
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      pincode: shippingAddress.pincode.trim(),
      country: shippingAddress.country || 'India',
    },
    items: items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
    })),
    paymentMethod,
    upiTransactionId: upiTransactionId?.trim() || undefined,
  };
}

export const api = {
  /**
   * POST /api/orders
   * Dispatches order payload to server.
   */
  async createOrder(payload: CreateOrderPayload): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return {
        ...data,
        data: data.order || data.data,
        order: data.order || data.data,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error while creating order.',
      };
    }
  },

  /**
   * GET /api/orders/:orderNumber
   * Fetches order confirmation details. Optionally accepts guest orderAccessToken.
   */
  async getOrder(orderNumber: string, token?: string): Promise<ApiResponse<any>> {
    try {
      const url = token
        ? `${API_BASE}/orders/${encodeURIComponent(orderNumber)}?token=${encodeURIComponent(token)}`
        : `${API_BASE}/orders/${encodeURIComponent(orderNumber)}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error while fetching order.',
      };
    }
  },

  /**
   * GET /api/payments/config
   * Fetches safe public gateway config and key ID.
   */
  async getPaymentConfig(): Promise<ApiResponse<{ isConfigured: boolean; keyId?: string; mode: string }>> {
    try {
      const response = await fetch(`${API_BASE}/payments/config`);
      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error while fetching payment configuration.',
      };
    }
  },

  /**
   * POST /api/payments/create
   * Requests server to initiate payment session with Razorpay.
   */
  async createPayment(orderNumber: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error initiating payment.',
      };
    }
  },

  /**
   * POST /api/payments/verify
   * Submits gateway payment credentials for server-side HMAC SHA-256 verification.
   */
  async verifyPayment(params: {
    orderNumber: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error verifying payment.',
      };
    }
  },

  /**
   * POST /api/wholesale-enquiry
   * Submits wholesale B2B lead to server.
   */
  async submitWholesaleEnquiry(payload: {
    fullName: string;
    businessName: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    businessType: string;
    productInterest: string[] | string;
    estimatedRequirement?: string;
    message?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/wholesale-enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error while submitting wholesale enquiry.',
      };
    }
  },

  /**
   * POST /api/contact
   * Submits customer message to server.
   */
  async submitContactEnquiry(payload: {
    fullName: string;
    email: string;
    phone?: string;
    enquiryType: string;
    orderNumber?: string;
    message: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error while submitting contact message.',
      };
    }
  },

  /**
   * GET /api/reviews
   * Fetches reviews, optionally filtered by productId.
   */
  async getReviews(productId?: string): Promise<ApiResponse<any[]>> {
    try {
      const url = productId
        ? `${API_BASE}/reviews?productId=${encodeURIComponent(productId)}`
        : `${API_BASE}/reviews`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error while fetching reviews.',
      };
    }
  },

  /**
   * POST /api/reviews
   * Submits a new product review.
   */
  async submitReview(payload: {
    productId: string;
    userName: string;
    location?: string;
    rating: number;
    title: string;
    comment: string;
    verifiedPurchase?: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error while submitting review.',
      };
    }
  },
};
