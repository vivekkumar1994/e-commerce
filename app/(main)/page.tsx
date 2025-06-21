'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ProductCatalog from '@/components/productCatalog';
import Image from 'next/image';
import { mockProducts } from '@/lib/mockProducts';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-10">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="w-full h-[400px] relative">
              <img
                src="https://assets.entrepreneur.com/content/3x2/2000/20150812074510-Online-shopping.jpeg?format=pjeg&auto=webp&crop=16:9&width=1200"
                alt="Hero Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Welcome to Our Store!
                </h1>
                <p className="text-lg text-gray-700 mb-6 max-w-xl">
                  Explore the latest arrivals, top-selling items, and exclusive deals.
                  Your perfect purchase is just a click away!
                </p>
                <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:brightness-110 text-white px-6 py-2">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Sections */}
        {mockProducts.map((catalog) => (
          <ProductCatalog
            key={catalog.id}
            title={catalog.localizeInfos.title}
            products={catalog.catalogProducts.items || []}
          />
        ))}
      </main>
    </div>
  );
}
