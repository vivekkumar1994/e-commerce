'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

import useCartStore from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { IProduct } from '@/types/product';
import { createRazorpayOrder } from '@/action/createRazorpayOrder';

interface ProductActionsProps {
  product: IProduct;
}

interface IUserEntity {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  phone: string;
  formData?: {
    marker: string;
    value: string;
  }[];
}

// Helper function to read cookies in client-side
function getCookieValue(name: string): string | undefined {
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));
  return cookie?.split('=')[1];
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image: string;
    order_id: string;
    handler: (res: RazorpayResponse) => void;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
    theme: {
      color: string;
    };
  }

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayInstance {
    open(): void;
  }
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<IUserEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const addToCart = useCartStore((state) => state.addToCart);

  const priceRaw = product.attributeValues?.p_price?.value ?? product.price;
  const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw ?? 0;
  const totalPrice = price * quantity;
  const title = product.attributeValues?.p_title?.value || 'Untitled';
  const id = Number(product.id);
  const image = product.attributeValues?.p_image?.value?.downloadLink || '';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const email = getCookieValue('userEmail');
    const name = getCookieValue('userName');
    const role = getCookieValue('userRole');
    const avatar = getCookieValue('avatar');
    const phone = getCookieValue('userPhone');

    if (email && name && role) {
      setUser({ name, email, role, avatar, phone: phone || '' });
    } else {
      router.push('/');
    }

    setIsLoading(false);
  }, [router]);

  const handleAddToCart = () => {
    if (!id || !title || !image) {
      toast.error('Product information missing');
      return;
    }

    addToCart({ id, name: title, price, quantity, image });
    toast.success('Added to Cart', {
      description: `${title} added to cart.`,
    });
  };

  const handleBuyNow = async () => {
    if (!id || !title || !price || !image) {
      toast.error('Missing product information');
      return;
    }

    try {
      const response = await createRazorpayOrder({
        amount: totalPrice * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: { productId: id, productName: title, quantity },
      });

      if (!response?.orderId) throw new Error('Order creation failed');

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: totalPrice * 100,
        currency: 'INR',
        name: 'Your Store',
        description: title,
        image,
        order_id: response.orderId,
        handler: (rzpResponse) => {
          toast.success('Payment Successful!', {
            description: `Payment ID: ${rzpResponse.razorpay_payment_id}`,
          });
          router.push('/checkout');
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#3399cc' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay Error:', error);
      toast.error('Failed to initiate Razorpay');
    }
  };

  const increment = () => {
    if (quantity < 100) setQuantity((prev) => prev + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  if (isLoading || !user) return null;

  return (
    <div ref={mobileMenuRef}>
      <div className="mb-6">
        <label className="block mb-1 font-medium">Quantity:</label>
        <div className="flex items-center gap-2">
          <Button onClick={decrement} disabled={quantity <= 1} className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">−</Button>
          <input type="number" readOnly value={quantity} className="w-16 text-center border px-2 py-1 rounded" />
          <Button onClick={increment} disabled={quantity >= 100} className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">+</Button>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-medium">Price per unit: ₹{price.toFixed(2)}</p>
        <p className="font-semibold text-lg text-green-700">Total: ₹{totalPrice.toFixed(2)}</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleAddToCart} className="flex-1 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold">
          <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
        </Button>
        <Button onClick={handleBuyNow} className="flex-1 py-3 bg-green-600 text-white font-semibold hover:bg-green-700">
          Buy Now
        </Button>
      </div>
    </div>
  );
}
