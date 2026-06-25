"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { calculatePromotions, type PromoTier } from "@/lib/promotions";
import { getSubtotal } from "@/lib/cart-utils";
import { calculateGst, GST_DEFAULTS } from "@/lib/gst-utils";
import type { CartItem } from "@/lib/cart-utils";

interface CartSummaryProps {
  items: CartItem[];
}

const FALLBACK_TIERS: PromoTier[] = [
  { type: "FREE_DELIVERY", minAmount: 50, value: 0, name: "Free Delivery", description: "FREE DELIVERY" },
  { type: "PERCENTAGE_DISCOUNT", minAmount: 150, value: 5, name: "5% Off", description: "5% OFF + FREE DELIVERY" },
  { type: "PERCENTAGE_DISCOUNT", minAmount: 250, value: 10, name: "10% Off", description: "10% OFF + FREE DELIVERY" },
];

export default function CartSummary({ items }: CartSummaryProps) {
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
  // INCLUSIVE: GST already in prices, don't add to total. EXCLUSIVE: add GST on top.
  const gstAddon = gstMode === "EXCLUSIVE" ? gstAmount : 0;
  const finalTotal = baseAmount + displayFee + gstAddon;

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

        {/* Progress nudge to next tier */}
        {promo.nextTier && (
          <div className="rounded-lg bg-gold/15 border border-gold/30 px-3 py-2 text-center">
            <span className="text-xs text-dark font-medium">
              🎯 Add <strong>{formatPrice(promo.nextTier.amount)}</strong> more for <strong>{promo.nextTier.label}</strong>
            </span>
          </div>
        )}

        {/* Active promo */}
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
