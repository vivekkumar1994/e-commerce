'use server';

import { cookies } from 'next/headers';

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
