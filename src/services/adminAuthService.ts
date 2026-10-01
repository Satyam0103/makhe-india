/**
 * Admin Authentication & API Client Service
 * Interacts directly with existing backend admin endpoints:
 * - POST /api/admin/login
 * - GET /api/admin/orders
 * - GET /api/admin/orders/:id
 * - PATCH /api/admin/orders/:id/status
 * - PATCH /api/admin/orders/:id/payment-status
 */

const TOKEN_KEY = 'makhe_admin_jwt_token';
const ADMIN_USER_KEY = 'makhe_admin_user_profile';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface AdminOrderItem {
  productId: string;
  name: string;
  weight: string;
  image?: string;
  quantity: number;
  price: number;
}

export interface AdminOrderCustomer {
  fullName: string;
  email: string;
  phone: string;
}

export interface AdminOrderShipping {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  orderAccessToken?: string;
  customer: AdminOrderCustomer;
  shippingAddress: AdminOrderShipping;
  items: AdminOrderItem[];
  subtotal: number;
  shippingAmount: number;
  total: number;
  paymentMethod: 'cod' | 'upi';
  paymentStatus: 'pending' | 'verification_pending' | 'verified' | 'paid' | 'failed';
  upiTransactionId?: string;
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ADMIN_USER_KEY) || sessionStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminSession(token: string, user: AdminUser, remember: boolean = true): void {
  if (typeof window === 'undefined') return;
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  // Clean up opposite storage
  if (remember) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_USER_KEY);
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  return Boolean(token && token.trim().length > 10);
}

/**
 * Handle HTTP authorization error safely without full page redirect
 */
function handleAuthError(res: Response): void {
  if (res.status === 401 || res.status === 403) {
    clearAdminSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('makhe_admin_auth_failed'));
    }
  }
}

/**
 * Admin Login API call
 */
export async function adminLoginApi(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; token?: string; admin?: AdminUser }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        message: data?.message || (res.status === 401 ? 'Invalid email or password.' : 'Server unavailable. Please try again later.'),
      };
    }

    if (data.token && data.admin) {
      setAdminSession(data.token, data.admin);
    }

    return {
      success: true,
      message: data.message || 'Login successful.',
      token: data.token,
      admin: data.admin,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Network error: Unable to connect to server. Please check your internet connection.',
    };
  }
}

/**
 * Fetch all orders from protected admin API
 */
export async function fetchAdminOrdersApi(filters?: {
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}): Promise<{ success: boolean; orders: AdminOrder[]; count: number; message?: string }> {
  const token = getAdminToken();
  if (!token) {
    clearAdminSession();
    return { success: false, orders: [], count: 0, message: 'Admin authentication required.' };
  }

  const query = new URLSearchParams();
  if (filters?.orderStatus && filters.orderStatus !== 'all') {
    query.set('orderStatus', filters.orderStatus);
  }
  if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
    query.set('paymentMethod', filters.paymentMethod);
  }
  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    query.set('paymentStatus', filters.paymentStatus);
  }

  const url = `/api/admin/orders${query.toString() ? `?${query.toString()}` : ''}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    handleAuthError(res);

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      return {
        success: false,
        orders: [],
        count: 0,
        message: errData?.message || 'Unable to load orders. Please try again.',
      };
    }

    const data = await res.json();
    return {
      success: true,
      orders: data.orders || [],
      count: data.count || (data.orders ? data.orders.length : 0),
    };
  } catch (err: any) {
    return {
      success: false,
      orders: [],
      count: 0,
      message: 'Unable to load orders. Please check your connection and try again.',
    };
  }
}

/**
 * Fetch single order by ID or orderNumber
 */
export async function fetchAdminOrderByIdApi(id: string): Promise<{
  success: boolean;
  order?: AdminOrder;
  message?: string;
}> {
  const token = getAdminToken();
  if (!token) {
    clearAdminSession();
    return { success: false, message: 'Admin authentication required.' };
  }

  try {
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    handleAuthError(res);

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      return {
        success: false,
        message: errData?.message || 'Order not found.',
      };
    }

    const data = await res.json();
    return {
      success: true,
      order: data.order,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Network error fetching order details.',
    };
  }
}

/**
 * Update Order Status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
 */
export async function updateAdminOrderStatusApi(
  id: string,
  orderStatus: string
): Promise<{ success: boolean; order?: AdminOrder; message?: string }> {
  const token = getAdminToken();
  if (!token) {
    clearAdminSession();
    return { success: false, message: 'Admin authentication required.' };
  }

  try {
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderStatus }),
    });

    handleAuthError(res);

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      return {
        success: false,
        message: data?.message || 'Failed to update order status.',
      };
    }

    return {
      success: true,
      order: data.order,
      message: data.message || `Order status updated to '${orderStatus}'.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Network error updating order status.',
    };
  }
}

/**
 * Update Payment Status: 'pending' | 'verification_pending' | 'verified' | 'paid' | 'failed'
 */
export async function updateAdminOrderPaymentStatusApi(
  id: string,
  paymentStatus: string
): Promise<{ success: boolean; order?: AdminOrder; message?: string }> {
  const token = getAdminToken();
  if (!token) {
    clearAdminSession();
    return { success: false, message: 'Admin authentication required.' };
  }

  try {
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}/payment-status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentStatus }),
    });

    handleAuthError(res);

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      return {
        success: false,
        message: data?.message || 'Failed to update payment status.',
      };
    }

    return {
      success: true,
      order: data.order,
      message: data.message || `Payment status updated to '${paymentStatus}'.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Network error updating payment status.',
    };
  }
}
