import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RazorPayKeyId as string,
  key_secret: process.env.RazorPaySecretKey as string,
});

export async function createOrder({
  amount,
  currency,
  receipt,
  notes,
}: {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, any>;
}) {
  return razorpay.orders.create({
    amount, // already rounded by caller
    currency,
    receipt,
    notes,
  });
}
