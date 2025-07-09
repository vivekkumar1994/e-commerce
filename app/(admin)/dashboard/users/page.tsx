"use client";

import { useEffect, useState } from "react";
import {
  getAdminStats,
  getAllUsers,
  deleteUser,
} from "@/action/admin.actions";
import type { UserClient, RecentUser } from "@/types/adminUser";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalAdmins: number;
    recentUsers: RecentUser[];
  } | null>(null);

  const [users, setUsers] = useState<UserClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const statRes = await getAdminStats();
      const userRes = await getAllUsers();
      setStats(statRes);
      setUsers(userRes);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteUser(id);
    setUsers(users.filter((u) => u._id !== id));
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        Admin Dashboard
      </h1>

      {loading ? (
        <div className="text-gray-600 animate-pulse">Loading...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-100 p-6 rounded-xl shadow">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-800">
                {stats?.totalUsers ?? "..."}
              </p>
            </div>
            <div className="bg-green-100 p-6 rounded-xl shadow">
              <p className="text-sm text-gray-600">Total Admins</p>
              <p className="text-3xl font-bold text-green-800">
                {stats?.totalAdmins ?? "..."}
              </p>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white p-6 rounded-xl shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Signups</h2>
            <ul className="divide-y divide-gray-200">
              {stats?.recentUsers.map((user) => (
                <li
                  key={user._id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
              {stats?.recentUsers.length === 0 && (
                <p className="text-gray-500">No recent users</p>
              )}
            </ul>
          </div>

          {/* All Users Table */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center p-4 text-gray-500 italic"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
