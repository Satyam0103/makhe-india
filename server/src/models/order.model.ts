import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer, IShippingAddress, IOrderItem, IPaymentInfo, OrderStatus } from '../types';

export interface IOrderDocument extends Document {
  orderNumber: string;
  orderAccessToken: string;
  customer: ICustomer;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shippingAmount: number;
  total: number;
  payment: IPaymentInfo;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    weight: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: 'India' },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPaymentInfo>(
  {
    provider: { type: String, default: 'razorpay' },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    orderAccessToken: { type: String, required: true, index: true },
    customer: { type: CustomerSchema, required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingAmount: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    payment: { type: PaymentSchema, required: true },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
