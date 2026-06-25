"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { calculatePromotions, type PromoTier } from "@/lib/promotions";
import { getItemPrice, getSubtotal } from "@/lib/cart-utils";
import { calculateGst, GST_DEFAULTS } from "@/lib/gst-utils";
import type { CartItem } from "@/lib/cart-utils";

interface OrderSummaryProps {
  items: CartItem[];
}

const FALLBACK_TIERS: PromoTier[] = [
  { type: "FREE_DELIVERY", minAmount: 60, value: 0, name: "Free Delivery", description: "FREE DELIVERY" },
  { type: "PERCENTAGE_DISCOUNT", minAmount: 120, value: 5, name: "5% Off", description: "5% OFF" },
  { type: "PERCENTAGE_DISCOUNT", minAmount: 200, value: 10, name: "10% Off", description: "10% OFF" },
];

export default function OrderSummary({ items }: OrderSummaryProps) {
  const subtotal = getSubtotal(items);

  const [gstRate, setGstRate] = useState(GST_DEFAULTS.rate);
  const [gstMode, setGstMode] = useState<"INCLUSIVE" | "EXCLUSIVE">(GST_DEFAULTS.mode);
  const [dbDeliveryFee, setDbDeliveryFee] = useState(0);
  const [promoTiers, setPromoTiers] = useState<PromoTier[]>(FALLBACK_TIERS);

  const promo = calculatePromotions(items, promoTiers);
  const baseAmount = subtotal - promo.discountAmount;
  const displayFee = promo.type !== "none" ? 0 : dbDeliveryFee;

  useEffect(() => {
    fetch("/api/gst")
      .then((res) => res.json())
      .then((data) => {
        if (data.rate !== undefined) setGstRate(data.rate);
        if (data.mode) setGstMode(data.mode);
      })
      .catch(() => {});
    fetch("/api/delivery")
      .then((res) => res.json())
      .then((data) => {
        if (data.fee !== undefined) setDbDeliveryFee(data.fee);
      })
      .catch(() => {});
    fetch("/api/promotions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPromoTiers(data);
      })
      .catch(() => {});
  }, []);

  const gstAmount = calculateGst(baseAmount, gstRate, gstMode);
  const gstAddon = gstMode === "EXCLUSIVE" ? gstAmount : 0;
  const finalTotal = baseAmount + displayFee + gstAddon;

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
            {displayFee === 0 ? (
              <span className="text-green-700">FREE</span>
            ) : (
              formatPrice(displayFee)
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
