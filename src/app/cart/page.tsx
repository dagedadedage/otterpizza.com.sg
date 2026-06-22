"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartItemComponent from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { useCart } from "@/store/cart-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
        <span className="mb-4 text-6xl">🍕</span>
        <h1 className="mb-2 text-2xl font-bold text-dark">Your cart is empty</h1>
        <p className="mb-8 text-muted">
          Looks like you haven&apos;t added anything to your cart yet. Browse our
          menu to find something delicious!
        </p>
        <Link href="/menu">
          <Button variant="primary" size="lg">
            <ShoppingBag className="h-4 w-4" />
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Your Cart</h1>
          <p className="mt-1 text-sm text-muted">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <Link
          href="/menu"
          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      {/* Cart layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map((item) => (
            <CartItemComponent
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <CartSummary items={items} />
          <Link href="/checkout">
            <Button variant="primary" size="lg" className="w-full">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
