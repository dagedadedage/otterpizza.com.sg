"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { calculatePromotions } from "@/lib/promotions";
import { getItemPrice, getSubtotal } from "@/store/cart-context";
import { calculateGst, GST_DEFAULTS } from "@/lib/gst-utils";
import type { CartItem } from "@/store/cart-context";

interface OrderSummaryProps {
  items: CartItem[];
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const subtotal = getSubtotal(items);
  const promo = calculatePromotions(items);
  const baseAmount = subtotal - promo.discountAmount;

  const [gstRate, setGstRate] = useState(GST_DEFAULTS.rate);
  const [gstMode, setGstMode] = useState<"INCLUSIVE" | "EXCLUSIVE">(GST_DEFAULTS.mode);

  useEffect(() => {
    fetch("/api/gst")
      .then((res) => res.json())
      .then((data) => {
        if (data.rate !== undefined) setGstRate(data.rate);
        if (data.mode) setGstMode(data.mode);
      })
      .catch(() => {});
  }, []);

  const gstAmount = calculateGst(baseAmount, gstRate, gstMode);
  // INCLUSIVE: GST already in prices, don't add to total. EXCLUSIVE: add GST on top.
  const gstAddon = gstMode === "EXCLUSIVE" ? gstAmount : 0;
  const finalTotal = baseAmount + promo.deliveryFee + gstAddon;

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
              <div className="relative w-[3.75rem] h-10 flex-shrink-0 overflow-hidden rounded-md bg-cream">
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

        {/* GST */}
        {gstAmount > 0 && (
          <div className="flex items-center justify-between text-muted">
            <span>GST ({gstRate}% {gstMode === "INCLUSIVE" ? "incl." : "excl."})</span>
            <span>{formatPrice(gstAmount)}</span>
          </div>
        )}

        <hr className="border-border" />

        <div className="flex items-center justify-between text-base font-bold text-dark">
          <span>Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
}
