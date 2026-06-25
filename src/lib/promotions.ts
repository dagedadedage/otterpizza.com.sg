import type { CartItem } from "@/lib/cart-utils";
import { getSubtotal } from "@/lib/cart-utils";

export interface AppliedPromo {
  type: "percentage" | "free_delivery" | "none";
  description: string;
  discountAmount: number;
  deliveryFee: number;
  nextTier?: { amount: number; label: string };
}

export interface PromoTier {
  type: string; // "FREE_DELIVERY" | "PERCENTAGE_DISCOUNT"
  minAmount: number;
  value: number; // percentage (10 = 10%) or 0 for free delivery
  name: string;
  description: string | null;
}

function formatLabel(tier: PromoTier): string {
  if (tier.type === "PERCENTAGE_DISCOUNT") {
    return `${tier.value}% OFF`;
  }
  return "FREE DELIVERY";
}

/**
 * Calculate applicable promotion from DB-fetched tiers.
 * Tiers should be sorted ascending by minAmount (lowest first).
 */
export function calculatePromotions(items: CartItem[], tiers: PromoTier[]): AppliedPromo {
  const subtotal = getSubtotal(items);

  // Sort descending (highest threshold first) to find the best matching tier
  const sorted = [...tiers].sort((a, b) => b.minAmount - a.minAmount);

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    if (subtotal >= tier.minAmount) {
      const discount = tier.type === "PERCENTAGE_DISCOUNT" ? subtotal * (tier.value / 100) : 0;
      // Find the next tier above this one (if any)
      const next = i > 0 ? sorted[i - 1] : null;
      return {
        type: tier.type === "PERCENTAGE_DISCOUNT" ? "percentage" : "free_delivery",
        description: formatLabel(tier),
        discountAmount: discount,
        deliveryFee: 0,
        nextTier: next ? { amount: next.minAmount - subtotal, label: formatLabel(next) } : undefined,
      };
    }
  }

  // No promo yet: find the next tier to nudge toward (lowest threshold above current)
  const next = sorted.findLast((t) => subtotal < t.minAmount);
  return {
    type: "none",
    description: "",
    discountAmount: 0,
    deliveryFee: 0,
    nextTier: next ? { amount: next.minAmount - subtotal, label: formatLabel(next) } : undefined,
  };
}
