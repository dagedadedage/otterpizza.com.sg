"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useCart } from "@/store/cart-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/locate-us", label: "Locate Us" },
];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-warm-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile: hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden -ml-2"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <MobileMenu />
            </SheetContent>
          </Sheet>

          {/* Brand logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-primary"
          >
            <span className="sr-only">Otter Pizza</span>
            OTTER PIZZA
          </Link>

          {/* Desktop nav links */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-semibold transition-colors rounded-lg ${
                    isActive
                      ? "text-primary"
                      : "text-dark hover:text-primary hover:bg-primary-light/50"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart icon */}
            <Link
              href="/cart"
              className="relative p-2 text-dark hover:text-primary transition-colors rounded-lg hover:bg-primary-light/50"
              aria-label={`Shopping cart${itemCount > 0 ? ` (${itemCount} items)` : ""}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="signature"
                  className="absolute -top-1.5 -right-1.5 h-5 min-w-[1.25rem] px-1 text-[10px] font-bold leading-none flex items-center justify-center"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
            </Link>

            {/* Desktop login */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex"
              asChild
            >
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
