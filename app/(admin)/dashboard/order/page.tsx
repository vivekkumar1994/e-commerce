"use client";

import { useEffect, useState } from "react";
import { getAllOrdersForAdmin,updateOrderStatus } from "@/action/order/get-orders";
 // You need to create this API action
import { motion } from "framer-motion";

type AdminOrder = {
  _id: string;
  createdAt: string;
  product: {
    title: string;
    quantity: number;
    totalPrice: number;
  };
  user: {
    name: string;
    email: string;
  };
  status: string;
};

const statuses = ["processing", "shipped", "out for delivery", "delivered"];

export default function AdminOrdersDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const data = await getAllOrdersForAdmin();
      setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus); // API call to update status
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading all orders...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">All User Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                {order.product.title}{" "}
                <span className="text-sm text-gray-500">(x{order.product.quantity})</span>
              </h2>

              <p className="mt-2 text-blue-600 font-bold">₹{order.product.totalPrice}</p>

              <div className="mt-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">User:</span> {order.user.name}
                </p>
                <p className="text-xs text-gray-500">{order.user.email}</p>
              </div>

              {/* Status Dropdown */}
              <div className="mt-4">
                <label className="text-xs text-gray-500">Status:</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  disabled={updatingOrderId === order._id}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {updatingOrderId === order._id && (
                <div className="mt-2 text-xs text-yellow-500 animate-pulse">
                  Updating status...
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
