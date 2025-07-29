import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from './ui/button';
import useCartStore from '@/stores/cartStore';
import { IProduct, ProductInput } from '@/types/product';
import { WishlistItem } from '@/types/wishlist';

const ProductCard = ({ product }: { product: IProduct | ProductInput }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  const imageUrl =
    product.attributeValues?.p_image?.value?.downloadLink || product.image || '';

  const title =
    product.attributeValues?.p_title?.value ||
    product.localizeInfos?.title ||
    'Untitled Product';

  const rawPrice = product.attributeValues?.p_price?.value ?? product.price;
  const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice ?? 0;

  const descriptionItem = product.attributeValues?.p_description?.value?.[0];
  const description =
    typeof descriptionItem === 'string'
      ? descriptionItem
      : descriptionItem?.htmlValue || '';

  const [isWishlisted, setIsWishlisted] = useState(false);

  const productIdStr = String(product.id);

  const syncWishlistState = useCallback(() => {
    const existingWishlist: WishlistItem[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = existingWishlist.some((item) => String(item.id) === productIdStr);
    setIsWishlisted(exists);
  }, [productIdStr]);

  useEffect(() => {
    syncWishlistState();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wishlist') {
        syncWishlistState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncWishlistState]);

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

  const handleToggleWishlist = () => {
    const wishlistItem: WishlistItem = {
     id: String(product.id),
      name: title,
      price: price,
      image: imageUrl,
    };

    const existingWishlist: WishlistItem[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = existingWishlist.some((item) => String(item.id) === productIdStr);

    let updatedWishlist: WishlistItem[] = [];

    if (!exists) {
      updatedWishlist = [...existingWishlist, wishlistItem];
      setIsWishlisted(true);
      toast('Added to Wishlist', {
        description: `${title} has been added to your wishlist.`,
        duration: 4000,
      });
    } else {
      updatedWishlist = existingWishlist.filter((item) => String(item.id) !== productIdStr);
      setIsWishlisted(false);
      toast('Removed from Wishlist', {
        description: `${title} has been removed from your wishlist.`,
        duration: 3000,
      });
    }

    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    // Trigger event to sync across tabs
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="group relative h-full flex flex-col rounded-lg shadow-lg border border-gray-200 bg-white">
      <div className="relative w-full pt-[100%] bg-gray-50 overflow-hidden">
        <Link href={`/product/${product.id}`}>
          {imageUrl.startsWith('data:image') ? (
            <Image
              src={imageUrl}
              height={500}
              width={500}
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

        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 stroke-red-500' : 'stroke-gray-500'}`} />
        </button>
      </div>

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

        <p className="text-gray-800 font-semibold text-lg">₹{price}</p>
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
