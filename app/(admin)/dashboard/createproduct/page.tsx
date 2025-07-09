"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  createProduct,
  getSellerProducts,
  getAllSellers,
  getProductsBySellerId,
} from "@/action/product.actions";
import {
  Product,
  Seller,
  RawProduct,
  RawSeller,
} from "@/types/products";

// Define safe structure of raw Mongoose product documents
type RawProductDoc = {
  _id: string | { toString(): string };
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sellerId?: {
    _id: string | { toString(): string };
    name: string;
    email: string;
  };
};

export default function CreateProductForm() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState("");

  const transformProduct = (raw: RawProduct): Product => ({
    _id: typeof raw._id === "string" ? raw._id : raw._id.toString(),
    title: raw.title,
    price: raw.price,
    description: raw.description,
    image: raw.image,
    category: raw.category,
    sellerId: raw.sellerId
      ? {
          _id:
            typeof raw.sellerId._id === "string"
              ? raw.sellerId._id
              : raw.sellerId._id.toString(),
          name: raw.sellerId.name,
          email: raw.sellerId.email,
        }
      : undefined,
  });

  const transformSeller = (raw: RawSeller): Seller => ({
    _id: typeof raw._id === "string" ? raw._id : raw._id.toString(),
    name: raw.name,
    email: raw.email,
  });

  const fetchInitialData = useCallback(async () => {
    try {
      const rawData = await getSellerProducts();
      const rawProducts: RawProduct[] = ((rawData as unknown) as RawProductDoc[]).map((doc) => ({
        _id: doc._id.toString(),
        title: doc.title,
        price: doc.price,
        description: doc.description,
        image: doc.image,
        category: doc.category,
        sellerId: doc.sellerId
          ? {
              _id: doc.sellerId._id.toString(),
              name: doc.sellerId.name,
              email: doc.sellerId.email,
            }
          : undefined,
      }));
      setProducts(rawProducts.map(transformProduct));

      const rawSellers = await getAllSellers();
      setSellers(rawSellers.map(transformSeller));
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  }, []);

  const fetchProductsBySeller = useCallback(async (sellerId: string) => {
    try {
      const rawData = await getProductsBySellerId(sellerId);
      const rawProducts: RawProduct[] = ((rawData as unknown) as RawProductDoc[]).map((doc) => ({
        _id: doc._id.toString(),
        title: doc.title,
        price: doc.price,
        description: doc.description,
        image: doc.image,
        category: doc.category,
        sellerId: doc.sellerId
          ? {
              _id: doc.sellerId._id.toString(),
              name: doc.sellerId.name,
              email: doc.sellerId.email,
            }
          : undefined,
      }));
      setProducts(rawProducts.map(transformProduct));
    } catch (err) {
      console.error("Failed to fetch products by seller:", err);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedSeller) {
      fetchProductsBySeller(selectedSeller);
    } else {
      fetchInitialData();
    }
  }, [selectedSeller, fetchProductsBySeller, fetchInitialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    if (!title || !price || !category || !imageFile) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", String(price));
    formData.append("description", description);
    formData.append("category", category);
    formData.append("image", imageFile);

    try {
      await createProduct(formData);
      setTitle("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      setCategory("");
      setSuccess(true);
      fetchInitialData();
    } catch (err) {
      setError("Failed to create product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Create New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input
          type="text"
          placeholder="Title"
          className="w-full px-4 py-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full px-4 py-2 border rounded"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded text-gray-700"
        >
          <option value="">Select Category</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="books">Books</option>
          <option value="homeandkitchen">Home & Kitchen</option>
        </select>

        <input
          type="file"
          accept="image/*"
          className="w-full px-4 py-2 border rounded"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          required
        />

        <textarea
          placeholder="Description (optional)"
          className="w-full px-4 py-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Product"}
        </button>

        {success && <p className="text-green-600">Product created successfully!</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>

      {sellers.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Seller:
          </label>
          <select
            className="px-4 py-2 border rounded w-full"
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
          >
            <option value="">All Sellers</option>
            {sellers.map((seller) => (
              <option key={seller._id} value={seller._id}>
                {seller.name} ({seller.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Uploaded Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg p-4 shadow hover:shadow-lg">
                <div className="relative w-full h-48">
                  <Image
                    src={product.image}
                    alt={product.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">{product.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                <div className="mt-2 font-semibold text-blue-600">₹ {product.price}</div>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  Category: {product.category}
                </p>

                {product.sellerId?.email && (
                  <div className="text-xs text-gray-500 mt-2">
                    Seller: {product.sellerId.name} ({product.sellerId.email})
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
