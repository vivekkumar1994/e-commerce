"use client";

import { useEffect, useState } from "react";
import { getAllOrdersForAdmin } from "@/action/order/get-orders";

export default function AdminOrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const data = await getAllOrdersForAdmin();
      setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Loading all orders...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All User Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="p-4 border rounded shadow-sm bg-white">
              <p className="text-sm text-gray-600">
                Ordered: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="font-semibold">
                {order.product.title} (x{order.product.quantity})
              </p>
              <p>Total: ₹{order.product.totalPrice}</p>
              <p className="text-sm text-gray-700">
                User: {order.user.name} ({order.user.email})
              </p>
              <p>Status: <span className="capitalize">{order.status}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
