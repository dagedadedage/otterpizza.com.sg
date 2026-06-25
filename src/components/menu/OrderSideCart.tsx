"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getSubtotal } from "@/lib/cart-utils";
import { useCart } from "@/store/cart-context";

export function OrderSideCart() {
  const { items, itemCount } = useCart();

  if (itemCount === 0) return null;

  const subtotal = getSubtotal(items);

  return (
    <>
      {/* Desktop: floating bar beside category strip */}
      <div className="hidden lg:flex shrink-0 items-center">
        <Link href="/cart" className="flex items-center gap-3 rounded-full bg-primary text-white px-4 py-2 shadow-lg hover:bg-primary/90 transition-colors">
          <ShoppingCart className="h-4 w-4" />
          <span className="text-sm font-bold">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          <span className="text-sm font-bold opacity-80">|</span>
          <span className="text-sm font-bold">{formatPrice(subtotal)}</span>
        </Link>
      </div>

      {/* Mobile: floating button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Link href="/cart">
          <div className="flex items-center gap-3 rounded-full bg-primary text-white px-4 py-3 shadow-lg hover:bg-primary/90 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm font-bold">{itemCount}</span>
            <span className="text-xs font-bold opacity-80">|</span>
            <span className="text-sm font-bold">{formatPrice(subtotal)}</span>
          </div>
        </Link>
      </div>
    </>
  );
}
