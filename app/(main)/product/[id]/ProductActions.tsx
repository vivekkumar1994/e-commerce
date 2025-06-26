'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

import useCartStore from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { IProduct } from '@/types/product';

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

const handleGoToCheckout = () => {
  if (user) {
    const orderData = {
      product: {
        id,
        title,
        price,
        quantity,
        image,
        totalPrice,
      },
      user,
    };

    try {
      localStorage.setItem('lastOrder', JSON.stringify(orderData));
    } catch (error) {
      console.error('Error saving checkout data:', error);
    }
  }

  router.push('/checkout');
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
          <Button
            onClick={decrement}
            disabled={quantity <= 1}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white"
          >
            −
          </Button>
          <input
            type="number"
            readOnly
            value={quantity}
            className="w-16 text-center border px-2 py-1 rounded"
          />
          <Button
            onClick={increment}
            disabled={quantity >= 100}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white"
          >
            +
          </Button>
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
          onClick={handleAddToCart}
          className="flex-1 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold"
        >
          <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
        </Button>
        <Button
          onClick={handleGoToCheckout}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Go to Checkout
        </Button>
      </div>
    </div>
  );
}
