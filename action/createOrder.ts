"use server";

import { connectToDB } from "@/lib/db";
import { Order, IOrder } from "@/models/order";

interface SaveOrderInput {
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  product: {
    id: number;
    title: string;
    price: number;
    quantity: number;
    totalPrice: number;
    image?: string;
  };
  paymentId: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingPincode: string;
}

interface SaveOrderResult {
  success: boolean;
  message: string;
  orderId?: string;
  error?: string;
}

export async function saveOrderToDB(orderData: SaveOrderInput): Promise<SaveOrderResult> {
  try {
    await connectToDB();

    const newOrder: IOrder = new Order({
      user: {
        name: orderData.user.name,
        email: orderData.user.email,
        phone: orderData.user.phone || "",
      },
      product: {
        id: orderData.product.id,
        title: orderData.product.title,
        price: orderData.product.price,
        quantity: orderData.product.quantity,
        totalPrice: orderData.product.totalPrice,
        image: orderData.product.image || "",
      },
      paymentId: orderData.paymentId,
      shipping: {
        name: orderData.shippingName,
        email: orderData.shippingEmail,
        phone: orderData.shippingPhone,
        address: orderData.shippingAddress,
        pincode: orderData.shippingPincode,
      },
      createdAt: new Date(),
    });

    const savedOrder = (await newOrder.save()) as IOrder;

    return {
      success: true,
      message: "Order saved successfully.",
      orderId: savedOrder.toString(),
    };
  } catch (error) {
    console.error("❌ Failed to save order:", error);
    return {
      success: false,
      message: "Failed to save order.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
