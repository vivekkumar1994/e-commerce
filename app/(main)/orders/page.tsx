'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  XSquareIcon,
  CalendarCheck,
  CreditCard,
} from 'lucide-react';
import { getOrders } from '@/action/getorder';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
}

interface OrderItem {
  id: string;
  createdDate: string;
  statusIdentifier: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalSum: string;
  products: Product[];
  shipping: ShippingDetails;
  // You can add `paymentId` if available from the backend
}

interface IOrder {
  items: OrderItem[];
  total: number;
}

const orderStatusIcons = {
  processing: <Package className="w-4 h-4 text-yellow-500" />,
  shipped: <Truck className="w-4 h-4 text-blue-500" />,
  delivered: <CheckCircle className="w-4 h-4 text-green-500" />,
  cancelled: <AlertCircle className="w-4 h-4 text-red-500" />,
};

const getStaticDeliveryDate = (createdDate: string) => {
  const date = new Date(createdDate);
  date.setDate(date.getDate() + 4); // static +4 days
  return date.toISOString().split('T')[0];
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<IOrder>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getOrders();
      setOrders(data ? { items: data.items.reverse(), total: data.total } : { items: [], total: 0 });
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
          My Orders
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center mt-20">
            <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.items.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
            }}
            className="space-y-6"
          >
            {orders.items.map((order) => (
              <motion.div
                key={order.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                className="bg-white rounded-xl border shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6 space-y-4">
                  {/* Order Header */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-purple-700">Order #{order.id}</h2>
                    <Badge
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        order.statusIdentifier === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.statusIdentifier === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : order.statusIdentifier === 'processing'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {orderStatusIcons[order.statusIdentifier]}
                      <span className="capitalize">{order.statusIdentifier}</span>
                    </Badge>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>
                      <CalendarCheck className="inline w-4 h-4 mr-1" />
                      <strong>Order Date:</strong>{' '}
                      {order.createdDate?.split('T')[0] || 'N/A'}
                    </p>
                    <p>
                      <CalendarCheck className="inline w-4 h-4 mr-1" />
                      <strong>Delivery Date:</strong>{' '}
                      {getStaticDeliveryDate(order.createdDate)}
                    </p>
                    <p>
                      <CreditCard className="inline w-4 h-4 mr-1" />
                      <strong>Payment ID:</strong> #PAY123456
                    </p>
                    <p>
                      <strong>Total Amount:</strong> ₹{order.totalSum}
                    </p>
                  </div>

                  {/* Products */}
                  <div className="border-t pt-4 space-y-4">
                    {order.products.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center border rounded-md px-4 py-2 bg-gray-50 hover:bg-white transition"
                      >
                        <div>
                          <h3 className="font-medium text-gray-800">{item.title}</h3>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-purple-600">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Details */}
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-lg font-semibold text-purple-700 mb-2">
                      Shipping Details
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>
                        <strong>Name:</strong> {order.shipping.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {order.shipping.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {order.shipping.phone}
                      </p>
                      <p>
                        <strong>Pincode:</strong> {order.shipping.pincode}
                      </p>
                      <p className="sm:col-span-2">
                        <strong>Address:</strong> {order.shipping.address}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-sm"
          >
            <XSquareIcon className="mx-auto h-14 w-14 text-red-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-purple-600">No orders found</h2>
            <p className="text-gray-500 mb-6">You haven’t placed any orders yet. Start shopping now!</p>
            <Button
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold"
              onClick={() => router.push('/')}
            >
              Continue Shopping
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
