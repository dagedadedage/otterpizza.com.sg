import type { CartItem } from "@/lib/cart-utils";
import { getSubtotal } from "@/lib/cart-utils";

export interface AppliedPromo {
  type: "free_delivery" | "percentage" | "none";
  description: string;
  discountAmount: number;
  deliveryFee: number;
}

const DELIVERY_FEE = 5.0;

export function calculatePromotions(items: CartItem[]): AppliedPromo {
  const subtotal = getSubtotal(items);

  if (subtotal >= 500) {
    return {
      type: "percentage",
      description: "15% OFF + FREE DELIVERY",
      discountAmount: subtotal * 0.15,
      deliveryFee: 0,
    };
  }

  if (subtotal >= 200) {
    return {
      type: "percentage",
      description: "10% OFF + FREE DELIVERY",
      discountAmount: subtotal * 0.1,
      deliveryFee: 0,
    };
  }

  if (subtotal >= 60) {
    return {
      type: "free_delivery",
      description: "FREE DELIVERY",
      discountAmount: 0,
      deliveryFee: 0,
    };
  }

  return {
    type: "none",
    description: "",
    discountAmount: 0,
    deliveryFee: DELIVERY_FEE,
  };
}
