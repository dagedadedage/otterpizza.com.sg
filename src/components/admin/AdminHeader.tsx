"use client";

"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Shield, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/menu": "Menu Management",
  "/admin/menu/gst": "GST Settings",
  "/admin/promotions": "Promotions",
  "/admin/stores": "Stores",
  "/admin/contacts": "Contact Submissions",
  "/admin/access": "Access Control",
};

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  user?: AdminUser;
}

export function AdminHeader({ onToggleSidebar, user }: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();

  // Find the best matching title
  let title = "Admin";
  const sortedPaths = Object.keys(pageTitles).sort(
    (a, b) => b.length - a.length
  );
  for (const path of sortedPaths) {
    if (pathname.startsWith(path)) {
      title = pageTitles[path];
      break;
    }
  }

  // Check if we're on a detail/edit/new page
  const segments = pathname.split("/").filter(Boolean);
  const isDetailPage = segments.length > 2;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-border">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-bold text-dark">{title}</h1>
          {isDetailPage && (
            <p className="text-xs text-muted">{pathname}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-dark">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                user.role === "ADMIN"
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {user.role === "ADMIN" ? (
                <Shield className="w-3.5 h-3.5" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>{user.role === "ADMIN" ? "Admin" : "Manager"}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setLoggingOut(true);
                await fetch("/api/admin/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
                router.push("/admin/login");
              }}
              disabled={loggingOut}
              className="text-muted hover:text-red-600"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
