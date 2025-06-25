'use server';

import { createOrder, RazorpayOrder } from '@/lib/razorpay';

interface RazorpayOrderParams {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string | number | boolean>;
}

interface RazorpayOrderResult {
  success: boolean;
  orderId?: string;
  order?: RazorpayOrder;
  message?: string;
}

export async function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes,
}: RazorpayOrderParams): Promise<RazorpayOrderResult> {
  try {
    const finalAmount = Math.round(amount);

    // ✅ Sanitize notes to match Razorpay's expected type
    const sanitizedNotes: Record<string, string | number | null> | undefined =
      notes
        ? Object.fromEntries(
            Object.entries(notes).map(([key, value]) => {
              if (typeof value === 'boolean') {
                return [key, value ? 'true' : 'false']; // convert boolean to string
              }
              return [key, value];
            })
          )
        : undefined;

    const order = await createOrder({
      amount: finalAmount,
      currency,
      receipt,
      notes: sanitizedNotes,
    });

    if (!order?.id) {
      throw new Error('Order not created');
    }

    return {
      success: true,
      orderId: order.id,
      order,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error('[CREATE_RAZORPAY_ORDER_ERROR]', message, error);

    return {
      success: false,
      message,
    };
  }
}
