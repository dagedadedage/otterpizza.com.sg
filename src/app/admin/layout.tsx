"use client";

import { useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { AdminUser } from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";

export { type AdminUser };
export const AdminUserContext = createContext<AdminUser | null>(null);

export function useAdminUser() {
  return useContext(AdminUserContext);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Login page renders standalone without admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/admin/login");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-muted">Redirecting to login...</p>
      </div>
    );
  }

  const user: AdminUser = {
    id: session.user.id || "0",
    email: session.user.email || "",
    name: session.user.name || "",
    role: (session.user as Record<string, unknown>).role as string || "MANAGER",
    image: session.user.image,
  };

  return (
    <AdminUserContext.Provider value={user}>
      <div className="min-h-screen flex bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <AdminSidebar role={user.role} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64 h-full">
              <AdminSidebar role={user.role} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
          <AdminHeader
            user={user}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminUserContext.Provider>
  );
}
