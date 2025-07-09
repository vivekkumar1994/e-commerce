"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ProductCatalog from "@/components/productCatalog";
import Image from "next/image";
import { motion } from "framer-motion";
import { getProductsByCategory, ProductInput } from "@/action/product.actions";

const categories = [
  { name: "Electronics", key: "electronics" },
  { name: "Fashion", key: "fashion" },
  { name: "Home & Kitchen", key: "homeandkitchen" },
  { name: "Books", key: "books" },
];

export default function HomePage() {
  const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductInput[]>>({});

  useEffect(() => {
    const loadProducts = async () => {
      const results = await Promise.all(
        categories.map(async (cat) => {
          const products = await getProductsByCategory(cat.key);
          return { key: cat.name, products };
        })
      );

      const mapped: Record<string, ProductInput[]> = {};
      for (const { key, products } of results) {
        mapped[key] = products;
      }

      setCategoryProducts(mapped);
    };

    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-10 space-y-24">
        {/* Hero Section */}
        <section>
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="w-full h-[400px] relative">
              <Image
                src="https://assets.entrepreneur.com/content/3x2/2000/20150812074510-Online-shopping.jpeg?format=pjeg&auto=webp&crop=16:9&width=1200"
                alt="Hero Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
                height={400}
                width={1200}
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                <motion.h1
                  className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Welcome to Our Store!
                </motion.h1>
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

        {/* Top Categories */}
        <section>
          <h2 className="text-2xl font-bold text-center mb-8">Top Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-md transition text-center font-semibold text-gray-700"
              >
                {cat.name}
              </div>
            ))}
          </div>
        </section>

        {/* Product Catalog */}
        {categories.map((cat) => (
          <ProductCatalog
            key={cat.name}
            title={cat.name}
            products={categoryProducts[cat.name] || []}
          />
        ))}

        {/* Testimonials */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-8">What Our Customers Say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Ravi Sharma",
                feedback: "Amazing quality and fast delivery. I’ll definitely shop again!",
              },
              {
                name: "Sneha Kapoor",
                feedback: "Great customer service and awesome product variety!",
              },
              {
                name: "Aditya Verma",
                feedback: "User-friendly website and smooth checkout process!",
              },
            ].map((review, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg shadow border">
                <p className="text-gray-600 italic mb-4">{review.feedback}</p>
                <p className="font-semibold text-gray-800">— {review.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-gradient-to-r from-pink-100 to-purple-100 py-10 rounded-2xl shadow-inner text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Stay Updated!</h2>
          <p className="text-gray-700 mb-6">
            Subscribe to our newsletter and get the latest updates and deals.
          </p>
          <form className="flex justify-center gap-4 flex-wrap">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-md border w-64"
            />
            <Button className="bg-purple-600 text-white px-6 py-2">Subscribe</Button>
          </form>
        </section>
      </main>
    </div>
  );
}
