import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RazorPayKeyId as string,
  key_secret: process.env.RazorPaySecretKey as string,
});

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
  created_at: number;
  [key: string]: string | number | boolean | null | undefined;
}

export async function createOrder({
  amount,
  currency,
  receipt,
  notes,
}: {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string | number | null>;
}): Promise<RazorpayOrder> {
  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt,
    notes,
  });

  return {
    id: order.id,
    entity: order.entity,
    amount: Number(order.amount),
    currency: order.currency,
    status: order.status,
    receipt: order.receipt ?? 'no-receipt', // fallback provided
    created_at: Number(order.created_at),
  };
}
