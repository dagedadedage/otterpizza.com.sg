"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { calculatePromotions } from "@/lib/promotions";
import { getItemPrice, getSubtotal } from "@/store/cart-context";
import type { CartItem } from "@/store/cart-context";

interface OrderSummaryProps {
  items: CartItem[];
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const subtotal = getSubtotal(items);
  const promo = calculatePromotions(items);
  const finalTotal = subtotal - promo.discountAmount + promo.deliveryFee;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-6 text-center text-sm text-muted">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-dark">Order Summary</h3>

      {/* Compact item list */}
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const unitPrice = getItemPrice(item);
          const lineTotal = unitPrice * item.quantity;
          return (
            <li key={item.productId} className="flex items-center gap-3 py-3">
              {/* Mini thumbnail */}
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-cream">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">
                    🍕
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark">{item.name}</p>
                <p className="text-xs text-muted">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-dark">
                {formatPrice(lineTotal)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {promo.discountAmount > 0 && (
          <div className="flex items-center justify-between text-green-700">
            <span>{promo.description}</span>
            <span>-{formatPrice(promo.discountAmount)}</span>
          </div>
        )}

        {promo.type === "free_delivery" && promo.description && (
          <div className="flex items-center justify-between text-green-700">
            <span>{promo.description}</span>
            <span>{formatPrice(0)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-muted">
          <span>Delivery Fee</span>
          <span>
            {promo.deliveryFee === 0 && promo.type !== "none" ? (
              <span className="text-green-700">FREE</span>
            ) : (
              formatPrice(promo.deliveryFee)
            )}
          </span>
        </div>

        <hr className="border-border" />

        <div className="flex items-center justify-between text-base font-bold text-dark">
          <span>Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
}
