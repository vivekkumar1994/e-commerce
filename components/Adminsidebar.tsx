"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  Package,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/action/AuthAction";
import Image from "next/image";

function getCookieValue(name: string): string | undefined {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));
  return cookie?.split("=")[1];
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const adminNavLinks: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
  { label: "Users", icon: <Users size={18} />, href: "/dashboard/users" },
  { label: "Orders", icon: <ShoppingCart size={18} />, href: "/dashboard/order" },
  { label: "Products", icon: <Package size={18} />, href: "/dashboard/createproduct" },
  { label: "Settings", icon: <Settings size={18} />, href: "/admin/settings" },
];

const sellerNavLinks: NavItem[] = [
  { label: "Add Product", icon: <Plus size={18} />, href: "/dashboard/createproduct" },
];

export default function AdminSidebar() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    avatar?: string;
  } | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const name = getCookieValue("userName");
    const email = getCookieValue("userEmail");
    const role = getCookieValue("userRole");
    const avatar = getCookieValue("avatar");

    if (name && email && role) {
      setUser({ name, email, role, avatar });
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navLinks = user?.role === "seller" ? sellerNavLinks : adminNavLinks;

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:h-screen`}
      >
        {/* Close Button for Mobile */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-300 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col h-full">
          {/* Top - User Info */}
          <div className="p-6 flex items-center gap-4 border-b border-gray-700">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-white shadow"
                height={100}
                width={100}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold shadow">
                {user?.name?.charAt(0) || "A"}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold">{user?.name || "Admin"}</h2>
              <p className="text-sm text-gray-400 capitalize">{user?.role || "admin"}</p>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {user?.role === "admin" && (
              <button
                onClick={() => alert("Open create user modal")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white py-2 px-4 rounded-lg font-semibold shadow transition flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Create User
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-500 hover:to-pink-400 text-white py-2 px-4 rounded-lg font-semibold shadow transition flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>

            {/* Navigation */}
            <nav className="space-y-2 text-sm font-medium">
              {navLinks.map((item) => (
                <SidebarItem
                  key={item.href}
                  label={item.label}
                  icon={item.icon}
                  href={item.href}
                  activePath={pathname}
                  onClick={() => setSidebarOpen(false)} // close on nav click (mobile)
                />
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  label,
  icon,
  href,
  activePath,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  href: string;
  activePath: string;
  onClick?: () => void;
}) {
  const isActive = activePath === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all ${
        isActive
          ? "bg-gray-700 text-white"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
