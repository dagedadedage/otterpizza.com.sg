"use client";

import Link from "next/link";
import Image from "next/image";
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gold/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center">
          {/* Brand logo — centered on mobile, left on desktop */}
          <Link
            href="/"
            className="flex items-center shrink-0 max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2"
            aria-label="Otter Pizza Home"
          >
            <Image
              src="/images/logo.png"
              alt="Otter Pizza"
              width={138}
              height={64}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Right side: nav links + cart + login (desktop) */}
          <div className="hidden lg:flex items-center gap-1 ml-auto">
            <nav aria-label="Main navigation" className="flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                      isActive
                        ? "text-primary"
                        : "text-dark hover:text-primary hover:bg-primary-light/50"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-3/4 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Cart icon */}
            <Link
              href="/cart"
              className="relative p-2 text-dark hover:text-primary transition-colors rounded-lg hover:bg-primary-light/50"
              aria-label={`Shopping cart${itemCount > 0 ? ` (${itemCount} items)` : ""}`}
            >
              <ShoppingCart className="h-4 w-4" />
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
              className="font-[family-name:var(--font-inter)] font-semibold"
              asChild
            >
              <Link href="/login">
                <LogIn className="h-3.5 w-3.5" />
                Log In
              </Link>
            </Button>
          </div>

          {/* Mobile: hamburger — right side */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden ml-auto -mr-2"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <MobileMenu />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
