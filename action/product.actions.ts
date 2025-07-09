"use server";

import { connectToDB } from "@/lib/db";
import { Product } from "@/models/products";
import { User } from "@/models/user"; // ✅ Make sure this model exists
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface DecodedToken {
  _id: string;
  role: string;
  email: string;
}

// 🔐 Decode JWT if needed
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

// ✅ Create Product
export const createProduct = async (formData: FormData) => {
  const allCookies = await cookies();
  const role = allCookies.get("userRole")?.value;
  const sellerId = allCookies.get("id")?.value;

  if (!sellerId || role !== "seller") {
    throw new Error("Unauthorized: Only sellers can create products.");
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

  const product = new Product({
    title,
    price,
    description,
    category,
    image,
    sellerId,
  });

  await product.save();

  return { success: true };
};

// ✅ Get Products Based on Role
export const getSellerProducts = async () => {
  const allCookies = await cookies();
  const role = allCookies.get("userRole")?.value;
  const sellerId = allCookies.get("id")?.value;

  if (!role || !sellerId) {
    throw new Error("Unauthorized");
  }

  await connectToDB();

  if (role === "admin") {
    return await Product.find()
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  if (role === "seller") {
    return await Product.find({ sellerId })
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  throw new Error("Unauthorized: Role not supported");
};

// ✅ Admin: Get All Products (same as above, kept for fallback)
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

// ✅ Seller: Filter by Category
export const getProductsByCategory = async (category: string) => {
  const allCookies = await cookies();
  const role = allCookies.get("userRole")?.value;
  const sellerId = allCookies.get("id")?.value;

  if (!role || role !== "seller" || !sellerId) {
    throw new Error("Unauthorized");
  }

  await connectToDB();

  return await Product.find({ category, sellerId })
    .populate("sellerId", "name email")
    .sort({ createdAt: -1 })
    .lean();
};

// ✅ Admin: Get Products by Specific Seller
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

  const sellers = await User.find({ role: "seller" }).select("_id name email").lean();
  return sellers;
};
