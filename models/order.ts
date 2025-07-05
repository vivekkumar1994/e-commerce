import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image?: string;
}

export interface IUser {
  name: string;
  email: string;
  phone?: string;
}

export interface IShipping {
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
}

export interface IOrder extends Document {
  user: IUser;
  product: IProduct;
  paymentId: string;
  shipping: IShipping;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
    },
    product: {
      id: { type: Number, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      image: String,
    },
    paymentId: { type: String, required: true },
    shipping: {
      name: String,
      email: String,
      phone: String,
      address: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
