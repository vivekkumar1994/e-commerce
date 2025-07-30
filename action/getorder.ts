'use server';

import mongoose from 'mongoose';
import { connectToDB } from '@/lib/db';
import { Order, IOrder } from '@/models/order';

interface FormattedProduct {
  id: string;  // Changed to string
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

    const formattedOrders: FormattedOrder[] = orders.map((order) => {
      const product = order.product;  // Single product object

      const formattedProduct: FormattedProduct = {
        id: product.id.toString(),  // Ensure string type
        title: product.title,
        price: product.price,
        quantity: product.quantity,
      };

      const totalSum = (product.price * product.quantity).toFixed(2);

      return {
        id: (order._id as mongoose.Types.ObjectId).toString(),
        createdDate: order.createdAt.toISOString(),
        statusIdentifier: order.status,
        totalSum,
        products: [formattedProduct],  // Wrap in array
        shipping: {
          name: order.shipping.name,
          email: order.shipping.email,
          phone: order.shipping.phone,
          address: order.shipping.address,
          pincode: order.shipping.pincode,
        },
      };
    });

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
