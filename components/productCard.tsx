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

  const imageUrl =
    product.attributeValues?.p_image?.value?.downloadLink || '';

  const title =
    product.attributeValues?.p_title?.value ||
    product.localizeInfos?.title ||
    'Untitled Product';

  const price =
    typeof product.attributeValues?.p_price?.value === 'string'
      ? parseFloat(product.attributeValues.p_price.value)
      : product.attributeValues?.p_price?.value || 0;

  const description =
    product.attributeValues?.p_description?.value?.[0]?.htmlValue || '';

  const handleAddToCart = () => {
    addToCart({
      id: typeof product.id === 'string' ? Number(product.id) : product.id,
      name: title,
      price: price,
      quantity: 1,
      image: imageUrl,
    });

    toast('Added to Cart', {
      description: `${title} has been added to your cart.`,
      duration: 4000,
    });
  };

  return (
    <div className="group relative h-full flex flex-col rounded-lg shadow-lg border border-gray-200 bg-white">
      <Link href={`/product/${product.id}`} className="relative w-full pt-[100%] bg-gray-50 overflow-hidden">
        {imageUrl.startsWith('data:image') ? (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 border-b border-gray-200"
          />
        ) : (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105 border-b border-gray-200"
          />
        )}
      </Link>

      <div className="p-4 flex-grow">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl mb-2 text-gray-700 group-hover:text-purple-500 transition-colors duration-300 line-clamp-1">
            {title}
          </h3>
        </Link>

        <div
          className="text-gray-500 line-clamp-2 text-sm mb-2"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <p className="text-gray-800 font-semibold text-lg">
          ₹{price.toFixed(2)}
        </p>
      </div>

      <div className="p-4">
        <Button
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
