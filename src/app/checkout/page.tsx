"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomerForm from "@/components/checkout/CustomerForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useCart } from "@/store/cart-context";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  async function handleSubmit(formData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryType: "delivery" | "pickup";
    deliveryDate: string;
    storeId: string;
    deliveryAddress: string;
    deliveryUnit: string;
    deliveryPostalCode: string;
    deliveryTimeslot: string;
    notes: string;
  }) {
    setIsSubmitting(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.salePrice ?? item.price,
        totalPrice: (item.salePrice ?? item.price) * item.quantity,
      }));

      const payload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || undefined,
        deliveryType: formData.deliveryType,
        deliveryDate: formData.deliveryDate || undefined,
        storeId: formData.storeId ? parseInt(formData.storeId, 10) : undefined,
        deliveryAddress: formData.deliveryAddress || undefined,
        deliveryUnit: formData.deliveryUnit || undefined,
        deliveryPostalCode: formData.deliveryPostalCode || undefined,
        deliveryTimeslot: formData.deliveryTimeslot || undefined,
        notes: formData.notes || undefined,
        items: orderItems,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Clear the cart
      clearCart();

      // Redirect to HitPay checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback: redirect to success page with order number
        router.push(`/checkout/success?order=${data.orderNumber}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/cart"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-dark">Checkout</h1>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Left: Customer form */}
        <div className="rounded-lg border border-border bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold text-dark">
            Customer Details
          </h2>
          <CustomerForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>

        {/* Right: Order summary */}
        <div>
          <OrderSummary items={items} />
        </div>
      </div>
    </div>
  );
}
