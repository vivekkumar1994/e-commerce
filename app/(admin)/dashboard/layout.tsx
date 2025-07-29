// components/layouts/AdminLayout.tsx
"use client";

import AdminSidebar from "@/components/Adminsidebar";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar Fixed */}
      <div className="fixed inset-y-0 left-0 w-64 z-40">
        <AdminSidebar />
      </div>

      {/* Main Content Area (with left padding for sidebar width) */}
      <div className="flex-1 ml-64 overflow-y-auto bg-gray-100">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
