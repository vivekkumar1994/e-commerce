'use server';

import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';
import { Order, IOrder } from '@/models/order';

interface FormattedProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
}

interface FormattedOrder {
  id: string;
  createdDate: string;
  statusIdentifier: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalSum: string;
  products: FormattedProduct[];
  shipping: ShippingInfo;
}

interface OrdersResponse {
  items: FormattedOrder[];
  total: number;
}

export async function getOrders(): Promise<OrdersResponse> {
  try {
    await connectToDB();

    const orders: IOrder[] = await Order.find().sort({ createdAt: -1 });

    const formattedOrders: FormattedOrder[] = orders.map((order) => ({
      id: (order._id as mongoose.Types.ObjectId).toString(),
      createdDate: order.createdAt.toISOString(),
      statusIdentifier: order.status,
      totalSum: order.product.totalPrice.toFixed(2),
      products: [
        {
          id: order.product.id,
          title: order.product.title,
          price: order.product.price,
          quantity: order.product.quantity,
        },
      ],
      shipping: {
        name: order.shipping.name,
        email: order.shipping.email,
        phone: order.shipping.phone,
        address: order.shipping.address,
        pincode: order.shipping.pincode,
      },
    }));

    return {
      items: formattedOrders,
      total: formattedOrders.length,
    };
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return {
      items: [],
      total: 0,
    };
  }
}
