'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { createRazorpayOrder } from '@/action/createRazorpayOrder';
import { saveOrderToDB } from '@/action/createOrder'; // ✅ Make sure this path is correct

interface IUser {
  name: string;
  email: string;
  phone?: string;
}

interface IProductOrder {
  id: string;  // <-- CHANGED to string
  title: string;
  price: number;
  quantity: number;
  image?: string;
  totalPrice: number;
}

interface ILastOrder {
  product: IProductOrder;
  user: IUser;
}

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (res: RazorpayPaymentResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [lastOrder, setLastOrder] = useState<ILastOrder | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const [shippingName, setShippingName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('lastOrder');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.product && parsed.user) {
          // Ensure product.id is string (safe-guard)
          parsed.product.id = parsed.product.id.toString();
          setLastOrder(parsed);
          setShippingName(parsed.user.name);
          setShippingEmail(parsed.user.email);
          setShippingPhone(parsed.user.phone || '');
        } else throw new Error('Invalid order structure');
      } catch (err) {
        console.error('Invalid order parsing error:', err);
        toast.error('Invalid order data. Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      }
    } else {
      toast.error('No order data found. Redirecting...');
      setTimeout(() => router.push('/'), 2000);
    }
    setIsChecking(false);
  }, [router]);

  const handleProceedToPayment = async () => {
    if (
      !shippingName.trim() ||
      !shippingEmail.trim() ||
      !shippingPhone.trim() ||
      !shippingAddress.trim() ||
      !shippingPincode.trim()
    ) {
      toast.error('Please fill in all shipping details.');
      return;
    }

    if (!lastOrder) return;

    const { product, user } = lastOrder;

    try {
      toast.message('Creating Razorpay order...');
      const response = await createRazorpayOrder({
        amount: product.totalPrice * 100, // in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          productId: product.id,
          productName: product.title,
          quantity: product.quantity,
          shippingName,
          shippingAddress,
        },
      });

      if (!response?.orderId) throw new Error('Order creation failed');

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: product.totalPrice * 100,
        currency: 'INR',
        name: 'Your Store',
        description: product.title,
        image: product.image || '',
        order_id: response.orderId,
        handler: async (rzpResponse) => {
          toast.success('Payment Successful!', {
            description: `Payment ID: ${rzpResponse.razorpay_payment_id}`,
          });

          const result = await saveOrderToDB({
            user,
            product,  // <-- product.id is string now
            paymentId: rzpResponse.razorpay_payment_id,
            shippingName,
            shippingEmail,
            shippingPhone,
            shippingAddress,
            shippingPincode,
          });

          if (result.success) {
            toast.success('Order saved successfully.');
          } else {
            toast.error('Payment succeeded, but order save failed.');
          }

          router.push('/success');
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '',
        },
        theme: { color: '#9333ea' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay Error:', error);
      toast.error('Payment failed to initiate.');
    }
  };

  if (isChecking) return <p className="text-center p-8 text-lg">Checking order details...</p>;
  if (!lastOrder) return <p className="text-center p-8 text-lg">Redirecting...</p>;

  const { product, user } = lastOrder;

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 md:p-10 bg-gradient-to-br from-purple-100 via-white to-pink-100 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-extrabold text-center text-purple-700 mb-10">Checkout</h1>

      {/* Billing Details */}
      <div className="mb-8 bg-white shadow-sm rounded p-6 border">
        <h2 className="text-xl font-semibold text-purple-600 mb-4">Billing Details</h2>
        <div className="flex flex-col md:flex-row items-start gap-6">
          {product.image && (
            <Image
              src={product.image}
              height={100}
              width={100}
              alt={product.title}
              className="w-28 h-28 rounded-lg object-cover border"
            />
          )}
          <div>
            <p className="text-lg font-semibold text-gray-800">{product.title}</p>
            <p className="text-gray-600">Quantity: {product.quantity}</p>
            <p className="text-gray-600">Price per unit: ₹{product.price.toFixed(2)}</p>
            <p className="font-bold text-green-700 mt-2">Total: ₹{product.totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="mb-8 bg-white shadow-sm rounded p-6 border">
        <h2 className="text-xl font-semibold text-purple-600 mb-4">User Details</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
      </div>

      {/* Shipping Form */}
      <div className="mb-10 bg-white shadow-sm rounded p-6 border">
        <h2 className="text-xl font-semibold text-purple-600 mb-4">Shipping Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Full Name" value={shippingName} onChange={(e) => setShippingName(e.target.value)} className="border rounded px-4 py-2" />
          <input type="email" placeholder="Email" value={shippingEmail} onChange={(e) => setShippingEmail(e.target.value)} className="border rounded px-4 py-2" />
          <input type="tel" placeholder="Phone" value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} className="border rounded px-4 py-2" />
          <input type="text" placeholder="Pincode" value={shippingPincode} onChange={(e) => setShippingPincode(e.target.value)} className="border rounded px-4 py-2" />
          <textarea placeholder="Shipping Address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} className="border rounded px-4 py-2 md:col-span-2" />
        </div>
      </div>

      {/* Payment Button */}
      <div className="text-center">
        <Button
          onClick={handleProceedToPayment}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 text-lg rounded font-semibold"
        >
          Proceed to Payment
        </Button>
      </div>
    </motion.div>
  );
}
