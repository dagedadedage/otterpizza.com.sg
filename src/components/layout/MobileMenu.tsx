"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, LogIn } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/locate-us", label: "Locate Us" },
];

export function MobileMenu() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <div className="flex flex-col gap-6 pt-12">
      <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <SheetClose key={link.href} asChild>
              <Link
                href={link.href}
                className={`flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-primary bg-primary-light"
                    : "text-dark hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            </SheetClose>
          );
        })}
      </nav>

      <hr className="border-border mx-4" />

      <div className="flex flex-col gap-2 px-4">
        <SheetClose asChild>
          <Link
            href="/cart"
            className="flex items-center justify-between px-4 py-3 text-lg font-medium rounded-lg text-dark hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" />
              Cart
            </span>
            {itemCount > 0 && (
              <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </SheetClose>

        <SheetClose asChild>
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-2"
            asChild
          >
            <Link href="/login">
              <LogIn className="h-5 w-5" />
              Login
            </Link>
          </Button>
        </SheetClose>
      </div>
    </div>
  );
}
