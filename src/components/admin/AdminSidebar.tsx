"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Tag,
  Store,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Pizza,
  Percent,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function getNavItems(isAdmin: boolean) {
  return [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ShoppingCart,
    },
    {
      href: "/admin/menu",
      label: "Menu",
      icon: UtensilsCrossed,
    },
    {
      href: "/admin/menu/gst",
      label: "GST",
      icon: Percent,
    },
    {
      href: "/admin/promotions",
      label: "Promotions",
      icon: Tag,
    },
    {
      href: "/admin/stores",
      label: "Stores",
      icon: Store,
    },
    {
      href: "/admin/contacts",
      label: "Contacts",
      icon: MessageSquare,
    },
    // Access Control — ADMIN only
    ...(isAdmin
      ? [
          {
            href: "/admin/access",
            label: "Access Control",
            icon: Shield,
          },
        ]
      : []),
  ];
}

export function AdminSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = role === "ADMIN";
  const navItems = getNavItems(isAdmin);

  return (
    <aside
      className={cn(
        "flex flex-col bg-dark text-white transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary shrink-0">
          <Pizza className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg whitespace-nowrap">Otter Admin</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-white/50 hover:text-white justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
