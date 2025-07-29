"use server";

import { connectToDB } from "@/lib/db";
import mongoose from 'mongoose';
import { Product } from "@/models/products";
import { User } from "@/models/user";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Common type for client-safe products
export type ProductInput = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
};

// Decoded JWT Token Type
interface DecodedToken {
  _id: string;
  role: string;
  email: string;
}

// 🔐 JWT-based authentication (for admin endpoints)
const getCurrentUser = async (): Promise<DecodedToken | null> => {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token || !process.env.ACCESS_SECRET) return null;

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET) as DecodedToken;
    return decoded;
  } catch {
    return null;
  }
};

// ✅ Create Product (Seller only)
export const createProduct = async (formData: FormData) => {
  const allCookies = await cookies();
  const role = allCookies.get("userRole")?.value;
  const sellerId = allCookies.get("id")?.value;
if (!sellerId || (role !== "seller" && role !== "admin")) {
  throw new Error("Unauthorized: Only sellers or admins can create products.");
}

  const title = formData.get("title") as string;
  const price = Number(formData.get("price"));
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const file = formData.get("image") as File;

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const image = `data:${file.type};base64,${base64}`;

  await connectToDB();

  const product = new Product({ title, price, description, category, image, sellerId });
  await product.save();

  return { success: true };
};

// ✅ Seller: Get Their Products
export const getSellerProducts = async () => {
  const allCookies = await cookies();
  const role = allCookies.get("userRole")?.value;
  const sellerId = allCookies.get("id")?.value;

  if (!role || !sellerId) {
    throw new Error("Unauthorized");
  }

  await connectToDB();

  const query = role === "admin" ? {} : { sellerId };

  const products = await Product.find(query)
    .populate("sellerId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return products;
};

// ✅ Admin only: Get All Products
export const getAllProducts = async () => {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admins only.");
  }

  await connectToDB();

  return await Product.find()
    .populate("sellerId", "name email")
    .sort({ createdAt: -1 })
    .lean();
};

// ✅ Public: Get Products by Category (Client uses this)
export const getProductsByCategory = async (category: string): Promise<ProductInput[]> => {
  await connectToDB();

  const products = await Product.find({ category }).sort({ createdAt: -1 }).lean();

  return products.map((product) => {
    const id = product._id?.toString?.() || "unknown";

    const title = product.title || product.attributeValues?.p_title?.value || "Untitled";

    const description = product.description
      ?? (Array.isArray(product.attributeValues?.p_description?.value)
        ? product.attributeValues.p_description.value.join(", ")
        : typeof product.attributeValues?.p_description?.value === "string"
          ? product.attributeValues.p_description.value
          : "");

    const image = product.image || product.attributeValues?.p_image?.value?.downloadLink || "";

    const price = typeof product.price === "number"
      ? product.price
      : Number(product.price) || 0;

    return { id, title, description, image, price };
  });
};

// ✅ Admin: Get Products of Specific Seller
export const getProductsBySellerId = async (sellerId: string) => {
  const allCookies = await cookies();
  const role = allCookies.get("userRole")?.value;

  if (role !== "admin") {
    throw new Error("Unauthorized: Admins only.");
  }

  await connectToDB();

  return await Product.find({ sellerId })
    .populate("sellerId", "name email")
    .sort({ createdAt: -1 })
    .lean();
};

// ✅ Admin: Get All Sellers
export const getAllSellers = async () => {
  const allCookies = await cookies();
  const role = allCookies.get("userRole")?.value;

  if (role !== "admin") {
    throw new Error("Unauthorized");
  }

  await connectToDB();

  return await User.find({ role: "seller" }).select("_id name email").lean();
};


export const getProductById = async (productId: string) => {
  await connectToDB();

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.warn("Invalid product ID:", productId);
    return null;
  }

  const product = await Product.findById(productId).lean();
  if (!product) return null;

  // 🔥 Add this block to convert _id to id
  return {
    ...product,
  
  };
};

export const editProduct = async (productId: string, formData: FormData) => {
  const allCookies = await cookies();
  const role = allCookies.get("userRole")?.value;
  const sellerId = allCookies.get("id")?.value;

  if (!role || !sellerId) {
    throw new Error("Unauthorized");
  }

  await connectToDB();

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  if (role !== "admin" && product.sellerId.toString() !== sellerId) {
    throw new Error("Unauthorized: You don't own this product");
  }

  const title = formData.get("title") as string;
  const price = Number(formData.get("price"));
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const file = formData.get("image") as File | null;

  let image = product.image;
  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    image = `data:${file.type};base64,${base64}`;
  }

  product.title = title;
  product.price = price;
  product.description = description;
  product.category = category;
  product.image = image;

  await product.save();

  return { success: true };
};
export const deleteProduct = async (productId: string) => {
  const allCookies = await cookies();
  const role = allCookies.get("userRole")?.value;
  const sellerId = allCookies.get("id")?.value;

  if (!role || !sellerId) {
    throw new Error("Unauthorized");
  }

  await connectToDB();

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  if (role !== "admin" && product.sellerId.toString() !== sellerId) {
    throw new Error("Unauthorized: You don't own this product");
  }

  await Product.findByIdAndDelete(productId);

  return { success: true };
};


export const getSimilarProducts = async (productId: string, limit: number = 6) => {
  await connectToDB();

  if (!mongoose.Types.ObjectId.isValid(productId)) return [];

  const currentProduct = await Product.findById(productId).lean() as {
    _id: mongoose.Types.ObjectId;
    category?: string;
    title: string;
  } | null;

  if (!currentProduct) return [];

  const category = currentProduct.category || "";
  const titleKeywords = currentProduct.title.split(" ").filter(Boolean);

  const similarProducts = await Product.find({
    _id: { $ne: currentProduct._id },  // Exclude current product
    $or: [
      { category },
      { title: { $regex: titleKeywords.join("|"), $options: "i" } }
    ]
  })
    .limit(limit)
    .lean();

  return similarProducts.map((prod) => ({
    id: (prod._id as mongoose.Types.ObjectId).toString(),
    title: prod.title,
    price: prod.price,
    image: prod.image || prod.attributeValues?.p_image?.value?.downloadLink || "",
  }));
};


  // <-- Ensure path is correct

import  { Error as MongooseError } from "mongoose";
// adjust import as needed

export async function addProductReview({
  productId,
  userId,
  rating,
  comment,
}: {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}) {
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid productId');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId');
    }

    const review = {
      userId: new mongoose.Types.ObjectId(userId),
      rating,
      comment,
    };

    // Atomic Update with Aggregation Pipeline
    const result = await Product.updateOne(
      { _id: productId },
      [
        { $set: { reviews: { $concatArrays: ["$reviews", [review]] } } },
        {
          $set: {
            averageRating: {
              $round: [
                {
                  $avg: {
                    $map: {
                      input: { $concatArrays: ["$reviews", [review]] },
                      as: "r",
                      in: "$$r.rating",
                    },
                  },
                },
                2, // Round to 2 decimals
              ],
            },
          },
        },
      ]
    );

    if (result.modifiedCount === 0) {
      throw new Error('Failed to add review');
    }

    return { success: true, message: 'Review added successfully' };
  } catch (error) {
    const err = error as MongooseError | Error;
    console.error('Error adding review:', err);
    return { success: false, message: err.message || 'Failed to add review' };
  }
}







