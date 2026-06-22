"use client";

import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { getItemPrice } from "@/store/cart-context";
import type { CartItem as CartItemType } from "@/store/cart-context";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const unitPrice = getItemPrice(item);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-white p-4">
      {/* Thumbnail */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-cream">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">
            🍕
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-dark">{item.name}</h3>
            <p className="mt-0.5 text-sm text-muted">
              {item.salePrice ? (
                <>
                  <span className="text-muted line-through">
                    {formatPrice(item.price)}
                  </span>{" "}
                  <span className="font-medium text-primary">
                    {formatPrice(item.salePrice)}
                  </span>
                </>
              ) : (
                <span>{formatPrice(item.price)}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="ml-2 rounded-full p-1 text-muted transition-colors hover:bg-red-50 hover:text-accent"
            aria-label={`Remove ${item.name} from cart`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="flex h-8 w-10 items-center justify-center rounded-md border border-border bg-warm-white text-sm font-medium text-dark">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              aria-label="Increase quantity"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="text-sm font-semibold text-dark">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
