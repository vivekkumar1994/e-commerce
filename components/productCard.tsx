import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

import { Button } from './ui/button';
import useCartStore from '@/stores/cartStore';
import { IProduct } from '@/types/product';

const ProductCard = ({ product }: { product: IProduct }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  console.log(product,"product card")

  const handleAddToCart = (product: IProduct) => {
    addToCart({
      id: typeof product.id === 'string' ? Number(product.id) : product.id,
      name: product.attributeValues?.p_title?.value || 'Product',
      price: product.attributeValues?.p_price?.value || 0,
      quantity: 1,
      image: product.attributeValues?.p_image?.value?.downloadLink || '',
    });

    toast('Added to Cart', {
      description: `${product.attributeValues?.p_title?.value || 'Product'} has been added to your cart.`,
      duration: 5000,
    });
  };

  return (
    <div className="group relative h-full flex flex-col rounded-lg shadow-lg border-2 border-gray-200 bg-white">
      <Link href={`/product/${product.id}`} className="relative w-full pt-[100%] bg-transparent">
        <Image
          src={product.attributeValues?.p_image?.value?.downloadLink || '/placeholder.png'}
          width={200}
          height={200}
          alt={product.attributeValues?.p_title?.value || 'Product'}
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 border-b-2 border-gray-200"
        />
      </Link>

      <div className="p-4 flex-grow">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl mb-2 text-gray-700 group-hover:text-purple-500 transition-colors duration-300 line-clamp-1">
            {product.attributeValues?.p_title?.value || 'Product'}
          </h3>
        </Link>

        <div
          className="text-gray-500 line-clamp-2 text-sm mb-2"
          dangerouslySetInnerHTML={{
            __html: product.attributeValues?.p_description?.value?.[0]?.htmlValue || '',
          }}
        />

        <p className="text-gray-600 font-semibold">
          ₹{(product.attributeValues?.p_price?.value || 0).toFixed(2)}
        </p>
      </div>

      <div className="p-4">
        <Button
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold cursor-pointer"
          onClick={() => handleAddToCart(product)}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </Button>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>
    </div>
  );
};

export default ProductCard;
