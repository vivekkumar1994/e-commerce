import { use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star } from 'lucide-react';
import ProductActions from './ProductActions';
import { getProductById } from '@/action/getProductById';

type AttributeValues = {
  p_title?: { value?: string };
  p_image?: { value?: { downloadLink?: string } };
  p_price?: { value?: number };
  p_description?: { value?: { htmlValue?: string }[] };
  p_highlights?: { value?: string[] };
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  if (!id) return notFound();

  const product = use(getProductById(id));
  if (!product) return notFound();

  const attrs: AttributeValues = product.attributeValues || {};

  const title =
    attrs.p_title?.value || product.localizeInfos?.title || 'Untitled Product';

  const image = attrs.p_image?.value?.downloadLink || '/placeholder.png';

  const priceRaw = attrs.p_price?.value ?? product.price ?? 0;
  const price = parseFloat(String(priceRaw)) || 0;

  const description =
    attrs.p_description?.value?.[0]?.htmlValue || 'No description available.';

  const highlights: string[] = attrs.p_highlights?.value ?? [];

  const colors = ['Black', 'White'];
  const sizes = ['Standard'];
  const stock = 0;
  const rating = 0;
  const reviews = 0;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative w-full h-[500px]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain rounded-xl border"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>

          <div className="flex items-center gap-2 mb-2 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                fill={i < Math.round(rating) ? '#facc15' : 'none'}
              />
            ))}
            <span className="text-gray-600 text-sm">({reviews} reviews)</span>
          </div>

          <div
            className="prose mb-4 text-gray-700"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <p className="text-3xl font-semibold text-red-600 mb-4">
            ₹{price.toFixed(2)}
          </p>

          <p
            className={`mb-2 font-medium ${
              stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
          </p>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Color:</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className="px-4 py-1 border rounded-full hover:bg-gray-100 capitalize"
                >
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

          <ProductActions product={product} />

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
    </div>
  );
}
