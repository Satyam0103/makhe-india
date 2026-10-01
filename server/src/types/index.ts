export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type WholesaleStatus = 'new' | 'contacted' | 'closed';
export type ContactStatus = 'new' | 'resolved';

export interface IProductItem {
  productId: string;
  quantity: number;
}

export interface ICustomer {
  email: string;
  phone: string;
}

export interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrderItem {
  productId: string;
  productName: string;
  weight: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface IPaymentInfo {
  provider: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: PaymentStatus;
}
