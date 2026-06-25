"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getSubtotal } from "@/lib/cart-utils";
import { useCart } from "@/store/cart-context";
import { Button } from "@/components/ui/button";

export function OrderSideCart() {
  const { items, itemCount } = useCart();

  if (itemCount === 0) return null;

  const subtotal = getSubtotal(items);

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-dark text-sm">Your Cart</h3>
            <span className="ml-auto text-xs text-muted">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-2 text-xs">
                <span className="flex-1 text-dark truncate">{item.name}</span>
                <span className="text-muted shrink-0">×{item.quantity}</span>
                <span className="font-medium text-dark shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="my-3 border-border" />
          <div className="flex items-center justify-between text-sm font-bold text-dark mb-3">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link href="/cart">
            <Button variant="primary" size="sm" className="w-full">
              View Cart
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile: floating button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Link href="/cart">
          <Button variant="primary" size="lg" className="rounded-full shadow-lg h-14 w-14 p-0 relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-dark text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          </Button>
        </Link>
      </div>
    </>
  );
}
