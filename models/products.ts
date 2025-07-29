import mongoose, { Schema, Document, Types } from "mongoose";

// Review Subdocument TypeScript Interface
export interface IReview {
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Product Main Document TypeScript Interface
export interface IProduct extends Document {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  sellerId: Types.ObjectId;
  reviews: IReview[];
  averageRating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Review Schema
const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true, _id: false } // No separate _id for sub-documents
);

// Product Schema
const productSchema = new Schema<IProduct>(
  {
    id: { type: String, unique:true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    reviews: { type: [reviewSchema], default: [] },
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
