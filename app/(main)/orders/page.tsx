'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  XSquareIcon,
  CalendarCheck,
  CreditCard,
  Star,
} from 'lucide-react';
import { getOrders } from '@/action/getorder';
import { addProductReview } from '@/action/product.actions'; // <-- Import this!
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Product {
  id: string;
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
  date.setDate(date.getDate() + 4);
  return date.toISOString().split('T')[0];
};

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<IOrder>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const router = useRouter();

 useEffect(() => {
  const fetchOrders = async () => {
    const data = await getOrders();

    if (data) {
      const formattedOrders = data.items.map((order) => ({
        ...order,
        products: order.products.map((product) => ({
          ...product,
          id: product.id.toString(), // <-- THIS FIXES THE TYPE MISMATCH
        })),
      }));

      setOrders({ items: formattedOrders, total: data.total });
    } else {
      setOrders({ items: [], total: 0 });
    }

    setIsLoading(false);
  };

  fetchOrders();
}, []);

 const handleSubmitReview = async (productId: string) => {
  const userId = getCookie('id'); // Get userId from cookies/session/auth state

  if (!userId) {
    alert("Please log in to submit a review.");
    return;
  }


  const result = await addProductReview({ productId, userId, rating, comment });
  if (result.success) {
    alert('Review submitted successfully');
    setReviewingProductId(null);
    setRating(0);
    setComment('');
  } else {
    alert(result.message);
  }
};


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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>
                      <CalendarCheck className="inline w-4 h-4 mr-1" />
                      <strong>Order Date:</strong> {order.createdDate?.split('T')[0] || 'N/A'}
                    </p>
                    <p>
                      <CalendarCheck className="inline w-4 h-4 mr-1" />
                      <strong>Delivery Date:</strong> {getStaticDeliveryDate(order.createdDate)}
                    </p>
                    <p>
                      <CreditCard className="inline w-4 h-4 mr-1" />
                      <strong>Payment ID:</strong> #PAY123456
                    </p>
                    <p>
                      <strong>Total Amount:</strong> ₹{order.totalSum}
                    </p>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    {order.products.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center border rounded-md px-4 py-2 bg-gray-50 hover:bg-white transition"
                      >
                        <div>
                          <h3 className="font-medium text-gray-800">{item.title}</h3>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm font-semibold text-purple-600">₹{item.price.toFixed(2)}</p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          {reviewingProductId === item.id ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-5 h-5 cursor-pointer ${
                                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                    onClick={() => setRating(star)}
                                  />
                                ))}
                              </div>
                              <Textarea
                                placeholder="Write your feedback..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSubmitReview(item.id)}
                                  disabled={rating === 0 || comment.trim() === ''}
                                >
                                  Submit Review
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => setReviewingProductId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => setReviewingProductId(item.id)}>
                              Give Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-lg font-semibold text-purple-700 mb-2">Shipping Details</h4>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p><strong>Name:</strong> {order.shipping.name}</p>
                      <p><strong>Email:</strong> {order.shipping.email}</p>
                      <p><strong>Phone:</strong> {order.shipping.phone}</p>
                      <p><strong>Pincode:</strong> {order.shipping.pincode}</p>
                      <p className="sm:col-span-2"><strong>Address:</strong> {order.shipping.address}</p>
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
