"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-context";

interface AddToCartButtonProps {
  productId: number;
  name: string;
  price: number;
  salePrice?: number | null;
  sku?: string;
  imageUrl?: string | null;
  className?: string;
  showQuantity?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AddToCartButton({
  productId,
  name,
  price,
  salePrice,
  sku,
  imageUrl,
  className,
  showQuantity = false,
  size = "md",
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      productId,
      sku: sku ?? String(productId),
      name,
      price,
      salePrice: salePrice ?? null,
      quantity,
      imageUrl: imageUrl ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const increment = () => {
    if (quantity < 20) setQuantity((q) => q + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  if (showQuantity) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={decrement}
            disabled={quantity <= 1}
            className="flex items-center justify-center h-10 w-10 text-dark hover:bg-primary-light disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex items-center justify-center h-10 w-12 text-sm font-bold text-dark border-x border-border">
            {quantity}
          </span>
          <button
            type="button"
            onClick={increment}
            disabled={quantity >= 20}
            className="flex items-center justify-center h-10 w-10 text-dark hover:bg-primary-light disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          variant={added ? "secondary" : "primary"}
          size={size}
          onClick={handleAdd}
          className="flex-1"
        >
          <ShoppingCart className="h-4 w-4" />
          {added ? "Added!" : "Add to Cart"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={added ? "secondary" : "primary"}
      size={size}
      onClick={handleAdd}
      className={cn("w-full", className)}
    >
      <ShoppingCart className="h-4 w-4" />
      {added ? "Added!" : "Add to Cart"}
    </Button>
  );
}
