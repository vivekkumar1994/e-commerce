'use server';

import { cookies } from 'next/headers';
import { connectToDB } from "@/lib/db";

import { Order } from '@/models/order';

export const getOrders = async () => {
    try {
 
      const accessToken = (await cookies()).get('accessToken')?.value;
      const id = (await cookies()).get('id')?.value;
  
      if (!accessToken) {
        throw new Error('Missing access token.');
      }
      // Fetch orders for the user
      const orders = await Order.find({ userId: id }).sort({ createdDate: -1 });

      return {
        items: orders,
      };
    } catch (error) {
      console.error({ error });
    }
  };

  export const getAllOrdersForAdmin = async () => {
  try {
    await connectToDB();

    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return orders.map((order) => ({
      _id: order._id.toString(),
      createdAt: order.createdAt?.toString(),
      status: order.status,
      paymentId: order.paymentId,
      product: order.product,
      user: order.user,
      shipping: order.shipping,
    }));
  } catch (error) {
    console.error("Error fetching all orders for admin:", error);
    return [];
  }
};


export const updateOrderStatus = async (orderId: string, status: string) => {
  await connectToDB();
  await Order.findByIdAndUpdate(orderId, { status });
  return { success: true };
};