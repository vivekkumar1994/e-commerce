'use client';

import { useEffect, useRef, useState } from 'react';
import useCartStore from '@/stores/cartStore';
import { toast } from 'sonner';
import { IProduct } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserSession } from '@/action/getUserSession';
import { IUserSession } from '@/types/user';

interface ProductActionsProps {
  stock: number;
  product: IProduct;
}

export default function ProductActions({ stock, product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  const [user, setUser] = useState<IUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

   useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserSession();
        if (userData) {
          setUser(userData as IUserSession);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        // Optional logic
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const rawPrice = product.attributeValues?.p_price?.value ?? product.price ?? '0';
  const price = parseFloat(rawPrice) || 0;
  const totalPrice = price * quantity;

  const title = product.attributeValues?.p_title?.value || 'Untitled';
  const id = product.id;
  const image = product.attributeValues?.p_image?.value?.downloadLink || '';

  const handleAddToCart = () => {
    if (!id) return toast.error('Product ID is missing');
    if (!title) return toast.error('Product title is missing');
    if (!image) return toast.error('Product image is missing');

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
      const res = await fetch('/api/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice * 100,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: { productId: id, productName: title, quantity },
        }),
      });

      const data = await res.json();
      if (!data || !data.orderId) throw new Error('Order creation failed');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalPrice * 100,
        currency: 'INR',
        name: 'Your Store',
        description: title,
        image,
        order_id: data.orderId,
        handler(response: any) {
          toast.success('Payment Successful!', {
            description: `Payment ID: ${response.razorpay_payment_id}`,
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

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
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
          <button
            onClick={decrement}
            disabled={quantity <= 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            −
          </button>
          <input
            type="number"
            readOnly
            value={quantity}
            className="w-16 text-center border px-2 py-1 rounded"
          />
          <button
            onClick={increment}
            disabled={quantity >= 100}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-medium">Price per unit: ₹{price.toFixed(2)}</p>
        <p className="font-semibold text-lg text-green-700">
          Total: ₹{totalPrice.toFixed(2)}
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          className="flex-1 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={stock === 0}
          className="flex-1 py-3 bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
