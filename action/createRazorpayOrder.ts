'use server';

import { createOrder } from '@/lib/razorpay';

interface RazorpayOrderParams {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export async function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes,
}: RazorpayOrderParams) {
  try {
    const finalAmount = Math.round(amount); // Razorpay requires amount in paise as integer

    console.log('Creating Razorpay Order:', {
      amount: finalAmount,
      currency,
      receipt,
      notes,
    });

    const order = await createOrder({
      amount: finalAmount,
      currency,
      receipt,
      notes,
    });

    if (!order?.id) throw new Error('Order not created');

    return {
      success: true,
      orderId: order.id,
      order,
    };
  } catch (error: any) {
    console.error('[CREATE_RAZORPAY_ORDER_ERROR]', {
      message: error?.message,
      full: error,
    });

    return {
      success: false,
      message: error?.message || 'Razorpay order creation failed',
    };
  }
}
