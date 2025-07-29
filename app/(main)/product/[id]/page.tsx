'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { getProductById, getSimilarProducts } from '@/action/product.actions';

interface AttributeValues {
  p_title?: { value?: string };
  p_image?: { value?: { downloadLink?: string } };
  p_price?: { value?: number };
  p_description?: { value?: { htmlValue?: string }[] };
  p_highlights?: { value?: string[] };
}

interface Product {
  _id?: { toString(): string };
  id: string;
  title?: string;
  image?: string;
  price?: number;
  description?: string;
  attributeValues?: AttributeValues;
  averageRating?:string
}

interface User {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  phone: string;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);  // Unwrapping params using React.use
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = ['Black', 'White'];
  const sizes = ['Standard'];
  const stock = 10;
  const rating = product?.averageRating || 4.5;
  const reviews = 24;

  // Fetch product by ID
  useEffect(() => {
    async function fetchProduct() {
const rawProductArray = await getProductById(id);
const rawProduct = Array.isArray(rawProductArray) ? rawProductArray[0] : rawProductArray;

if (!rawProduct) {
  router.push('/not-found');
  return;
}

const formattedProduct: Product = {
  id: (rawProduct._id as { toString(): string })?.toString(),
  title: rawProduct.title,
  image: rawProduct.image,
  price: rawProduct.price,
  description: rawProduct.description,
  attributeValues: rawProduct.attributeValues,
};

setProduct(formattedProduct);
    }

    fetchProduct();
  }, [id, router]);

  // Get user from cookies (optional)
  useEffect(() => {
    const getCookieValue = (name: string): string | undefined => {
      const cookies = document.cookie.split('; ');
      const cookie = cookies.find((c) => c.startsWith(`${name}=`));
      return cookie?.split('=')[1];
    };

    const email = getCookieValue('userEmail');
    const name = getCookieValue('userName');
    const role = getCookieValue('userRole');
    const avatar = getCookieValue('avatar');
    const phone = getCookieValue('userPhone');

    if (email && name && role) {
      setUser({ name, email, role, avatar, phone: phone || '' });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  // Fetch Similar Products
  useEffect(() => {
    async function fetchSimilar() {
      if (product) {
        const data = await getSimilarProducts(product.id);
        setSimilarProducts(data);
      }
    }

    fetchSimilar();
  }, [product]);

  if (loading || !product) return <div>Loading...</div>;

  // Product Attributes
  const attrs = product.attributeValues || {};
  const title = attrs.p_title?.value || product.title || 'Untitled Product';
  const image = attrs.p_image?.value?.downloadLink || product.image || '/placeholder.png';
  const priceRaw = attrs.p_price?.value ?? product.price ?? 0;
  const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw;
  const totalPrice = price * quantity;
  const description = attrs.p_description?.value?.[0]?.htmlValue || product.description || 'No description available.';
  const highlights = attrs.p_highlights?.value ?? [];

  const handleAddToCart = () => {
    const cartItem = { id: product.id, name: title, price, quantity, image };
    const existing = localStorage.getItem('cart') || '[]';
    const cart = JSON.parse(existing);
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${title} added to cart`);
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Please login to proceed to checkout');
      router.push('/auth?type=login');
      return;
    }

    const orderData = {
      product: { id: product.id, title, price, quantity, image, totalPrice },
      user,
    };
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative w-full h-[500px]">
          <Image src={image} alt={title} fill className="object-contain rounded-xl border" />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>

          <div className="flex items-center gap-2 mb-2 text-yellow-500">
            {[...Array(5)].map((_, i) => (
             <Star key={i} fill={i < Math.round(Number(rating)) ? '#facc15' : 'none'} />

            ))}
            <span className="text-gray-600 text-sm">({reviews} reviews)</span>
          </div>

          <div className="prose mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: description }} />

          <p className="text-3xl font-semibold text-red-600 mb-4">₹{price.toFixed(2)}</p>

          <p className={`mb-2 font-medium ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
          </p>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Color:</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button key={color} className="px-4 py-1 border rounded-full hover:bg-gray-100 capitalize">
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Size:</label>
            <select className="border px-3 py-2 rounded w-full">
              {sizes.map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-1 font-medium">Quantity:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="bg-purple-600 text-white px-3 py-1 rounded"
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
                onClick={() => setQuantity((q) => Math.min(100, q + 1))}
                className="bg-purple-600 text-white px-3 py-1 rounded"
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="font-medium">Price per unit: ₹{price.toFixed(2)}</p>
            <p className="font-semibold text-lg text-green-700">Total: ₹{totalPrice.toFixed(2)}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold rounded"
            >
              <ShoppingCart className="w-5 h-5 mr-2 inline" /> Add to Cart
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              Go to Checkout
            </button>
          </div>

          {highlights.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold mb-2">Highlights:</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {highlights.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((prod) => (
              <Link href={`/product/${prod.id}`} key={prod.id} className="block p-4 border rounded-lg hover:shadow-md">
                <div className="relative w-full h-40 mb-2">
                  <Image src={prod.image || '/placeholder.png'} alt={prod.title || ''} fill className="object-contain rounded" />
                </div>
                <h3 className="font-semibold text-sm truncate">{prod.title}</h3>
                <p className="text-red-600 font-medium">₹{prod.price?.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
