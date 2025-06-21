// app/product/[id]/page.tsx

import { getProductById } from '@/action/getProductById';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star } from 'lucide-react';

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
  if (!product) return notFound();

  const attrs = product.attributeValues || {};
  const title = attrs.p_title?.value || product.localizeInfos?.title || 'Untitled';
  const image = attrs.p_image?.value?.downloadLink || '';
  const price = product.price || 0;
  const description = attrs.p_description?.value?.[0]?.htmlValue || '';
  const colors = attrs.p_colors?.value || ['Black', 'White'];
  const sizes = attrs.p_sizes?.value || ['Standard'];
  const stock = attrs.p_stock?.value ?? 0;
  const rating = attrs.p_rating?.value ?? 0;
  const reviews = attrs.p_reviews?.value ?? 0;
  const highlights = attrs.p_highlights?.value || [];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative w-full h-[500px]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain rounded-xl border"
          />
        </div>

        {/* Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} fill={i < Math.round(rating) ? '#facc15' : 'none'} />
            ))}
            <span className="text-gray-600 text-sm">({reviews} reviews)</span>
          </div>

          <p
            className="prose mb-4 text-gray-700"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          {/* Price */}
          <p className="text-3xl font-semibold text-red-600 mb-4">${price.toFixed(2)}</p>

          {/* Stock */}
          <p className={`mb-2 font-medium ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
          </p>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Color:</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className="px-4 py-1 border rounded-full hover:bg-gray-100"
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Picker */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Size:</label>
            <select className="border px-3 py-2 rounded w-full">
              {sizes.map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Quantity:</label>
            <input
              type="number"
              min={1}
              max={stock}
              defaultValue={1}
              className="border px-3 py-2 rounded w-24"
              disabled={stock === 0}
            />
          </div>

          {/* Add to Cart */}
          <button
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
            disabled={stock === 0}
          >
            {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>

          {/* Highlights */}
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
