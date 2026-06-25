import type { CartItem } from "@/lib/cart-utils";
import { getSubtotal } from "@/lib/cart-utils";

export interface AppliedPromo {
  type: "free_delivery" | "percentage" | "none";
  description: string;
  discountAmount: number;
  deliveryFee: number;
}

export interface AppliedPromo {
  type: "percentage" | "free_delivery" | "none";
  description: string;
  discountAmount: number;
  deliveryFee: number;
  nextTier?: { amount: number; label: string };
}

const TIERS = [
  { threshold: 250, type: "percentage" as const, discount: 0.10, label: "10% OFF + FREE DELIVERY" },
  { threshold: 150, type: "percentage" as const, discount: 0.05, label: "5% OFF + FREE DELIVERY" },
  { threshold: 50,  type: "free_delivery" as const, discount: 0, label: "FREE DELIVERY" },
];

export function calculatePromotions(items: CartItem[]): AppliedPromo {
  const subtotal = getSubtotal(items);

  for (const tier of TIERS) {
    if (subtotal >= tier.threshold) {
      return {
        type: tier.type,
        description: tier.label,
        discountAmount: subtotal * tier.discount,
        deliveryFee: 0,
        nextTier: undefined,
      };
    }
  }

  // No promo yet: find the next tier to nudge toward
  const next = TIERS.findLast((t) => subtotal < t.threshold);
  return {
    type: "none",
    description: "",
    discountAmount: 0,
    deliveryFee: 0, // DB delivery fee will be applied by CartSummary
    nextTier: next ? { amount: next.threshold - subtotal, label: next.label } : undefined,
  };
}
