"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { calculatePromotions } from "@/lib/promotions";
import { getSubtotal } from "@/lib/cart-utils";
import { calculateGst, GST_DEFAULTS } from "@/lib/gst-utils";
import type { CartItem } from "@/lib/cart-utils";

interface CartSummaryProps {
  items: CartItem[];
}

export default function CartSummary({ items }: CartSummaryProps) {
  const subtotal = getSubtotal(items);
  const promo = calculatePromotions(items);
  const baseAmount = subtotal - promo.discountAmount;

  const [gstRate, setGstRate] = useState(GST_DEFAULTS.rate);
  const [gstMode, setGstMode] = useState<"INCLUSIVE" | "EXCLUSIVE">(GST_DEFAULTS.mode);
  // Delivery fee: promo override (free delivery thresholds) takes priority, else fetch from DB
  const [dbDeliveryFee, setDbDeliveryFee] = useState(0);
  const deliveryFee = promo.deliveryFee > 0 ? promo.deliveryFee : 0;
  // When promo gives free delivery, use 0. Otherwise use the promo-calculated fee
  // which will be overwritten by DB fetch if promo has a positive deliveryFee.
  const displayFee = promo.type !== "none" ? 0 : (dbDeliveryFee > 0 ? dbDeliveryFee : promo.deliveryFee);

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
