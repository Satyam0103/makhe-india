import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'cod' | 'upi';
export type PaymentStatus = 'pending' | 'verification_pending' | 'verified' | 'paid' | 'failed';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrderItem {
  productId: string;
  name: string;
  weight: string;
  image?: string;
  quantity: number;
  price: number;
}

export interface ICustomer {
  fullName: string;
  email: string;
  phone: string;
}

export interface IShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrderDocument extends Document {
  orderNumber: string;
  orderAccessToken?: string;
  customer: ICustomer;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shippingAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  upiTransactionId?: string;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    weight: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: 'India', trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    orderAccessToken: {
      type: String,
      index: true,
    },
    customer: {
      type: CustomerSchema,
      required: true,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (arr: IOrderItem[]) => Array.isArray(arr) && arr.length > 0,
        message: 'Order must contain at least one item.',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi'],
      default: 'cod',
      required: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'verification_pending', 'verified', 'paid', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    upiTransactionId: {
      type: String,
      trim: true,
      default: null,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
export default OrderModel;
