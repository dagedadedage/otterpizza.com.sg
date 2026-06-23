"use client";

import Link from "next/link";
import { Pizza, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-context";

interface ProductCardProps {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  salePrice?: number | string | null;
  imageUrl?: string | null;
  tags: string[];
  inStock: boolean;
}

function getTagVariant(
  tag: string
): "default" | "signature" | "sale" | "mustTry" {
  const lower = tag.toLowerCase();
  if (lower === "signature") return "signature";
  if (lower === "must-try" || lower === "musttry") return "mustTry";
  if (lower === "sale") return "sale";
  return "default";
}

export function ProductCard({
  id,
  sku,
  name,
  slug,
  price,
  salePrice,
  imageUrl,
  tags,
  inStock,
}: ProductCardProps) {
  const { addItem } = useCart();
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  const numericSalePrice =
    salePrice != null
      ? typeof salePrice === "string"
        ? parseFloat(salePrice)
        : salePrice
      : null;
  const hasSale = numericSalePrice != null && numericSalePrice < numericPrice;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      productId: id,
      sku: slug,
      name,
      price: numericPrice,
      salePrice: numericSalePrice,
      quantity: 1,
      imageUrl: imageUrl ?? null,
    });
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        !inStock && "opacity-60"
      )}
    >
      {/* Product image */}
      <Link
        href={`/menu/${slug}`}
        className="relative aspect-[15/10] overflow-hidden bg-cream flex items-center justify-center"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <Pizza className="h-16 w-16 text-muted/30" />
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white px-4 py-1.5 rounded-full text-sm font-bold text-dark shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && inStock && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant={getTagVariant(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Sale badge */}
        {hasSale && inStock && (
          <div className="absolute top-2 right-2">
            <Badge variant="sale">Sale</Badge>
          </div>
        )}
      </Link>

      {/* Product info */}
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/menu/${slug}`}>
          <h3 className="text-xs lg:text-sm font-bold text-dark leading-snug line-clamp-2 hover:text-primary transition-colors">
            <span className="text-muted font-medium">{sku}</span>{" "}
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          {hasSale ? (
            <>
              <span className="text-base lg:text-lg font-bold lg:font-extrabold text-primary">
                {formatPrice(numericSalePrice)}
              </span>
              <span className="text-xs lg:text-sm text-muted line-through">
                {formatPrice(numericPrice)}
              </span>
            </>
          ) : (
            <span className="text-base lg:text-lg font-bold lg:font-extrabold text-dark">
              {formatPrice(numericPrice)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <Button
            variant={inStock ? "primary" : "outline"}
            size="sm"
            className="w-full"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
