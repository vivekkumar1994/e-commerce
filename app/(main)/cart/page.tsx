'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  LogIn,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCartStore from '@/stores/cartStore';
import getUserSession from '@/action/getUserSession';
import { toast } from 'sonner';
import { createRazorpayOrder } from '@/action/createRazorpayOrder';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getUserSession();
        if (userData) setUser(userData);
      } catch (error) {
        console.error({ error });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const createOrderAndCheckout = async () => {
    if (!user) {
      toast.error('You must be logged in to checkout.');
      return;
    }

    try {
      const response = await createRazorpayOrder({
        amount: Math.round(total * 100), // amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: user.id || '',
          cartLength: cartItems.length,
        },
      });

      if (!response?.success) throw new Error(response.message);

      const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: response.order.amount,
        currency: response.order.currency,
        name: 'My Store',
        description: 'Order Payment',
        image: '/logo.png', // optional logo
        order_id: response.orderId,
        handler: function (res: any) {
          toast.success('Payment Successful!', {
            description: `Payment ID: ${res.razorpay_payment_id}`,
          });
          clearCart();
          router.push('/success');
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const razorpay = new (window as any).Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error: any) {
      console.error('[RAZORPAY_ERROR]', error);
      toast.error('Failed to process payment.');
    }
  };

  return (
    <div className='min-h-screen p-4 sm:p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent'>
          Your Cart
        </h1>

        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-purple-900'></div>
          </div>
        ) : (
          <>
            <div>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className='p-4 sm:p-6 rounded-lg shadow-lg mb-4 relative overflow-hidden border-2 border-gray-200'
                >
                  <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-4'>
                    <div className='flex items-center space-x-4 mb-4 sm:mb-0'>
                      <Image
                        src={item.image}
                        alt={item.name}
                        className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md'
                      />
                      <div className='flex-1'>
                        <h3 className='text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent line-clamp-1'>
                          {item.name}
                        </h3>
                        <p className='text-gray-400'>
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center justify-between sm:justify-end sm:flex-1'>
                      <div className='flex items-center space-x-2'>
                        <Button
                          size='icon'
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className='bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white'
                        >
                          <Minus className='h-4 w-4' />
                        </Button>
                        <Input
                          type='number'
                          min='1'
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value))
                          }
                          className='w-16 text-center'
                        />
                        <Button
                          size='icon'
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className='bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white'
                        >
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => removeItem(item.id)}
                        className='text-red-500 hover:text-red-600 ml-4'
                      >
                        <Trash2 className='h-5 w-5' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='p-4 sm:p-6 rounded-lg border-gray-200 border-2 shadow-lg mt-8'>
              <h2 className='text-xl sm:text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent'>
                Order Summary
              </h2>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className='border-t border-gray-700 my-2'></div>
                <div className='flex justify-between text-lg font-semibold'>
                  <span>Total</span>
                  <span className='bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent'>
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
              {user ? (
                <Button
                  className='w-full mt-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold'
                  disabled={!cartItems.length}
                  onClick={createOrderAndCheckout}
                >
                  <CreditCard className='mr-2 h-5 w-5' />
                  Pay with Razorpay
                </Button>
              ) : (
                <Button
                  className='w-full mt-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold'
                  onClick={() => router.push('/auth')}
                >
                  <LogIn className='mr-2 h-5 w-5' />
                  Login to Checkout
                </Button>
              )}
            </div>
          </>
        )}

        {!isLoading && cartItems.length === 0 && (
          <div className='text-center py-12'>
            <ShoppingCart className='mx-auto h-16 w-16 text-gray-400 mb-4' />
            <h2 className='text-2xl font-semibold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent'>
              Your cart is empty
            </h2>
            <p className='text-gray-400 mb-6'>
              Looks like you haven&apos;t added any items yet.
            </p>
            <Button
              className='bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold'
              onClick={() => router.push('/')}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
