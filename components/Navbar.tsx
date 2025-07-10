"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { logout } from "@/action/AuthAction";
import useCartStore from "@/stores/cartStore";

interface IUserSession {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Decode cookie values
function getCookieValue(name: string): string | undefined {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<IUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cart);

  useEffect(() => {
    const email = getCookieValue("userEmail");
    const name = getCookieValue("userName");
    const role = getCookieValue("userRole");
    const avatar = getCookieValue("avatar");

    if (email && name && role) {
      setUser({ email, name, role, avatar });
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length) {
      router.push(`/search?searchTerm=${searchQuery}`);
      setIsMobileMenuOpen(false);
    }
  };

  const showAvatar = user && (user.role === "user" || user.role === "admin");

  return (
    <nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b-2 border-gray-200">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent"
          >
            Ujjwal com
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="mr-64">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-100 border-gray-400 min-w-48"
              />
            </form>

            {user?.role === "seller" && (
              <Link href="/seller?type=login">
                <Button variant="ghost" className="text-purple-600 hover:text-purple-800">
                  Seller Dashboard
                </Button>
              </Link>
            )}

            {user?.role === "user" && (
              <Link href="/cart">
                <Button size="icon" className="relative" variant="ghost">
                  <ShoppingCart className="h-5 w-5 text-gray-600 hover:text-purple-500" />
                  {cartItems.length > 0 && (
                    <span className="absolute top-[-3px] right-[-3px] px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {isLoading ? (
              <Avatar className="h-8 w-8">
                <AvatarFallback>-</AvatarFallback>
              </Avatar>
            ) : showAvatar ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="space-y-1">
                      <p className="text-sm font-medium bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {user.role === "user" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth?type=login">
                  <Button variant="outline" className="border-gray-300 text-purple-600">
                    Login
                  </Button>
                </Link>
                <Link href="/auth?type=signup">
                  <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-gray-100 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch}>
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white"
            />
          </form>

          {user?.role === "user" && (
            <Link
              href="/cart"
              className="block text-gray-500 hover:text-white hover:bg-purple-500 p-2 rounded"
            >
              Cart
            </Link>
          )}

          {user?.role === "seller" && (
            <Link
              href="/seller?type=login"
              className="block text-gray-500 hover:text-white hover:bg-purple-500 p-2 rounded"
            >
              Seller Dashboard
            </Link>
          )}

          {showAvatar ? (
            <>
              <div className="flex items-center gap-3 border-t pt-4">
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border bg-purple-600 text-white">
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
                <div>
                  <div className="font-medium text-purple-600">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              {user.role === "user" && (
                <>
                  <Link
                    href="/profile"
                    className="block text-gray-500 hover:text-white hover:bg-purple-500 p-2 rounded"
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block text-gray-500 hover:text-white hover:bg-purple-500 p-2 rounded"
                  >
                    Orders
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="block w-full text-left text-gray-500 hover:text-white hover:bg-purple-500 p-2 rounded"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth?type=login"
                className="block text-gray-500 hover:text-white hover:bg-purple-500 p-2 rounded"
              >
                Login
              </Link>
              <Link
                href="/auth?type=signup"
                className="block text-gray-500 hover:text-white hover:bg-purple-500 p-2 rounded"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
