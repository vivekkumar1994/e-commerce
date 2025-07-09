'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Users, PackageCheck, ShoppingCart } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: 1524, icon: <Users className="h-6 w-6 text-purple-600" /> },
    { label: 'Products Listed', value: 320, icon: <PackageCheck className="h-6 w-6 text-pink-600" /> },
    { label: 'Orders Processed', value: 780, icon: <ShoppingCart className="h-6 w-6 text-green-600" /> },
    { label: 'Revenue (₹)', value: '1,20,000', icon: <BarChart className="h-6 w-6 text-red-600" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-md bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              {stat.icon}
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Manage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button className="w-full">Manage Users</Button>
          <Button className="w-full">Manage Products</Button>
          <Button className="w-full">Manage Orders</Button>
          <Button className="w-full">View Reports</Button>
          <Button className="w-full">Site Settings</Button>
        </div>
      </div>
    </div>
  );
}
