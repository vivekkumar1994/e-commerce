import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 🔗 linked to User
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
