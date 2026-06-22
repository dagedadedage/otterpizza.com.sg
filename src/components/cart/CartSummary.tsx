"use client";

import { formatPrice } from "@/lib/utils";
import { calculatePromotions } from "@/lib/promotions";
import { getSubtotal } from "@/store/cart-context";
import type { CartItem } from "@/store/cart-context";

interface CartSummaryProps {
  items: CartItem[];
}

export default function CartSummary({ items }: CartSummaryProps) {
  const subtotal = getSubtotal(items);
  const promo = calculatePromotions(items);
  const finalTotal = subtotal - promo.discountAmount + promo.deliveryFee;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-dark">Order Summary</h3>

      <div className="space-y-3 text-sm">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {/* Discount */}
        {promo.discountAmount > 0 && (
          <div className="flex items-center justify-between text-green-700">
            <span>{promo.description}</span>
            <span>-{formatPrice(promo.discountAmount)}</span>
          </div>
        )}

        {/* Free delivery promotion banner (no discount amount) */}
        {promo.type === "free_delivery" && promo.description && (
          <div className="flex items-center justify-between text-green-700">
            <span>{promo.description}</span>
            <span>{formatPrice(0)}</span>
          </div>
        )}

        {/* Delivery fee */}
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

        {/* Divider */}
        <hr className="border-border" />

        {/* Total */}
        <div className="flex items-center justify-between text-base font-bold text-dark">
          <span>Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
}
