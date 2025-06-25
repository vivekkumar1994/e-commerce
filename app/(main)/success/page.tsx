'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('lastOrder'); // Clear order data after success
  }, []);

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-start items-center bg-gradient-to-br from-green-100 via-white to-blue-100 pt-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white rounded-xl shadow-xl p-10 text-center max-w-md w-full">
        <Image
          src="/success.png" // Make sure this file exists in your public folder
          alt="Success"
          width={100}
          height={100}
          className="mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-green-700 mb-2">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase. Your payment has been successfully processed.
        </p>
        <Button
          onClick={() => router.push('/')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium"
        >
          Go to Homepage
        </Button>
      </div>
    </motion.div>
  );
}
