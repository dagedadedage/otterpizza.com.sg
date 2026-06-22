"use client";

import { usePathname } from "next/navigation";
import { ShieldCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/menu": "Menu Management",
  "/admin/promotions": "Promotions",
  "/admin/stores": "Stores",
  "/admin/contacts": "Contact Submissions",
};

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
}
