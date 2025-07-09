"use server";

import { connectToDB } from "@/lib/db";
import { User } from "@/models/user";
import { UserClient, RecentUser } from "@/types/adminUser";

// ✅ Get all users with _id as string
export async function getAllUsers(): Promise<UserClient[]> {
  await connectToDB();

  const users = await User.find({ role: "user" })
    .select("name email _id")
    .lean();

  return users.map((user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
  }));
}

// ✅ Get single user
export async function getUserById(userId: string): Promise<UserClient | null> {
  await connectToDB();

  const user = await User.findById(userId)
    .select("name email _id")
    .lean();

  if (!user) return null;

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

// ✅ Update existing user
export async function updateUser(
  userId: string,
  data: Partial<{ name: string; email: string }>
): Promise<UserClient | null> {
  await connectToDB();

  const updated = await User.findByIdAndUpdate(userId, data, {
    new: true,
  })
    .select("name email _id")
    .lean();

  if (!updated) return null;

  return {
    _id: updated._id.toString(),
    name: updated.name,
    email: updated.email,
  };
}

// ✅ Delete user by ID
export async function deleteUser(userId: string) {
  await connectToDB();
  return await User.findByIdAndDelete(userId);
}

// ✅ Get dashboard stats
export async function getAdminStats(): Promise<{
  totalUsers: number;
  totalAdmins: number;
  recentUsers: RecentUser[];
}> {
  try {
    await connectToDB();

    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const recentUsersRaw = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt _id")
      .lean();

    const recentUsers: RecentUser[] = recentUsersRaw.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: new Date(user.createdAt).toISOString(), // ✅ convert to string
    }));

    return {
      totalUsers,
      totalAdmins,
      recentUsers,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      totalAdmins: 0,
      recentUsers: [],
    };
  }
}
